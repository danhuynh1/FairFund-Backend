const Group = require("../models/Group");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement"); // Make sure this is imported
const { calculateBalancesForGroup } = require("../utils/balanceCalculator");

/**
 * @desc    Get all groups for the currently logged-in user
 * @route   GET /api/groups/
 * @access  Private
 */
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all groups the user is a member of
    const groups = await Group.find({ members: userId }).lean();

    // For each group, calculate its balance and determine if it's unsettled
    const groupsWithStatus = await Promise.all(
      groups.map(async (group) => {
        const balances = await calculateBalancesForGroup(
          group._id,
          group.members
        );
        // A group is unsettled if any member's net balance is not zero
        const isUnsettled = balances.some((b) => b.net !== 0);

        return {
          _id: group._id,
          name: group.name,
          updatedAt: group.updatedAt,
          isUnsettled: isUnsettled, // Add the new flag
        };
      })
    );

    // Sort groups by most recently updated
    groupsWithStatus.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(groupsWithStatus);
  } catch (error) {
    console.error("Error fetching groups with status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get a single group by its ID
 * @route   GET /api/groups/:id
 * @access  Private
 */
exports.getGroupById = async (req, res) => {
  try {
    // console.log(`--- GET GROUP BY ID: START ---`);
    // console.log(`1. Fetching group with ID: ${req.params.id}`);
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!group) {
      // console.log(`2. FAILED: Group not found.`);
      return res.status(404).json({ message: "Group not found" });
    }
    // console.log(`2. SUCCESS: Found group: "${group.name}"`);

    // --- Security Check ---
    if (!req.user || !req.user._id) {
      // console.log(`3. FAILED: User object not found on request.`);
      return res
        .status(401)
        .json({ message: "Authentication error: User identity not found." });
    }
    // console.log(`3. SUCCESS: Authenticated user ID is: ${req.user._id}`);

    const isMember = group.members.some(
      (member) => member && member._id && member._id.equals(req.user._id)
    );
    // console.log(`4. Membership check result: ${isMember}`);

    if (!isMember) {
      // console.log(`5. FAILED: User is not a member of this group.`);
      return res
        .status(403)
        .json({ message: "Forbidden: You are not a member of this group." });
    }
    // console.log(`5. SUCCESS: User is a member. Sending group data.`);
    // console.log(`--- GET GROUP BY ID: END ---`);
    // --- End of Security Check ---

    res.json(group);
  } catch (err) {
    console.error("--- CRITICAL ERROR in getGroupById ---", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Create a new group
 * @route   POST /api/groups/create
 * @access  Private
 */
exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name) {
    return res.status(400).json({ message: "Please provide a group name." });
  }

  try {
    const group = new Group({
      name,
      description,
      createdBy: userId,
      members: [userId],
    });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error("Error in createGroup:", err);
    res
      .status(500)
      .json({ message: "Failed to create group", error: err.message });
  }
};

// You can add your other controller functions (addUsers, removeUsers) here.
/**
 * @desc    Remove one or more users from a group
 * @route   POST /api/groups/:groupId/remove-users
 * @access  Private
 */
exports.removeUsersFromGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIds } = req.body; // Expect an array of user IDs to remove

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Please provide an array of user IDs to remove." });
  }

  try {
    // Use MongoDB's $pullAll to efficiently remove multiple users.
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pullAll: { members: userIds } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(updatedGroup);
  } catch (err) {
    console.error("Error in removeUsersFromGroup:", err);
    res.status(500).json({
      message: "Failed to remove users from group",
      error: err.message,
    });
  }
};

/**
 * @desc    Add one or more users to a group
 * @route   POST /api/groups/:groupId/add-users
 * @access  Private
 */
exports.addUsersToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIds } = req.body; // Expect an array of user IDs

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Please provide an array of user IDs to add." });
  }

  try {
    // Use MongoDB's $addToSet to add users without creating duplicates.
    // The { new: true } option returns the document after the update.
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: userIds } } },
      { new: true }
    ).populate("members createdBy", "name email");

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(updatedGroup);
  } catch (err) {
    console.error("Error in addUsersToGroup:", err);
    res
      .status(500)
      .json({ message: "Failed to add users to group", error: err.message });
  }
};

/**
 * Calculates the final net balance for every member, including expenses and settlements.
 */
exports.getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate(
      "members",
      "name email"
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Security Check
    if (!group.members.some((member) => member._id.equals(req.user._id))) {
      return res
        .status(403)
        .json({ message: "User not authorized to view these balances." });
    }

    // Use the utility to get the core balance data
    const balances = await calculateBalancesForGroup(groupId, group.members);

    // Add member names back in for a user-friendly response
    const populatedBalances = balances.map((b) => {
      const memberInfo = group.members.find(
        (m) => m._id.toString() === b.userId
      );
      return {
        ...b,
        name: memberInfo ? memberInfo.name : "Unknown Member",
        email: memberInfo ? memberInfo.email : "",
      };
    });

    res.json(populatedBalances);
  } catch (error) {
    console.error("Error calculating group balances:", error);
    res
      .status(500)
      .json({ message: "Server error while calculating balances." });
  }
};

exports.updateGroupBudget = async (req, res) => {
  const { groupId } = req.params;
  const { budget } = req.body; // Expecting { budget: 500 } in the request body

  // Validate that the budget is a valid number
  if (typeof budget !== "number" || budget < 0) {
    return res
      .status(400)
      .json({ message: "A valid, non-negative budget is required." });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Optional: Check if the user making the request is the creator or an admin
    // if (group.createdBy.toString() !== req.user.userId) {
    //     return res.status(403).json({ message: 'Not authorized to update this group's budget' });
    // }

    group.budget = budget;
    await group.save();

    res.status(200).json({ message: "Budget updated successfully", group });
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(500).json({ message: "Server error while updating budget." });
  }
};

exports.addBudgetPlan = async (req, res) => {
  const { groupId } = req.params;
  const { category, limit } = req.body;

  if (!category || typeof limit !== "number") {
    return res
      .status(400)
      .json({ message: "Category and a numeric limit are required." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Optional but recommended: Check if the category already exists to prevent duplicates.
    const existingPlan = group.budgetPlans.find(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    if (existingPlan) {
      return res
        .status(400)
        .json({ message: "A budget for this category already exists." });
    }

    // Add the new plan to the array
    group.budgetPlans.push({ category, limit });

    // Save the updated group document
    await group.save();

    // Send back the entire updated group object
    res.status(201).json(group);
  } catch (err) {
    console.error("Error adding budget plan:", err);
    res.status(500).json({ message: "Server error while adding budget plan." });
  }
};

/**
 * @desc    Get a combined activity feed for a group (expenses and settlements)
 * @route   GET /api/groups/:groupId/activity
 * @access  Private
 */
exports.getGroupActivity = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Fetch both expenses and settlements concurrently for better performance
    const [expenses, settlements] = await Promise.all([
      Expense.find({ group: groupId }).populate("paidBy", "name").lean(), // .lean() makes the query faster and returns plain JavaScript objects

      Settlement.find({ group: groupId })
        .populate("from", "name")
        .populate("to", "name")
        .lean(),
    ]);

    // Add a 'type' field to each item so the frontend can distinguish them
    const expenseItems = expenses.map((e) => ({ ...e, type: "expense" }));
    const settlementItems = settlements.map((s) => ({
      ...s,
      type: "settlement",
    }));

    // Combine the two arrays into a single activity feed
    const activity = [...expenseItems, ...settlementItems];

    // Sort the combined list by date, with the most recent items first
    activity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(activity);
  } catch (error) {
    console.error("Error fetching group activity:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching group activity." });
  }
};

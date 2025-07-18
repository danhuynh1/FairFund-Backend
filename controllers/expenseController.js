const Expense = require("../models/Expense");
const Group = require("../models/Group");




/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Add a new expense to a group
 *     tags:
 *       - Expenses
 *     security:
 *       - BearerAuth: []
 *     description: Adds an expense for a group, with optional split details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - amount
 *               - group
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Dinner at sushi restaurant"
 *               amount:
 *                 type: number
 *                 example: 120.5
 *               group:
 *                 type: string
 *                 example: "64f125abc456def7890abcff2"
 *               category:
 *                 type: string
 *                 example: "Food"
 *               splitType:
 *                 type: string
 *                 enum: [equal, percentage, custom]
 *                 default: equal
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       description: User ID involved in the split
 *                       example: "64f123abc456def7890abcde"
 *                     amount:
 *                       type: number
 *                       example: 40.17
 *               isRecurring:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Missing required fields or invalid splits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide description, amount, and group ID.
 *       403:
 *         description: User not a member of the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User is not a member of this group
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group not found
 *       500:
 *         description: Server error while adding expense
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error while adding expense
 */
exports.addExpense = async (req, res) => {
  // Destructure all expected fields from the request body
  const {
    description,
    amount,
    group: groupId,
    category,
    splitType = "equal",
    splits,
    isRecurring,
  } = req.body;


  console.log(req.body);
  const paidById = req.user._id;

  if (!description || !amount || !groupId) {
    return res
      .status(400)
      .json({ message: "Please provide description, amount, and group ID." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some((memberId) =>
      memberId.equals(paidById)
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "User is not a member of this group" });
    }

    let calculatedSplits = [];

    // Logic for splitting the expense
    if (splitType === "equal") {
      const memberCount = group.members.length;
      const splitAmount = parseFloat((amount / memberCount).toFixed(2));

      // Ensure the sum of splits equals the total amount due to rounding
      let totalSplit = splitAmount * memberCount;
      let remainder = parseFloat((amount - totalSplit).toFixed(2));

      calculatedSplits = group.members.map((memberId, index) => ({
        user: memberId,
        // Distribute any rounding remainder to the first member to ensure accuracy
        amount: index === 0 ? splitAmount + remainder : splitAmount,
      }));
    } else if (splitType === "custom" || splitType === "percentage") {
      // CRITICAL: Validate that the provided splits add up to the total amount
      if (!splits || splits.length === 0) {
        return res
          .status(400)
          .json({
            message: "Custom splits data is required for this split type.",
          });
      }
      const totalSplitAmount = splits.reduce(
        (sum, split) => sum + split.amount,
        0
      );
      if (Math.abs(totalSplitAmount - amount) > 0.01) {
        // Allow for small rounding differences
        return res
          .status(400)
          .json({
            message:
              "The sum of custom splits must equal the total expense amount.",
          });
      }
      calculatedSplits = splits;
    }

    const newExpense = await Expense.create({
      description,
      amount,
      group: groupId,
      paidBy: paidById,
      category,
      isRecurring,
      splitType,
      splits: calculatedSplits,
    });

    console.log("New expense created:", newExpense);

    const populatedExpense = await Expense.findById(newExpense._id).populate(
      "paidBy splits.user",
      "name email"
    );

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Server error while adding expense" });
  }
};




exports.getGroupExpenses = async (req, res) => {
  const { groupId } = req.params;
  try {
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy splits.user", "name email")
      .sort({ createdAt: -1 }); // Sort by createdAt descending (newest first)
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

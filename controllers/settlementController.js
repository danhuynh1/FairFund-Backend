// controllers/settlementController.js

const Expense = require("../models/Expense");
const Group = require("../models/Group");
const Settlement = require("../models/Settlement"); // Make sure this is imported

/**
 * Records a new settlement transaction and returns the populated record.
 */
exports.recordSettlement = async (req, res) => {
  const { from, to, group, amount } = req.body;
console.log("Recording settlement:", req.body);
  // console.log(req.body)
  if (!from || !to || !group || !amount) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Create a new settlement document in memory
    const newSettlement = new Settlement({ from, to, group, amount });

    // This is the crucial step: save the document to the database
    await newSettlement.save();

    // After saving, find the new record again so you can populate it
    // with the user names before sending it back to the front-end.
    const populatedSettlement = await Settlement.findById(newSettlement._id)
      .populate("from", "name")
      .populate("to", "name");

      console.log("Retuning 201");
    res.status(201).json({
      message: "Settlement recorded successfully",
      // Send the populated record back so the front-end can use it
      settlement: populatedSettlement,
    });
  } catch (err) {
    console.error("Error in recordSettlement:", err);
    res.status(500).json({ message: "Failed to record settlement" });
  }
};



exports.getSettlementHistoryForGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const history = await Settlement.find({ group: groupId })
      .populate("from", "name") // Get the 'name' of the user who paid
      .populate("to", "name") // Get the 'name' of the user who received
      .sort({ date: -1 }); // Show the most recent payments first

    res.status(200).json(history);
  } catch (err) {
    console.error("Error fetching settlement history:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching settlement history." });
  }
};

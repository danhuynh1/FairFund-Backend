const express = require("express");
const router = express.Router();
const {
  addExpense,
  getGroupExpenses,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

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
 *               paidBy:
 *                 type: string
 *                 description: User ID of the person who paid
 *                 example: "64f123abc456def7890abcde"
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

router.post("/add", protect, addExpense);

/**
 * @swagger
 * /api/groups/{groupId}/expenses:
 *   get:
 *     summary: Get all expenses for a specific group
 *     tags:
 *       - Expenses
 *     security:
 *       - BearerAuth: []
 *     description: Retrieves all expenses for the given group, newest first.
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID to retrieve expenses for
 *     responses:
 *       200:
 *         description: List of expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       500:
 *         description: Failed to fetch expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch expenses
 */

router.get("/group/:groupId", protect, getGroupExpenses);

module.exports = router;

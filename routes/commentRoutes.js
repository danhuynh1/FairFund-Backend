const express = require("express");
const router = express.Router();
const { addComment, getCommentsByExpense } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware"); // Assuming you have auth

/**
 * @swagger
 * /api/comments/{expenseId}:
 *   post:
 *     summary: Add a comment to an expense
 *     tags:
 *       - Expenses
 *     security:
 *       - BearerAuth: []
 *     description: Allows a logged-in user to post a comment on a specific expense.
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Great dinner! Thanks for covering."
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 message:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Missing or invalid comment message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment message is required.
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense not found.
 *       500:
 *         description: Server error while adding comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error while adding comment.
 */

router.post("/:expenseId", protect, addComment);

/**
 * @swagger
 * /api/comments/{expenseId}:
 *   get:
 *     summary: Get all comments for an expense
 *     tags:
 *       - Expenses
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve all comments posted on a specific expense.
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   message:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       500:
 *         description: Server error while fetching comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch comments.
 */
router.get("/:expenseId", protect, getCommentsByExpense);

module.exports = router;

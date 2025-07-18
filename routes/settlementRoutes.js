// routes/settlementRoutes.js
const express = require('express');
const router = express.Router();
const { recordSettlement, getSettlementHistoryForGroup } = require('../controllers/settlementController'); // Assuming you have a settlementController
const { protect } = require('../middleware/authMiddleware'); // Assuming you have auth middleware


/**
 * @swagger
 * /api/settlements:
 *   post:
 *     summary: Record a new settlement transaction
 *     tags:
 *       - Settlements
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Records a new settlement transaction from one user to another within a group and returns the populated record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from
 *               - to
 *               - group
 *               - amount
 *             properties:
 *               from:
 *                 type: string
 *                 description: User ID who is paying
 *                 example: "64f123abc456def7890abcde"
 *               to:
 *                 type: string
 *                 description: User ID who is receiving payment
 *                 example: "64f124abc456def7890abcdf1"
 *               group:
 *                 type: string
 *                 description: Group ID associated with the settlement
 *                 example: "64f125abc456def7890abcff2"
 *               amount:
 *                 type: number
 *                 description: Amount settled
 *                 example: 50.75
 *     responses:
 *       201:
 *         description: Settlement recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Settlement recorded successfully
 *                 settlement:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f130abc456def7890abd12"
 *                     from:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f123abc456def7890abcde"
 *                         name:
 *                           type: string
 *                           example: "Alice"
 *                     to:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64f124abc456def7890abcdf1"
 *                         name:
 *                           type: string
 *                           example: "Bob"
 *                     group:
 *                       type: string
 *                       example: "64f125abc456def7890abcff2"
 *                     amount:
 *                       type: number
 *                       example: 50.75
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields.
 *       500:
 *         description: Failed to record settlement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to record settlement
 */
router.post('/', protect, recordSettlement);


/**
 * @swagger
 * /api/settlements/history/{groupId}:
 *   get:
 *     summary: Get settlement history for a specific group
 *     tags:
 *       - Settlements
 *     security:
 *       - BearerAuth: []
 *     description: Retrieves all settlement transactions for the given group, sorted by most recent first.
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to fetch settlement history for
 *     responses:
 *       200:
 *         description: Settlement history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64f130abc456def7890abd12"
 *                   from:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f123abc456def7890abcde"
 *                       name:
 *                         type: string
 *                         example: "Alice"
 *                   to:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f124abc456def7890abcdf1"
 *                       name:
 *                         type: string
 *                         example: "Bob"
 *                   group:
 *                     type: string
 *                     example: "64f125abc456def7890abcff2"
 *                   amount:
 *                     type: number
 *                     example: 50.75
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-02T15:42:00.000Z"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error while fetching settlement history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error while fetching settlement history.
 */
router.get('/group/:groupId', protect, getSettlementHistoryForGroup);

module.exports = router;

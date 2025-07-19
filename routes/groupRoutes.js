// src/routes/groupRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createGroup,
  getGroupById,
  getMyGroups,
  addUsersToGroup,
  removeUsersFromGroup,
  getGroupBalances,
  updateGroupBudget,
  addBudgetPlan,
  deleteBudgetPlan,
  getGroupActivity,
  updateGroupInfo
} = require("../controllers/groupController");

/**
 * @swagger
 * /api/groups/:
 *   get:
 *     summary: Get all groups for the logged-in user
 *     tags:
 *       - Groups
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Returns a list of groups that the currently authenticated user is a member of.  
 *       Each group includes a flag `isUnsettled` indicating if any balances in the group are not settled.
 *     responses:
 *       200:
 *         description: Successfully fetched user groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64e4f2985f3a2e19c56a7e91"
 *                   name:
 *                     type: string
 *                     example: "Roommates Budget"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-01T18:32:45.123Z"
 *                   isUnsettled:
 *                     type: boolean
 *                     example: true
 *       401:
 *         description: Unauthorized – user not authenticated
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.get("/", protect, getMyGroups);

/**
 * @swagger
 * /api/groups/create:
 *   post:
 *     summary: Create a new group
 *     tags:
 *       - Groups
 *     security:
 *       - BearerAuth: []
 *     description: Creates a new group with the logged-in user as the creator and member.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Roommates Budget"
 *               description:
 *                 type: string
 *                 example: "Tracking shared living expenses"
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f123abc456def7890abcde"
 *                 name:
 *                   type: string
 *                   example: "Roommates Budget"
 *                 description:
 *                   type: string
 *                   example: "Tracking shared living expenses"
 *                 createdBy:
 *                   type: string
 *                   example: "64f111abc123def4560abcd9"
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["64f111abc123def4560abcd9"]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide a group name.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to create group
 *                 error:
 *                   type: string
 *                   example: Validation failed
 */
router.post("/create", protect, createGroup);

// GET /api/groups/:id -> gets a single group by its ID
/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get a single group by ID
 *     tags:
 *       - Groups
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Retrieves a specific group by its ID if the authenticated user is a member of that group.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f123abc456def7890abcde"
 *                 name:
 *                   type: string
 *                   example: "Trip to Japan"
 *                 description:
 *                   type: string
 *                   example: "Expenses for Japan group"
 *                 createdBy:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64eabc1234de5678ef90cd12"
 *                     name:
 *                       type: string
 *                       example: "Alice"
 *                     email:
 *                       type: string
 *                       example: "alice@example.com"
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64eabc1234de5678ef90cd13"
 *                       name:
 *                         type: string
 *                         example: "Bob"
 *                       email:
 *                         type: string
 *                         example: "bob@example.com"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - no user info in request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication error: User identity not found."
 *       403:
 *         description: Forbidden - user is not a member of this group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: You are not a member of this group."
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
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.get("/:id", protect, getGroupById);

/**
 * @swagger
 * /api/groups/{groupId}/add-users:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Add users to a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to add users to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d0fe4f5311236168a109cd", "60d0fe4f5311236168a109ce"]
 *     responses:
 *       200:
 *         description: Updated group with added users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 */
router.post("/:groupId/add-users", protect, addUsersToGroup);
router.get("/:groupId/balances", protect, getGroupBalances);

router.get("/:groupId/activity", protect, getGroupActivity);

router.route("/:groupId/budget").put(protect, updateGroupBudget);
router.route("/:groupId/budget-plans").post(protect, addBudgetPlan);
router.route("/:groupId/:categoryId/delete-budget-plan").delete(protect, deleteBudgetPlan);
router.route("/:groupId/edit").put(protect, updateGroupInfo);

module.exports = router;

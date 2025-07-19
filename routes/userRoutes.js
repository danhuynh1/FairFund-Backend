const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  googleLogin,
  createUser,
  searchUserByEmail,
} = require("../controllers/userController");

/**
 * @swagger
 * /api/users/google-login:
 *   post:
 *     summary: Google Sign-In
 *     tags:
 *       - User
 *     description: Authenticates a user via Google OAuth token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenId:
 *                 type: string
 *                 example: mock-google-token-id
 *     responses:
 *       200:
 *         description: Returns JWT and user data
 */
router.post("/google-login", googleLogin);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search for a user by email address
 *     tags:
 *       - User
 *     description: Returns user details (excluding sensitive info) for a given email.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address of the user to search for.
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 60c72b2f9b1e8b001f0e4e4f
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: john.doe@example.com
 *       400:
 *         description: Missing email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide an email address to search for.
 *       404:
 *         description: No user found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No user found with that email address.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error while searching for user.
 */
router.get("/search", protect, searchUserByEmail);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - User
 *     description: Register a new user with name, email, and optional role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/create", createUser);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [member, admin]
 *       required:
 *         - name
 *         - email
 */
module.exports = router;

// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user from the database using the ID in the token
      User.findById(decoded.userId).select('-password').then(user => {
        if (!user) {
          // If user not found, send an error
          return res.status(401).json({ message: 'User not found' });
        }
        
        // Attach the user object to the request
        req.user = user;
        
        // Proceed to the next middleware/controller
        next();
      }).catch(dbError => {
        // Handle potential database errors
        // console.error("Database error in middleware:", dbError);
        return res.status(500).json({ message: 'Server error during authentication' });
      });

    } catch (error) {
      // This catches errors if the token is invalid or expired
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // This runs if no 'Bearer' token is found
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

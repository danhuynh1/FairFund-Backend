const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin  = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload();


    let user = await User.findOne({ googleId: sub });

    if (!user) {
      user = await User.findOne({ email: email });
      if (user) {
        user.googleId = sub;
        await user.save();
        console.log(`Linked Google ID to existing email: ${email}`);
      }
    }
        if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
      });
      console.log(`Created a new user for: ${email}`);
    }

    const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log(token);
    res.json({ token }); 

  } catch (err) {
    console.error('--- FULL GOOGLE LOGIN ERROR ---');
    console.error(err);
    console.error('---------------------------------');
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

const createUser = async (req, res) => {
  const { name, email, role } = req.body;
  console.log(name);
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, role });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};


const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members createdBy', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const searchUserByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address to search for.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });

  } catch (error) {
    console.error('Error during user search:', error);
    res.status(500).json({ message: 'Server error while searching for user.' });
  }
};

module.exports = {
  googleLogin,
  createUser,searchUserByEmail, getGroupById
};

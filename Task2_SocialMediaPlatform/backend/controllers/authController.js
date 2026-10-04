const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserByUsername, createUser } = require('../models/userModel');

const signToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

const slugifyUsername = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

const register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    const username = slugifyUsername(req.body.username || '');

    if (!name || !name.trim() || !email || !password || !username) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (await findUserByEmail(email)) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    if (await findUserByUsername(username)) {
      return res.status(400).json({ message: 'This username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(name.trim(), username, email, hashedPassword);

    const user = { id: userId, name: name.trim(), username, email, bio: '', avatar_url: null };
    res.status(201).json({ message: 'Account created successfully', token: signToken(user), user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter your email and password' });
    }

    const found = await findUserByEmail(email);
    if (!found || !(await bcrypt.compare(password, found.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = {
      id: found.id,
      name: found.name,
      username: found.username,
      email: found.email,
      bio: found.bio,
      avatar_url: found.avatar_url
    };
    res.json({ message: 'Logged in successfully', token: signToken(user), user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { register, login };
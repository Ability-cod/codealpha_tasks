const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/userModel');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Please log in to continue' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Your session has expired. Please log in again' });
  }
};

module.exports = { protect };
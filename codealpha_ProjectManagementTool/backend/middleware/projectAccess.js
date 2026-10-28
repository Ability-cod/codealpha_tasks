const { getMemberRole } = require('../models/projectModel');

const requireMember = async (req, res, next) => {
  try {
    const role = await getMemberRole(req.params.projectId || req.params.id, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });
    req.projectRole = role;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const requireOwner = async (req, res, next) => {
  try {
    const role = await getMemberRole(req.params.projectId || req.params.id, req.user.id);
    if (role !== 'owner') return res.status(403).json({ message: 'Only the project owner can do this' });
    req.projectRole = role;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { requireMember, requireOwner };
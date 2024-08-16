// middleware/checkCreator.js

const checkCreator = (req, res, next) => {
    if (!req.user.isCreator) {
      return res.status(403).json({ msg: 'Permission denied. Only creators can perform this action.' });
    }
    next();
  };
  
  module.exports = checkCreator;
  
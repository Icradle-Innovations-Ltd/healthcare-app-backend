const User = require("../models/User");

exports.assignRole = async (req, res) => {
  const { userId, role } = req.body;

  try {
    const user = await User.findById(userId);
    user.role = role;
    await user.save();
    res.status(200).json({ message: "Role assigned successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error assigning role" });
  }
};

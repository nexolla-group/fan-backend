const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register
router.post("/register", async (req, res) => {
  try {
    // generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create a new user
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    res.status(200).json({ user: newUser });
  } catch (error) {
    res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5d",
      }
    );

    // user
    return res.status(200).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token,
      username: user.username,
      coverPicture: user.coverPicture,
      profilePicture: user.profilePicture,
      followers: user.followers,
      following: user.following,
      joinedGroups: user.joinedGroups,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json(error);
  }
});
module.exports = router;

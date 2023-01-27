const crypto = require("crypto");
const ErrorResponse = require("../helpers/errorResponse");
const asyncHandler = require("../middleware/async");

const Users = require("../models/Users");

// register
exports.userRegister = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // create user
  const user = await Users.create({
    username,
    email,
    password,
  });
  // create TOKEN
  res.status(200).json({ msg: `User ${username} is created `, data: user });
});

exports.fetchUsers = asyncHandler(async (req, res) => {
  const users = await Users.find();
  res.status(200).json({ msg: "success", data: users });
});
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await Users.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`user with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({
    success: true,
    msg: "user with id: " + req.params.id + " Has deleted",
  });
});

exports.getSingleUser = asyncHandler(async (req, res, next) => {
  const user = await Users.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`user with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({ msg: "success", data: user });
});

// login
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // Validate email & password
  if (!username || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await Users.findOne({ username }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// user logout
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    data: {},
    msg: "logged out!!",
  });
});

// Get token from models and create cookies and response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const id = user._id;
  const email = user.email;
  const fullName = user.fullName;
  const role = user.role;
  const token = user.getSignedJwtToken();
  const username = user.username;
  const coverPicture = user.coverPicture;
  const profilePicture = user.profilePicture;
  const followers = user.followers;
  const following = user.following;
  const joinedGroups = user.joinedGroups;

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    message: "success",
    token,
    email,
    fullName,
    role,
    username,
    coverPicture,
    profilePicture,
    followers,
    following,
    joinedGroups,
  });
};

// updated user details
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
  };

  const user = await Users.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "success",
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await Users.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Reset password
// @route     PUT /api/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await Users.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      min: 3,
    },
    username: {
      type: String,
      required: true,
      max: 20,
      min: 3,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    joinedGroups: {
      type: Array,
      default: [],
    },
    role: {
      type: String,
      default: "user",
      required: true,
    },
    // desc: {
    //   type: String,
    //   max: 50,
    // },
    // city: {
    //   type: String,
    //   max: 50,
    // },
    // from: {
    //   type: String,
    //   max: 50,
    // },
    // relationship: {
    //   type: Number,
    //   enum: [1, 2, 3],
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);

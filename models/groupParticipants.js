const mongoose = require("mongoose");

const groupParticipantsSchema = new mongoose.Schema(
  {
    groupId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("groupParticipants", groupParticipantsSchema);

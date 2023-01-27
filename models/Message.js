const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: String,
      require: true,
    },
    senderDetails: {
      type: Object,
      required: true,
    },
    message: {
      type: String,
      require: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);

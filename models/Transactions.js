const mongoose = require("mongoose");

const TransactionScheme = mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: [true, "Transaction Id is required"],
    },
    groupId: {
      type: mongoose.Schema.ObjectId,
      ref: "groups",
      required: [true, "please specify the group "],
    },

    amount: {
      type: Number,
      required: [true, "Please specify amount to send"],
    },
    transactionStatus: {
      type: String,
    },
    senderName: {
      type: String,
      required: [true, "sender name is required"],
    },
    telephoneNumber: {
      type: String,
      required: [true, "Provide phone number"],
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionScheme);

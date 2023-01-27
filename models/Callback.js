const mongoose = require("mongoose");

const CallbackScheme = mongoose.Schema(
  {
    statusDescription: {
      type: String,
    },
    spTransactionId: {
      type: String,
    },

    walletTransactionId: {
      type: String,
    },
    chargedCommission: {
      type: String,
    },
    currency: {
      type: String,
    },
    paidAmount: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    statusCode: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Callback", CallbackScheme);

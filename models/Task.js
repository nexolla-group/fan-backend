const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    taskTitle: {
      type: String,
      required: [true, "Provide title of this contribution"],
    },
    taskDescription: {
      type: String,
      required: [true, "Provide description of this contribution"],
    },
    balance: {
      type: Number,
      default: 0,
    },
    maximumAmount: {
      type: Number,
      required: [true, "Enter the maximum amount of this contribution"],
    },
    currentPercent: {
      type: Number,
      default: 0,
    },
    taskDeadline: {
      type: Date,
      required: [true, "Please provide the deadline of this contribution"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// cascade delete transaction when prisoner deleted
TaskSchema.pre("remove", async function (next) {
  console.log(`transaction being removed from Task ${this._id}`);
  await this.model("Transaction").deleteMany({ task: this._id });
  next();
});

// reverse populate with virtuals
TaskSchema.virtual("transaction", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "task",
  justOne: false,
});

module.exports = mongoose.model("Task", TaskSchema);

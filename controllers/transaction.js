const ErrorResponse = require("../helpers/errorResponse");
const asyncHandler = require("../middleware/async");
const Callback = require("../models/Callback");
const Task = require("../models/Task");
const Transactions = require("../models/Transactions");
const Groups = require("../models/groups");

exports.createTransaction = asyncHandler(async (req, res, next) => {
  const {
    transactionId,
    amount,
    transactionStatus,
    senderName,
    telephoneNumber,
    address,
    groupId,
  } = req.body;
  // const contribution = await Task.findOne({ _id: task });
  // if (contribution) {
  await Transactions.create({
    transactionId,
    groupId,
    amount,
    transactionStatus,
    senderName,
    telephoneNumber,
    address,
  })
    .then(async (resp) => {
      res.status(200).json({ success: true, data: resp });
    })
    .catch((e) => {
      res.status(500).json({ msg: "failed to make transaction!!", error: e });
    });
  // } else {
  //   res.status(400).json({ msg: "transaction fail task not found!!!" });
  // }
});
exports.getTransaction = asyncHandler(async (req, res, next) => {
  const transactions = await Transactions.find().populate({
    path: "task",
    select: "taskTitle taskDescription",
  });
  res.status(200).json({
    count: transactions.length,
    msg: "fetched transaction",
    transactions,
  });
});

exports.getTransactionsPerTask = asyncHandler(async (req, res, next) => {
  const transaction = await Transactions.find({
    task: { _id: req.params.taskId },
  });

  if (!transaction) {
    return next(new ErrorResponse(`No history related with this Task`, 400));
  }

  res.status(200).json({ msg: "Retrived transactions", transaction });
});

exports.paymentCallback = asyncHandler(async (req, res, next) => {
  const status = req.body.status;

  if (status == "SUCCESS") {
    const transaction = await Transactions.findOneAndUpdate(
      {
        transactionId: req.params.txId,
      },
      { transactionStatus: "SUCCESS" },
      {
        new: true,
      }
    );

    if (!transaction) {
      return next(
        new ErrorResponse(
          `transaction with id: ${req.params.txid} not found`,
          404
        )
      );
    }
  }
  if (status == "FAILED") {
    const transaction = await Transactions.findOneAndUpdate(
      {
        transactionId: req.params.txId,
      },
      { transactionStatus: "FAILED" },
      {
        new: true,
      }
    );
    if (!transaction) {
      return next(
        new ErrorResponse(
          `transaction with id: ${req.params.txid} not found`,
          404
        )
      );
    }
  }
  if (status !== "SUCCESS") {
    return next(
      new ErrorResponse(
        `transaction with id: ${req.params.txid} had been failed`,
        200
      )
    );
  }

  res.status(200).json({
    success: true,
    data: {
      msg: `transaction with id: ${req.params.id} has already updated`,
    },
  });
});

exports.createCallback = asyncHandler(async (req, res, next) => {
  const callback = await Callback.create(req.body);
  const status = req.body.status;
  const amount = parseInt(req.body.paidAmount);
  const transaction = await Transactions.findOne({
    transactionId: req.body.transactionId,
  });
  if (!transaction) {
    return next(
      new ErrorResponse(
        `transaction with id: ${req.params.txid} not found`,
        404
      )
    );
  }
  // const taskId = transaction.task;
  const groupId = transaction.groupId;

  if (status == "SUCCESS") {
    const transaction = await Transactions.findOneAndUpdate(
      {
        transactionId: req.body.transactionId,
      },
      { transactionStatus: "SUCCESS" },
      {
        new: true,
      }
    );
    const gr = await Groups.findOne({ _id: groupId });
    if (gr) {
      const newTargetReached =
        Number(gr.targetReached) + Number(req.body.paidAmount);
      await Groups.updateOne(
        { _id: groupId },
        {
          targetReached: newTargetReached,
        }
      );
    }
  }
  if (status == "FAILED") {
    const transaction = await Transactions.findOneAndUpdate(
      {
        transactionId: req.body.transactionId,
      },
      { transactionStatus: "FAILED" },
      {
        new: true,
      }
    );
  }
  if (status !== "SUCCESS") {
    return next(
      new ErrorResponse(
        `transaction with id: ${req.body.transactionId} had been updated`,
        200
      )
    );
  }

  res.status(200).json({ msg: "callback", data: callback });
});

exports.displayCallback = asyncHandler(async (req, res, next) => {
  const callback = await Callback.find();
  res.status(200).json({ msg: "retrived data", data: callback });
});

exports.withdraw = asyncHandler(async (req, res, next) => {
  const { taskId, amount } = req.body;
  if (taskId && amount <= 0) {
    return next(new ErrorResponse(`please enter amount you want`, 400));
  }
  if (amount >= 1 && taskId == "") {
    return next(new ErrorResponse(`Please Specify task`, 400));
  }

  const task = await Task.findOne({ _id: taskId });
  const newBalance = task.balance - amount;
  if (newBalance < 0) {
    return next(new ErrorResponse(`Insufficient amounts`, 400));
  }

  const updateAccount = await task.updateOne({ balance: newBalance });
  res.status(200).json({ msg: "success", balance: newBalance });
});

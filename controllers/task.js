const ErrorResponse = require("../helpers/errorResponse");
const asyncHandler = require("../middleware/async");
const Task = require("../models/Task");

exports.getContribution = asyncHandler(async (req, res, next) => {
  const contribution = await Task.find();
  if (contribution.length <= 0) {
    return next(new ErrorResponse("No contribution made", 204));
  }
  res.status(200).json({ msg: "Fetched contribution", data: contribution });
});
exports.createContribution = asyncHandler(async (req, res, next) => {
  const { taskTitle, taskDescription, balance, maximumAmount, taskDeadline } =
    req.body;
  if (
    taskTitle == "" ||
    taskDescription == "" ||
    maximumAmount == "" ||
    taskDeadline == ""
  ) {
    return next(new ErrorResponse("Please fill all required field", 422));
  }
  const contribution = await Task.create({
    taskTitle,
    taskDescription,
    balance,
    maximumAmount,
    taskDeadline,
  });

  res.status(201).json({ msg: "success", data: contribution });
});

exports.getSingleContribution = asyncHandler(async (req, res, next) => {
  const contribution = await Task.findById(req.params.taskId);
  if (!contribution) {
    return next(
      new ErrorResponse(
        `Contribution with an id: ${req.params.taskId} not found`,
        404
      )
    );
  }
  res.status(200).json({ msg: "retrived contribution", data: contribution });
});

exports.updateContribution = asyncHandler(async (req, res, next) => {
  const contribution = await Task.findByIdAndUpdate(
    req.params.taskId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!contribution) {
    return next(
      new ErrorResponse(`Task with an id: ${req.params.taskId} not found`, 404)
    );
  }
  res.status(200).json({
    success: true,
    msg: `update a contribution with id of ${req.params.taskId} is Successfully updated`,
    contribution,
  });
});

exports.deleteContribution = asyncHandler(async (req, res, next) => {
  const contribution = await Task.findByIdAndDelete(req.params.taskId);
  if (!contribution) {
    return next(
      new ErrorResponse(`Task with an id: ${req.params.taskId} not found`, 404)
    );
  }

  contribution.remove();
  res.status(200).json({
    success: true,
    msg: `A contribution with id of ${req.params.taskId} is successfully deleted`,
  });
});

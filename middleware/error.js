const ErrorResponse = require("../helpers/errorResponse");

const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;
  console.log("this error is located in middleware", error);
  if (error.name === "CastError") {
    const message = `Oops! Nothing related with ${error.value}.`;
    err = new ErrorResponse(message, 404);
  }

  if (error.code === 11000) {
    const message = `${Object.keys(error.keyPattern)[0]} ${
      Object.values(error.keyValue)[0]
    } is Already Exist`;

    err = new ErrorResponse(message, 400);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors).map((val) => val.message);
    err = new ErrorResponse(message, 400);
  }
  if (error.name === "TypeError") {
    err = new ErrorResponse(error.message, 400);
  }

  res
    .status(err.statusCode || 500)
    .json({ success: false, error: err.message || "Server Error" });
};
module.exports = errorHandler;

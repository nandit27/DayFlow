export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  statusCode = statusCode || 500;
  message = message || "Internal Server Error";

  const response = {
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  console.error(`[Error] ${statusCode} - ${message}\n`, err.stack);

  res.status(statusCode).json(response);
};

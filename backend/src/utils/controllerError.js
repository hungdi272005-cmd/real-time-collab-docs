export const createAppError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const sendControllerError = (res, error) => {
  const statusCode = error.statusCode || (error.code === 11000 ? 409 : 500);

  if (statusCode === 500) {
    return res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }

  return res.status(statusCode).json({ message: error.message });
};

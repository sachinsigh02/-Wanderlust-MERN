class ExpressError extends Error {
  constructor(message = "Something went wrong", statusCode = 500) {
    super(message); // Call the parent class constructor with the message
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;

  
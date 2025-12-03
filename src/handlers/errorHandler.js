const CARDError = require("../errors/customErrorClass");

class ErrorHandler {
    static constructCARDError(err) {
        if (err instanceof CARDError) {
            return err;
          } else {
            const cardError = new CARDError({err: err.message});
            return cardError
        }
    }
}

module.exports = ErrorHandler;
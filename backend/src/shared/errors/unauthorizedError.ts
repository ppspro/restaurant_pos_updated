import { CustomError } from './customError';

export class UnauthorizedError extends CustomError {
  statusCode = 401;
  constructor(public message: string = 'Unauthorized access') {
    super(message);
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

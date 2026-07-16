import { CustomError } from './customError';

export class ForbiddenError extends CustomError {
  statusCode = 403;
  constructor(public message: string = 'Access denied: forbidden resource') {
    super(message);
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

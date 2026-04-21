export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
  
    constructor(message: string, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  
    static notFound(message = 'Resource not found'): AppError {
      return new AppError(message, 404);
    }
  
    static badRequest(message = 'Bad request'): AppError {
      return new AppError(message, 400);
    }
  }
  
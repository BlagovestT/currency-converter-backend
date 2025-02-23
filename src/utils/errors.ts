export class AppError extends Error {
  constructor(
    public statusCode: number,
    public status: string,
    message: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, "NOT FOUND", message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, "BAD REQUEST", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(403, "FORBIDDEN", message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(429, "TOO MANY REQUESTS", message);
  }
}

export class InternalError extends AppError {
  constructor(message: string) {
    super(500, "INTERNAL SERVER ERROR", message);
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.TooManyRequestsError = exports.ForbiddenError = exports.BadRequestError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, status, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = status;
        this.statusCode = statusCode;
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message) {
        super(404, "NOT FOUND", message);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends AppError {
    constructor(message) {
        super(400, "BAD REQUEST", message);
    }
}
exports.BadRequestError = BadRequestError;
class ForbiddenError extends AppError {
    constructor(message) {
        super(403, "FORBIDDEN", message);
    }
}
exports.ForbiddenError = ForbiddenError;
class TooManyRequestsError extends AppError {
    constructor(message) {
        super(429, "TOO MANY REQUESTS", message);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalError extends AppError {
    constructor(message) {
        super(500, "INTERNAL SERVER ERROR", message);
    }
}
exports.InternalError = InternalError;

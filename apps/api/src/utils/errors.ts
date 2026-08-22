import { ERROR_CODES, HTTP_STATUS } from '@stock-analyser/shared';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function createAuthenticationError(message = 'Authentication is required'): AppError {
  return new AppError(ERROR_CODES.AUTHENTICATION_REQUIRED, message, HTTP_STATUS.UNAUTHORIZED);
}

export function createAuthorizationError(message = 'You do not have permission to perform this action'): AppError {
  return new AppError(ERROR_CODES.FORBIDDEN, message, HTTP_STATUS.FORBIDDEN);
}

export function createValidationError(message: string): AppError {
  return new AppError(ERROR_CODES.INVALID_INPUT, message, HTTP_STATUS.BAD_REQUEST);
}

export function createNotFoundError(message = 'Resource not found'): AppError {
  return new AppError(ERROR_CODES.USER_NOT_FOUND, message, HTTP_STATUS.NOT_FOUND);
}

export function createConflictError(message: string): AppError {
  return new AppError(ERROR_CODES.USER_ALREADY_EXISTS, message, HTTP_STATUS.CONFLICT);
}

export function createInvalidCredentialsError(): AppError {
  return new AppError(ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
}

export function createSessionExpiredError(): AppError {
  return new AppError(ERROR_CODES.SESSION_EXPIRED, 'Your session has expired. Please log in again', HTTP_STATUS.UNAUTHORIZED);
}

export function createCannotDeleteSelfError(): AppError {
  return new AppError(ERROR_CODES.CANNOT_DELETE_SELF, 'You cannot delete your own account', HTTP_STATUS.CONFLICT);
}

export function createCannotDeleteLastAdminError(): AppError {
  return new AppError(
    ERROR_CODES.CANNOT_DELETE_LAST_ADMIN,
    'Cannot delete the last administrator account',
    HTTP_STATUS.CONFLICT
  );
}

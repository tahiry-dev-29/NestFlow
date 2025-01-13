export const ERROR_MESSAGES = {
  USER_RETRIEVAL: 'Error retrieving user data',
  INVALID_CREDENTIALS: 'Invalid credentials',
  LOGIN_ERROR: 'Error during login',
  USER_NOT_FOUND: 'User not found',
  LOGOUT_ERROR: 'Error during user retrieval : ',
  ACCOUNT_CREATION: 'Error during account creation',
  USER_CREATION_ERROR: 'Error creating user. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden. Please check your permissions.',
  TOKEN_EXPIRED: 'Token expired. Please login again.',
  PASSWORD_OR_EMAIL_INCORRECT: 'Password or email incorrect',  
};

export const SERVER_ERROR_MESSAGES = {
  404: 'Resource not found',
  403: 'Access forbidden. Please check your permissions.',
  401: 'Unauthorized. Please login again.',
  500: 'Internal server error. Please try again later.',
  400: 'Bad request. Please check your input.',
};

export const ERROR_MESSAGES_FORM = {
  PASSWORD_MISMATCH: 'Password mismatch',
  PASSWORD_REQUIRED: 'Password is required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Invalid email',
  MIN_LENGTH: 'Minimum 8 characters',
  REQUIRED: 'This field is required',
  VALIDATION_ERROR: 'Validation error',
};

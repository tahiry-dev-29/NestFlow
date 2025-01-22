export const ERROR_MESSAGES = {
  USER_RETRIEVAL: 'Error retrieving user data',
  INVALID_CREDENTIALS: 'Email or password incorrect',
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
  400: 'Bad request. Please check your input.',
  401: 'Unauthorized. Please login again.',
  403: 'Access forbidden. Please check your permissions.',
  404: 'Resource not found',
  500: 'Internal server error. Please try again later.',
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


export const errorMessages: { [key: string]: { [key: string]: string } } = {
  fullname: {
      required: 'The full name is required.',
      minlength: 'The full name must contain at least 5 characters.',
      maxlength: 'The full name must contain at most 50 characters.',
  },
  email: {
      required: 'The email is required.',
      email: 'The email is invalid.'
  },
  tel: {
      required: 'The phone number is required.',
      pattern: 'The phone number is invalid. ex: 1234567890'
  },
  adresse: {
      required: 'The address is required.',
      minlength: 'The address must contain at least 5 characters.',
      maxlength: 'The address must contain at most 60 characters.'
  },
  code: {
      required: 'The password is required.',
      minlength: 'The password must contain at least 4 characters.',
      maxlength: 'The password must contain at most 4 characters.',
      pattern: 'The password must contain only numbers.'
  },
  subscriptionType: {
      required: 'The subscription type is required.'
  },
  duration: {
      required: 'The duration is required.',
      min: 'The duration must be at least 1.'
  },
  timeUnit: {
      required: 'The time unit is required.'
  }
};
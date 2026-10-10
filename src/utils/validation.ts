/**
 * Validate Name
 */
export const validateName = (name: string): string => {
  if (!name.trim()) {
    return 'Name is required';
  }

  if (name.trim().length < 3) {
    return 'Name must be at least 3 characters';
  }

  return '';
};

/**
 * Validate Email
 */
export const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return 'Email is required';
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Please enter a valid email';
  }

  return '';
};

/**
 * Validate Password
 */
export const validatePassword = (password: string): string => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return '';
};

/**
 * Validate Confirm Password
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string => {
  if (!confirmPassword) {
    return 'Confirm Password is required';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return '';
};

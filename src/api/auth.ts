import api from './api';

// =========================
// Types
// =========================

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  developmentOTP?: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// =========================
// Email Validation
// =========================

export const isValidSRMAPEmail = (
  email: string,
): boolean => {
  return /^[^\s@]+@srmap\.edu\.in$/i.test(email.trim());
};

// =========================
// Send Registration OTP
// =========================

export const sendEmailOTP = async (
  email: string,
): Promise<ApiResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidSRMAPEmail(normalizedEmail)) {
    throw new Error(
      'Enter an email that ends with @srmap.edu.in',
    );
  }

  const response = await api.post(
    '/auth/send-email-otp',
    {
      email: normalizedEmail,
    },
  );

  return response.data;
};

// =========================
// Register User
// Call only after email verification
// =========================

export const registerUser = async (
  user: RegisterData,
): Promise<RegisterResponse> => {
  const normalizedEmail = user.email.trim().toLowerCase();

  if (!isValidSRMAPEmail(normalizedEmail)) {
    throw new Error(
      'Enter an email that ends with @srmap.edu.in',
    );
  }

  if (!user.name.trim()) {
    throw new Error('Enter your name');
  }

  if (!/^\d{10}$/.test(user.phone.trim())) {
    throw new Error('Enter a valid 10-digit mobile number');
  }

  if (user.password.length < 8) {
    throw new Error(
      'Password must contain at least 8 characters',
    );
  }

  const response = await api.post(
    '/auth/register',
    {
      name: user.name.trim(),
      email: normalizedEmail,
      phone: user.phone.trim(),
      password: user.password,
    },
  );

  return response.data;
};

// =========================
// Verify Registration Email OTP
// =========================

export const verifyEmailOTP = async (
  email: string,
  otp: string,
): Promise<ApiResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidSRMAPEmail(normalizedEmail)) {
    throw new Error(
      'Enter an email that ends with @srmap.edu.in',
    );
  }

  if (!/^\d{6}$/.test(otp.trim())) {
    throw new Error('Enter the valid 6-digit OTP');
  }

  const response = await api.post(
    '/auth/verify-email',
    {
      email: normalizedEmail,
      otp: otp.trim(),
    },
  );

  return response.data;
};

// =========================
// Resend Registration OTP
// =========================

export const resendEmailOTP = async (
  email: string,
): Promise<ApiResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidSRMAPEmail(normalizedEmail)) {
    throw new Error(
      'Enter an email that ends with @srmap.edu.in',
    );
  }

  const response = await api.post(
    '/auth/resend-email-otp',
    {
      email: normalizedEmail,
    },
  );

  return response.data;
};

// =========================
// Login with Mobile Number
// =========================

export const loginUser = async (
  data: LoginData,
): Promise<LoginResponse> => {
  if (!/^\d{10}$/.test(data.phone.trim())) {
    throw new Error('Enter a valid 10-digit mobile number');
  }

  if (!data.password) {
    throw new Error('Enter your password');
  }

  const response = await api.post(
    '/auth/login',
    {
      phone: data.phone.trim(),
      password: data.password,
    },
  );

  return response.data;
};

// =========================
// Forgot Password
// Request password-reset OTP
// =========================

export const forgotPassword = async (
  email: string,
): Promise<ApiResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidSRMAPEmail(normalizedEmail)) {
    throw new Error(
      'Enter an email that ends with @srmap.edu.in',
    );
  }

  const response = await api.post(
    '/auth/forgot-password',
    {
      email: normalizedEmail,
    },
  );

  return response.data;
};

// =========================
// Verify Password-Reset OTP
// =========================

export const verifyResetOTP = async (
  email: string,
  otp: string,
): Promise<ApiResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidSRMAPEmail(normalizedEmail)) {
    throw new Error(
      'Enter an email that ends with @srmap.edu.in',
    );
  }

  if (!/^\d{6}$/.test(otp.trim())) {
    throw new Error('Enter the valid 6-digit OTP');
  }

  const response = await api.post(
    '/auth/verify-reset-otp',
    {
      email: normalizedEmail,
      otp: otp.trim(),
    },
  );

  return response.data;
};

// =========================
// Reset Password
// =========================

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<ApiResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidSRMAPEmail(normalizedEmail)) {
    throw new Error(
      'Enter an email that ends with @srmap.edu.in',
    );
  }

  if (!/^\d{6}$/.test(otp.trim())) {
    throw new Error('Enter the valid 6-digit OTP');
  }

  if (newPassword.length < 8) {
    throw new Error(
      'Password must contain at least 8 characters',
    );
  }

  const response = await api.post(
    '/auth/reset-password',
    {
      email: normalizedEmail,
      otp: otp.trim(),
      newPassword,
    },
  );

  return response.data;
};

// =========================
// Get Profile
// =========================

export const getProfile = async (
  token: string,
) => {
  const response = await api.get(
    '/auth/profile',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

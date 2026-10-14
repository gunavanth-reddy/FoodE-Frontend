import api from './api';

// =========================
// Types
// =========================

export interface StudentVerificationData {
  username: string;
  password: string;
}

export interface VerifiedStudent {
  studentName?: string;
  registerNo?: string;
  institution?: string;
  program?: string;
  section?: string;
}

export interface StudentVerificationResponse {
  success: boolean;
  message: string;
  verificationToken?: string;
  student?: VerifiedStudent;
}

export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  verificationToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  role: string;
  isPhoneVerified: boolean;
  profileImage?: string;
  studentVerification?: {
    registerNo?: string;
    institution?: string;
    program?: string;
    isVerified?: boolean;
    verifiedAt?: string | null;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// =========================
// Helpers
// =========================

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const err = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
};

// =========================
// Verify SRM AP Student
// =========================

export const verifySRMAPStudent = async (
  data: StudentVerificationData,
): Promise<StudentVerificationResponse> => {
  const username = data.username.trim();
  const password = data.password;

  if (!username || !password) {
    throw new Error(
      'Enter your SRM AP ERP username and password.',
    );
  }

  try {
    const response =
      await api.post<StudentVerificationResponse>(
        '/auth/verify-student',
        { username, password },
      );

    const result = response.data;

    if (
      result?.success !== true ||
      !result.verificationToken?.trim()
    ) {
      throw new Error(
        result?.message || 'SRM AP student verification failed.',
      );
    }

    return result;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Unable to verify your SRM AP student identity.',
      ),
    );
  }
};

// =========================
// Register FoodE User
// =========================

export const registerUser = async (
  user: RegisterData,
): Promise<RegisterResponse> => {
  const name = user.name.trim();
  const phone = user.phone.trim();
  const verificationToken = user.verificationToken.trim();

  if (!verificationToken) {
    throw new Error(
      'Verify your SRM AP student identity before registering.',
    );
  }

  if (name.length < 2) {
    throw new Error('Enter a valid name.');
  }

  if (!/^\d{10}$/.test(phone)) {
    throw new Error('Enter a valid 10-digit mobile number.');
  }

  if (user.password.length < 8) {
    throw new Error(
      'Password must contain at least 8 characters.',
    );
  }

  try {
    const response = await api.post<RegisterResponse>(
      '/auth/register',
      {
        name,
        phone,
        password: user.password,
        verificationToken,
      },
    );

    if (response.data?.success !== true) {
      throw new Error(
        response.data?.message || 'FoodE registration failed.',
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, 'Unable to create your FoodE account.'),
    );
  }
};

// =========================
// Login
// Mobile Number + FoodE Password
// =========================

export const loginUser = async (
  data: LoginData,
): Promise<LoginResponse> => {
  const phone = data.phone.trim();

  if (!/^\d{10}$/.test(phone)) {
    throw new Error('Enter a valid 10-digit mobile number.');
  }

  if (!data.password) {
    throw new Error('Enter your FoodE password.');
  }

  try {
    const response = await api.post<LoginResponse>(
      '/auth/login',
      {
        phone,
        password: data.password,
      },
    );

    if (
      response.data?.success !== true ||
      !response.data.token ||
      !response.data.user
    ) {
      throw new Error(
        response.data?.message || 'FoodE login failed.',
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, 'Unable to log in to FoodE.'),
    );
  }
};

// =========================
// Get Profile
// =========================

export const getProfile = async (token: string) => {
  const response = await api.get('/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// =========================
// OTP Verification & Resend
// =========================

export const verifyEmailOTP = async (
  email: string,
  otp: string,
): Promise<{success: boolean; message: string}> => {
  const response = await api.post('/auth/verify-email-otp', {
    email,
    otp,
  });
  return response.data;
};

export const verifyPhoneOTP = async (
  phone: string,
  otp: string,
): Promise<{success: boolean; message: string}> => {
  const response = await api.post('/auth/verify-phone-otp', {
    phone,
    otp,
  });
  return response.data;
};

export const resendEmailOTP = async (
  email: string,
): Promise<{success: boolean; message: string; developmentOTP?: string}> => {
  const response = await api.post('/auth/resend-email-otp', {
    email,
  });
  return response.data;
};

export const resendPhoneOTP = async (
  phone: string,
): Promise<{success: boolean; message: string; developmentOTP?: string}> => {
  const response = await api.post('/auth/resend-phone-otp', {
    phone,
  });
  return response.data;
};


export type UserRole = 'claim-handler' | 'claimant' | 'contractor';

export type ClaimHandlerUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};

export type AuthSession = {
  token: string;
  user: ClaimHandlerUser;
};

export type OtpChallenge = {
  email: string;
  userId: string;
  expiresIn: number;
};

export type VerifyOtpPayload = {
  email: string;
  userId: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
  userId: string;
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetResult = {
  message: string;
};

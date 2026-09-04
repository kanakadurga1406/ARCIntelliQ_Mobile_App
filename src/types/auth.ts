export type UserRole = 'claim-handler' | 'claimant' | 'contractor';

export type ClaimHandlerUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
};

export type ClaimHandlerAccount = ClaimHandlerUser & {
  password: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  token: string;
  user: ClaimHandlerUser;
};

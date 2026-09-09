import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ClaimHandlerUser} from './auth';

export type RootStackParamList = {
  Splash: undefined;
  PortalSelect: undefined;
  ClaimHandlerLogin: undefined;
  ForgotPassword: undefined;
  VerifyOtp: {email: string; userId: string};
  ClaimHandlerHome: {user: ClaimHandlerUser};
  ClaimPortals: {
    user: ClaimHandlerUser;
    initialTab?: string;
    openAddClaim?: boolean;
  };
  Faqs: undefined;
  SmartSearch: undefined;
  ClaimHistory: {
    user: ClaimHandlerUser;
    portalId: string;
    portalName: string;
    openAddClaim?: boolean;
  };
  Users: {
    user: ClaimHandlerUser;
    portalId?: string;
    portalName?: string;
  };
  ClaimDetail: {
    claimId: string;
  };
};

export type SplashScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Splash'
>;

export type PortalSelectScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PortalSelect'
>;

export type ClaimHandlerLoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ClaimHandlerLogin'
>;

export type ForgotPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPassword'
>;

export type VerifyOtpScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'VerifyOtp'
>;

export type ClaimHandlerHomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ClaimHandlerHome'
>;

export type ClaimPortalsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ClaimPortals'
>;

export type FaqsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Faqs'
>;

export type SmartSearchScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SmartSearch'
>;

export type ClaimHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ClaimHistory'
>;

export type UsersScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Users'
>;

export type ClaimDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ClaimDetail'
>;

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ClaimHandlerUser} from './auth';

export type RootStackParamList = {
  Splash: undefined;
  PortalSelect: undefined;
  ClaimHandlerLogin: undefined;
  ClaimHandlerHome: {user: ClaimHandlerUser};
  ClaimPortals: {user: ClaimHandlerUser};
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

export type ClaimHandlerHomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ClaimHandlerHome'
>;

export type ClaimPortalsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ClaimPortals'
>;

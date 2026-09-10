import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  resendClaimHandlerOtp,
  verifyClaimHandlerOtp,
} from '../api/auth';
import {completePostLoginLanding} from '../api/business';
import {getPendingOtp, setSession} from '../api/session';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {ChevronIcon} from '../components/PortalIcons';
import {colors} from '../theme';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {VerifyOtpScreenProps} from '../types/navigation';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return email;
  }
  const visible = local.slice(0, 1);
  return `${visible}••••@${domain}`;
}

const VerifyOtpScreen = ({navigation, route}: VerifyOtpScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const {email, userId} = route.params;
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [code, setCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const submittedRef = useRef(false);

  const canVerify = code.length === OTP_LENGTH && !isVerifying;

  useEffect(() => {
    const stored = getPendingOtp();
    const nextUserId = stored?.userId || getLoginUserId() || userId;
    const nextEmail = stored?.email || email;
    if (nextUserId || nextEmail) {
      setPendingOtp({email: nextEmail, userId: nextUserId});
    }
  }, [email, userId]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }
    const timer = setTimeout(() => setSeconds(current => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setIsFocused(false);
    });
    return () => {
      clearTimeout(timer);
      hide.remove();
    };
  }, []);

  const focusOtp = () => {
    inputRef.current?.blur();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  };

  const handleChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, OTP_LENGTH));
    setErrorMessage('');
  };

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH || submittedRef.current) {
      if (code.length !== OTP_LENGTH) {
        setErrorMessage('Enter the 6-digit code to continue.');
      }
      return;
    }

    submittedRef.current = true;
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const stored = getPendingOtp();
      const session = await verifyClaimHandlerOtp({
        email: stored?.email || email,
        userId: getLoginUserId() || stored?.userId || userId,
        otp: code,
      });
      setSession(session);
      const next = await completePostLoginLanding(session);
      if (next.kind === 'enter') {
        const entered = getEnteredPortal();
        if (entered) {
          openEnteredWorkspace(navigation, session.user, entered, 'reset');
          return;
        }
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'ClaimHistory',
              params: {
                user: session.user,
                portalId: next.businessId,
                portalName: next.businessName,
              },
            },
          ],
        });
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{name: 'ClaimPortals', params: {user: session.user}}],
      });
    } catch (error) {
      submittedRef.current = false;
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to verify the code. Please try again.',
      );
      setCode('');
      focusOtp();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setErrorMessage('');
    try {
      await resendClaimHandlerOtp({
        email: getPendingOtp()?.email || email,
        userId: getLoginUserId() || userId,
      });
      setCode('');
      setSeconds(RESEND_SECONDS);
      focusOtp();
      showDialog({
        title: 'Code sent',
        message: `A new 6-digit code was sent to ${maskEmail(email)}.`,
      });
    } catch (error) {
      showDialog({
        title: 'Unable to resend',
        message:
          error instanceof Error
            ? error.message
            : 'Please wait a moment and try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (code.length === OTP_LENGTH && !isVerifying && !submittedRef.current) {
      handleVerify();
    }
  }, [code, isVerifying]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topWave} pointerEvents="none" />
      <View style={styles.topWaveSoft} pointerEvents="none" />
      <View style={styles.bottomWave} pointerEvents="none" />
      <View style={styles.bottomWaveSoft} pointerEvents="none" />

      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        style={({pressed}) => [
          styles.backButton,
          {top: insets.top + 8},
          pressed && styles.backButtonPressed,
        ]}>
        <View style={styles.backChevron}>
          <ChevronIcon color={colors.primaryDark} size={8} />
        </View>
      </Pressable>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 88,
              paddingBottom: insets.bottom + 36,
            },
          ]}>
          <Image
            source={require('../../assets/arcintelliq-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.kicker}>TWO-STEP VERIFICATION</Text>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {maskEmail(email)}.
          </Text>

          <Pressable
            onPress={focusOtp}
            accessibilityRole="button"
            accessibilityLabel="Enter 6-digit code"
            style={styles.otpWrap}>
            <View style={styles.otpRow} pointerEvents="none">
              {Array.from({length: OTP_LENGTH}, (_, index) => {
                const filled = Boolean(code[index]);
                const focused =
                  isFocused && index === Math.min(code.length, OTP_LENGTH - 1);
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      focused && styles.otpBoxFocused,
                      filled && !focused && styles.otpBoxFilled,
                    ]}>
                    <Text style={styles.otpMask}>{filled ? '●' : ' '}</Text>
                  </View>
                );
              })}
            </View>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              caretHidden
              showSoftInputOnFocus
              blurOnSubmit={false}
              pointerEvents="none"
              style={styles.hiddenInput}
            />
          </Pressable>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : (
            <View style={styles.otpSpacer} />
          )}

          <Pressable
            onPress={handleVerify}
            disabled={!canVerify}
            accessibilityRole="button"
            accessibilityLabel="Verify OTP"
            style={({pressed}) => [
              styles.submit,
              pressed && canVerify && styles.submitPressed,
              !canVerify && styles.submitDisabled,
            ]}>
            {isVerifying ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Text style={styles.submitText}>Verify OTP</Text>
                <View style={styles.submitArrow}>
                  <ChevronIcon color={colors.onPrimary} size={7} />
                </View>
              </>
            )}
          </Pressable>

          <Text style={styles.resendPrompt}>Didn't receive the code?</Text>
          {seconds > 0 ? (
            <Text style={styles.resendTimer}>Resend in {seconds}s</Text>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={isResending}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Resend code">
              <Text style={styles.resendLink}>
                {isResending ? 'Sending…' : 'Resend code'}
              </Text>
            </Pressable>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            hitSlop={8}
            style={styles.backToSignIn}>
            <View style={styles.backToSignInArrow}>
              <ChevronIcon color={colors.primary} size={7} />
            </View>
            <Text style={styles.backToSignInText}>Back to sign in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppDialog
        visible={dialog.visible}
        theme={theme}
        title={dialog.title}
        message={dialog.message}
        buttons={dialog.buttons}
        onClose={hideDialog}
      />
    </View>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  topWave: {
    position: 'absolute',
    top: -80,
    right: -90,
    width: 280,
    height: 200,
    borderRadius: 140,
    backgroundColor: colors.wave,
    transform: [{rotate: '16deg'}],
  },
  topWaveSoft: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 180,
    height: 130,
    borderRadius: 90,
    backgroundColor: colors.waveSoft,
  },
  bottomWave: {
    position: 'absolute',
    left: -70,
    bottom: -100,
    width: 300,
    height: 200,
    borderRadius: 140,
    backgroundColor: colors.waveBottom,
    transform: [{rotate: '-10deg'}],
  },
  bottomWaveSoft: {
    position: 'absolute',
    left: -30,
    bottom: -50,
    width: 200,
    height: 130,
    borderRadius: 80,
    backgroundColor: colors.waveBottomSoft,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  backChevron: {
    transform: [{rotate: '180deg'}],
  },
  logo: {
    width: 196,
    height: 26,
    marginTop: 12,
    marginBottom: 32,
  },
  kicker: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
    color: '#9AA6B5',
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.navy,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 36,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#7C8896',
    paddingHorizontal: 12,
  },
  otpWrap: {
    width: '100%',
    position: 'relative',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEF5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: '#F8FBFF',
  },
  otpBoxFilled: {
    borderColor: '#D7E8FF',
  },
  otpMask: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.navy,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
    textAlign: 'center',
  },
  otpSpacer: {
    height: 12,
  },
  submit: {
    width: '100%',
    minHeight: 54,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  submitPressed: {
    backgroundColor: colors.primaryDark,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  submitArrow: {
    marginLeft: 8,
    marginTop: 1,
  },
  resendPrompt: {
    marginTop: 18,
    fontSize: 13,
    color: colors.textSecondary,
  },
  resendTimer: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  resendLink: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  dividerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  or: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  backToSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backToSignInArrow: {
    transform: [{rotate: '180deg'}],
    marginTop: 1,
  },
  backToSignInText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});

import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
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
import {requestPasswordReset} from '../api/auth';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {EnvelopeIcon, RecoveryShieldIcon} from '../components/FormIcons';
import {ChevronIcon} from '../components/PortalIcons';
import {FadeSlideIn} from '../components/ui/Motion';
import {colors} from '../theme';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {ForgotPasswordScreenProps} from '../types/navigation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen({navigation}: ForgotPasswordScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await requestPasswordReset({email: trimmed});
      showDialog({
        title: 'Check your email',
        message: result.message,
        buttons: [
          {
            label: 'Back to sign in',
            tone: 'primary',
            onPress: () => navigation.goBack(),
          },
        ],
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to send the reset link. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topWave} pointerEvents="none" />
      <View style={styles.topWaveSoft} pointerEvents="none" />
      <View style={styles.bottomWave} pointerEvents="none" />
      <View style={styles.bottomWaveSoft} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <View style={{height: insets.top + 8}} />
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          hitSlop={8}
          style={styles.backLink}>
          <View style={styles.backChevron}>
            <ChevronIcon color={colors.primary} size={7} />
          </View>
          <Text style={styles.backLinkText}>Back to sign in</Text>
        </Pressable>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: insets.bottom + 16},
          ]}>
          <FadeSlideIn distance={12}>
          <Image
            source={require('../../assets/arcintelliq-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send a secure link to set a new password.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>
              Email address
              <Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <EnvelopeIcon />
              </View>
              <TextInput
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setErrorMessage('');
                }}
                placeholder="name@company.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                style={styles.input}
              />
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Send set-password link"
              style={({pressed}) => [
                styles.submit,
                pressed && !isSubmitting && styles.submitPressed,
                isSubmitting && styles.submitDisabled,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.submitText}>Send set-password link</Text>
                  <View style={styles.submitArrow}>
                    <ChevronIcon color={colors.onPrimary} size={7} />
                  </View>
                </>
              )}
            </Pressable>

            <View style={styles.infoBox}>
              <RecoveryShieldIcon />
              <View style={styles.infoCopy}>
                <Text style={styles.infoTitle}>Secure recovery</Text>
                <Text style={styles.infoText}>
                  The link expires after 60 minutes and can only be used for the
                  email on your account.
                </Text>
              </View>
            </View>
          </View>
          </FadeSlideIn>

          <Text style={styles.footer}>
            Remember your password?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
              Sign in
            </Text>
          </Text>
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
}

export default ForgotPasswordScreen;

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
    justifyContent: 'center',
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
  backLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 24,
  },
  backChevron: {
    transform: [{rotate: '180deg'}],
    marginTop: 1,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  logo: {
    alignSelf: 'center',
    width: 196,
    height: 26,
    marginTop: -18,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
  form: {
    width: '100%',
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.danger,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputFill,
    paddingLeft: 14,
    paddingRight: 12,
  },
  inputIcon: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
  },
  submit: {
    minHeight: 54,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: {
    backgroundColor: colors.primaryDark,
  },
  submitDisabled: {
    opacity: 0.7,
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
  infoBox: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentSofter,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 22,
    paddingTop: 0,
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});

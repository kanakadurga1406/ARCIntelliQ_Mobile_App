import React, {useState} from 'react';
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
  type KeyboardTypeOptions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronIcon} from '../components/PortalIcons';
import {
  EnvelopeIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from '../components/FormIcons';
import {loginClaimHandler} from '../api/auth';
import {setSession} from '../api/session';
import {colors} from '../theme';
import type {ClaimHandlerLoginScreenProps} from '../types/navigation';

type FieldProps = {
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Field({
  label,
  icon,
  trailing,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        <Text style={styles.required}> *</Text>
      </Text>
      <View style={styles.inputWrap}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
        {trailing}
      </View>
    </View>
  );
}

const ClaimHandlerLoginScreen = ({
  navigation,
}: ClaimHandlerLoginScreenProps) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const session = await loginClaimHandler({
        email: trimmedEmail,
        password,
      });
      setSession(session);
      navigation.replace('ClaimHandlerHome', {user: session.user});
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
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

      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Back to portal selection"
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
              paddingTop: insets.top + 28,
              paddingBottom: insets.bottom + 48,
            },
          ]}>
          <View style={styles.brandBlock}>
            <Image
              source={require('../../assets/arcintelliq-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>SMARTER CLAIMS TOGETHER</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Claim Handler sign in</Text>
            <Text style={styles.subtitle}>
              Access claims, workflows, AI insights, dashboards, and loss-run
              reporting.
            </Text>

            <Field
              label="Email address"
              icon={<EnvelopeIcon />}
              placeholder="name@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Field
              label="Password"
              icon={<LockIcon />}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              trailing={
                <Pressable
                  onPress={() => setShowPassword(current => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  hitSlop={8}
                  style={styles.eyeButton}>
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </Pressable>
              }
            />

            <View style={styles.row}>
              <Pressable
                onPress={() => setRememberMe(current => !current)}
                accessibilityRole="checkbox"
                accessibilityState={{checked: rememberMe}}
                style={styles.remember}>
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}>
                  {rememberMe ? <View style={styles.checkboxTick} /> : null}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Pressable hitSlop={6}>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Pressable
              onPress={handleSignIn}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Sign in securely"
              style={({pressed}) => [
                styles.submit,
                pressed && !isSubmitting && styles.submitPressed,
                isSubmitting && styles.submitDisabled,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.submitText}>Sign in securely</Text>
                  <View style={styles.submitArrow}>
                    <ChevronIcon color={colors.onPrimary} size={7} />
                  </View>
                </>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Need access?{' '}
            <Text style={styles.footerLink}>Contact your administrator</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ClaimHandlerLoginScreen;

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
    paddingHorizontal: 22,
  },
  topWave: {
    position: 'absolute',
    top: -90,
    left: -120,
    width: 320,
    height: 220,
    borderRadius: 160,
    backgroundColor: colors.wave,
    transform: [{rotate: '-12deg'}],
  },
  topWaveSoft: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: 220,
    height: 140,
    borderRadius: 90,
    backgroundColor: colors.waveSoft,
  },
  bottomWave: {
    position: 'absolute',
    right: -80,
    bottom: -110,
    width: 380,
    height: 210,
    borderRadius: 140,
    backgroundColor: colors.waveBottom,
    transform: [{rotate: '-8deg'}],
  },
  bottomWaveSoft: {
    position: 'absolute',
    left: -40,
    bottom: -70,
    width: 240,
    height: 140,
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
  brandBlock: {
    alignItems: 'center',
    marginTop: 52,
    marginBottom: 16,
  },
  logo: {
    width: 220,
    height: 28,
  },
  tagline: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.textMuted,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  field: {
    marginBottom: 16,
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
    paddingRight: 8,
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
  eyeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 22,
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTick: {
    width: 8,
    height: 5,
    marginTop: -1,
    borderLeftWidth: 1.8,
    borderBottomWidth: 1.8,
    borderColor: colors.onPrimary,
    transform: [{rotate: '-45deg'}],
  },
  rememberText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
  },
  submit: {
    minHeight: 54,
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
  footer: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});

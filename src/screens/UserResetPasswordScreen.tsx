import React, {useMemo, useState} from 'react';
import {
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
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {resetUserPassword} from '../api/users';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {
  CloseIcon,
  EyeMiniIcon,
  KeyMiniIcon,
  ShieldMiniIcon,
  UsersMiniIcon,
} from '../components/claimPortals/ClaimPortalsIcons';
import {FieldLabel} from '../components/claimPortals/IntakeFields';
import {UiIcon} from '../components/claimPortals/UiIcon';
import {colors} from '../theme';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {ClaimPortalTheme} from '../theme/claimPortals';
import type {UserResetPasswordScreenProps} from '../types/navigation';
import {
  getPasswordChecks,
  isStrongPassword,
  PASSWORD_SPECIAL,
  type PasswordChecks,
} from '../utils/userList';

type FormErrors = {
  password?: string;
  confirmPassword?: string;
};

const RULES: Array<{key: keyof PasswordChecks; label: string}> = [
  {key: 'length', label: 'At least 8 characters'},
  {key: 'upper', label: 'One uppercase letter'},
  {key: 'lower', label: 'One lowercase letter'},
  {key: 'number', label: 'One number'},
  {key: 'special', label: `One special character (${PASSWORD_SPECIAL})`},
];

function PasswordField({
  theme,
  label,
  value,
  onChangeText,
  placeholder,
  error,
  visible,
  onToggleVisible,
}: {
  theme: ClaimPortalTheme;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? '#F3B6C1'
    : focused
      ? theme.primary
      : theme.border;

  return (
    <View style={styles.field}>
      <FieldLabel theme={theme} label={label} required />
      <View
        style={[
          styles.passwordInput,
          {backgroundColor: theme.input, borderColor},
        ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password-new"
          textContentType="newPassword"
          returnKeyType="done"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.passwordField, {color: theme.text}]}
        />
        <Pressable
          onPress={onToggleVisible}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={8}
          style={styles.eyeButton}>
          <EyeMiniIcon color={theme.textMuted} size={18} />
          {visible ? null : <View style={styles.eyeSlash} />}
        </Pressable>
      </View>
      {error ? (
        <Text style={[styles.fieldError, {color: theme.danger}]}>{error}</Text>
      ) : null}
    </View>
  );
}

const UserResetPasswordScreen = ({
  navigation,
  route,
}: UserResetPasswordScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const sessionUser = route.params.user;
  const targetUser = route.params.targetUser;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const allRulesMet = isStrongPassword(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const goBack = () => navigation.goBack();

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!password) {
      next.password = 'Enter a new password.';
    } else if (!allRulesMet) {
      next.password = 'Password does not meet the security requirements.';
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Confirm the new password.';
    } else if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (saving || !validate()) {
      return;
    }

    setSaving(true);
    try {
      await resetUserPassword({
        userId: targetUser.id,
        password,
        confirmPassword,
      });
      navigation.navigate({
        name: 'Users',
        params: {
          user: sessionUser,
          portalId: route.params.portalId,
          portalName: route.params.portalName,
          savedUserName: targetUser.name,
          savedUserAction: 'password',
        },
        merge: true,
      });
    } catch (error) {
      showDialog({
        title: 'Unable to reset password',
        message:
          error instanceof Error
            ? error.message
            : 'Please try again in a moment.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, {backgroundColor: theme.page}]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2B74FF', '#6D5EF6', '#7C3AED']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.hero, {paddingTop: insets.top + 10}]}>
        <View style={styles.heroTop}>
          <View style={styles.heroMark}>
            <KeyMiniIcon color="#2B74FF" size={16} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Reset Password</Text>
            <Text style={styles.heroSubtitle}>
              Set a secure new password for this user account.
            </Text>
          </View>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
            style={({pressed}) => [
              styles.closeButton,
              {opacity: pressed ? 0.8 : 1},
            ]}>
            <CloseIcon color="#FFFFFF" size={12} />
          </Pressable>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}>
            <View style={[styles.accountIcon, {backgroundColor: colors.accentSoft}]}>
              <UsersMiniIcon color={theme.primary} size={16} />
            </View>
            <View style={styles.accountCopy}>
              <Text style={[styles.accountKicker, {color: theme.textMuted}]}>
                USER ACCOUNT
              </Text>
              <Text style={[styles.accountName, {color: theme.text}]} numberOfLines={1}>
                {targetUser.name}
              </Text>
              <Text
                style={[styles.accountEmail, {color: theme.textSecondary}]}
                numberOfLines={1}>
                {targetUser.email}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}>
            <PasswordField
              theme={theme}
              label="New Password"
              value={password}
              onChangeText={value => {
                setPassword(value);
                setErrors(current => ({...current, password: undefined}));
              }}
              placeholder="Enter new password"
              error={errors.password}
              visible={showPassword}
              onToggleVisible={() => setShowPassword(current => !current)}
            />
            <PasswordField
              theme={theme}
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={value => {
                setConfirmPassword(value);
                setErrors(current => ({
                  ...current,
                  confirmPassword: undefined,
                }));
              }}
              placeholder="Confirm new password"
              error={errors.confirmPassword}
              visible={showConfirm}
              onToggleVisible={() => setShowConfirm(current => !current)}
            />

            {passwordsMatch ? (
              <View
                style={[
                  styles.matchRow,
                  {backgroundColor: theme.successSoft},
                ]}>
                <UiIcon name="check" color={theme.success} size={12} />
                <Text style={[styles.matchText, {color: theme.success}]}>
                  Passwords match
                </Text>
              </View>
            ) : null}

            <View
              style={[
                styles.rulesCard,
                {
                  backgroundColor: allRulesMet
                    ? theme.successSoft
                    : colors.accentSoft,
                  borderColor: allRulesMet ? theme.success : theme.primary,
                },
              ]}>
              <View style={styles.rulesHead}>
                <ShieldMiniIcon
                  color={allRulesMet ? theme.success : theme.primary}
                  size={16}
                />
                <Text
                  style={[
                    styles.rulesTitle,
                    {color: allRulesMet ? theme.success : theme.primary},
                  ]}>
                  Password requirements
                </Text>
              </View>
              {RULES.map(rule => {
                const met = checks[rule.key];
                return (
                  <View key={rule.key} style={styles.ruleRow}>
                    <View
                      style={[
                        styles.ruleDot,
                        {
                          backgroundColor: met
                            ? theme.success
                            : 'transparent',
                          borderColor: met ? theme.success : theme.primary,
                        },
                      ]}>
                      {met ? (
                        <UiIcon name="check" color="#FFFFFF" size={9} />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.ruleText,
                        {
                          color: met ? theme.success : theme.primary,
                        },
                      ]}>
                      {rule.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={[styles.copyright, {color: theme.textMuted}]}>
            © 2026 ARC Global Risk · Powered by WebAppClouds
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({pressed}) => [
            styles.footerBack,
            {borderColor: theme.border, opacity: pressed ? 0.86 : 1},
          ]}>
          <Text style={[styles.footerBackText, {color: theme.text}]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save password"
          style={({pressed}) => [
            styles.footerSave,
            {
              backgroundColor: theme.primary,
              opacity: saving || pressed ? 0.86 : 1,
            },
          ]}>
          <UiIcon name="check" color={theme.onPrimary} size={14} />
          <Text style={[styles.footerSaveText, {color: theme.onPrimary}]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

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

export default UserResetPasswordScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  accountKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  accountName: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800',
  },
  accountEmail: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  field: {
    marginBottom: 12,
  },
  passwordInput: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 6,
  },
  passwordField: {
    flex: 1,
    minHeight: 48,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 0,
  },
  eyeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeSlash: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    backgroundColor: '#9AA6B5',
    transform: [{rotate: '-32deg'}],
  },
  fieldError: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rulesCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  rulesHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  rulesTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  copyright: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBack: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBackText: {
    fontSize: 15,
    fontWeight: '800',
  },
  footerSave: {
    flex: 1.35,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerSaveText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

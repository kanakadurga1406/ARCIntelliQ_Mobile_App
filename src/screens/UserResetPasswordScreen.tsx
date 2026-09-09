import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fetchUsersPage, resetUserPassword} from '../api/users';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {
  ChevronRightIcon,
  KeyMiniIcon,
  ShieldMiniIcon,
} from '../components/claimPortals/ClaimPortalsIcons';
import {FieldLabel} from '../components/claimPortals/IntakeFields';
import {UiIcon} from '../components/claimPortals/UiIcon';
import {colors} from '../theme';
import {getAvatarColor, getClaimPortalTheme, getInitials} from '../theme/claimPortals';
import type {ClaimPortalTheme} from '../theme/claimPortals';
import type {ResetPasswordConfig} from '../types/users';
import type {UserResetPasswordScreenProps} from '../types/navigation';
import {
  DEFAULT_RESET_PASSWORD_CONFIG,
  evaluatePasswordRule,
  mergeResetPasswordConfig,
  passwordMeetsPolicy,
} from '../utils/userList';

type FormErrors = {
  password?: string;
  confirmPassword?: string;
};

const DEFAULT_FILTERS = {
  status: 'all',
  businessId: 'all',
  userType: 'all',
  sortBy: 'latest',
};

type PasswordInput = React.ElementRef<typeof TextInput>;

function PasswordField({
  theme,
  label,
  value,
  onChangeText,
  placeholder,
  error,
  visible,
  onToggleVisible,
  returnKeyType,
  onSubmitEditing,
  inputRef,
}: {
  theme: ClaimPortalTheme;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  visible: boolean;
  onToggleVisible: () => void;
  returnKeyType: 'next' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.Ref<PasswordInput>;
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
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password-new"
          textContentType="newPassword"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === 'done'}
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
          <UiIcon
            name={visible ? 'eye' : 'eye-off'}
            color={theme.textMuted}
            size={18}
          />
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
  const confirmRef = useRef<PasswordInput>(null);

  const [copy, setCopy] = useState<ResetPasswordConfig>(
    DEFAULT_RESET_PASSWORD_CONFIG,
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchUsersPage({
      page: 1,
      limit: 1,
      search: '',
      filters: DEFAULT_FILTERS,
    })
      .then(result => {
        if (!cancelled) {
          setCopy(mergeResetPasswordConfig(result.config.resetPassword));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCopy(DEFAULT_RESET_PASSWORD_CONFIG);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const policy = copy.policy;
  const allRulesMet = passwordMeetsPolicy(password, policy);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const canSave = allRulesMet && passwordsMatch && !saving;

  const goBack = () => navigation.goBack();

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!password) {
      next.password = copy.emptyPassword;
    } else if (!allRulesMet) {
      next.password = copy.weakPassword;
    }
    if (!confirmPassword) {
      next.confirmPassword = copy.emptyConfirm;
    } else if (password !== confirmPassword) {
      next.confirmPassword = copy.mismatch;
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
        title: copy.saveErrorTitle,
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
      <StatusBar barStyle="dark-content" />
      <View style={{height: insets.top, backgroundColor: theme.page}} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}>
            <View style={styles.heroTop}>
              <Pressable
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel={copy.backLabel}
                hitSlop={8}
                style={({pressed}) => [
                  styles.backButton,
                  {
                    backgroundColor: theme.chip,
                    borderColor: theme.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <View style={styles.backChevron}>
                  <ChevronRightIcon color={theme.text} size={9} />
                </View>
              </Pressable>
              <View style={styles.heroMark}>
                <KeyMiniIcon color={theme.primary} size={16} />
              </View>
              <View style={styles.heroTopSpacer} />
            </View>
            <Text style={[styles.kicker, {color: theme.primary}]}>
              {copy.kicker}
            </Text>
            <Text style={[styles.pageTitle, {color: theme.text}]}>
              {copy.title}
            </Text>
            <Text style={[styles.pageSubtitle, {color: theme.textSecondary}]}>
              {copy.subtitle}
            </Text>
          </View>

          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: getAvatarColor(targetUser.name)},
              ]}>
              <Text style={styles.avatarText}>
                {getInitials(targetUser.name)}
              </Text>
            </View>
            <View style={styles.accountCopy}>
              <Text style={[styles.accountKicker, {color: theme.textMuted}]}>
                {copy.accountLabel}
              </Text>
              <Text
                style={[styles.accountName, {color: theme.text}]}
                numberOfLines={1}>
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
              label={copy.passwordLabel}
              value={password}
              onChangeText={value => {
                setPassword(value);
                setErrors(current => ({...current, password: undefined}));
              }}
              placeholder={copy.passwordPlaceholder}
              error={errors.password}
              visible={showPassword}
              onToggleVisible={() => setShowPassword(current => !current)}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <PasswordField
              theme={theme}
              label={copy.confirmLabel}
              value={confirmPassword}
              onChangeText={value => {
                setConfirmPassword(value);
                setErrors(current => ({
                  ...current,
                  confirmPassword: undefined,
                }));
              }}
              placeholder={copy.confirmPlaceholder}
              error={
                errors.confirmPassword ||
                (confirmPassword.length > 0 && !passwordsMatch
                  ? copy.mismatch
                  : undefined)
              }
              visible={showConfirm}
              onToggleVisible={() => setShowConfirm(current => !current)}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              inputRef={confirmRef}
            />

            {passwordsMatch ? (
              <View
                style={[styles.matchRow, {backgroundColor: theme.successSoft}]}>
                <UiIcon name="check" color={theme.success} size={12} />
                <Text style={[styles.matchText, {color: theme.success}]}>
                  {copy.matchLabel}
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
                  {copy.rulesTitle}
                </Text>
              </View>
              {policy.rules.map(rule => {
                const met = evaluatePasswordRule(password, rule, policy);
                return (
                  <View key={rule.id} style={styles.ruleRow}>
                    <View
                      style={[
                        styles.ruleDot,
                        {
                          backgroundColor: met ? theme.success : 'transparent',
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
                        {color: met ? theme.success : theme.primary},
                      ]}>
                      {rule.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}>
        <View style={styles.footerActions}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={copy.backLabel}
            style={({pressed}) => [
              styles.footerBack,
              {borderColor: theme.border, opacity: pressed ? 0.86 : 1},
            ]}>
            <Text style={[styles.footerBackText, {color: theme.text}]}>
              {copy.backLabel}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={copy.saveLabel}
            accessibilityState={{disabled: !canSave}}
            style={({pressed}) => [
              styles.footerSave,
              {
                backgroundColor: theme.primary,
                opacity: !canSave || pressed ? 0.45 : 1,
              },
            ]}>
            <UiIcon name="check" color={theme.onPrimary} size={14} />
            <Text style={[styles.footerSaveText, {color: theme.onPrimary}]}>
              {saving ? copy.savingLabel : copy.saveLabel}
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.copyright, {color: theme.textMuted}]}>
          {copy.copyright}
        </Text>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    transform: [{rotate: '180deg'}],
    marginRight: 2,
  },
  heroMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginLeft: 8,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTopSpacer: {
    flex: 1,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  pageTitle: {
    marginTop: 4,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  copyright: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    fontSize: 11,
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

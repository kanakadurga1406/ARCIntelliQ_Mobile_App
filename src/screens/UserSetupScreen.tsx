import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
import {fetchUsersPage, saveUser} from '../api/users';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {
  ChevronRightIcon,
  MailMiniIcon,
  PlusMiniIcon,
  UsersMiniIcon,
} from '../components/claimPortals/ClaimPortalsIcons';
import {
  FieldLabel,
  PhoneField,
  SelectField,
} from '../components/claimPortals/IntakeFields';
import {UiIcon} from '../components/claimPortals/UiIcon';
import {colors} from '../theme';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {ClaimPortalTheme} from '../theme/claimPortals';
import type {UserBusinessOption, UserFormValues} from '../types/users';
import type {UserSetupScreenProps} from '../types/navigation';
import {
  emptyAssignment,
  emptyUserForm,
  formFromUser,
  IDLE_MINUTE_PRESETS,
  isValidEmail,
} from '../utils/userList';

const DEFAULT_FILTERS = {
  status: 'all',
  businessId: 'all',
  userType: 'all',
  sortBy: 'latest',
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  idleMinutes?: string;
  assignments?: string;
};

function IconTextField({
  theme,
  label,
  required,
  error,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = 'sentences',
}: {
  theme: ClaimPortalTheme;
  label: string;
  required?: boolean;
  error?: string;
  icon: React.ReactNode;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#F3B6C1' : focused ? theme.primary : theme.border;

  return (
    <View style={styles.field}>
      <FieldLabel theme={theme} label={label} required={required} />
      <View
        style={[
          styles.iconInput,
          {backgroundColor: theme.input, borderColor},
        ]}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType="done"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.iconInputField, {color: theme.text}]}
        />
      </View>
      {error ? (
        <Text style={[styles.fieldError, {color: theme.danger}]}>{error}</Text>
      ) : null}
    </View>
  );
}

function Section({
  index,
  icon,
  title,
  subtitle,
  theme,
  action,
  children,
}: {
  index: string;
  icon: string;
  title: string;
  subtitle: string;
  theme: ClaimPortalTheme;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIndex, {backgroundColor: theme.primary}]}>
          <Text style={styles.sectionIndexText}>{index}</Text>
        </View>
        <View style={styles.sectionCopy}>
          <View style={styles.sectionTitleRow}>
            <UiIcon name={icon} color={theme.primary} size={15} />
            <Text style={[styles.sectionTitle, {color: theme.text}]}>{title}</Text>
            {action}
          </View>
          <Text style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
            {subtitle}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const UserSetupScreen = ({navigation, route}: UserSetupScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const sessionUser = route.params.user;
  const editingUser = route.params.editingUser;
  const portalId = route.params.portalId ?? '';
  const isEditing = Boolean(editingUser);

  const [values, setValues] = useState<UserFormValues>(() =>
    formFromUser(editingUser, portalId),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [businesses, setBusinesses] = useState<UserBusinessOption[]>([]);
  const [roles, setRoles] = useState<string[]>([
    'Employee',
    'Admin',
    'Manager',
    'Supervisor',
  ]);
  const [isLoading, setIsLoading] = useState(true);
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
        if (cancelled) {
          return;
        }
        setBusinesses(
          result.config.businesses.filter(item => item.id !== 'all'),
        );
        if (result.config.roles.length > 0) {
          setRoles(result.config.roles);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K],
  ) => {
    setValues(current => ({...current, [key]: value}));
    setErrors(current => ({...current, [key]: undefined}));
  };

  const updateAssignment = (
    id: string,
    patch: {portalId?: string; role?: string},
  ) => {
    setValues(current => ({
      ...current,
      assignments: current.assignments.map(item =>
        item.id === id ? {...item, ...patch} : item,
      ),
    }));
    setErrors(current => ({...current, assignments: undefined}));
  };

  const addAssignment = () => {
    setValues(current => ({
      ...current,
      assignments: [...current.assignments, emptyAssignment()],
    }));
  };

  const removeAssignment = (id: string) => {
    setValues(current => {
      if (current.assignments.length <= 1) {
        return {
          ...current,
          assignments: current.assignments.map(item =>
            item.id === id ? emptyAssignment() : item,
          ),
        };
      }
      return {
        ...current,
        assignments: current.assignments.filter(item => item.id !== id),
      };
    });
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!values.firstName.trim()) {
      next.firstName = 'Enter a first name.';
    }
    if (!values.lastName.trim()) {
      next.lastName = 'Enter a last name.';
    }
    if (!values.email.trim()) {
      next.email = 'Enter an email address.';
    } else if (!isValidEmail(values.email)) {
      next.email = 'Enter a valid email address.';
    }
    if (values.mobile.trim() && values.mobile.replace(/\D/g, '').length < 7) {
      next.mobile = 'Enter a valid mobile number.';
    }
    if (!Number.isFinite(values.idleMinutes) || values.idleMinutes < 1) {
      next.idleMinutes = 'Idle logout must be at least 1 minute.';
    }

    const filled = values.assignments.filter(item => item.portalId || item.role);
    if (filled.length === 0 || filled.some(item => !item.portalId || !item.role)) {
      next.assignments = 'Assign at least one business and role.';
    } else {
      const ids = filled.map(item => item.portalId);
      if (new Set(ids).size !== ids.length) {
        next.assignments = 'Each business can only be assigned once.';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = useCallback(() => {
    setErrors({});
    setValues(emptyUserForm(portalId));
  }, [portalId]);

  const requestNewAccount = () => {
    const dirty =
      values.firstName.trim() ||
      values.lastName.trim() ||
      values.email.trim() ||
      values.mobile.trim() ||
      values.isAdjuster ||
      values.isSupervisor;
    if (!dirty) {
      resetForm();
      return;
    }
    showDialog({
      title: 'Start a new account',
      message: 'This clears the form so you can create a different user.',
      buttons: [
        {label: 'Cancel'},
        {label: 'New account', tone: 'primary', onPress: resetForm},
      ],
    });
  };

  const handleSubmit = async () => {
    if (saving || !validate()) {
      return;
    }

    setSaving(true);
    try {
      const saved = await saveUser(
        {
          ...values,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          mobile: values.mobile.trim(),
          idleMinutes: Math.max(1, Math.round(values.idleMinutes)),
          assignments: values.assignments.filter(
            item => item.portalId && item.role,
          ),
        },
        editingUser?.id,
      );
      navigation.navigate({
        name: 'Users',
        params: {
          user: sessionUser,
          portalId: route.params.portalId,
          portalName: route.params.portalName,
          savedUserName: saved.name,
          savedUserAction: isEditing ? 'updated' : 'created',
        },
        merge: true,
      });
    } catch (error) {
      showDialog({
        title: 'Unable to save user',
        message:
          error instanceof Error ? error.message : 'Please try again in a moment.',
      });
    } finally {
      setSaving(false);
    }
  };

  const idleLabel =
    values.idleMinutes === 1 ? '1 minute' : `${values.idleMinutes || 0} minutes`;
  const minutesBorder = errors.idleMinutes
    ? '#F3B6C1'
    : theme.border;

  return (
    <View style={[styles.root, {backgroundColor: theme.page}]}>
      <StatusBar barStyle="dark-content" />
      <View style={{height: insets.top, backgroundColor: theme.page}} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
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
                  onPress={() => navigation.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
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
                  <UsersMiniIcon color={theme.primary} size={16} />
                  <View style={styles.heroPlus}>
                    <PlusMiniIcon color={theme.primary} size={9} />
                  </View>
                </View>
                <View style={styles.heroTopSpacer} />
                <Pressable
                  onPress={requestNewAccount}
                  accessibilityRole="button"
                  accessibilityLabel="New account"
                  style={({pressed}) => [
                    styles.newAccount,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      opacity: pressed ? 0.86 : 1,
                    },
                  ]}>
                  <PlusMiniIcon color={theme.text} size={11} />
                  <Text style={[styles.newAccountText, {color: theme.text}]}>
                    New account
                  </Text>
                </Pressable>
              </View>
              <Text style={[styles.kicker, {color: theme.primary}]}>
                USER SETUP
              </Text>
              <Text style={[styles.pageTitle, {color: theme.text}]}>
                {isEditing ? 'Edit user' : 'Add New User'}
              </Text>
              <Text style={[styles.pageSubtitle, {color: theme.textSecondary}]}>
                Manage account details, role assignment, business access, and
                password controls.
              </Text>
            </View>

            <Section
              index="01"
              icon="profile"
              title="Profile details"
              subtitle="Basic identity information for this claim-handler account."
              theme={theme}>
              <IconTextField
                theme={theme}
                label="First name"
                required
                icon={<UsersMiniIcon color={theme.textMuted} size={14} />}
                value={values.firstName}
                onChangeText={value => update('firstName', value)}
                placeholder="Enter first name"
                autoCapitalize="words"
                error={errors.firstName}
              />
              <IconTextField
                theme={theme}
                label="Last name"
                required
                icon={<UsersMiniIcon color={theme.textMuted} size={14} />}
                value={values.lastName}
                onChangeText={value => update('lastName', value)}
                placeholder="Enter last name"
                autoCapitalize="words"
                error={errors.lastName}
              />
              <IconTextField
                theme={theme}
                label="User email address"
                required
                icon={<MailMiniIcon color={theme.textMuted} size={14} />}
                value={values.email}
                onChangeText={value => update('email', value)}
                placeholder="name@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <PhoneField
                theme={theme}
                label="User mobile number"
                value={values.mobile}
                countryCode={values.mobileCode}
                onChangeText={value => update('mobile', value)}
                onChangeCode={value => update('mobileCode', value)}
                error={errors.mobile}
              />
            </Section>

            <Section
              index="02"
              icon="shield"
              title="Session security"
              subtitle="Idle logout rule for this user. Minimum is 1 minute."
              theme={theme}>
              <View style={styles.idleHead}>
                <Text style={[styles.idleLabel, {color: theme.text}]}>
                  Logout after inactivity
                </Text>
                <View
                  style={[styles.idleBadge, {backgroundColor: theme.successSoft}]}>
                  <Text style={[styles.idleBadgeText, {color: theme.success}]}>
                    {idleLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.idleRow}>
                <TextInput
                  value={String(values.idleMinutes || '')}
                  onChangeText={value => {
                    const digits = value.replace(/[^\d]/g, '').slice(0, 4);
                    update('idleMinutes', digits ? Number(digits) : 0);
                  }}
                  keyboardType="number-pad"
                  accessibilityLabel="Idle minutes"
                  style={[
                    styles.minutesBox,
                    {
                      color: theme.text,
                      backgroundColor: theme.input,
                      borderColor: minutesBorder,
                    },
                  ]}
                />
                {IDLE_MINUTE_PRESETS.map(preset => {
                  const selected = values.idleMinutes === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => update('idleMinutes', preset)}
                      accessibilityRole="button"
                      accessibilityState={{selected}}
                      style={[
                        styles.preset,
                        {
                          backgroundColor: selected ? theme.primary : theme.chip,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.presetText,
                          {color: selected ? theme.onPrimary : theme.chipText},
                        ]}>
                        {preset}m
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.idleMinutes ? (
                <Text style={[styles.fieldError, {color: theme.danger}]}>
                  {errors.idleMinutes}
                </Text>
              ) : (
                <Text style={[styles.helper, {color: theme.textMuted}]}>
                  This user is signed out after {idleLabel} of inactivity.
                </Text>
              )}
            </Section>

            <Section
              index="03"
              icon="layers"
              title="Role flags"
              subtitle="Optional claim workflow flags for this user."
              theme={theme}>
              {[
                {
                  key: 'isAdjuster' as const,
                  title: 'Adjuster',
                  hint: 'Eligible for claim assignment and adjuster workflows.',
                  checked: values.isAdjuster,
                },
                {
                  key: 'isSupervisor' as const,
                  title: 'Supervisor',
                  hint: 'Can oversee assigned adjusters for this portal.',
                  checked: values.isSupervisor,
                },
              ].map(flag => (
                <Pressable
                  key={flag.key}
                  onPress={() => update(flag.key, !flag.checked)}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked: flag.checked}}
                  style={({pressed}) => [
                    styles.flagCard,
                    {
                      backgroundColor: flag.checked
                        ? colors.accentSoft
                        : theme.card,
                      borderColor: flag.checked ? theme.primary : theme.border,
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}>
                  <View
                    style={[
                      styles.check,
                      {
                        backgroundColor: flag.checked
                          ? theme.primary
                          : theme.card,
                        borderColor: flag.checked ? theme.primary : theme.border,
                      },
                    ]}>
                    {flag.checked ? (
                      <UiIcon name="check" color={theme.onPrimary} size={12} />
                    ) : null}
                  </View>
                  <View style={styles.flagCopy}>
                    <Text style={[styles.flagTitle, {color: theme.text}]}>
                      {flag.title}
                    </Text>
                    <Text style={[styles.flagHint, {color: theme.textSecondary}]}>
                      {flag.hint}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </Section>

            <Section
              index="04"
              icon="briefcase"
              title="Access assignment"
              subtitle="Assign portal access and roles for this user."
              theme={theme}
              action={
                <Pressable
                  onPress={addAssignment}
                  accessibilityRole="button"
                  accessibilityLabel="Add business"
                  style={({pressed}) => [
                    styles.addBusiness,
                    {opacity: pressed ? 0.75 : 1},
                  ]}>
                  <PlusMiniIcon color={theme.primary} size={11} />
                  <Text style={[styles.addBusinessText, {color: theme.primary}]}>
                    Add business
                  </Text>
                </Pressable>
              }>
              {values.assignments.map((assignment, index) => {
                const businessLabel =
                  businesses.find(item => item.id === assignment.portalId)
                    ?.label ?? '';
                return (
                  <View
                    key={assignment.id}
                    style={[
                      styles.assignment,
                      {
                        backgroundColor: theme.page,
                        borderColor: theme.border,
                      },
                    ]}>
                    <View style={styles.assignmentHead}>
                      <Text
                        style={[styles.assignmentLabel, {color: theme.textMuted}]}>
                        BUSINESS {String(index + 1).padStart(2, '0')}
                      </Text>
                      <Pressable
                        onPress={() => removeAssignment(assignment.id)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove business"
                        hitSlop={8}
                        style={[
                          styles.trash,
                          {backgroundColor: theme.dangerSoft},
                        ]}>
                        <UiIcon name="trash" color={theme.danger} size={14} />
                      </Pressable>
                    </View>
                    <SelectField
                      theme={theme}
                      label="Select user business"
                      required
                      value={businessLabel}
                      options={businesses.map(item => item.label)}
                      placeholder="Select user business"
                      onChange={label => {
                        const match = businesses.find(
                          item => item.label === label,
                        );
                        updateAssignment(assignment.id, {
                          portalId: match?.id ?? '',
                        });
                      }}
                    />
                    <SelectField
                      theme={theme}
                      label="Select user role"
                      required
                      value={assignment.role}
                      options={roles}
                      placeholder="Select user role"
                      onChange={role =>
                        updateAssignment(assignment.id, {role})
                      }
                    />
                  </View>
                );
              })}
              {errors.assignments ? (
                <Text style={[styles.fieldError, {color: theme.danger}]}>
                  {errors.assignments}
                </Text>
              ) : null}
            </Section>

            <View style={[styles.info, {backgroundColor: colors.accentSoft}]}>
              <UiIcon name="shield" color={theme.primary} size={14} />
              <Text style={[styles.infoText, {color: theme.textSecondary}]}>
                After save, the user receives a set-password link by email
                (production).
              </Text>
            </View>
            <Text style={[styles.copyright, {color: theme.textMuted}]}>
              © 2026 ARC Global Risk · Powered by WebAppClouds
            </Text>
          </ScrollView>
        )}
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
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({pressed}) => [
            styles.footerBack,
            {borderColor: theme.border, opacity: pressed ? 0.86 : 1},
          ]}>
          <Text style={[styles.footerBackText, {color: theme.text}]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={saving || isLoading}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Save user' : 'Create user'}
          style={({pressed}) => [
            styles.footerSave,
            {
              backgroundColor: theme.primary,
              opacity: saving || isLoading || pressed ? 0.86 : 1,
            },
          ]}>
          <Text style={[styles.footerSaveText, {color: theme.onPrimary}]}>
            {saving ? 'Saving...' : isEditing ? 'Save user' : 'Create user'}
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

export default UserSetupScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 14,
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
  heroPlus: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  heroTopSpacer: {
    flex: 1,
  },
  newAccount: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  newAccountText: {
    fontSize: 13,
    fontWeight: '700',
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
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 10,
  },
  sectionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIndexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },
  field: {
    marginBottom: 12,
  },
  iconInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputIcon: {
    width: 18,
    alignItems: 'center',
  },
  iconInputField: {
    flex: 1,
    height: 48,
    fontSize: 15,
    padding: 0,
  },
  fieldError: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  idleHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  idleLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  idleBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  idleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  idleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  minutesBox: {
    width: 56,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    padding: 0,
  },
  preset: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '800',
  },
  helper: {
    fontSize: 12,
    lineHeight: 17,
  },
  flagCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  flagCopy: {
    flex: 1,
    minWidth: 0,
  },
  flagTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  flagHint: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },
  addBusiness: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  addBusinessText: {
    fontSize: 12,
    fontWeight: '800',
  },
  assignment: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  assignmentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assignmentLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  trash: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 14,
    padding: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  copyright: {
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSaveText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

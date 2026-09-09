import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  AppUser,
  UserBusinessOption,
  UserFormValues,
  UserStatus,
} from '../../types/users';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';
import {SelectField, TextField} from '../claimPortals/IntakeFields';
import {isValidEmail} from '../../utils/userList';

type UserFormSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  user: AppUser | null;
  businesses: UserBusinessOption[];
  roles: string[];
  userTypes: string[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
};

const emptyForm: UserFormValues = {
  name: '',
  email: '',
  portalId: '',
  role: 'Employee',
  userType: '',
  status: 'active',
};

type FormErrors = Partial<Record<keyof UserFormValues, string>>;

export function UserFormSheet({
  visible,
  theme,
  user,
  businesses,
  roles,
  userTypes,
  saving,
  onClose,
  onSubmit,
}: UserFormSheetProps) {
  const [values, setValues] = useState<UserFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const portalOptions = useMemo(
    () => businesses.filter(item => item.id !== 'all').map(item => item.label),
    [businesses],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    setErrors({});
    if (user) {
      setValues({
        name: user.name,
        email: user.email,
        portalId: user.portalId,
        role: user.role,
        userType: user.userType,
        status: user.status,
      });
      return;
    }
    setValues({
      ...emptyForm,
      portalId: businesses.find(item => item.id !== 'all')?.id ?? '',
      role: roles[0] ?? 'Employee',
    });
  }, [visible, user, businesses, roles]);

  const update = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setValues(current => ({...current, [key]: value}));
    setErrors(current => ({...current, [key]: undefined}));
  };

  const selectedPortal =
    businesses.find(item => item.id === values.portalId)?.label ?? '';

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!values.name.trim()) {
      next.name = 'Enter the full name.';
    }
    if (!values.email.trim()) {
      next.email = 'Enter an email address.';
    } else if (!isValidEmail(values.email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!values.portalId) {
      next.portalId = 'Choose an associated portal.';
    }
    if (!values.role) {
      next.role = 'Choose a role.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (saving || !validate()) {
      return;
    }
    onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
    });
  };

  return (
    <BottomSheet
      visible={visible}
      title={user ? 'Edit user' : 'Add new user'}
      theme={theme}
      onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <Text style={[styles.intro, {color: theme.textSecondary}]}>
            {user
              ? 'Update the profile, role, and portal assignment.'
              : 'Create a user and assign them to a business portal.'}
          </Text>
          <TextField
            theme={theme}
            label="Full name"
            required
            value={values.name}
            onChangeText={value => update('name', value)}
            placeholder="Enter full name"
            autoCapitalize="words"
            error={errors.name}
          />
          <TextField
            theme={theme}
            label="Email address"
            required
            value={values.email}
            onChangeText={value => update('email', value)}
            placeholder="name@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <SelectField
            theme={theme}
            label="Associated portal"
            required
            value={selectedPortal}
            options={portalOptions}
            placeholder="Select a portal"
            onChange={label => {
              const match = businesses.find(item => item.label === label);
              update('portalId', match?.id ?? '');
            }}
            error={errors.portalId}
          />
          <SelectField
            theme={theme}
            label="User role"
            required
            value={values.role}
            options={roles}
            placeholder="Select a role"
            onChange={value => update('role', value)}
            error={errors.role}
          />
          <SelectField
            theme={theme}
            label="User type"
            value={values.userType}
            options={['None', ...userTypes]}
            placeholder="Optional"
            onChange={value =>
              update('userType', value === 'None' ? '' : value)
            }
          />
          <SelectField
            theme={theme}
            label="Status"
            required
            value={values.status === 'active' ? 'Active' : 'Inactive'}
            options={['Active', 'Inactive']}
            onChange={value =>
              update('status', (value === 'Inactive' ? 'inactive' : 'active') as UserStatus)
            }
          />
          <Pressable
            onPress={handleSubmit}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={user ? 'Save user' : 'Add user'}
            style={({pressed}) => [
              styles.submit,
              {backgroundColor: theme.primary, opacity: saving || pressed ? 0.86 : 1},
            ]}>
            <Text style={[styles.submitText, {color: theme.onPrimary}]}>
              {saving ? 'Saving...' : user ? 'Save changes' : 'Add user'}
            </Text>
          </Pressable>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 520,
  },
  intro: {
    marginTop: -4,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  submit: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 8,
  },
});

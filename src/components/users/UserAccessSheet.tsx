import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {AppUser, UserBusinessOption} from '../../types/users';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';
import {SelectField} from '../claimPortals/IntakeFields';

type UserAccessSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  user: AppUser | null;
  businesses: UserBusinessOption[];
  onClose: () => void;
  onSave: (portalId: string) => void;
};

export function UserAccessSheet({
  visible,
  theme,
  user,
  businesses,
  onClose,
  onSave,
}: UserAccessSheetProps) {
  const [portalId, setPortalId] = useState('');

  useEffect(() => {
    if (visible) {
      setPortalId(user?.portalId ?? '');
    }
  }, [visible, user]);

  const portalOptions = businesses
    .filter(item => item.id !== 'all')
    .map(item => item.label);
  const selectedLabel =
    businesses.find(item => item.id === portalId)?.label ?? '';

  return (
    <BottomSheet
      visible={visible}
      title="Portal access"
      theme={theme}
      onClose={onClose}>
      {user ? (
        <Text style={[styles.intro, {color: theme.textSecondary}]}>
          {user.name} currently has {user.role.toLowerCase()} access to{' '}
          {user.portalName}. Change the assigned portal below.
        </Text>
      ) : null}
      <SelectField
        theme={theme}
        label="Assigned portal"
        required
        value={selectedLabel}
        options={portalOptions}
        placeholder="Select a portal"
        onChange={label => {
          const match = businesses.find(item => item.label === label);
          setPortalId(match?.id ?? '');
        }}
      />
      <View style={[styles.note, {backgroundColor: theme.cardMuted}]}>
        <Text style={[styles.noteText, {color: theme.textSecondary}]}>
          Additional portal keys and impersonation stay on the live API. This
          assignment updates the user record on this device until that endpoint
          is connected.
        </Text>
      </View>
      <Pressable
        onPress={() => portalId && onSave(portalId)}
        disabled={!portalId}
        accessibilityRole="button"
        accessibilityLabel="Save portal access"
        style={({pressed}) => [
          styles.submit,
          {
            backgroundColor: theme.primary,
            opacity: !portalId || pressed ? 0.7 : 1,
          },
        ]}>
        <Text style={[styles.submitText, {color: theme.onPrimary}]}>
          Save access
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: -4,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  note: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 17,
  },
  submit: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

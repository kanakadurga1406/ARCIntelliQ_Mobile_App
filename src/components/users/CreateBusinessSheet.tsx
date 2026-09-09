import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {AppUser} from '../../types/users';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getInitials} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';
import {TextField} from '../claimPortals/IntakeFields';

type CreateBusinessSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  users: AppUser[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (userId: string, businessName: string) => void;
};

export function CreateBusinessSheet({
  visible,
  theme,
  users,
  saving,
  onClose,
  onSubmit,
}: CreateBusinessSheetProps) {
  const [userId, setUserId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }
    setUserId('');
    setBusinessName('');
    setQuery('');
    setError('');
  }, [visible]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const unique = new Map<string, AppUser>();
    users.forEach(user => {
      if (!unique.has(user.email)) {
        unique.set(user.email, user);
      }
    });
    const list = Array.from(unique.values());
    if (!needle) {
      return list.slice(0, 8);
    }
    return list
      .filter(
        user =>
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle),
      )
      .slice(0, 8);
  }, [query, users]);

  const selected = users.find(item => item.id === userId);

  const handleSubmit = () => {
    if (saving) {
      return;
    }
    if (!userId) {
      setError('Select an existing user.');
      return;
    }
    if (!businessName.trim()) {
      setError('Enter a business name.');
      return;
    }
    setError('');
    onSubmit(userId, businessName.trim());
  };

  return (
    <BottomSheet
      visible={visible}
      title="Create business from existing"
      theme={theme}
      onClose={onClose}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}>
        <Text style={[styles.intro, {color: theme.textSecondary}]}>
          Choose a current user and create a new business portal from their
          profile. Portal access stays assigned to that person.
        </Text>
        <TextField
          theme={theme}
          label="Find existing user"
          value={query}
          onChangeText={value => {
            setQuery(value);
            setError('');
          }}
          placeholder="Search by name or email"
          autoCapitalize="none"
        />
        <View style={styles.list}>
          {matches.map(user => {
            const selectedItem = user.id === userId;
            return (
              <Pressable
                key={user.id}
                onPress={() => {
                  setUserId(user.id);
                  setError('');
                  if (!businessName) {
                    setBusinessName(`${user.name} Business`);
                  }
                }}
                style={[
                  styles.person,
                  {
                    backgroundColor: selectedItem ? theme.chip : theme.card,
                    borderColor: selectedItem ? theme.primary : theme.border,
                  },
                ]}>
                <View style={[styles.avatar, {backgroundColor: theme.primary}]}>
                  <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                </View>
                <View style={styles.personCopy}>
                  <Text style={[styles.personName, {color: theme.text}]}>
                    {user.name}
                  </Text>
                  <Text
                    style={[styles.personEmail, {color: theme.textSecondary}]}
                    numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {selected ? (
          <Text style={[styles.selected, {color: theme.primary}]}>
            Using {selected.name}
          </Text>
        ) : null}
        <TextField
          theme={theme}
          label="New business name"
          required
          value={businessName}
          onChangeText={value => {
            setBusinessName(value);
            setError('');
          }}
          placeholder="Enter business name"
          autoCapitalize="words"
        />
        {error ? (
          <Text style={[styles.error, {color: theme.danger}]}>{error}</Text>
        ) : null}
        <Pressable
          onPress={handleSubmit}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Create business"
          style={({pressed}) => [
            styles.submit,
            {
              backgroundColor: theme.primary,
              opacity: saving || pressed ? 0.86 : 1,
            },
          ]}>
          <Text style={[styles.submitText, {color: theme.onPrimary}]}>
            {saving ? 'Creating...' : 'Create business'}
          </Text>
        </Pressable>
      </ScrollView>
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
  list: {
    gap: 8,
    marginBottom: 8,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  personCopy: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  personName: {
    fontSize: 14,
    fontWeight: '700',
  },
  personEmail: {
    marginTop: 1,
    fontSize: 12,
  },
  selected: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  submit: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {AppUser} from '../../types/users';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';
import {UiIcon} from '../claimPortals/UiIcon';

export type UserAction = 'edit' | 'access' | 'reset' | 'delete';

type UserActionsSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  user: AppUser | null;
  onClose: () => void;
  onAction: (action: UserAction) => void;
};

const ACTIONS: Array<{
  id: UserAction;
  label: string;
  icon: string;
  tone?: 'danger';
}> = [
  {id: 'edit', label: 'Edit user', icon: 'pencil'},
  {id: 'access', label: 'Manage portal access', icon: 'key'},
  {id: 'reset', label: 'Reset password', icon: 'shield'},
  {id: 'delete', label: 'Delete user', icon: 'trash', tone: 'danger'},
];

export function UserActionsSheet({
  visible,
  theme,
  user,
  onClose,
  onAction,
}: UserActionsSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      title="User actions"
      theme={theme}
      onClose={onClose}>
      {user ? (
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          {user.name}
        </Text>
      ) : null}
      {ACTIONS.map((action, index) => {
        const destructive = action.tone === 'danger';
        return (
          <React.Fragment key={action.id}>
            {destructive && index > 0 ? (
              <View style={[styles.divider, {backgroundColor: theme.border}]} />
            ) : null}
            <Pressable
              onPress={() => onAction(action.id)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({pressed}) => [
                styles.row,
                {backgroundColor: pressed ? theme.cardMuted : theme.card},
              ]}>
              <View style={[styles.icon, {backgroundColor: theme.chip}]}>
                <UiIcon
                  name={action.icon}
                  color={destructive ? theme.danger : theme.text}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {color: destructive ? theme.danger : theme.text},
                ]}>
                {action.label}
              </Text>
            </Pressable>
          </React.Fragment>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: -8,
    marginBottom: 10,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
    marginHorizontal: 8,
  },
});

import React, {useCallback, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';

export type AppDialogButton = {
  label: string;
  tone?: 'default' | 'primary' | 'destructive';
  onPress?: () => void;
};

export type AppDialogRequest = {
  title: string;
  message: string;
  buttons?: AppDialogButton[];
};

type AppDialogState = AppDialogRequest & {
  visible: boolean;
};

type AppDialogProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  title: string;
  message: string;
  buttons?: AppDialogButton[];
  onClose: () => void;
};

export function AppDialog({
  visible,
  theme,
  title,
  message,
  buttons,
  onClose,
}: AppDialogProps) {
  const actions =
    buttons && buttons.length > 0 ? buttons : [{label: 'OK', tone: 'primary' as const}];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, {backgroundColor: theme.overlay}]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
        />
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.sheet,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}>
          <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, {color: theme.textSecondary}]}>
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            {actions.map((button, index) => {
              const isDestructive = button.tone === 'destructive';
              const isPrimary =
                button.tone === 'primary' ||
                (!button.tone && actions.length === 1);
              const backgroundColor = isDestructive
                ? theme.danger
                : isPrimary
                  ? theme.primary
                  : theme.card;
              const color =
                isDestructive || isPrimary ? theme.onPrimary : theme.text;
              const borderColor =
                isDestructive || isPrimary ? 'transparent' : theme.border;

              return (
                <Pressable
                  key={`${button.label}-${index}`}
                  onPress={() => {
                    onClose();
                    button.onPress?.();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={button.label}
                  style={({pressed}) => [
                    styles.button,
                    {
                      backgroundColor,
                      borderColor,
                      opacity: pressed ? 0.86 : 1,
                    },
                    actions.length === 1 && styles.buttonSolo,
                  ]}>
                  <Text style={[styles.buttonText, {color}]}>{button.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function useAppDialog() {
  const [dialog, setDialog] = useState<AppDialogState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const hideDialog = useCallback(() => {
    setDialog(current => ({...current, visible: false}));
  }, []);

  const showDialog = useCallback((request: AppDialogRequest) => {
    setDialog({
      visible: true,
      title: request.title,
      message: request.message,
      buttons: request.buttons ?? [{label: 'OK', tone: 'primary'}],
    });
  }, []);

  return {dialog, showDialog, hideDialog};
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minHeight: 40,
    minWidth: 84,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSolo: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

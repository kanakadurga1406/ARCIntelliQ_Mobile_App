import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  BusinessRequestSummary,
  ClaimPortal,
  PortalFilters,
  PortalSortOption,
  PortalStatusFilter,
} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from './BottomSheet';
import {
  CheckMiniIcon,
  ClockMiniIcon,
  CloseIcon,
  CopyMiniIcon,
  DocumentIcon,
  EyeMiniIcon,
  PencilMiniIcon,
  TrashMiniIcon,
} from './ClaimPortalsIcons';

type FilterSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  value: PortalFilters;
  onClose: () => void;
  onApply: (next: PortalFilters) => void;
};

const STATUS_OPTIONS: {id: Exclude<PortalStatusFilter, 'new'>; label: string}[] =
  [
    {id: 'all', label: 'All'},
    {id: 'active', label: 'Active'},
    {id: 'inactive', label: 'Inactive'},
  ];

const SORT_OPTIONS: {id: PortalSortOption; label: string}[] = [
  {id: 'latest', label: 'Latest'},
  {id: 'oldest', label: 'Oldest'},
  {id: 'name-asc', label: 'Name A-Z'},
  {id: 'name-desc', label: 'Name Z-A'},
];

export function FilterSheet({
  visible,
  theme,
  value,
  onClose,
  onApply,
}: FilterSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  return (
    <BottomSheet
      visible={visible}
      title="Filter Portals"
      theme={theme}
      onClose={onClose}>
      <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
        STATUS
      </Text>
      <View style={styles.rowWrap}>
        {STATUS_OPTIONS.map(option => {
          const selected = draft.status === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setDraft(current => ({...current, status: option.id}))}
              style={[
                styles.pill,
                {
                  backgroundColor: selected ? theme.primary : theme.chip,
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {color: selected ? theme.onPrimary : theme.chipText},
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
        CREATED DATE
      </Text>
      <View style={styles.dateRow}>
        <DateField
          theme={theme}
          label="From"
          value={draft.fromDate}
          onChangeText={fromDate => setDraft(current => ({...current, fromDate}))}
        />
        <DateField
          theme={theme}
          label="To"
          value={draft.toDate}
          onChangeText={toDate => setDraft(current => ({...current, toDate}))}
        />
      </View>

      <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
        SORT BY
      </Text>
      <View style={styles.rowWrap}>
        {SORT_OPTIONS.map(option => {
          const selected = draft.sortBy === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setDraft(current => ({...current, sortBy: option.id}))}
              style={[
                styles.pill,
                {
                  backgroundColor: selected ? theme.primary : theme.chip,
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {color: selected ? theme.onPrimary : theme.chipText},
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            setDraft({
              status: 'all',
              fromDate: '',
              toDate: '',
              sortBy: 'latest',
            })
          }
          style={[styles.reset, {borderColor: theme.border}]}>
          <Text style={[styles.resetText, {color: theme.text}]}>Reset</Text>
        </Pressable>
        <Pressable
          onPress={() => onApply(draft)}
          style={[styles.apply, {backgroundColor: theme.primary}]}>
          <Text style={[styles.applyText, {color: theme.onPrimary}]}>Apply</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function DateField({
  theme,
  label,
  value,
  onChangeText,
}: {
  theme: ClaimPortalTheme;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.dateField}>
      <Text style={[styles.dateLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        style={[
          styles.dateInput,
          {color: theme.text, backgroundColor: theme.input, borderColor: theme.border},
        ]}
      />
    </View>
  );
}

type ActionsSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  portal: ClaimPortal | null;
  onClose: () => void;
  onAction: (action: PortalActionId) => void;
};

export type PortalActionId =
  | 'view'
  | 'edit'
  | 'requests'
  | 'clone'
  | 'delete';

export function PortalActionsSheet({
  visible,
  theme,
  portal,
  onClose,
  onAction,
}: ActionsSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      title="Portal Actions"
      theme={theme}
      onClose={onClose}>
      {portal ? (
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          {portal.name}
        </Text>
      ) : null}
      <ActionRow
        theme={theme}
        label="View Details"
        icon={<EyeMiniIcon color={theme.text} />}
        onPress={() => onAction('view')}
      />
      <ActionRow
        theme={theme}
        label="Edit Portal"
        icon={<PencilMiniIcon color={theme.text} />}
        onPress={() => onAction('edit')}
      />
      <ActionRow
        theme={theme}
        label="Business Requests"
        icon={<DocumentIcon color={theme.text} />}
        onPress={() => onAction('requests')}
      />
      <ActionRow
        theme={theme}
        label="Clone Portal"
        icon={<CopyMiniIcon color={theme.text} />}
        onPress={() => onAction('clone')}
      />
      <ActionRow
        theme={theme}
        label="Delete Portal"
        icon={<TrashMiniIcon color={theme.danger} />}
        destructive
        onPress={() => onAction('delete')}
      />
    </BottomSheet>
  );
}

function ActionRow({
  theme,
  label,
  icon,
  onPress,
  destructive,
}: {
  theme: ClaimPortalTheme;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.actionRow,
        {backgroundColor: pressed ? theme.cardMuted : theme.card},
      ]}>
      <View style={[styles.actionIcon, {backgroundColor: theme.chip}]}>
        {icon}
      </View>
      <Text
        style={[
          styles.actionLabel,
          {color: destructive ? theme.danger : theme.text},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

type RequestsSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  summary: BusinessRequestSummary;
  onClose: () => void;
  onViewAll: () => void;
};

export function BusinessRequestsSheet({
  visible,
  theme,
  summary,
  onClose,
  onViewAll,
}: RequestsSheetProps) {
  const rows = [
    {
      label: 'Total',
      value: summary.total,
      icon: <DocumentIcon color={theme.textSecondary} />,
    },
    {
      label: 'Pending',
      value: summary.pending,
      icon: <ClockMiniIcon color={theme.warning} />,
    },
    {
      label: 'Approved',
      value: summary.approved,
      icon: <CheckMiniIcon color={theme.success} />,
    },
    {
      label: 'Rejected',
      value: summary.rejected,
      icon: <CloseIcon color={theme.danger} size={12} />,
    },
  ];

  return (
    <BottomSheet
      visible={visible}
      title="Business Requests"
      theme={theme}
      onClose={onClose}>
      {rows.map(row => (
        <View
          key={row.label}
          style={[styles.requestRow, {borderColor: theme.border}]}>
          <View style={[styles.actionIcon, {backgroundColor: theme.chip}]}>
            {row.icon}
          </View>
          <Text style={[styles.actionLabel, {color: theme.text}]}>
            {row.label}
          </Text>
          <Text style={[styles.requestValue, {color: theme.text}]}>
            {row.value}
          </Text>
        </View>
      ))}
      <Pressable
        onPress={onViewAll}
        style={[styles.apply, {backgroundColor: theme.primary, marginTop: 16}]}>
        <Text style={[styles.applyText, {color: theme.onPrimary}]}>
          View All Requests
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

export type AddClaimDraft = {
  title: string;
  claimant: string;
  portalId: string;
  notes: string;
};

type AddClaimSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  portals: ClaimPortal[];
  onClose: () => void;
  onSubmit: (draft: AddClaimDraft) => void;
};

const EMPTY_CLAIM: AddClaimDraft = {
  title: '',
  claimant: '',
  portalId: '',
  notes: '',
};

export function AddClaimSheet({
  visible,
  theme,
  portals,
  onClose,
  onSubmit,
}: AddClaimSheetProps) {
  const [draft, setDraft] = useState(EMPTY_CLAIM);
  const [error, setError] = useState('');

  const activePortals = useMemo(
    () => portals.filter(portal => portal.status === 'active'),
    [portals],
  );

  useEffect(() => {
    if (visible) {
      setDraft(EMPTY_CLAIM);
      setError('');
    }
  }, [visible]);

  const submit = () => {
    const title = draft.title.trim();
    const claimant = draft.claimant.trim();
    if (!title) {
      setError('Enter a claim title to continue.');
      return;
    }
    if (!claimant) {
      setError('Enter the claimant name to continue.');
      return;
    }
    onSubmit({
      ...draft,
      title,
      claimant,
      notes: draft.notes.trim(),
    });
  };

  return (
    <BottomSheet
      visible={visible}
      title="Add Claim"
      theme={theme}
      onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
            Capture a new claim. Submission will connect to the live API later.
          </Text>

          <FieldLabel theme={theme} label="Claim title" />
          <TextInput
            value={draft.title}
            onChangeText={title => {
              setDraft(current => ({...current, title}));
              setError('');
            }}
            placeholder="Water damage — kitchen"
            placeholderTextColor={theme.textMuted}
            style={[
              styles.formInput,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />

          <FieldLabel theme={theme} label="Claimant" />
          <TextInput
            value={draft.claimant}
            onChangeText={claimant => {
              setDraft(current => ({...current, claimant}));
              setError('');
            }}
            placeholder="Full name"
            placeholderTextColor={theme.textMuted}
            style={[
              styles.formInput,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />

          <FieldLabel theme={theme} label="Related portal" />
          <View style={styles.portalWrap}>
            {(activePortals.length ? activePortals : portals)
              .slice(0, 8)
              .map(portal => {
                const selected = draft.portalId === portal.id;
                return (
                  <Pressable
                    key={portal.id}
                    onPress={() =>
                      setDraft(current => ({
                        ...current,
                        portalId: selected ? '' : portal.id,
                      }))
                    }
                    style={[
                      styles.pill,
                      {
                        backgroundColor: selected ? theme.primary : theme.chip,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        {color: selected ? theme.onPrimary : theme.chipText},
                      ]}>
                      {portal.name}
                    </Text>
                  </Pressable>
                );
              })}
          </View>

          <FieldLabel theme={theme} label="Notes" />
          <TextInput
            value={draft.notes}
            onChangeText={notes => setDraft(current => ({...current, notes}))}
            placeholder="Optional context for this claim"
            placeholderTextColor={theme.textMuted}
            multiline
            style={[
              styles.formInput,
              styles.notesInput,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />

          {error ? (
            <Text style={[styles.formError, {color: theme.danger}]}>{error}</Text>
          ) : null}

          <Pressable
            onPress={submit}
            style={[styles.apply, {backgroundColor: theme.primary, marginTop: 8}]}>
            <Text style={[styles.applyText, {color: theme.onPrimary}]}>
              Submit claim
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

function FieldLabel({
  theme,
  label,
}: {
  theme: ClaimPortalTheme;
  label: string;
}) {
  return (
    <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 6,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  reset: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
  },
  apply: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: -8,
    marginBottom: 10,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  requestValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  formInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 4,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  portalWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  formError: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
});

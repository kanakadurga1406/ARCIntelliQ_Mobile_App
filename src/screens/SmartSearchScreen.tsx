import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {
  applySmartSearch,
  askSmartSearch,
  fetchSmartSearchConfig,
} from '../api/smartSearch';
import {
  ChevronDownIcon,
  CloseIcon,
} from '../components/claimPortals/ClaimPortalsIcons';
import {UiIcon} from '../components/claimPortals/UiIcon';
import {OptionPicker} from '../components/smartSearch/OptionPicker';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {
  SearchField,
  SearchOption,
  SmartSearchChatMessage,
  SmartSearchConfig,
  SmartSearchFilter,
  SmartSearchMode,
} from '../types/smartSearch';
import type {SmartSearchScreenProps} from '../types/navigation';

type PickerState = {
  filterId: string;
  kind: 'field' | 'operator' | 'value';
} | null;

function createFilter(fields: SearchField[] = []): SmartSearchFilter {
  return {
    id: `filter-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fieldId: fields[0]?.id ?? '',
    operatorId: '',
    value: '',
  };
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SmartSearchScreen = ({navigation, route}: SmartSearchScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(
    () => getClaimPortalTheme(route.params.scheme),
    [route.params.scheme],
  );

  const [config, setConfig] = useState<SmartSearchConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [modeId, setModeId] = useState('');
  const [filters, setFilters] = useState<SmartSearchFilter[]>([]);
  const [messages, setMessages] = useState<SmartSearchChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [picker, setPicker] = useState<PickerState>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const next = await fetchSmartSearchConfig();
        if (cancelled) {
          return;
        }
        const firstMode = next.modes[0];
        setConfig(next);
        setModeId(firstMode?.id ?? '');
        setFilters([createFilter(firstMode?.fields)]);
        if (firstMode?.kind === 'ai' && firstMode.greeting) {
          setMessages([
            {id: nextId('msg'), role: 'assistant', text: firstMode.greeting},
          ]);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load Smart Search.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeMode = config?.modes.find(item => item.id === modeId);
  const copy = config?.copy;
  const pickerFilter = filters.find(item => item.id === picker?.filterId);
  const pickerField = activeMode?.fields?.find(
    item => item.id === pickerFilter?.fieldId,
  );

  const pickerOptions: SearchOption[] = useMemo(() => {
    if (!activeMode || !picker) {
      return [];
    }
    if (picker.kind === 'field') {
      return (activeMode.fields ?? []).map(field => ({
        id: field.id,
        label: field.label,
      }));
    }
    if (picker.kind === 'operator') {
      return (activeMode.operators ?? []).map(operator => ({
        id: operator.id,
        label: operator.label,
      }));
    }
    return pickerField?.options ?? [];
  }, [activeMode, picker, pickerField]);

  const switchMode = (mode: SmartSearchMode) => {
    setModeId(mode.id);
    setPicker(null);
    if (mode.kind === 'filters') {
      setFilters([createFilter(mode.fields)]);
      return;
    }
    setPrompt('');
    setMessages(
      mode.greeting
        ? [{id: nextId('msg'), role: 'assistant', text: mode.greeting}]
        : [],
    );
  };

  const updateFilter = (id: string, patch: Partial<SmartSearchFilter>) => {
    setFilters(current =>
      current.map(item => (item.id === id ? {...item, ...patch} : item)),
    );
  };

  const clearAll = () => {
    if (activeMode?.kind === 'ai') {
      setPrompt('');
      setMessages(
        activeMode.greeting
          ? [{id: nextId('msg'), role: 'assistant', text: activeMode.greeting}]
          : [],
      );
      return;
    }
    setFilters([createFilter(activeMode?.fields)]);
  };

  const handleApply = async () => {
    if (!activeMode || !copy) {
      return;
    }
    setIsApplying(true);
    try {
      const result = await applySmartSearch({
        modeId: activeMode.id,
        filters,
      });
      Alert.alert(copy.title, result.message, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert(
        copy.title,
        error instanceof Error ? error.message : 'Unable to apply search.',
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleAsk = async () => {
    const text = prompt.trim();
    if (!text || !activeMode || isAsking) {
      return;
    }
    setPrompt('');
    setMessages(current => [
      ...current,
      {id: nextId('msg'), role: 'user', text},
    ]);
    setIsAsking(true);
    try {
      const result = await askSmartSearch({
        modeId: activeMode.id,
        message: text,
      });
      setMessages(current => [
        ...current,
        {id: nextId('msg'), role: 'assistant', text: result.reply},
      ]);
    } catch (error) {
      setMessages(current => [
        ...current,
        {
          id: nextId('msg'),
          role: 'assistant',
          text:
            error instanceof Error
              ? error.message
              : 'Unable to complete that search.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleVoice = () => {
    if (isListening) {
      return;
    }
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      Alert.alert(
        copy?.title || 'Smart Search',
        'Voice search will connect when the live API is ready.',
      );
    }, 1800);
  };

  const selectedOperator = (filter: SmartSearchFilter) =>
    activeMode?.operators?.find(item => item.id === filter.operatorId);

  const selectedField = (filter: SmartSearchFilter) =>
    activeMode?.fields?.find(item => item.id === filter.fieldId);

  const renderFilterCard = (filter: SmartSearchFilter) => {
    const field = selectedField(filter);
    const operator = selectedOperator(filter);
    const showValue = Boolean(operator && operator.needsValue !== false);

    return (
      <View
        key={filter.id}
        style={[
          styles.filterCard,
          {backgroundColor: theme.card, borderColor: theme.border},
        ]}>
        <View style={styles.filterHeader}>
          <Text style={[styles.filterLabel, {color: theme.textMuted}]}>
            {copy?.filterCardLabel}
          </Text>
          <Pressable
            onPress={() =>
              setFilters(current => current.filter(item => item.id !== filter.id))
            }
            hitSlop={6}>
            <Text style={[styles.link, {color: theme.primary}]}>
              {copy?.removeLabel}
            </Text>
          </Pressable>
        </View>

        <View style={styles.dropdownRow}>
          <DropdownButton
            themeColor={theme.text}
            borderColor={theme.border}
            fill={theme.input}
            label={field?.label || 'Select field'}
            muted={!field}
            mutedColor={theme.textMuted}
            onPress={() => setPicker({filterId: filter.id, kind: 'field'})}
          />
          <DropdownButton
            themeColor={theme.text}
            borderColor={theme.border}
            fill={theme.input}
            label={operator?.label || copy?.operatorPlaceholder || 'Select operator'}
            muted={!operator}
            mutedColor={theme.textMuted}
            onPress={() => setPicker({filterId: filter.id, kind: 'operator'})}
          />
        </View>

        {showValue ? (
          field?.type === 'select' ? (
            <DropdownButton
              themeColor={theme.text}
              borderColor={theme.border}
              fill={theme.input}
              label={
                field.options?.find(option => option.id === filter.value)?.label ||
                copy?.valuePlaceholder ||
                'Select value'
              }
              muted={!filter.value}
              mutedColor={theme.textMuted}
              onPress={() => setPicker({filterId: filter.id, kind: 'value'})}
            />
          ) : (
            <TextInput
              value={filter.value}
              onChangeText={value => updateFilter(filter.id, {value})}
              placeholder={
                field?.type === 'date'
                  ? 'YYYY-MM-DD'
                  : copy?.valuePlaceholder
              }
              placeholderTextColor={theme.textMuted}
              keyboardType={field?.type === 'number' ? 'numeric' : 'default'}
              style={[
                styles.valueInput,
                {
                  color: theme.text,
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                },
              ]}
            />
          )
        ) : (
          <Text style={[styles.helper, {color: theme.textMuted}]}>
            {activeMode?.helperText}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, {backgroundColor: theme.page}]}>
      <StatusBar
        barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={{height: insets.top, backgroundColor: theme.page}} />

      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.text}]}>
          {copy?.title || 'Smart Search'}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close Smart Search"
          hitSlop={8}
          style={styles.close}>
          <CloseIcon color={theme.text} size={14} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}

      {errorMessage ? (
        <Text style={[styles.error, {color: theme.danger}]}>{errorMessage}</Text>
      ) : null}

      {config ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modeBlock}>
            <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
              {copy?.searchByLabel}
            </Text>
            <View style={[styles.modeTrack, {backgroundColor: theme.chip}]}>
              {config.modes.map(mode => {
                const selected = mode.id === modeId;
                return (
                  <Pressable
                    key={mode.id}
                    onPress={() => switchMode(mode)}
                    style={[
                      styles.modeChip,
                      selected && [
                        styles.modeChipSelected,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                        },
                      ],
                    ]}>
                    <UiIcon
                      name={mode.icon}
                      color={selected ? theme.primary : theme.textSecondary}
                      size={14}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.modeLabel,
                        {color: selected ? theme.text : theme.textSecondary},
                      ]}>
                      {mode.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {activeMode?.kind === 'filters' ? (
            <>
              <Text style={[styles.chooseLabel, {color: theme.textSecondary}]}>
                {copy?.filtersLabel}
              </Text>
              <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.filterList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {filters.map(renderFilterCard)}
                <Pressable
                  onPress={() =>
                    setFilters(current => [
                      ...current,
                      createFilter(activeMode.fields),
                    ])
                  }
                  hitSlop={6}
                  style={styles.addAnother}>
                  <Text style={[styles.link, {color: theme.primary}]}>
                    {copy?.addFilterLabel}
                  </Text>
                </Pressable>
              </ScrollView>

              <View
                style={[
                  styles.footer,
                  {
                    borderTopColor: theme.border,
                    paddingBottom: Math.max(insets.bottom, 12),
                  },
                ]}>
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={[styles.cancel, {borderColor: theme.primary}]}>
                  <Text style={[styles.cancelText, {color: theme.primary}]}>
                    {copy?.cancelLabel}
                  </Text>
                </Pressable>
                <View style={styles.footerRight}>
                  <Pressable onPress={clearAll} hitSlop={6}>
                    <Text style={[styles.link, {color: theme.primary}]}>
                      {copy?.clearLabel}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleApply}
                    disabled={isApplying}
                    style={[styles.apply, {backgroundColor: theme.primary}]}>
                    {isApplying ? (
                      <ActivityIndicator color={theme.onPrimary} />
                    ) : (
                      <Text style={[styles.applyText, {color: theme.onPrimary}]}>
                        {copy?.applyLabel}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.flex}>
              <Pressable onPress={clearAll} style={styles.aiClear}>
                <Text style={[styles.aiClearText, {color: theme.textMuted}]}>
                  {copy?.clearLabel}
                </Text>
              </Pressable>
              <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.chatList}
                showsVerticalScrollIndicator={false}>
                {messages.map(message => (
                  <View
                    key={message.id}
                    style={[
                      styles.bubbleRow,
                      message.role === 'user' && styles.userRow,
                    ]}>
                    {message.role === 'assistant' ? (
                      <View
                        style={[
                          styles.sparkleBadge,
                          {backgroundColor: theme.chip},
                        ]}>
                        <UiIcon name="sparkle" color={theme.primary} size={13} />
                      </View>
                    ) : null}
                    <View
                      style={[
                        styles.bubble,
                        {
                          backgroundColor:
                            message.role === 'assistant'
                              ? theme.scheme === 'dark'
                                ? theme.cardMuted
                                : '#E8F1FF'
                              : theme.primary,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.bubbleText,
                          {
                            color:
                              message.role === 'assistant'
                                ? theme.text
                                : theme.onPrimary,
                          },
                        ]}>
                        {message.text}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View
                style={[
                  styles.aiComposerWrap,
                  {paddingBottom: Math.max(insets.bottom, 12)},
                ]}>
                <View
                  style={[
                    styles.aiComposer,
                    {backgroundColor: theme.card, borderColor: theme.border},
                  ]}>
                  <TextInput
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder={activeMode?.placeholder}
                    placeholderTextColor={theme.textMuted}
                    returnKeyType="send"
                    onSubmitEditing={handleAsk}
                    style={[styles.aiInput, {color: theme.text}]}
                  />
                  <Pressable
                    onPress={handleVoice}
                    accessibilityLabel="Voice search"
                    style={[
                      styles.micButton,
                      {borderColor: theme.border, backgroundColor: theme.card},
                    ]}>
                    <UiIcon
                      name="mic"
                      color={isListening ? theme.primary : theme.text}
                      size={15}
                    />
                  </Pressable>
                  <Pressable
                    onPress={handleAsk}
                    disabled={isAsking}
                    accessibilityLabel="Send search"
                    style={[styles.sendButton, {backgroundColor: theme.primary}]}>
                    {isAsking ? (
                      <ActivityIndicator color={theme.onPrimary} size="small" />
                    ) : (
                      <UiIcon name="send" color={theme.onPrimary} size={14} />
                    )}
                  </Pressable>
                </View>
                {activeMode?.disclaimer ? (
                  <Text style={[styles.disclaimer, {color: theme.textMuted}]}>
                    {activeMode.disclaimer}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      ) : null}

      <OptionPicker
        visible={Boolean(picker)}
        title={
          picker?.kind === 'field'
            ? 'Select field'
            : picker?.kind === 'operator'
              ? copy?.operatorPlaceholder || 'Select operator'
              : copy?.valuePlaceholder || 'Select value'
        }
        theme={theme}
        options={pickerOptions}
        selectedId={
          picker?.kind === 'field'
            ? pickerFilter?.fieldId
            : picker?.kind === 'operator'
              ? pickerFilter?.operatorId
              : pickerFilter?.value
        }
        onClose={() => setPicker(null)}
        onSelect={option => {
          if (!picker) {
            return;
          }
          if (picker.kind === 'field') {
            updateFilter(picker.filterId, {
              fieldId: option.id,
              operatorId: '',
              value: '',
            });
            return;
          }
          if (picker.kind === 'operator') {
            updateFilter(picker.filterId, {operatorId: option.id, value: ''});
            return;
          }
          updateFilter(picker.filterId, {value: option.id});
        }}
      />
    </View>
  );
};

function DropdownButton({
  label,
  muted,
  themeColor,
  mutedColor,
  borderColor,
  fill,
  onPress,
}: {
  label: string;
  muted: boolean;
  themeColor: string;
  mutedColor: string;
  borderColor: string;
  fill: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.dropdown, {backgroundColor: fill, borderColor}]}>
      <Text
        numberOfLines={1}
        style={[styles.dropdownText, {color: muted ? mutedColor : themeColor}]}>
        {label}
      </Text>
      <ChevronDownIcon color={mutedColor} size={8} />
    </Pressable>
  );
}

export default SmartSearchScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  close: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    paddingTop: 40,
    alignItems: 'center',
  },
  error: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modeBlock: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  modeTrack: {
    height: 48,
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeChip: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeChipSelected: {
    shadowColor: '#1B3A66',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  chooseLabel: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  filterList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dropdown: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  valueInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
  },
  addAnother: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancel: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  apply: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '800',
  },
  aiClear: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  aiClearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chatList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  sparkleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    flexShrink: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: '88%',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiComposerWrap: {
    paddingHorizontal: 20,
  },
  aiComposer: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    padding: 0,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});

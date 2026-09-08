import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ClaimPortal} from '../../types/claimPortals';
import type {
  IntakeConfig,
  IntakeDraft,
  IntakeField,
  IntakeStep,
} from '../../types/intake';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {
  CheckMiniIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from './ClaimPortalsIcons';
import {AppDialog, useAppDialog} from './AppDialog';
import {
  FieldRow,
  DateField,
  PhoneField,
  REQUIRED_MESSAGE,
  SelectField,
  TextAreaField,
  TextField,
  TimeField,
} from './IntakeFields';

type FieldErrors = Record<string, string>;

type IntakeWizardProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  portals: ClaimPortal[];
  config: IntakeConfig;
  initialValues?: IntakeDraft;
  onClose: () => void;
  onSubmit: (draft: IntakeDraft) => void;
};

const DATE_PATTERN = /^\d{2}-\d{2}-\d{4}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function allFields(config: IntakeConfig): IntakeField[] {
  return (config.steps ?? []).flatMap(step => step.fields ?? []);
}

function createDraft(
  config: IntakeConfig,
  _portals: ClaimPortal[],
  initialValues?: IntakeDraft,
): IntakeDraft {
  const draft: IntakeDraft = {};
  for (const field of allFields(config)) {
    draft[field.id] = field.defaultValue ?? '';
    if (field.type === 'phone') {
      draft[`${field.id}Code`] = '+1';
    }
  }
  if (initialValues) {
    Object.assign(draft, initialValues);
  }
  return draft;
}

function isVisible(field: IntakeField, draft: IntakeDraft): boolean {
  if (!field.visibleWhen) {
    return true;
  }
  return draft[field.visibleWhen.field] === field.visibleWhen.equals;
}

function groupFields(fields: IntakeField[]): IntakeField[][] {
  const groups: IntakeField[][] = [];
  const byRow = new Map<string, IntakeField[]>();

  fields.forEach(field => {
    if (!field.row) {
      groups.push([field]);
      return;
    }
    const existing = byRow.get(field.row);
    if (existing) {
      existing.push(field);
      return;
    }
    const group = [field];
    byRow.set(field.row, group);
    groups.push(group);
  });

  return groups;
}

function validateField(field: IntakeField, value: string): string | undefined {
  const rules = field.validation ?? (field.required ? ['required'] : []);
  for (const rule of rules) {
    if (rule === 'required' && !value.trim()) {
      return REQUIRED_MESSAGE;
    }
    if (rule === 'email' && value && !EMAIL_PATTERN.test(value)) {
      return 'Enter a valid email.';
    }
    if (
      (rule === 'phone10' || rule === 'phone') &&
      value &&
      (value.length < 7 || value.length > 15)
    ) {
      return 'Enter 7 to 15 digits.';
    }
    if (rule === 'date' && value && !DATE_PATTERN.test(value)) {
      return 'Enter a valid date (DD-MM-YYYY).';
    }
    if (rule === 'time' && value && !TIME_PATTERN.test(value)) {
      return 'Enter a valid time (HH:MM).';
    }
  }
  return undefined;
}

export function IntakeWizard({
  visible,
  theme,
  portals,
  config,
  initialValues,
  onClose,
  onSubmit,
}: IntakeWizardProps) {
  const insets = useSafeAreaInsets();
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const fieldTops = useRef<Record<string, number>>({});
  const cardTop = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<IntakeDraft>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const portalOptions = useMemo(
    () => portals.map(portal => ({id: portal.id, label: portal.name})),
    [portals],
  );

  useEffect(() => {
    if (visible) {
      setStep(0);
      setDraft(createDraft(config, portals, initialValues));
      setFieldErrors({});
    }
  }, [visible, config, portals]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    fieldTops.current = {};
    scrollRef.current?.scrollTo({y: 0, animated: false});
  }, [step]);

  const scrollFieldIntoView = (fieldId: string) => {
    const y = cardTop.current + (fieldTops.current[fieldId] ?? 0);
    const delay = Platform.OS === 'android' ? 280 : 80;
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 16),
        animated: true,
      });
    }, delay);
  };

  const update = (key: string, value: string) => {
    setDraft(current => ({...current, [key]: value}));
    setFieldErrors(current => {
      if (!current[key]) {
        return current;
      }
      const next = {...current};
      delete next[key];
      return next;
    });
  };

  const defaults = useMemo(
    () => createDraft(config, portals, initialValues),
    [config, initialValues, portals],
  );
  const isDirty = useMemo(
    () =>
      allFields(config).some(field => {
        const current = draft[field.id] ?? '';
        const initial = defaults[field.id] ?? '';
        if (current !== initial) {
          return true;
        }
        if (field.type !== 'phone') {
          return false;
        }
        return (draft[`${field.id}Code`] ?? '') !== (defaults[`${field.id}Code`] ?? '');
      }),
    [config, defaults, draft],
  );

  const current = config.steps[step];
  const isLast = step === config.steps.length - 1;

  const validateStep = (target: IntakeStep): FieldErrors => {
    const next: FieldErrors = {};
    (target.fields ?? []).filter(field => isVisible(field, draft)).forEach(field => {
      const error = validateField(field, draft[field.id] ?? '');
      if (error) {
        next[field.id] = error;
      }
    });
    return next;
  };

  const goNext = () => {
    if (!current) {
      return;
    }
    const nextErrors = validateStep(current);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    if (!isLast) {
      setStep(currentStep => currentStep + 1);
      return;
    }
    showDialog({
      title: config.submitTitle,
      message: config.submitMessage,
      buttons: [
        {label: 'Keep editing'},
        {label: 'Submit', tone: 'primary', onPress: () => onSubmit(draft)},
      ],
    });
  };

  const requestClose = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    showDialog({
      title: config.discardTitle,
      message: config.discardMessage,
      buttons: [
        {label: 'Keep editing'},
        {label: 'Discard', tone: 'destructive', onPress: onClose},
      ],
    });
  };

  if (!current) {
    return null;
  }

  const visibleFields = (current.fields ?? []).filter(field =>
    isVisible(field, draft),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={requestClose}>
      <KeyboardAvoidingView
        style={[styles.root, {backgroundColor: theme.page}]}
        behavior="padding"
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <View
          style={[
            styles.root,
            Platform.OS === 'android' ? {paddingBottom: keyboardHeight} : null,
          ]}>
        <View style={{height: insets.top, backgroundColor: theme.page}} />
        <View style={styles.header}>
          <Pressable
            onPress={requestClose}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={({pressed}) => [
              styles.iconButton,
              {backgroundColor: theme.card, borderColor: theme.border},
              pressed && {opacity: 0.8},
            ]}>
            <View style={styles.backChevron}>
              <ChevronRightIcon color={theme.text} size={9} />
            </View>
          </Pressable>
          <Text style={[styles.headerTitle, {color: theme.text}]}>
            {current.title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.progressTrack, {backgroundColor: theme.chip}]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${((step + 1) / config.steps.length) * 100}%`,
              },
            ]}
          />
        </View>
        <View style={styles.stepper}>
          {config.steps.map((item, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (index < step) {
                    setFieldErrors({});
                    setStep(index);
                  }
                }}
                disabled={index >= step}
                style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        active || done ? theme.primary : theme.chip,
                    },
                  ]}>
                  {done ? (
                    <CheckMiniIcon color="#FFFFFF" size={12} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNum,
                        {color: active ? theme.onPrimary : theme.textMuted},
                      ]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {color: active ? theme.primary : theme.textMuted},
                  ]}
                  numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[
              styles.cardWrap,
              {paddingBottom: 28 + keyboardHeight},
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}>
            <View
              onLayout={event => {
                cardTop.current = event.nativeEvent.layout.y;
              }}
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                },
              ]}>
              <Text style={[styles.cardTitle, {color: theme.text}]}>
                {current.cardTitle}
              </Text>
              <Text style={[styles.cardSubtitle, {color: theme.textSecondary}]}>
                {current.subtitle}. {config.requiredHint}
              </Text>

              {current.review ? (
                <ReviewSummary
                  theme={theme}
                  draft={draft}
                  title={current.review.title}
                  hint={current.review.hint}
                  rows={current.review.rows}
                />
              ) : null}

              {groupFields(visibleFields).map(group => {
                const content = group.map(field => (
                  <DynamicField
                    key={field.id}
                    theme={theme}
                    field={field}
                    value={draft[field.id] ?? ''}
                    countryCode={draft[`${field.id}Code`] ?? '+1'}
                    error={fieldErrors[field.id]}
                    portalOptions={portalOptions}
                    flex={group.length > 1}
                    onChange={update}
                    onFocus={() => scrollFieldIntoView(group[0].id)}
                  />
                ));

                if (group.length > 1) {
                  return (
                    <View
                      key={group.map(item => item.id).join('-')}
                      onLayout={event => {
                        fieldTops.current[group[0].id] = event.nativeEvent.layout.y;
                      }}>
                      <FieldRow>{content}</FieldRow>
                    </View>
                  );
                }
                return (
                  <View
                    key={group[0].id}
                    onLayout={event => {
                      fieldTops.current[group[0].id] = event.nativeEvent.layout.y;
                    }}>
                    {content}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
                paddingBottom: Math.max(insets.bottom, 12),
                shadowColor: theme.shadow,
              },
            ]}>
            <Text style={[styles.footerMeta, {color: theme.textMuted}]}>
              Step {step + 1} of {config.steps.length}
            </Text>
            <View style={styles.footerActions}>
              {step > 0 ? (
                <Pressable
                  onPress={() => {
                    setFieldErrors({});
                    setStep(currentStep => Math.max(0, currentStep - 1));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={config.previousLabel}
                  style={({pressed}) => [
                    styles.footerButton,
                    styles.footerSecondary,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      opacity: pressed ? 0.82 : 1,
                    },
                  ]}>
                  <ChevronLeftIcon color={theme.text} size={9} />
                  <Text style={[styles.footerButtonText, {color: theme.text}]}>
                    {config.previousLabel}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={goNext}
                accessibilityRole="button"
                accessibilityLabel={isLast ? config.submitLabel : config.nextLabel}
                style={({pressed}) => [
                  styles.footerPrimaryWrap,
                  step === 0 && styles.footerPrimarySolo,
                  pressed && {opacity: 0.9},
                ]}>
                <LinearGradient
                  colors={['#3C8CFF', '#1E5EFF']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.footerPrimary}>
                  <Text style={[styles.footerButtonText, {color: theme.onPrimary}]}>
                    {isLast ? config.submitLabel : config.nextLabel}
                  </Text>
                  {isLast ? null : <ChevronRightIcon color="#FFFFFF" size={9} />}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
      <AppDialog
        visible={dialog.visible}
        theme={theme}
        title={dialog.title}
        message={dialog.message}
        buttons={dialog.buttons}
        onClose={hideDialog}
      />
    </Modal>
  );
}

function DynamicField({
  theme,
  field,
  value,
  countryCode,
  error,
  portalOptions,
  flex,
  onChange,
  onFocus,
}: {
  theme: ClaimPortalTheme;
  field: IntakeField;
  value: string;
  countryCode: string;
  error?: string;
  portalOptions: {id: string; label: string}[];
  flex: boolean;
  onChange: (id: string, value: string) => void;
  onFocus?: () => void;
}) {
  const common = {
    theme,
    label: field.label,
    required: field.required,
    error,
    hint: field.hint,
    flex,
    onFocus,
  };

  if (field.type === 'portal' || field.type === 'select') {
    const options =
      field.type === 'portal'
        ? portalOptions
        : field.options ?? [];
    const selectedLabel =
      options.find(option => option.id === value)?.label ?? '';
    return (
      <SelectField
        {...common}
        value={selectedLabel}
        placeholder="Select"
        options={options.map(option => option.label)}
        onChange={label => {
          const match = options.find(option => option.label === label);
          onChange(field.id, match?.id ?? '');
        }}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <TextAreaField
        {...common}
        value={value}
        onChangeText={next => onChange(field.id, next)}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === 'phone') {
    return (
      <PhoneField
        {...common}
        value={value}
        countryCode={countryCode}
        onChangeText={next => onChange(field.id, next)}
        onChangeCode={next => onChange(`${field.id}Code`, next)}
      />
    );
  }

  if (field.type === 'date') {
    return (
      <DateField
        {...common}
        value={value}
        onChange={next => onChange(field.id, next)}
      />
    );
  }

  if (field.type === 'time') {
    return (
      <TimeField
        {...common}
        value={value}
        onChange={next => onChange(field.id, next)}
      />
    );
  }

  const isEmail = field.type === 'email';

  return (
    <TextField
      {...common}
      value={value}
      onChangeText={next => onChange(field.id, next)}
      placeholder={field.placeholder}
      keyboardType={isEmail ? 'email-address' : 'default'}
      autoCapitalize={field.autoCapitalize ?? (isEmail ? 'none' : 'sentences')}
    />
  );
}

function ReviewSummary({
  theme,
  draft,
  title,
  hint,
  rows,
}: {
  theme: ClaimPortalTheme;
  draft: IntakeDraft;
  title: string;
  hint: string;
  rows: NonNullable<IntakeStep['review']>['rows'];
}) {
  const visible = rows
    .map(row => ({
      ...row,
      value: row.fieldIds
        .map(id => draft[id])
        .filter(Boolean)
        .join(row.separator ?? ' · '),
    }))
    .filter(row => row.value);

  if (visible.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.review,
        {backgroundColor: theme.cardMuted, borderColor: theme.border},
      ]}>
      <Text style={[styles.reviewTitle, {color: theme.text}]}>{title}</Text>
      <Text style={[styles.reviewHint, {color: theme.textMuted}]}>{hint}</Text>
      {visible.map(row => (
        <View key={row.id} style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, {color: theme.textMuted}]}>
            {row.label}
          </Text>
          <Text style={[styles.reviewValue, {color: theme.text}]} numberOfLines={1}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    transform: [{rotate: '180deg'}],
    marginRight: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 38,
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  stepper: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardSubtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
  },
  review: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  reviewHint: {
    marginTop: 3,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 5,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  footerMeta: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerSecondary: {
    flex: 1,
    borderWidth: 1.5,
  },
  footerPrimaryWrap: {
    flex: 1.15,
  },
  footerPrimarySolo: {
    flex: 1,
  },
  footerPrimary: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});

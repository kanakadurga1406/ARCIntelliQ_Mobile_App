import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
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
import {
  DEFAULT_INTAKE,
  INTAKE_OPTIONS,
  INTAKE_STEPS,
  type IntakeDraft,
} from '../../types/intake';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {
  CheckMiniIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from './ClaimPortalsIcons';
import {
  FieldRow,
  PhoneField,
  REQUIRED_MESSAGE,
  SelectField,
  TextAreaField,
  TextField,
} from './IntakeFields';

type FieldErrors = Partial<Record<keyof IntakeDraft, string>>;

type IntakeWizardProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  portals: ClaimPortal[];
  onClose: () => void;
  onSubmit: (draft: IntakeDraft) => void;
};

const AUTO_FILLED: Array<keyof IntakeDraft> = [
  'portalId',
  'timeZone',
  'country',
  'hasCoDriver',
];

function isIntakeStarted(draft: IntakeDraft): boolean {
  return (Object.keys(draft) as Array<keyof IntakeDraft>).some(
    key => !AUTO_FILLED.includes(key) && draft[key].trim() !== '',
  );
}

const DATE_PATTERN = /^\d{2}-\d{2}-\d{4}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function IntakeWizard({
  visible,
  theme,
  portals,
  onClose,
  onSubmit,
}: IntakeWizardProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(DEFAULT_INTAKE);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const portalOptions = useMemo(() => {
    const source = portals.filter(portal => portal.status === 'active');
    return (source.length ? source : portals).map(portal => portal.name);
  }, [portals]);

  useEffect(() => {
    if (visible) {
      setStep(0);
      setDraft(DEFAULT_INTAKE);
      setFieldErrors({});
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || draft.portalId || portals.length === 0) {
      return;
    }
    const preferred =
      portals.find(portal => portal.status === 'active') ?? portals[0];
    setDraft(current => ({...current, portalId: preferred.id}));
  }, [visible, draft.portalId, portals]);

  const update = <K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) => {
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

  const selectedPortalName =
    portals.find(portal => portal.id === draft.portalId)?.name ?? '';

  const isDirty = useMemo(() => isIntakeStarted(draft), [draft]);

  const validateStep = (index: number): FieldErrors => {
    const next: FieldErrors = {};
    if (index === 0) {
      if (!draft.reportedBy) {
        next.reportedBy = REQUIRED_MESSAGE;
      }
      if (!draft.driverType) {
        next.driverType = REQUIRED_MESSAGE;
      }
      if (draft.callerEmail && !EMAIL_PATTERN.test(draft.callerEmail)) {
        next.callerEmail = 'Enter a valid email.';
      }
      if (draft.callerPhone && draft.callerPhone.length !== 10) {
        next.callerPhone = 'Exactly 10 digits for the selected country.';
      }
    }
    if (index === 1) {
      if (!draft.incidentDate) {
        next.incidentDate = REQUIRED_MESSAGE;
      } else if (!DATE_PATTERN.test(draft.incidentDate)) {
        next.incidentDate = 'Enter a valid date (DD-MM-YYYY).';
      }
      if (!draft.incidentTime) {
        next.incidentTime = REQUIRED_MESSAGE;
      } else if (!TIME_PATTERN.test(draft.incidentTime)) {
        next.incidentTime = 'Enter a valid time (HH:MM).';
      }
    }
    if (index === 2 && !draft.claimType) {
      next.claimType = REQUIRED_MESSAGE;
    }
    if (index === 3 && !draft.city.trim()) {
      next.city = REQUIRED_MESSAGE;
    }
    if (index === 4) {
      if (!draft.driverFirstName.trim()) {
        next.driverFirstName = REQUIRED_MESSAGE;
      }
      if (draft.driverEmail && !EMAIL_PATTERN.test(draft.driverEmail)) {
        next.driverEmail = 'Enter a valid email.';
      }
      if (draft.driverMobile && draft.driverMobile.length !== 10) {
        next.driverMobile = 'Exactly 10 digits for the selected country.';
      }
      if (draft.hasCoDriver === 'Yes' && !draft.coDriverFirstName.trim()) {
        next.coDriverFirstName = REQUIRED_MESSAGE;
      }
    }
    return next;
  };

  const goNext = () => {
    const nextErrors = validateStep(step);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    if (step < INTAKE_STEPS.length - 1) {
      setStep(current => current + 1);
      return;
    }
    Alert.alert(
      'Submit this intake?',
      'Double-check the reporter, incident, and driver details. You can still edit after the live API is connected.',
      [
        {text: 'Keep editing', style: 'cancel'},
        {text: 'Submit', onPress: () => onSubmit(draft)},
      ],
    );
  };

  const requestClose = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    Alert.alert(
      'Discard intake?',
      'Your entries on this claim will be lost.',
      [
        {text: 'Keep editing', style: 'cancel'},
        {text: 'Discard', style: 'destructive', onPress: onClose},
      ],
    );
  };

  const current = INTAKE_STEPS[step];
  const isLast = step === INTAKE_STEPS.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={requestClose}>
      <View style={[styles.root, {backgroundColor: theme.page}]}>
        <View style={{height: insets.top, backgroundColor: theme.page}} />
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, {color: theme.primary}]}>
              New intake
            </Text>
            <Text style={[styles.headerTitle, {color: theme.text}]}>
              {current.title}
            </Text>
          </View>
          <Pressable
            onPress={requestClose}
            accessibilityRole="button"
            accessibilityLabel="Close intake"
            style={[styles.close, {backgroundColor: theme.card, borderColor: theme.border}]}>
            <CloseIcon color={theme.text} size={12} />
          </Pressable>
        </View>

        <View style={[styles.progressTrack, {backgroundColor: theme.chip}]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${((step + 1) / INTAKE_STEPS.length) * 100}%`,
              },
            ]}
          />
        </View>
        <View style={styles.stepper}>
          {INTAKE_STEPS.map((item, index) => {
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

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.cardWrap}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                },
              ]}>
              <Text style={[styles.cardTitle, {color: theme.text}]}>
                {current.title === 'Reporter'
                  ? 'Reporter Information'
                  : current.title === 'Timeline'
                    ? 'Incident Timeline'
                    : current.title === 'Incident'
                      ? 'Incident Information'
                      : current.title === 'Location'
                        ? 'Incident location'
                        : 'Involved Driver'}
              </Text>
              <Text style={[styles.cardSubtitle, {color: theme.textSecondary}]}>
                {current.subtitle}. Fields marked * are required.
              </Text>

              {step === 0 ? (
                <ReporterStep
                  theme={theme}
                  draft={draft}
                  errors={fieldErrors}
                  portalName={selectedPortalName}
                  portalOptions={portalOptions}
                  portals={portals}
                  onChange={update}
                />
              ) : null}
              {step === 1 ? (
                <TimelineStep
                  theme={theme}
                  draft={draft}
                  errors={fieldErrors}
                  onChange={update}
                />
              ) : null}
              {step === 2 ? (
                <IncidentStep
                  theme={theme}
                  draft={draft}
                  errors={fieldErrors}
                  onChange={update}
                />
              ) : null}
              {step === 3 ? (
                <LocationStep
                  theme={theme}
                  draft={draft}
                  errors={fieldErrors}
                  onChange={update}
                />
              ) : null}
              {step === 4 ? (
                <DriverStep
                  theme={theme}
                  draft={draft}
                  errors={fieldErrors}
                  onChange={update}
                />
              ) : null}
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
              Step {step + 1} of {INTAKE_STEPS.length}
            </Text>
            <View style={styles.footerActions}>
              {step > 0 ? (
                <Pressable
                  onPress={() => {
                    setFieldErrors({});
                    setStep(currentStep => Math.max(0, currentStep - 1));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Previous"
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
                    Previous
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={goNext}
                accessibilityRole="button"
                accessibilityLabel={isLast ? 'Submit intake' : 'Next'}
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
                    {isLast ? 'Submit Intake' : 'Next'}
                  </Text>
                  {isLast ? null : <ChevronRightIcon color="#FFFFFF" size={9} />}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type StepProps = {
  theme: ClaimPortalTheme;
  draft: IntakeDraft;
  errors: FieldErrors;
  onChange: <K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) => void;
};

function ReporterStep({
  theme,
  draft,
  errors,
  portalName,
  portalOptions,
  portals,
  onChange,
}: StepProps & {
  portalName: string;
  portalOptions: string[];
  portals: ClaimPortal[];
}) {
  return (
    <View>
      {portalOptions.length > 0 ? (
        <SelectField
          theme={theme}
          label="Related portal"
          error={errors.portalId}
          value={portalName}
          options={portalOptions}
          onChange={name => {
            const match = portals.find(portal => portal.name === name);
            onChange('portalId', match?.id ?? '');
          }}
        />
      ) : null}
      <SelectField
        theme={theme}
        label="Reported by"
        required
        error={errors.reportedBy}
        value={draft.reportedBy}
        options={INTAKE_OPTIONS.reportedBy}
        onChange={value => onChange('reportedBy', value)}
      />
      <SelectField
        theme={theme}
        label="Driver type"
        required
        error={errors.driverType}
        value={draft.driverType}
        options={INTAKE_OPTIONS.driverType}
        onChange={value => onChange('driverType', value)}
      />
      <FieldRow>
        <TextField
          theme={theme}
          label="Caller title"
          flex
          value={draft.callerTitle}
          onChangeText={value => onChange('callerTitle', value)}
          placeholder="Dispatcher"
        />
        <TextField
          theme={theme}
          label="Caller name"
          flex
          value={draft.callerName}
          onChangeText={value => onChange('callerName', value)}
          placeholder="Full name"
          autoCapitalize="words"
        />
      </FieldRow>
      <TextField
        theme={theme}
        label="Caller email"
        error={errors.callerEmail}
        value={draft.callerEmail}
        onChangeText={value => onChange('callerEmail', value)}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PhoneField
        theme={theme}
        label="Caller phone"
        error={errors.callerPhone}
        value={draft.callerPhone}
        onChangeText={value => onChange('callerPhone', value)}
        hint="Exactly 10 digits for the selected country."
      />
    </View>
  );
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

function formatTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function TimelineStep({theme, draft, errors, onChange}: StepProps) {
  return (
    <View>
      <FieldRow>
        <TextField
          theme={theme}
          label="Date of incident"
          required
          flex
          error={errors.incidentDate}
          value={draft.incidentDate}
          onChangeText={value => onChange('incidentDate', formatDateInput(value))}
          placeholder="DD-MM-YYYY"
          hint="Example: 04-09-2026"
          keyboardType="number-pad"
        />
        <TextField
          theme={theme}
          label="Time of incident"
          required
          flex
          error={errors.incidentTime}
          value={draft.incidentTime}
          onChangeText={value => onChange('incidentTime', formatTimeInput(value))}
          placeholder="HH:MM"
          hint="24-hour format"
          keyboardType="number-pad"
        />
      </FieldRow>
      <SelectField
        theme={theme}
        label="Time zone"
        value={draft.timeZone}
        options={INTAKE_OPTIONS.timeZone}
        onChange={value => onChange('timeZone', value)}
      />
    </View>
  );
}

function IncidentStep({theme, draft, errors, onChange}: StepProps) {
  return (
    <View>
      <FieldRow>
        <SelectField
          theme={theme}
          label="Claim type"
          required
          flex
          error={errors.claimType}
          value={draft.claimType}
          options={INTAKE_OPTIONS.claimType}
          onChange={value => onChange('claimType', value)}
        />
        <SelectField
          theme={theme}
          label="Issue type"
          flex
          value={draft.issueType}
          options={INTAKE_OPTIONS.issueType}
          onChange={value => onChange('issueType', value)}
        />
      </FieldRow>
      <TextAreaField
        theme={theme}
        label="Customer delivery instructions"
        value={draft.deliveryInstructions}
        onChangeText={value => onChange('deliveryInstructions', value)}
        placeholder="Gate codes, dock hours, contacts..."
      />
      <FieldRow>
        <SelectField
          theme={theme}
          label="Loss type"
          flex
          value={draft.lossType}
          options={INTAKE_OPTIONS.lossType}
          onChange={value => onChange('lossType', value)}
        />
        <SelectField
          theme={theme}
          label="Roadway"
          flex
          value={draft.roadway}
          options={INTAKE_OPTIONS.roadway}
          onChange={value => onChange('roadway', value)}
        />
      </FieldRow>
      <SelectField
        theme={theme}
        label="Weather"
        value={draft.weather}
        options={INTAKE_OPTIONS.weather}
        onChange={value => onChange('weather', value)}
      />
      <FieldRow>
        <SelectField
          theme={theme}
          label="Vehicles involved"
          flex
          value={draft.vehiclesInvolved}
          options={INTAKE_OPTIONS.count}
          onChange={value => onChange('vehiclesInvolved', value)}
        />
        <SelectField
          theme={theme}
          label="People involved"
          flex
          value={draft.peopleInvolved}
          options={INTAKE_OPTIONS.count}
          onChange={value => onChange('peopleInvolved', value)}
        />
      </FieldRow>
      <SelectField
        theme={theme}
        label="Where did the incident occur?"
        value={draft.incidentPlace}
        options={INTAKE_OPTIONS.incidentPlace}
        onChange={value => onChange('incidentPlace', value)}
      />
      <TextAreaField
        theme={theme}
        label="Accident details"
        value={draft.accidentDetails}
        onChangeText={value => onChange('accidentDetails', value)}
        placeholder="Describe what happened..."
      />
      <TextAreaField
        theme={theme}
        label="Action items"
        value={draft.actionItems}
        onChangeText={value => onChange('actionItems', value)}
        placeholder="Next steps, towing, notices..."
      />
    </View>
  );
}

function LocationStep({theme, draft, errors, onChange}: StepProps) {
  return (
    <View>
      <TextField
        theme={theme}
        label="Address lookup"
        error={errors.addressLookup}
        value={draft.addressLookup}
        onChangeText={value => onChange('addressLookup', value)}
        placeholder="Start typing an address"
        hint="Use this if you have the full location handy."
      />
      <FieldRow>
        <SelectField
          theme={theme}
          label="Region"
          flex
          value={draft.region}
          options={INTAKE_OPTIONS.region}
          onChange={value => onChange('region', value)}
        />
        <SelectField
          theme={theme}
          label="Country"
          flex
          value={draft.country}
          options={INTAKE_OPTIONS.country}
          onChange={value => onChange('country', value)}
        />
      </FieldRow>
      <SelectField
        theme={theme}
        label="State"
        value={draft.state}
        options={INTAKE_OPTIONS.state}
        onChange={value => onChange('state', value)}
      />
      <FieldRow>
        <TextField
          theme={theme}
          label="City"
          required
          flex
          error={errors.city}
          value={draft.city}
          onChangeText={value => onChange('city', value)}
          placeholder="City"
          autoCapitalize="words"
        />
        <TextField
          theme={theme}
          label="Zip"
          flex
          value={draft.zip}
          onChangeText={value => onChange('zip', value)}
          placeholder="ZIP"
          keyboardType="number-pad"
        />
      </FieldRow>
      <TextField
        theme={theme}
        label="Street / Address"
        error={errors.street}
        value={draft.street}
        onChangeText={value => onChange('street', value)}
        placeholder="Street address"
      />
      <FieldRow>
        <TextField
          theme={theme}
          label="Contractor code"
          flex
          value={draft.contractorShortCode}
          onChangeText={value => onChange('contractorShortCode', value)}
          placeholder="Optional"
          autoCapitalize="characters"
        />
        <TextField
          theme={theme}
          label="Station"
          flex
          value={draft.station}
          onChangeText={value => onChange('station', value)}
          placeholder="Optional"
        />
      </FieldRow>
    </View>
  );
}

function DriverStep({theme, draft, errors, onChange}: StepProps) {
  return (
    <View>
      <ReviewSummary theme={theme} draft={draft} />
      <FieldRow>
        <TextField
          theme={theme}
          label="Driver ID"
          flex
          value={draft.driverId}
          onChangeText={value => onChange('driverId', value)}
          placeholder="ID"
        />
        <TextField
          theme={theme}
          label="VIN"
          flex
          value={draft.vin}
          onChangeText={value => onChange('vin', value)}
          placeholder="VIN"
          autoCapitalize="characters"
        />
      </FieldRow>
      <TextField
        theme={theme}
        label="Tracking number"
        value={draft.trackingNumber}
        onChangeText={value => onChange('trackingNumber', value)}
        placeholder="Load or tracking number"
      />
      <FieldRow>
        <TextField
          theme={theme}
          label="First name"
          required
          flex
          error={errors.driverFirstName}
          value={draft.driverFirstName}
          onChangeText={value => onChange('driverFirstName', value)}
          placeholder="First name"
          autoCapitalize="words"
        />
        <TextField
          theme={theme}
          label="Last name"
          flex
          value={draft.driverLastName}
          onChangeText={value => onChange('driverLastName', value)}
          placeholder="Last name"
          autoCapitalize="words"
        />
      </FieldRow>
      <TextField
        theme={theme}
        label="Email"
        error={errors.driverEmail}
        value={draft.driverEmail}
        onChangeText={value => onChange('driverEmail', value)}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PhoneField
        theme={theme}
        label="Mobile"
        error={errors.driverMobile}
        value={draft.driverMobile}
        onChangeText={value => onChange('driverMobile', value)}
        hint="Exactly 10 digits for the selected country."
      />
      <SelectField
        theme={theme}
        label="Co-driver"
        value={draft.hasCoDriver}
        options={INTAKE_OPTIONS.hasCoDriver}
        onChange={value => onChange('hasCoDriver', value)}
      />
      {draft.hasCoDriver === 'Yes' ? (
        <FieldRow>
          <TextField
            theme={theme}
            label="Co-driver first name"
            required
            flex
            error={errors.coDriverFirstName}
            value={draft.coDriverFirstName}
            onChangeText={value => onChange('coDriverFirstName', value)}
            placeholder="First name"
            autoCapitalize="words"
          />
          <TextField
            theme={theme}
            label="Co-driver last name"
            flex
            value={draft.coDriverLastName}
            onChangeText={value => onChange('coDriverLastName', value)}
            placeholder="Last name"
            autoCapitalize="words"
          />
        </FieldRow>
      ) : null}
    </View>
  );
}

function ReviewSummary({
  theme,
  draft,
}: {
  theme: ClaimPortalTheme;
  draft: IntakeDraft;
}) {
  const rows = [
    {label: 'Reported by', value: draft.reportedBy},
    {label: 'When', value: [draft.incidentDate, draft.incidentTime].filter(Boolean).join(' · ')},
    {label: 'Claim', value: [draft.claimType, draft.issueType].filter(Boolean).join(' · ')},
    {label: 'City', value: [draft.city, draft.state].filter(Boolean).join(', ')},
  ].filter(row => row.value);

  if (rows.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.review,
        {backgroundColor: theme.cardMuted, borderColor: theme.border},
      ]}>
      <Text style={[styles.reviewTitle, {color: theme.text}]}>Quick review</Text>
      <Text style={[styles.reviewHint, {color: theme.textMuted}]}>
        Confirm these details, then add the driver and submit.
      </Text>
      {rows.map(row => (
        <View key={row.label} style={styles.reviewRow}>
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
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '800',
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

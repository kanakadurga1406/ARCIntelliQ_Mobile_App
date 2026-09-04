export type IntakeDraft = {
  portalId: string;
  reportedBy: string;
  driverType: string;
  callerTitle: string;
  callerName: string;
  callerEmail: string;
  callerPhone: string;
  incidentDate: string;
  incidentTime: string;
  timeZone: string;
  claimType: string;
  issueType: string;
  deliveryInstructions: string;
  lossType: string;
  roadway: string;
  weather: string;
  vehiclesInvolved: string;
  peopleInvolved: string;
  incidentPlace: string;
  accidentDetails: string;
  actionItems: string;
  addressLookup: string;
  region: string;
  country: string;
  state: string;
  city: string;
  street: string;
  zip: string;
  contractorShortCode: string;
  station: string;
  driverId: string;
  vin: string;
  trackingNumber: string;
  driverFirstName: string;
  driverLastName: string;
  driverEmail: string;
  driverMobile: string;
  hasCoDriver: string;
  coDriverFirstName: string;
  coDriverLastName: string;
};

export const DEFAULT_INTAKE: IntakeDraft = {
  portalId: '',
  reportedBy: '',
  driverType: '',
  callerTitle: '',
  callerName: '',
  callerEmail: '',
  callerPhone: '',
  incidentDate: '',
  incidentTime: '',
  timeZone: 'America/New_York',
  claimType: '',
  issueType: '',
  deliveryInstructions: '',
  lossType: '',
  roadway: '',
  weather: '',
  vehiclesInvolved: '',
  peopleInvolved: '',
  incidentPlace: '',
  accidentDetails: '',
  actionItems: '',
  addressLookup: '',
  region: '',
  country: 'United States',
  state: '',
  city: '',
  street: '',
  zip: '',
  contractorShortCode: '',
  station: '',
  driverId: '',
  vin: '',
  trackingNumber: '',
  driverFirstName: '',
  driverLastName: '',
  driverEmail: '',
  driverMobile: '',
  hasCoDriver: 'No',
  coDriverFirstName: '',
  coDriverLastName: '',
};

export const EMPTY_INTAKE: IntakeDraft = {
  portalId: '',
  reportedBy: '',
  driverType: '',
  callerTitle: '',
  callerName: '',
  callerEmail: '',
  callerPhone: '',
  incidentDate: '',
  incidentTime: '',
  timeZone: '',
  claimType: '',
  issueType: '',
  deliveryInstructions: '',
  lossType: '',
  roadway: '',
  weather: '',
  vehiclesInvolved: '',
  peopleInvolved: '',
  incidentPlace: '',
  accidentDetails: '',
  actionItems: '',
  addressLookup: '',
  region: '',
  country: '',
  state: '',
  city: '',
  street: '',
  zip: '',
  contractorShortCode: '',
  station: '',
  driverId: '',
  vin: '',
  trackingNumber: '',
  driverFirstName: '',
  driverLastName: '',
  driverEmail: '',
  driverMobile: '',
  hasCoDriver: '',
  coDriverFirstName: '',
  coDriverLastName: '',
};

export const INTAKE_STEPS = [
  {id: 'reporter', title: 'Reporter', subtitle: 'Who is calling this in'},
  {id: 'timeline', title: 'Timeline', subtitle: 'When the incident happened'},
  {id: 'incident', title: 'Incident', subtitle: 'What happened and why'},
  {id: 'location', title: 'Location', subtitle: 'Where the incident occurred'},
  {id: 'driver', title: 'Driver', subtitle: 'Who was involved'},
] as const;

export const INTAKE_OPTIONS = {
  reportedBy: ['Driver', 'Customer', 'Police', 'Witness', 'Other'],
  driverType: ['Company driver', 'Owner operator', 'Contractor', 'Third party'],
  timeZone: [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'UTC',
  ],
  claimType: ['Auto', 'Cargo', 'Property', 'Liability', 'Injury'],
  issueType: ['Accident', 'Theft', 'Damage', 'Delay', 'Injury'],
  lossType: ['Collision', 'Overturn', 'Fire', 'Weather', 'Theft'],
  roadway: ['Interstate', 'Highway', 'City street', 'Parking lot', 'Terminal'],
  weather: ['Clear', 'Rain', 'Snow', 'Fog', 'Ice'],
  count: ['1', '2', '3', '4+'],
  incidentPlace: [
    'On road',
    'Customer location',
    'Terminal',
    'Warehouse',
    'Other',
  ],
  region: ['North', 'South', 'East', 'West', 'Central'],
  country: ['United States', 'Canada', 'Mexico'],
  state: [
    'Alabama',
    'Alaska',
    'Arizona',
    'California',
    'Colorado',
    'Florida',
    'Georgia',
    'Illinois',
    'New York',
    'Texas',
    'Washington',
    'Other',
  ],
  hasCoDriver: ['No', 'Yes'],
} as const;

export type AddClaimDraft = IntakeDraft;

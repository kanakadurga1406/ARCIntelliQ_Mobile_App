import type {
  AppUser,
  UserFormValues,
  UserListQuery,
  UsersPageConfig,
  UsersPageResult,
  UserStatus,
} from '../../types/users';
import {
  applyUserFilters,
  paginateUsers,
} from '../../utils/userList';

type UserSeed = {
  name: string;
  email: string;
  portalId: string;
  portalName: string;
  role: string;
  userType: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
};

const BUSINESSES = [
  {id: 'portal-one', label: 'Portal One Transports'},
  {id: 'cp-1001', label: 'test ARCSK'},
  {id: 'cp-1002', label: 'CLANEWWWWWW'},
  {id: 'cp-1004', label: 'Summit Claims Group'},
  {id: 'cp-1005', label: 'Northwind Adjusters'},
  {id: 'cp-1007', label: 'Lakeside Mutual'},
  {id: 'cp-1008', label: 'Pioneer Loss Services'},
  {id: 'cp-1009', label: 'Cedar Ridge Claims'},
  {id: 'cp-1011', label: 'Blue Oak Partners'},
  {id: 'cp-1012', label: 'Evergreen Field Ops'},
] as const;

const ROLES = ['Employee', 'Admin', 'Manager', 'Supervisor'] as const;
const USER_TYPES = ['Adjuster', 'Examiner', 'Claim Handler'] as const;

const EXTRA_PEOPLE: Array<{name: string; email: string}> = [
  {name: 'Priya Sharma', email: 'priya.sharma@arcclaims.com'},
  {name: 'Marcus Hale', email: 'marcus.hale@arcclaims.com'},
  {name: 'Elena Vasquez', email: 'elena.vasquez@arcclaims.com'},
  {name: 'James Okonkwo', email: 'james.okonkwo@arcclaims.com'},
  {name: 'Sofia Chen', email: 'sofia.chen@arcclaims.com'},
  {name: 'Noah Patel', email: 'noah.patel@arcclaims.com'},
  {name: 'Ava Reynolds', email: 'ava.reynolds@arcclaims.com'},
  {name: 'Liam Brooks', email: 'liam.brooks@arcclaims.com'},
  {name: 'Maya Krishnan', email: 'maya.krishnan@arcclaims.com'},
  {name: 'Owen Barrett', email: 'owen.barrett@arcclaims.com'},
  {name: 'Chloe Nguyen', email: 'chloe.nguyen@arcclaims.com'},
  {name: 'Ethan Walsh', email: 'ethan.walsh@arcclaims.com'},
  {name: 'Harper Diaz', email: 'harper.diaz@arcclaims.com'},
  {name: 'Lucas Moreau', email: 'lucas.moreau@arcclaims.com'},
  {name: 'Isla Thompson', email: 'isla.thompson@arcclaims.com'},
  {name: 'Caleb Wright', email: 'caleb.wright@arcclaims.com'},
  {name: 'Nora Kim', email: 'nora.kim@arcclaims.com'},
  {name: 'Julian Ross', email: 'julian.ross@arcclaims.com'},
  {name: 'Amelia Grant', email: 'amelia.grant@arcclaims.com'},
  {name: 'Henry Adler', email: 'henry.adler@arcclaims.com'},
  {name: 'Zoe Marin', email: 'zoe.marin@arcclaims.com'},
  {name: 'Isaac Cole', email: 'isaac.cole@arcclaims.com'},
  {name: 'Ruby Santos', email: 'ruby.santos@arcclaims.com'},
  {name: 'Leo Nakamura', email: 'leo.nakamura@arcclaims.com'},
  {name: 'Grace Holloway', email: 'grace.holloway@arcclaims.com'},
  {name: 'Benjamin Cruz', email: 'benjamin.cruz@arcclaims.com'},
  {name: 'Layla Ahmed', email: 'layla.ahmed@arcclaims.com'},
  {name: 'Sebastian Quinn', email: 'sebastian.quinn@arcclaims.com'},
  {name: 'Aria Bennett', email: 'aria.bennett@arcclaims.com'},
  {name: 'Daniel Foster', email: 'daniel.foster@arcclaims.com'},
  {name: 'Mila Ortega', email: 'mila.ortega@arcclaims.com'},
  {name: 'Jack Ellison', email: 'jack.ellison@arcclaims.com'},
  {name: 'Penelope Shaw', email: 'penelope.shaw@arcclaims.com'},
  {name: 'Wyatt Hughes', email: 'wyatt.hughes@arcclaims.com'},
  {name: 'Camila Ortiz', email: 'camila.ortiz@arcclaims.com'},
  {name: 'Nathan Price', email: 'nathan.price@arcclaims.com'},
  {name: 'Violet Lane', email: 'violet.lane@arcclaims.com'},
  {name: 'Andrew Peck', email: 'andrew.peck@arcclaims.com'},
  {name: 'Stella Young', email: 'stella.young@arcclaims.com'},
  {name: 'Christopher Ball', email: 'christopher.ball@arcclaims.com'},
  {name: 'Hazel Ford', email: 'hazel.ford@arcclaims.com'},
  {name: 'Matthew Kane', email: 'matthew.kane@arcclaims.com'},
  {name: 'Aurora Singh', email: 'aurora.singh@arcclaims.com'},
  {name: 'David Lang', email: 'david.lang@arcclaims.com'},
  {name: 'Scarlett Moss', email: 'scarlett.moss@arcclaims.com'},
  {name: 'Joseph Reed', email: 'joseph.reed@arcclaims.com'},
  {name: 'Luna Park', email: 'luna.park@arcclaims.com'},
  {name: 'Ryan Bishop', email: 'ryan.bishop@arcclaims.com'},
  {name: 'Claire Dorsey', email: 'claire.dorsey@arcclaims.com'},
  {name: 'Thomas Nguyen', email: 'thomas.nguyen@arcclaims.com'},
  {name: 'Sienna Blake', email: 'sienna.blake@arcclaims.com'},
  {name: 'Patrick Rowe', email: 'patrick.rowe@arcclaims.com'},
  {name: 'Naomi Ellis', email: 'naomi.ellis@arcclaims.com'},
  {name: 'Gavin Shore', email: 'gavin.shore@arcclaims.com'},
];

function toUser(seed: UserSeed, index: number): AppUser {
  return {
    id: `usr-${String(index + 1).padStart(4, '0')}`,
    ...seed,
  };
}

function buildSeeds(): UserSeed[] {
  const screenshot: UserSeed[] = [
    {
      name: 'Anandh kumar',
      email: 'anandhkumar@yopmail.com',
      portalId: 'portal-one',
      portalName: 'Portal One Transports',
      role: 'Employee',
      userType: '',
      status: 'active',
      createdAt: '2026-09-07',
      lastLoginAt: '2026-09-07',
    },
    {
      name: 'ARC WEBAPP',
      email: '123@yopmail.com',
      portalId: 'portal-one',
      portalName: 'Portal One Transports',
      role: 'Employee',
      userType: 'Adjuster',
      status: 'active',
      createdAt: '2026-09-07',
      lastLoginAt: null,
    },
    {
      name: 'ARC WEBAPP',
      email: 'arc.webapp@yopmail.com',
      portalId: 'portal-one',
      portalName: 'Portal One Transports',
      role: 'Employee',
      userType: 'Adjuster',
      status: 'active',
      createdAt: '2026-09-07',
      lastLoginAt: null,
    },
    {
      name: 'Anandh kumar',
      email: 'anandh.handler@yopmail.com',
      portalId: 'portal-one',
      portalName: 'Portal One Transports',
      role: 'Employee',
      userType: '',
      status: 'active',
      createdAt: '2026-09-07',
      lastLoginAt: '2026-09-07',
    },
  ];

  const generated = EXTRA_PEOPLE.map((person, index) => {
    const business = BUSINESSES[index % BUSINESSES.length];
    const inactive = index % 9 === 4;
    const noLogin = index % 4 === 1;
    const createdDay = String(1 + (index % 28)).padStart(2, '0');
    const loginDay = String(1 + ((index + 3) % 28)).padStart(2, '0');

    return {
      name: person.name,
      email: person.email,
      portalId: business.id,
      portalName: business.label,
      role: ROLES[index % ROLES.length],
      userType: index % 5 === 0 ? '' : USER_TYPES[index % USER_TYPES.length],
      status: inactive ? 'inactive' : 'active',
      createdAt: `2026-${index % 2 === 0 ? '08' : '09'}-${createdDay}`,
      lastLoginAt: noLogin || inactive ? null : `2026-09-${loginDay}`,
    } satisfies UserSeed;
  });

  return [...screenshot, ...generated].slice(0, 58);
}

let users: AppUser[] = buildSeeds().map(toUser);

function nextUserId(): string {
  const max = users.reduce((highest, user) => {
    const value = Number(user.id.replace(/\D/g, ''));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `usr-${String(max + 1).padStart(4, '0')}`;
}

function countByStatus(status: UserStatus): number {
  return users.filter(user => user.status === status).length;
}

export function getUsersConfig(): UsersPageConfig {
  const businesses = [
    {id: 'all', label: 'All businesses'},
    ...Array.from(
      new Map(
        users.map(user => [
          user.portalId,
          {id: user.portalId, label: user.portalName},
        ]),
      ).values(),
    ).sort((left, right) => left.label.localeCompare(right.label)),
  ];

  return {
    title: 'Users',
    subtitle: 'Manage users, roles, and portal access.',
    businesses,
    roles: [...ROLES],
    userTypes: [...USER_TYPES],
    statusChips: [
      {id: 'all', label: 'All', count: users.length},
      {
        id: 'active',
        label: 'Active',
        count: countByStatus('active'),
        filter: {field: 'status', value: 'active'},
      },
      {
        id: 'inactive',
        label: 'Inactive',
        count: countByStatus('inactive'),
        filter: {field: 'status', value: 'inactive'},
      },
    ],
    sortOptions: [
      {id: 'latest', label: 'Latest', field: 'createdAt', direction: 'desc'},
      {id: 'oldest', label: 'Oldest', field: 'createdAt', direction: 'asc'},
      {id: 'name-asc', label: 'Name A-Z', field: 'name', direction: 'asc'},
      {id: 'name-desc', label: 'Name Z-A', field: 'name', direction: 'desc'},
      {id: 'login', label: 'Last login', field: 'lastLoginAt', direction: 'desc'},
    ],
  };
}

export function stubUsersPage(query: UserListQuery): UsersPageResult {
  const filtered = applyUserFilters(users, query.search, query.filters);
  return {
    config: getUsersConfig(),
    list: paginateUsers(filtered, query.page, query.limit),
  };
}

export function stubCreateUser(values: UserFormValues): AppUser {
  const business =
    getUsersConfig().businesses.find(item => item.id === values.portalId) ??
    BUSINESSES.find(item => item.id === values.portalId);

  const user: AppUser = {
    id: nextUserId(),
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    portalId: values.portalId,
    portalName: business?.label ?? 'Unassigned',
    role: values.role,
    userType: values.userType,
    status: values.status,
    createdAt: new Date().toISOString().slice(0, 10),
    lastLoginAt: null,
  };

  users = [user, ...users];
  return user;
}

export function stubUpdateUser(id: string, values: UserFormValues): AppUser {
  const current = users.find(item => item.id === id);
  if (!current) {
    throw new Error('User not found.');
  }

  const business =
    getUsersConfig().businesses.find(item => item.id === values.portalId) ??
    BUSINESSES.find(item => item.id === values.portalId);

  const next: AppUser = {
    ...current,
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    portalId: values.portalId,
    portalName: business?.label ?? current.portalName,
    role: values.role,
    userType: values.userType,
    status: values.status,
  };

  users = users.map(item => (item.id === id ? next : item));
  return next;
}

export function stubDeleteUser(id: string): void {
  const exists = users.some(item => item.id === id);
  if (!exists) {
    throw new Error('User not found.');
  }
  users = users.filter(item => item.id !== id);
}

export function stubCreateBusinessFromUser(
  userId: string,
  businessName: string,
): AppUser {
  const source = users.find(item => item.id === userId);
  if (!source) {
    throw new Error('Select an existing user to create the business.');
  }

  const name = businessName.trim();
  if (!name) {
    throw new Error('Enter a business name.');
  }

  const portalId = `biz-${Date.now()}`;
  const user: AppUser = {
    ...source,
    id: nextUserId(),
    portalId,
    portalName: name,
    createdAt: new Date().toISOString().slice(0, 10),
    lastLoginAt: null,
  };

  users = [user, ...users];
  return user;
}

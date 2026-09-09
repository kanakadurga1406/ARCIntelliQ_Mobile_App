import type {NavItem} from '../types/claimPortals';

export const HUB_HIDDEN_MENU = new Set([
  'dashboard',
  'add-claim',
  'smart-search',
  'users',
]);

export const USERS_NAV_ITEM: NavItem = {
  id: 'users',
  label: 'Users',
  icon: 'users',
  destination: 'users',
};

function insertUsersItem(items: NavItem[]): NavItem[] {
  if (items.some(item => item.destination === 'users')) {
    return items;
  }

  const portalsIndex = items.findIndex(item => item.destination === 'portals');
  if (portalsIndex < 0) {
    return [USERS_NAV_ITEM, ...items];
  }

  return [
    ...items.slice(0, portalsIndex + 1),
    USERS_NAV_ITEM,
    ...items.slice(portalsIndex + 1),
  ];
}

export function hubMenuItems(items: NavItem[]): NavItem[] {
  return items.filter(item => !HUB_HIDDEN_MENU.has(item.destination));
}

export function portalMenuItems(items: NavItem[]): NavItem[] {
  return insertUsersItem(items);
}

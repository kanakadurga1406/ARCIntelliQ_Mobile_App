import type {NavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getEnteredPortal, type EnteredPortal} from '../api/session';
import type {ClaimHandlerUser} from '../types/auth';
import type {NavItem} from '../types/claimPortals';
import type {RootStackParamList} from '../types/navigation';

const MOBILE_FEATURE_KEYS = new Set([
  'claims',
  'intake',
  'users',
  'faqs',
  'faq',
]);

export function menuPath(route?: string): string {
  return (route || '').replace(/^\/+/, '').split('?')[0].toLowerCase();
}

export function menuPathKey(route?: string): string {
  const path = menuPath(route);
  return path.split('/').filter(Boolean).pop() || path;
}

export function isMobileMenuRoute(route?: string): boolean {
  return MOBILE_FEATURE_KEYS.has(menuPathKey(route));
}

export function firstMenuFeature(items: NavItem[]): NavItem | null {
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      const nested = firstMenuFeature(item.children);
      if (nested) {
        return nested;
      }
    }
    if (
      item.destination !== 'sign-out' &&
      isMobileMenuRoute(item.route || item.destination)
    ) {
      return item;
    }
  }
  return null;
}

export function enteredWorkspaceRoute(
  user: ClaimHandlerUser,
  entered: EnteredPortal,
) {
  const feature = entered.firstFeature ?? firstMenuFeature(entered.menu);
  const key = menuPathKey(feature?.route || feature?.destination);
  const params = {
    user,
    portalId: entered.businessId,
    portalName: entered.businessName,
  };

  if (key === 'users') {
    return {name: 'Users' as const, params};
  }
  if (key === 'faqs' || key === 'faq') {
    return {name: 'Faqs' as const, params: undefined};
  }
  if (key === 'smart-search') {
    return {name: 'SmartSearch' as const, params: undefined};
  }

  return {
    name: 'ClaimHistory' as const,
    params: {
      ...params,
      openAddClaim: key === 'intake',
    },
  };
}

export function openEnteredWorkspace(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  user: ClaimHandlerUser,
  entered: EnteredPortal,
  mode: 'navigate' | 'reset' = 'navigate',
): void {
  const target = enteredWorkspaceRoute(user, entered);
  console.log('[ARC business] open first feature', {
    route: entered.firstFeature?.route,
    label: entered.firstFeature?.label,
    screen: target.name,
  });
  if (mode === 'reset') {
    navigation.reset({
      index: 0,
      routes: [target],
    });
    return;
  }
  if (target.name === 'Faqs') {
    navigation.navigate('Faqs');
    return;
  }
  if (target.name === 'SmartSearch') {
    navigation.navigate('SmartSearch');
    return;
  }
  if (target.name === 'Users') {
    navigation.navigate('Users', target.params);
    return;
  }
  navigation.navigate('ClaimHistory', target.params);
}

export type AppMenuResult = 'stay' | 'sign-out' | 'handled' | 'unknown';

export function navigateFromAppMenu(
  navigation: NavigationProp<RootStackParamList>,
  user: ClaimHandlerUser | null | undefined,
  destination: string,
  current?: string,
): AppMenuResult {
  if (current && destination === current) {
    return 'stay';
  }
  if (destination === 'sign-out') {
    return 'sign-out';
  }
  if (!user) {
    return 'unknown';
  }

  const entered = getEnteredPortal();
  const portalParams = {
    user,
    portalId: entered?.businessId,
    portalName: entered?.businessName,
  };

  if (destination === 'faqs' || destination === 'faq') {
    navigation.navigate('Faqs');
    return 'handled';
  }
  if (destination === 'smart-search') {
    navigation.navigate('SmartSearch');
    return 'handled';
  }
  if (destination === 'users') {
    navigation.navigate('Users', portalParams);
    return 'handled';
  }
  if (destination === 'claims' || destination === 'add-claim') {
    if (entered) {
      navigation.navigate('ClaimHistory', {
        user,
        portalId: entered.businessId,
        portalName: entered.businessName,
        openAddClaim: destination === 'add-claim',
      });
      return 'handled';
    }
  }
  if (
    destination === 'home' ||
    destination === 'portals' ||
    destination === 'dashboard' ||
    destination === 'profile'
  ) {
    navigation.navigate('ClaimPortals', {
      user,
      initialTab: destination === 'home' ? 'portals' : destination,
    });
    return 'handled';
  }

  return 'unknown';
}

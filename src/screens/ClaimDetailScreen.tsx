import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {clearBusinessCache} from '../api/business';
import {
  clearSession,
  getEnteredPortal,
  getSelectedClaim,
  getSession,
} from '../api/session';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {AppHeader} from '../components/claimPortals/AppHeader';
import {PageBackdrop} from '../components/claimPortals/PageBackdrop';
import {
  ChevronLeftIcon,
  DotsIcon,
} from '../components/claimPortals/ClaimPortalsIcons';
import {SideDrawer} from '../components/claimPortals/SideDrawer';
import {ClaimAccordionCard} from '../components/claims/ClaimAccordionCard';
import {ClaimDetailTabs} from '../components/claims/ClaimDetailTabs';
import {ClaimFormInput, TriageRow} from '../components/claims/ClaimFormControls';
import {FadeSlideIn, PressableScale} from '../components/ui/Motion';
import {getClaimPortalTheme} from '../theme/claimPortals';
import {
  CLAIM_DETAIL_TABS,
  INFO_SECTIONS,
  LOCATION_SECTION,
  PERSONS_SECTION,
  TRIAGE_QUESTIONS,
  type ClaimDetailTabId,
  type ClaimFormSection,
} from '../types/claimDetail';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {navigateFromAppMenu} from '../utils/enteredPortalNav';

type Props = NativeStackScreenProps<RootStackParamList, 'ClaimDetail'>;

function seedValues(raw: Record<string, string>): Record<string, string> {
  const next = {...raw};
  TRIAGE_QUESTIONS.forEach(question => {
    if (!next[question.id]) {
      next[question.id] = 'Unknown';
    }
  });
  if (!next.caller_phone && next.claimant_contact) {
    next.caller_phone = next.claimant_contact;
  }
  return next;
}

const ClaimDetailScreen = ({navigation}: Props) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const claim = getSelectedClaim();
  const user = getSession()?.user;
  const entered = getEnteredPortal();
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const [activeTab, setActiveTab] = useState<ClaimDetailTabId>('info');
  const [openSection, setOpenSection] = useState('incident');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    seedValues(claim?.raw ?? {}),
  );

  if (!claim) {
    return (
      <View style={styles.root}>
        <PageBackdrop />
        <AppHeader
          theme={theme}
          userName={user?.name || 'Handler'}
          topInset={insets.top}
          onMenuPress={() => setDrawerOpen(true)}
          onFaqsPress={() => navigation.navigate('Faqs')}
          onProfilePress={() => {
            if (user) {
              navigation.navigate('ClaimPortals', {user, initialTab: 'profile'});
            }
          }}
        />
        <Text style={[styles.missing, {color: theme.textSecondary}]}>
          This claim is no longer available.
        </Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backPlain}>
          <Text style={{color: theme.primary, fontWeight: '700'}}>Back to Claims</Text>
        </Pressable>
        {user ? (
          <SideDrawer
            visible={drawerOpen}
            theme={theme}
            user={user}
            portalName={entered?.businessName}
            menuItems={entered?.menu ?? []}
            activeDestination="claims"
            topInset={insets.top}
            bottomInset={insets.bottom}
            onClose={() => setDrawerOpen(false)}
            onNavigate={destination => {
              setDrawerOpen(false);
              const result = navigateFromAppMenu(
                navigation,
                user,
                destination,
                'claims',
              );
              if (result === 'sign-out') {
                clearSession();
                clearBusinessCache();
                navigation.reset({
                  index: 0,
                  routes: [{name: 'PortalSelect'}],
                });
              }
            }}
          />
        ) : null}
      </View>
    );
  }

  const setField = (key: string, value: string) => {
    setValues(current => ({...current, [key]: value}));
  };

  const isDuplicate =
    `${claim.status.label} ${values.closure_code ?? ''}`.toLowerCase().includes(
      'duplicate',
    );

  const renderSection = (section: ClaimFormSection) => (
    <ClaimAccordionCard
      key={section.id}
      theme={theme}
      title={section.title}
      subtitle={section.subtitle}
      icon={section.icon}
      open={openSection === section.id}
      onToggle={() =>
        setOpenSection(current => (current === section.id ? '' : section.id))
      }>
      {section.kind === 'triage'
        ? TRIAGE_QUESTIONS.map(question => (
            <View key={question.id} style={styles.fullRow}>
              <TriageRow
                theme={theme}
                label={question.label}
                value={values[question.id] || 'Unknown'}
                onChange={value => setField(question.id, value)}
              />
            </View>
          ))
        : section.fields.map(field => (
            <ClaimFormInput
              key={field.id}
              theme={theme}
              field={field}
              value={values[field.rowKey] ?? ''}
              onChange={value => setField(field.rowKey, value)}
            />
          ))}
    </ClaimAccordionCard>
  );

  const renderTabBody = () => {
    if (activeTab === 'location') {
      return renderSection(LOCATION_SECTION);
    }
    if (activeTab === 'persons') {
      return renderSection(PERSONS_SECTION);
    }
    if (activeTab === 'payments') {
      return (
        <Text style={[styles.empty, {color: theme.textSecondary}]}>
          Payments for this claim will show here when that API is connected.
        </Text>
      );
    }
    if (activeTab === 'notes') {
      return (
        <Text style={[styles.empty, {color: theme.textSecondary}]}>
          Notes for this claim will show here when that API is connected.
        </Text>
      );
    }
    return INFO_SECTIONS.map(renderSection);
  };

  return (
    <View style={styles.root}>
      <PageBackdrop />
      <StatusBar barStyle="dark-content" />
      <AppHeader
        theme={theme}
        userName={user?.name || 'Handler'}
        topInset={insets.top}
        onMenuPress={() => setDrawerOpen(true)}
        onFaqsPress={() => navigation.navigate('Faqs')}
        onProfilePress={() => {
          if (user) {
            navigation.navigate('ClaimPortals', {user, initialTab: 'profile'});
          }
        }}
      />
      <View style={styles.nav}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back to Claims"
            hitSlop={8}
            style={styles.back}>
            <ChevronLeftIcon color={theme.primary} size={18} />
          </Pressable>
          <Text style={[styles.claimId, {color: theme.text}]} numberOfLines={1}>
            {claim.incidentNumber}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More"
          hitSlop={8}>
          <DotsIcon color={theme.text} />
        </Pressable>
      </View>
      <View style={styles.badges}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{claim.status.label}</Text>
        </View>
        {isDuplicate ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Possible Duplicate</Text>
          </View>
        ) : null}
      </View>

      <ClaimDetailTabs
        theme={theme}
        tabs={CLAIM_DETAIL_TABS}
        active={activeTab}
        onChange={id => {
          setActiveTab(id);
          if (id === 'location') {
            setOpenSection('incident-location');
          } else if (id === 'persons') {
            setOpenSection('persons-involved');
          } else if (id === 'info') {
            setOpenSection('incident');
          }
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingBottom: 24 + insets.bottom + (activeTab === 'info' ? 64 : 8)},
        ]}
        showsVerticalScrollIndicator={false}>
        <FadeSlideIn key={activeTab} distance={8} duration={200}>
          {renderTabBody()}
        </FadeSlideIn>
      </ScrollView>

      {activeTab === 'info' ? (
        <PressableScale
          onPress={() =>
            showDialog({
              title: 'Update Claim',
              message: 'Saving this claim will connect when that live API is ready.',
              buttons: [{label: 'OK'}],
            })
          }
          style={[styles.update, {bottom: 16 + insets.bottom}]}
          contentStyle={styles.updateInner}>
          <Text style={styles.updateText}>Update Claim</Text>
        </PressableScale>
      ) : null}

      <AppDialog
        visible={dialog.visible}
        theme={theme}
        title={dialog.title}
        message={dialog.message}
        buttons={dialog.buttons}
        onClose={hideDialog}
      />

      {user ? (
        <SideDrawer
          visible={drawerOpen}
          theme={theme}
          user={user}
          portalName={entered?.businessName}
          menuItems={entered?.menu ?? []}
          activeDestination="claims"
          topInset={insets.top}
          bottomInset={insets.bottom}
          onClose={() => setDrawerOpen(false)}
          onNavigate={destination => {
            setDrawerOpen(false);
            const result = navigateFromAppMenu(
              navigation,
              user,
              destination,
              'claims',
            );
            if (result === 'sign-out') {
              clearSession();
              clearBusinessCache();
              navigation.reset({
                index: 0,
                routes: [{name: 'PortalSelect'}],
              });
            }
          }}
        />
      ) : null}
    </View>
  );
};

export default ClaimDetailScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  nav: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  back: {
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlain: {
    alignSelf: 'center',
    marginTop: 12,
  },
  claimId: {
    flex: 1,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDE8E8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DC2626',
  },
  badgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  fullRow: {
    width: '100%',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  missing: {
    marginTop: 48,
    textAlign: 'center',
    fontSize: 15,
  },
  update: {
    position: 'absolute',
    right: 16,
  },
  updateInner: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#163A7A',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

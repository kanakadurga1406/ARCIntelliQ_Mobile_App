import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {clearBusinessCache} from '../api/business';
import {fetchFaqs} from '../api/faqs';
import {clearSession, getEnteredPortal, getSession} from '../api/session';
import {AppHeader} from '../components/claimPortals/AppHeader';
import {PageBackdrop} from '../components/claimPortals/PageBackdrop';
import {PageHero} from '../components/claimPortals/PageHero';
import {SideDrawer} from '../components/claimPortals/SideDrawer';
import {FadeSlideIn, PressableScale} from '../components/ui/Motion';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {FaqItem} from '../types/claimPortals';
import type {FaqsScreenProps} from '../types/navigation';
import {navigateFromAppMenu} from '../utils/enteredPortalNav';

const FaqsScreen = ({navigation}: FaqsScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const user = getSession()?.user;
  const entered = getEnteredPortal();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadFaqs = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const items = await fetchFaqs();
        if (cancelled) {
          return;
        }
        setFaqs(items);
        setOpenId(items[0]?.id ?? null);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load FAQs.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFaqs();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.root}>
      <PageBackdrop />
      <StatusBar barStyle="dark-content" />
      <AppHeader
        theme={theme}
        userName={user?.name || 'Handler'}
        topInset={insets.top}
        onMenuPress={() => setDrawerOpen(true)}
        onFaqsPress={() => {}}
        onProfilePress={() => {
          if (user) {
            navigation.navigate('ClaimPortals', {user, initialTab: 'profile'});
          }
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + 28},
        ]}>
        <PageHero
          icon="faq"
          title="FAQs"
          subtitle="Quick answers for claim handlers working in ARCIntelliQ."
        />

        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={styles.loader} />
        ) : null}

        {errorMessage ? (
          <Text style={[styles.subtitle, {color: theme.danger}]}>
            {errorMessage}
          </Text>
        ) : null}

        {faqs.map(item => {
          const open = openId === item.id;
          return (
            <FadeSlideIn key={item.id}>
            <PressableScale
              onPress={() => setOpenId(open ? null : item.id)}
              accessibilityRole="button"
              accessibilityState={{expanded: open}}
              accessibilityLabel={item.question}
              contentStyle={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: open ? theme.primary : 'transparent',
                  borderWidth: open ? 1.5 : 0,
                },
              ]}>
              <View style={styles.questionRow}>
                <Text style={[styles.question, {color: theme.text}]}>
                  {item.question}
                </Text>
                <View
                  style={[
                    styles.caret,
                    open && styles.caretOpen,
                    {borderColor: theme.textMuted},
                  ]}
                />
              </View>
              {open ? (
                <Text style={[styles.answer, {color: theme.textSecondary}]}>
                  {item.answer}
                </Text>
              ) : null}
            </PressableScale>
            </FadeSlideIn>
          );
        })}
      </ScrollView>

      {user ? (
        <SideDrawer
          visible={drawerOpen}
          theme={theme}
          user={user}
          portalName={entered?.businessName}
          menuItems={entered?.menu ?? []}
          activeDestination="faqs"
          topInset={insets.top}
          bottomInset={insets.bottom}
          onClose={() => setDrawerOpen(false)}
          onNavigate={destination => {
            setDrawerOpen(false);
            const result = navigateFromAppMenu(
              navigation,
              user,
              destination,
              'faqs',
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

export default FaqsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
  },
  loader: {
    marginTop: 16,
  },
  card: {
    borderWidth: 0,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#1B3A66',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  caret: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{rotate: '45deg'}],
    marginTop: -4,
  },
  caretOpen: {
    transform: [{rotate: '-135deg'}],
    marginTop: 4,
  },
  answer: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
  },
});

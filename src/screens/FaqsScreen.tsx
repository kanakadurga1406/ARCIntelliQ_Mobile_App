import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fetchFaqs} from '../api/faqs';
import {ChevronRightIcon} from '../components/claimPortals/ClaimPortalsIcons';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {FaqItem} from '../types/claimPortals';
import type {FaqsScreenProps} from '../types/navigation';

const FaqsScreen = ({navigation, route}: FaqsScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(
    () => getClaimPortalTheme(route.params.scheme),
    [route.params.scheme],
  );
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
    <View style={[styles.root, {backgroundColor: theme.page}]}>
      <StatusBar
        barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={{height: insets.top, backgroundColor: theme.page}} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
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
        <Text style={[styles.headerTitle, {color: theme.text}]}>FAQs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + 28},
        ]}>
        <Text style={[styles.title, {color: theme.text}]}>
          Frequently asked questions
        </Text>
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          Quick answers for claim handlers working in ARCIntelliQ.
        </Text>

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
            <Pressable
              key={item.id}
              onPress={() => setOpenId(open ? null : item.id)}
              accessibilityRole="button"
              accessibilityState={{expanded: open}}
              accessibilityLabel={item.question}
              style={({pressed}) => [
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: open ? theme.primary : theme.border,
                },
                pressed && {opacity: 0.92},
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
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FaqsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  loader: {
    marginTop: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
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

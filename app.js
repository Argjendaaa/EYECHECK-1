import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

const COLORS = {
  background: '#F5F7FA',
  navy: '#142B4A',
  blue: '#3268E8',
  teal: '#17A999',
  white: '#FFFFFF',
  text: '#203047',
  muted: '#77869A',
  border: '#E5EAF0',
  lightBlue: '#EAF0FF',
  lightTeal: '#E5F7F3',
  lightOrange: '#FFF3E1',
};

const TESTS = [
  {
    id: 'acuity',
    number: '01',
    title: 'Mprehtësia e shikimit',
    description: 'Ushtrim orientues me simbole',
    icon: 'E',
    color: COLORS.lightBlue,
  },
  {
    id: 'colors',
    number: '02',
    title: 'Njohja e ngjyrave',
    description: 'Ushtrim demonstrues me ngjyra',
    icon: '◉',
    color: COLORS.lightTeal,
  },
];

// Komponentet e përbashkëta jashtë App, që të mos rikrijohen në çdo render
const Header = () => (
  <View style={styles.header}>
    <View style={styles.logo}>
      <Text style={styles.logoSymbol}>◉</Text>
    </View>

    <View style={styles.brand}>
      <Text style={styles.brandName}>SYRI</Text>
      <Text style={styles.brandCaption}>EYECARE</Text>
    </View>

    <View style={styles.headerStatus}>
      <View style={styles.statusDot} />
      <Text style={styles.statusText}>Demo</Text>
    </View>
  </View>
);

const SectionTitle = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action ? (
      <Pressable onPress={onAction} hitSlop={8}>
        <Text style={styles.actionText}>{action}</Text>
      </Pressable>
    ) : null}
  </View>
);

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const PrimaryButton = ({ title, onPress, disabled = false }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    disabled={disabled}
    style={[styles.primaryButton, disabled && styles.disabledButton]}
  >
    <Text style={styles.primaryButtonText}>{title}</Text>
  </Pressable>
);

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedTest, setSelectedTest] = useState(null);
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const startTest = (test) => {
    setSelectedTest(test);
    setAnswer('');
    setScreen('test');
  };

  const finishTest = () => {
    if (!answer || !selectedTest) return;

    const result = {
      id: String(Date.now()),
      title: selectedTest.title,
      answer,
      date: new Date().toLocaleDateString(),
    };

    setLastResult(result);
    setHistory((previous) => [result, ...previous]);
    setScreen('result');
  };

  const renderHome = () => (
    <>
      <View style={styles.greeting}>
        <Text style={styles.eyebrow}>PLATFORMA E KUJDESIT PËR SYTË</Text>
        <Text style={styles.greetingTitle}>
          Shëndeti i syve fillon me kujdesin.
        </Text>
        <Text style={styles.greetingText}>
          Ndiq kontrollet orientuese dhe mbaj rezultatet të organizuara
          në një vend.
        </Text>

        <View style={styles.heroDecoration}>
          <Text style={styles.heroEye}>◉</Text>
          <View style={styles.heroLine} />
        </View>

        <PrimaryButton
          title="Fillo kontrollin   →"
          onPress={() => setScreen('tests')}
        />
      </View>

      <SectionTitle title="Përmbledhja" />

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Profile</Text>
          <Text style={styles.statValue}>01</Text>
          <Text style={styles.statFoot}>Demonstrues</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Kontrolle</Text>
          <Text style={styles.statValue}>
            {String(history.length).padStart(2, '0')}
          </Text>
          <Text style={styles.statFoot}>Në këtë sesion</Text>
        </Card>
      </View>

      <SectionTitle
        title="Kontrollet"
        action="Shiko të gjitha"
        onAction={() => setScreen('tests')}
      />

      {TESTS.map((test) => (
        <Pressable
          key={test.id}
          onPress={() => startTest(test)}
          accessibilityRole="button"
        >
          <Card style={styles.testCard}>
            <View style={[styles.testIcon, { backgroundColor: test.color }]}>
              <Text style={styles.testIconText}>{test.icon}</Text>
            </View>

            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>{test.title}</Text>
              <Text style={styles.testDescription}>{test.description}</Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </Card>
        </Pressable>
      ))}

      <SectionTitle
        title="Kontrolli i fundit"
        action={history.length ? 'Historiku' : undefined}
        onAction={() => setScreen('history')}
      />

      <Card>
        {history.length ? (
          <>
            <Text style={styles.recordTitle}>{history[0].title}</Text>
            <Text style={styles.muted}>
              {history[0].date} · Përgjigjja: {history[0].answer}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>▤</Text>
            </View>
            <Text style={styles.recordTitle}>Ende nuk ka kontrolle</Text>
            <Text style={styles.muted}>
              Rezultatet e ushtrimeve të këtij sesioni do të paraqiten këtu.
            </Text>
          </>
        )}
      </Card>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Kujdes shëndetësor</Text>
        <Text style={styles.disclaimerText}>
          Syri është prototip demonstrues. Ushtrimet nuk diagnostikojnë
          probleme të shikimit dhe nuk zëvendësojnë kontrollin te okulisti.
        </Text>
      </View>
    </>
  );

  const renderTests = () => (
    <>
      <Text style={styles.pageTitle}>Kontrollet</Text>
      <Text style={styles.pageDescription}>
        Zgjidh një ushtrim për të vazhduar.
      </Text>

      {TESTS.map((test) => (
        <Pressable
          key={test.id}
          onPress={() => startTest(test)}
          accessibilityRole="button"
        >
          <Card style={styles.testCardLarge}>
            <View
              style={[styles.testIconLarge, { backgroundColor: test.color }]}
            >
              <Text style={styles.testIconLargeText}>{test.icon}</Text>
            </View>
            <Text style={styles.testNumber}>{test.number}</Text>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.testDescription}>{test.description}</Text>
            <Text style={styles.actionText}>Hap ushtrimin  →</Text>
          </Card>
        </Pressable>
      ))}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Para se të fillosh</Text>
        <Text style={styles.disclaimerText}>
          Këto ushtrime nuk janë teste klinike të kalibruara. Mos i përdor
          për të nxjerrë përfundime për shëndetin e syve.
        </Text>
      </View>
    </>
  );

  const renderTest = () => {
    const options =
      selectedTest?.id === 'acuity'
        ? ['Djathtas', 'Majtas', 'Lart', 'Poshtë']
        : ['E kuqe', 'E gjelbër', 'Blu', 'E verdhë'];

    return (
      <>
        <Text style={styles.eyebrow}>USHTRIM DEMONSTRUES</Text>
        <Text style={styles.pageTitle}>{selectedTest?.title}</Text>
        <Text style={styles.pageDescription}>
          Zgjidh një përgjigje për të përfunduar ushtrimin.
        </Text>

        <Card style={styles.questionCard}>
          {selectedTest?.id === 'acuity' ? (
            <Text style={styles.chartSymbol}>E</Text>
          ) : (
            <View style={styles.colorCircle} />
          )}

          <Text style={styles.questionTitle}>
            {selectedTest?.id === 'acuity'
              ? 'Në cilin drejtim janë vijat e simbolit?'
              : 'Cila ngjyrë e përshkruan më mirë rrethin?'}
          </Text>

          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => setAnswer(option)}
              style={[
                styles.option,
                answer === option && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  answer === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
              <View style={styles.radioOuter}>
                {answer === option && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}

          <PrimaryButton
            title="Përfundo ushtrimin"
            onPress={finishTest}
            disabled={!answer}
          />
        </Card>

        <Pressable style={styles.backLink} onPress={() => setScreen('tests')}>
          <Text style={styles.actionText}>← Kthehu te kontrollet</Text>
        </Pressable>
      </>
    );
  };

  const renderResult = () => (
    <>
      <Text style={styles.eyebrow}>PËRMBLEDHJA E SESIONIT</Text>
      <Text style={styles.pageTitle}>Ushtrimi përfundoi</Text>
      <Text style={styles.pageDescription}>
        Më poshtë paraqitet përgjigjja që ke zgjedhur.
      </Text>

      <Card>
        <Text style={styles.recordTitle}>{lastResult?.title}</Text>
        <Text style={styles.muted}>Data: {lastResult?.date}</Text>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>
            Përgjigjja: {lastResult?.answer}
          </Text>
        </View>
      </Card>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Kujdes shëndetësor</Text>
        <Text style={styles.disclaimerText}>
          Ky rezultat është vetëm demonstrues dhe nuk përbën diagnozë. Për
          çdo shqetësim, konsultohu me okulistin.
        </Text>
      </View>

      <PrimaryButton
        title="Kthehu në ballinë"
        onPress={() => setScreen('home')}
      />
      <Pressable style={styles.backLink} onPress={() => setScreen('tests')}>
        <Text style={styles.actionText}>Bëj një ushtrim tjetër</Text>
      </Pressable>
    </>
  );

  const renderHistory = () => (
    <>
      <Text style={styles.pageTitle}>Historiku</Text>
      <Text style={styles.pageDescription}>
        Ushtrimet e përfunduara në këtë sesion.
      </Text>

      {history.length ? (
        history.map((item) => (
          <Card key={item.id} style={styles.historyCard}>
            <Text style={styles.recordTitle}>{item.title}</Text>
            <Text style={styles.muted}>
              {item.date} · Përgjigjja: {item.answer}
            </Text>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.recordTitle}>Ende nuk ka kontrolle</Text>
          <Text style={styles.muted}>
            Kur të përfundosh një ushtrim, do të shfaqet këtu.
          </Text>
        </Card>
      )}

      <Pressable style={styles.backLink} onPress={() => setScreen('home')}>
        <Text style={styles.actionText}>← Kthehu në ballinë</Text>
      </Pressable>
    </>
  );

  const renderScreen = () => {
    switch (screen) {
      case 'tests':
        return renderTests();
      case 'test':
        return renderTest();
      case 'result':
        return renderResult();
      case 'history':
        return renderHistory();
      default:
        return renderHome();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderScreen()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    color: COLORS.white,
    fontSize: 20,
  },
  brand: {
    flex: 1,
    marginLeft: 12,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: 2,
  },
  brandCaption: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 3,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightTeal,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.teal,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },

  // Greeting / hero
  greeting: {
    backgroundColor: COLORS.navy,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.teal,
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 10,
    lineHeight: 32,
  },
  greetingText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#C5D1E3',
    marginBottom: 20,
  },
  heroDecoration: {
    position: 'absolute',
    right: -10,
    top: 10,
    opacity: 0.12,
    alignItems: 'center',
  },
  heroEye: {
    fontSize: 110,
    color: COLORS.white,
  },
  heroLine: {
    width: 80,
    height: 2,
    backgroundColor: COLORS.white,
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue,
  },

  // Cards
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.navy,
    marginVertical: 4,
  },
  statFoot: {
    fontSize: 12,
    color: COLORS.muted,
  },

  // Test cards
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testIconText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
  },
  testInfo: {
    flex: 1,
    marginLeft: 14,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  testDescription: {
    fontSize: 13,
    color: COLORS.muted,
  },
  chevron: {
    fontSize: 28,
    color: COLORS.muted,
    marginLeft: 8,
  },
  testCardLarge: {
    padding: 20,
  },
  testIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  testIconLargeText: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.navy,
  },
  testNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
    letterSpacing: 1,
    marginBottom: 4,
  },

  // Records / empty state
  recordTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  muted: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyIconText: {
    fontSize: 20,
    color: COLORS.blue,
  },
  historyCard: {
    marginBottom: 10,
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: COLORS.lightOrange,
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A5B00',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7A5A22',
  },

  // Buttons
  primaryButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 14,
  },

  // Page titles
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 6,
  },
  pageDescription: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 20,
    lineHeight: 20,
  },

  // Test screen
  questionCard: {
    alignItems: 'stretch',
    padding: 20,
  },
  chartSymbol: {
    fontSize: 96,
    fontWeight: '900',
    color: COLORS.navy,
    textAlign: 'center',
    marginVertical: 12,
  },
  colorCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.teal,
    alignSelf: 'center',
    marginVertical: 16,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  optionSelected: {
    borderColor: COLORS.blue,
    backgroundColor: COLORS.lightBlue,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.blue,
    fontWeight: '700',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
  },

  
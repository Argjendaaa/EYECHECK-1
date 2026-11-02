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
      style={[
        styles.primaryButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );

  const renderHome = () => (
    <>
      <View style={styles.greeting}>
        <Text style={styles.eyebrow}>PLATFORMA E KUJDESIT PËR SYTË</Text>
        <Text style={styles.greetingTitle}>
          Shëndeti i syve fillon me kujdesin.
        </Text>
        <Text style={styles.greetingText}>
          Ndiq kontrollet orientuese dhe mbaj rezultatet
          të organizuara në një vend.
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
            <View
              style={[
                styles.testIcon,
                { backgroundColor: test.color },
              ]}
            >
              <Text style={styles.testIconText}>{test.icon}</Text>
            </View>

            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>{test.title}</Text>
              <Text style={styles.testDescription}>
                {test.description}
              </Text>
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
            <Text style={styles.recordTitle}>
              {history[0].title}
            </Text>
            <Text style={styles.muted}>
              {history[0].date} · Përgjigjja: {history[0].answer}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>▤</Text>
            </View>
            <Text style={styles.recordTitle}>
              Ende nuk ka kontrolle
            </Text>
            <Text style={styles.muted}>
              Rezultatet e ushtrimeve të këtij sesioni
              do të paraqiten këtu.
            </Text>
          </>
        )}
      </Card>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>
          Kujdes shëndetësor
        </Text>
        <Text style={styles.disclaimerText}>
          Syri është prototip demonstrues. Ushtrimet nuk
          diagnostikojnë probleme të shikimit dhe nuk
          zëvendësojnë kontrollin te okulisti.
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
        <Pressable key={test.id} onPress={() => startTest(test)}>
          <Card style={styles.testCardLarge}>
            <View
              style={[
                styles.testIconLarge,
                { backgroundColor: test.color },
              ]}
            >
              <Text style={styles.testIconLargeText}>
                {test.icon}
              </Text>
            </View>
            <Text style={styles.testNumber}>{test.number}</Text>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.testDescription}>
              {test.description}
            </Text>
            <Text style={styles.actionText}>
              Hap ushtrimin  →
            </Text>
          </Card>
        </Pressable>
      ))}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>
          Para se të fillosh
        </Text>
        <Text style={styles.disclaimerText}>
          Këto ushtrime nuk janë teste klinike të
          kalibruara. Mos i përdor për të nxjerrë
          përfundime për shëndetin e syve.
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
        <Text style={styles.eyebrow}>USHtrim DEMONSTRUES</Text>
        <Text style={styles.pageTitle}>
          {selectedTest?.title}
        </Text>
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
                {answer === option && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </Pressable>
          ))}

          <PrimaryButton
            title="Përfundo ushtrimin"
            onPress={finishTest}
            disabled={!answer}
          />
        </Card>

        <Pressable
          style={styles.backLink}
          onPress={() => setScreen('tests')}
        >
          <Text style={styles.actionText}>
            ← Kthehu te kontrollet
          </Text>
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

     
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const STEPS = [
  { n: '1', title: 'Shto fëmijën', text: 'Fut emrin dhe vitin e lindjes.' },
  { n: '2', title: 'Bëj testin', text: 'Mprehtësia dhe ngjyrat, në pak minuta.' },
  { n: '3', title: 'Merr rezultatin', text: 'Semafor i qartë dhe këshillë në shqip.' },
];

const LIGHTS = [
  { color: '#2e9e5b', label: 'Normal' },
  { color: '#e0a800', label: 'Kontrollo brenda 1–3 muajsh' },
  { color: '#d64545', label: 'Shko te okulisti' },
];

export default function App() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.logo}>Syri</Text>
      <Text style={styles.tagline}>
        Kontrollo shikimin e fëmijës nga shtëpia, në pak minuta.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Si funksionon</Text>
        {STEPS.map((s) => (
          <View key={s.n} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{s.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rezultati me semafor</Text>
        {LIGHTS.map((l) => (
          <View key={l.label} style={styles.light}>
            <View style={[styles.dot, { backgroundColor: l.color }]} />
            <Text style={styles.lightText}>{l.label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.button}
        onPress={() => Alert.alert('Së shpejti', 'Testi shtohet në hapin tjetër.')}
      >
        <Text style={styles.buttonText}>Fillo testin</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Mjet skrining, jo diagnozë. Nuk zëvendëson kontrollin te okulisti.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f8fb' },
  content: { padding: 20, paddingTop: 64, gap: 16 },
  logo: { fontSize: 40, fontWeight: '800', color: '#1a73e8' },
  tagline: { fontSize: 17, color: '#444', lineHeight: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#e3e8ef' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e8f0fe', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontWeight: '700', color: '#1a73e8' },
  stepTitle: { fontSize: 16, fontWeight: '600' },
  stepText: { fontSize: 14, color: '#666' },
  light: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  lightText: { fontSize: 15 },
  button: { backgroundColor: '#1a73e8', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  disclaimer: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 24 },
}
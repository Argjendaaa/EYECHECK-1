import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const KATEGORITE = [
  { emri: 'Korniza optike', pershkrimi: 'Klasike, moderne dhe për fëmijë', ikona: '◉', ngjyra: '#e4eee6' },
  { emri: 'Syze dielli', pershkrimi: 'Mbrojtje për ditët me diell', ikona: '☼', ngjyra: '#f5eddf' },
  { emri: 'Lente kontakti', pershkrimi: 'Zgjidhje të lehta për çdo ditë', ikona: '✳', ngjyra: '#e9e9f0' },
];

export default function Katalogu() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>OPTIKA · KOLEKSIONI</Text>
      <Text style={styles.title}>Gjej stilin tënd.</Text>
      <Text style={styles.intro}>Eksploro kategoritë dhe kërko ndihmë nga ekipi ynë në optikë.</Text>

      <View style={styles.feature}>
        <Text style={styles.featureIcon}>✦</Text>
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>Nuk je i sigurt çka të zgjedhësh?</Text>
          <Text style={styles.featureText}>Rezervo një konsultim dhe provo kornizat në optikë.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Kategoritë</Text>
      {KATEGORITE.map((kategoria) => (
        <Pressable
          key={kategoria.emri}
          style={styles.categoryCard}
          onPress={() => Alert.alert(kategoria.emri, 'Katalogu i produkteve po përgatitet.')}>
          <View style={[styles.categoryIcon, { backgroundColor: kategoria.ngjyra }]}>
            <Text style={styles.categoryGlyph}>{kategoria.ikona}</Text>
          </View>
          <View style={styles.categoryCopy}>
            <Text style={styles.categoryTitle}>{kategoria.emri}</Text>
            <Text style={styles.categoryDescription}>{kategoria.pershkrimi}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      <Text style={styles.note}>Fotot, modelet dhe çmimet do të shtohen pasi të zgjedhim optikën partnere.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f0' },
  content: { paddingHorizontal: 22, paddingTop: 64, paddingBottom: 36 },
  eyebrow: { color: '#718078', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#1d302b', fontSize: 30, fontWeight: '700', marginTop: 8 },
  intro: { color: '#718078', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 24 },
  feature: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#173d37', borderRadius: 18, padding: 17, marginBottom: 28 },
  featureIcon: { color: '#e5c58b', fontSize: 23, marginRight: 13 },
  featureCopy: { flex: 1 },
  featureTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  featureText: { color: '#d0ded7', fontSize: 11, lineHeight: 16, marginTop: 4 },
  sectionTitle: { color: '#1d302b', fontSize: 18, fontWeight: '700', marginBottom: 13 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 17, padding: 13, marginBottom: 11, borderWidth: 1, borderColor: '#e9e9e2' },
  categoryIcon: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryGlyph: { color: '#31594d', fontSize: 25 },
  categoryCopy: { flex: 1, marginLeft: 14 },
  categoryTitle: { color: '#253a34', fontSize: 14, fontWeight: '700' },
  categoryDescription: { color: '#7b8580', fontSize: 11, marginTop: 4 },
  chevron: { color: '#9aa49d', fontSize: 25, paddingHorizontal: 5 },
  note: { color: '#8b958f', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 15 },
});

import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BookingForm } from '@/components/booking-form';
import { supabase } from '@/utils/supabase';

type Kategoria = 'all' | 'frames' | 'sunglasses' | 'contact_lenses' | 'other';
type Produkt = {
  id: string;
  name: string;
  description: string | null;
  category: Exclude<Kategoria, 'all'>;
  price: number;
};

const KATEGORITE: { id: Kategoria; emri: string }[] = [
  { id: 'all', emri: 'Të gjitha' },
  { id: 'frames', emri: 'Korniza' },
  { id: 'sunglasses', emri: 'Syze dielli' },
  { id: 'contact_lenses', emri: 'Lente' },
  { id: 'other', emri: 'Të tjera' },
];

const IKONAT: Record<Exclude<Kategoria, 'all'>, string> = {
  frames: '◉',
  sunglasses: '☼',
  contact_lenses: '✳',
  other: '✦',
};

const EURO = new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR' });

export default function Katalogu() {
  const [produktet, setProduktet] = useState<Produkt[]>([]);
  const [kategoria, setKategoria] = useState<Kategoria>('all');
  const [kerkimi, setKerkimi] = useState('');
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [gabimi, setGabimi] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let aktiv = true;
    const ngarkoProduktet = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, category, price')
        .eq('active', true)
        .order('name');

      if (!aktiv) return;
      if (error) {
        setGabimi('Katalogu nuk u ngarkua. Kontrollo lidhjen me Supabase dhe tabelën products.');
      } else {
        setProduktet((data ?? []) as Produkt[]);
      }
      setDukeNgarkuar(false);
    };
    void ngarkoProduktet();
    return () => { aktiv = false; };
  }, []);

  const produktetEFiltruara = useMemo(() => {
    const term = kerkimi.trim().toLocaleLowerCase('sq-AL');
    return produktet.filter((produkt) => {
      const pershtatetKategoria = kategoria === 'all' || produkt.category === kategoria;
      const pershtatetTeksti = !term || `${produkt.name} ${produkt.description ?? ''}`
        .toLocaleLowerCase('sq-AL').includes(term);
      return pershtatetKategoria && pershtatetTeksti;
    });
  }, [produktet, kategoria, kerkimi]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>OPTIKA · KOLEKSIONI</Text>
      <Text style={styles.title}>Gjej stilin tënd.</Text>
      <Text style={styles.intro}>Shfleto produktet e optikës dhe kërko këshillë nga ekipi ynë.</Text>

      <Pressable accessibilityRole="button" onPress={() => setBookingOpen(true)} style={styles.feature}>
        <Text style={styles.featureIcon}>✦</Text>
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>Dëshiron ndihmë me zgjedhjen?</Text>
          <Text style={styles.featureText}>Kërko një konsultë në optikë.</Text>
        </View>
        <Text style={styles.featureArrow}>›</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Katalogu i produkteve</Text>
      <TextInput
        accessibilityLabel="Kërko produkte"
        value={kerkimi}
        onChangeText={setKerkimi}
        placeholder="Kërko sipas emrit ose përshkrimit"
        placeholderTextColor="#89948e"
        autoCorrect={false}
        style={styles.searchInput}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {KATEGORITE.map((opsion) => {
          const aktiv = kategoria === opsion.id;
          return (
            <Pressable
              key={opsion.id}
              accessibilityRole="button"
              accessibilityState={{ selected: aktiv }}
              onPress={() => setKategoria(opsion.id)}
              style={[styles.filterChip, aktiv && styles.filterChipActive]}>
              <Text style={[styles.filterText, aktiv && styles.filterTextActive]}>{opsion.emri}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {gabimi ? <Text accessibilityRole="alert" style={styles.error}>{gabimi}</Text> : null}
      {dukeNgarkuar ? (
        <ActivityIndicator color="#31594d" style={styles.loader} />
      ) : produktetEFiltruara.length ? (
        produktetEFiltruara.map((produkti) => (
          <View key={produkti.id} style={styles.productCard}>
            <View style={[styles.productIcon, produkti.category === 'sunglasses' && styles.productIconGold]}>
              <Text style={styles.productGlyph}>{IKONAT[produkti.category]}</Text>
            </View>
            <View style={styles.productCopy}>
              <Text style={styles.productName}>{produkti.name}</Text>
              <Text style={styles.productDescription}>{produkti.description || 'Pyet ekipin për më shumë hollësi.'}</Text>
              <Text style={styles.productPrice}>{EURO.format(Number(produkti.price))}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{gabimi ? 'Katalogu s’është i disponueshëm' : 'Nuk u gjetën produkte'}</Text>
          <Text style={styles.emptyText}>
            {gabimi ? 'Kontakto ekipin e optikës për ndihmë.' : 'Provo një kategori ose kërkim tjetër.'}
          </Text>
        </View>
      )}

      {bookingOpen && (
        <BookingForm
          visible={bookingOpen}
          defaultService="Konsultë për korniza"
          onClose={() => setBookingOpen(false)}
        />
      )}
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
  featureArrow: { color: '#e5c58b', fontSize: 25, marginLeft: 8 },
  sectionTitle: { color: '#1d302b', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  searchInput: { minHeight: 48, backgroundColor: '#fff', borderRadius: 13, borderWidth: 1, borderColor: '#e5e7df', paddingHorizontal: 14, color: '#253a34', fontSize: 13 },
  filterRow: { gap: 8, paddingVertical: 15 },
  filterChip: { borderRadius: 20, backgroundColor: '#e8ebe5', paddingHorizontal: 14, paddingVertical: 9 },
  filterChipActive: { backgroundColor: '#173d37' },
  filterText: { color: '#52635a', fontSize: 11, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 17, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e9e9e2' },
  productIcon: { width: 58, height: 58, borderRadius: 15, backgroundColor: '#e4eee6', alignItems: 'center', justifyContent: 'center' },
  productIconGold: { backgroundColor: '#f5eddf' },
  productGlyph: { color: '#31594d', fontSize: 25 },
  productCopy: { flex: 1, marginLeft: 14 },
  productName: { color: '#253a34', fontSize: 14, fontWeight: '700' },
  productDescription: { color: '#7b8580', fontSize: 11, lineHeight: 16, marginTop: 4 },
  productPrice: { color: '#31594d', fontSize: 13, fontWeight: '700', marginTop: 7 },
  loader: { marginVertical: 30 },
  error: { color: '#9f3333', backgroundColor: '#fff0ed', borderRadius: 12, padding: 13, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  emptyState: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 22, marginTop: 2 },
  emptyTitle: { color: '#253a34', fontSize: 14, fontWeight: '700' },
  emptyText: { color: '#7b8580', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
});

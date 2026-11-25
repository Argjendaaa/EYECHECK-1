import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BookingForm } from '@/components/booking-form';
import { supabase } from '@/utils/supabase';
import { useSesioni } from '@/utils/sesioni';

type Kategoria = 'all' | 'frames' | 'sunglasses' | 'contact_lenses' | 'other';
type Produkt = {
  id: string;
  name: string;
  description: string | null;
  category: Exclude<Kategoria, 'all'>;
  price: number;
  active: boolean;
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
  const { sesioni } = useSesioni();
  const [produktet, setProduktet] = useState<Produkt[]>([]);
  const [eshteStaf, setEshteStaf] = useState(false);
  const [roliNgarkuar, setRoliNgarkuar] = useState(false);
  const [kategoria, setKategoria] = useState<Kategoria>('all');
  const [kerkimi, setKerkimi] = useState('');
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [gabimi, setGabimi] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [produktNeEditim, setProduktNeEditim] = useState<Produkt | null>(null);
  const [emri, setEmri] = useState('');
  const [pershkrimi, setPershkrimi] = useState('');
  const [kategoriForm, setKategoriForm] = useState<Exclude<Kategoria, 'all'>>('frames');
  const [cmimi, setCmimi] = useState('');
  const [gabimiFormes, setGabimiFormes] = useState('');
  const [dukeRuajturProdukt, setDukeRuajturProdukt] = useState(false);
  const [produktNePerditesim, setProduktNePerditesim] = useState<string | null>(null);
  const [porosiaDukeUderguar, setPorosiaDukeUderguar] = useState<string | null>(null);
  const [porosiaSukses, setPorosiaSukses] = useState('');
  const [gabimiPorosise, setGabimiPorosise] = useState('');

  const kerkoProduktin = async (produkt: Produkt) => {
    setGabimiPorosise('');
    setPorosiaSukses('');
    setPorosiaDukeUderguar(produkt.id);
    try {
      const { error } = await supabase.rpc('create_product_order_request', {
        p_product_id: produkt.id,
      });
      if (error) {
        setGabimiPorosise('Porosia nuk u dërgua. Kontrollo që skedari optika_orders.sql është ekzekutuar në Supabase.');
      } else {
        setPorosiaSukses(produkt.name);
      }
    } catch {
      setGabimiPorosise('Porosia nuk u dërgua. Kontrollo që skedari optika_orders.sql është ekzekutuar në Supabase.');
    } finally {
      setPorosiaDukeUderguar(null);
    }
  };

  useEffect(() => {
    let aktiv = true;
    const ngarkoRolin = async () => {
      setRoliNgarkuar(false);
      if (!sesioni?.user.id) {
        setEshteStaf(false);
        setRoliNgarkuar(true);
        return;
      }
      const { data } = await supabase.from('profiles').select('role').eq('id', sesioni.user.id).maybeSingle();
      if (aktiv) {
        setEshteStaf(data?.role === 'staff' || data?.role === 'owner');
        setRoliNgarkuar(true);
      }
    };
    void ngarkoRolin();
    return () => { aktiv = false; };
  }, [sesioni?.user.id]);

  const ngarkoProduktet = useCallback(async () => {
    setDukeNgarkuar(true);
    setGabimi('');
    let query = supabase.from('products').select('id, name, description, category, price, active');
    if (!eshteStaf) query = query.eq('active', true);
    const { data, error } = await query.order('name');
    if (error) {
      setGabimi('Katalogu nuk u ngarkua. Kontrollo lidhjen me Supabase dhe tabelën products.');
    } else {
      setProduktet((data ?? []) as Produkt[]);
    }
    setDukeNgarkuar(false);
  }, [eshteStaf]);

  useEffect(() => {
    if (roliNgarkuar) void ngarkoProduktet();
  }, [roliNgarkuar, ngarkoProduktet]);

  const hapeFormen = (produkt?: Produkt) => {
    setProduktNeEditim(produkt ?? null);
    setEmri(produkt?.name ?? '');
    setPershkrimi(produkt?.description ?? '');
    setKategoriForm(produkt?.category ?? 'frames');
    setCmimi(produkt ? String(produkt.price) : '');
    setGabimiFormes('');
    setProductFormOpen(true);
  };

  const ruajProduktin = async () => {
    const cmimiNumerik = Number(cmimi.replace(',', '.'));
    if (!emri.trim() || !Number.isFinite(cmimiNumerik) || cmimiNumerik <= 0) {
      setGabimiFormes('Shkruaj emrin e produktit dhe një çmim më të madh se 0 € .');
      return;
    }
    setDukeRuajturProdukt(true);
    setGabimiFormes('');
    const teDhena = {
      name: emri.trim(),
      description: pershkrimi.trim() || null,
      category: kategoriForm,
      price: cmimiNumerik,
    };
    const { error } = produktNeEditim
      ? await supabase.from('products').update(teDhena).eq('id', produktNeEditim.id)
      : await supabase.from('products').insert(teDhena);
    if (error) {
      setGabimiFormes('Produkti nuk u ruajt. Kontrollo rolin staff/owner në Supabase.');
      setDukeRuajturProdukt(false);
      return;
    }
    setProductFormOpen(false);
    setDukeRuajturProdukt(false);
    await ngarkoProduktet();
  };

  const ndryshoAktivitetin = async (produkt: Produkt) => {
    setProduktNePerditesim(produkt.id);
    const { error } = await supabase.from('products').update({ active: !produkt.active }).eq('id', produkt.id);
    if (error) setGabimi('Statusi i produktit nuk u ndryshua. Kontrollo rolin staff/owner në Supabase.');
    else await ngarkoProduktet();
    setProduktNePerditesim(null);
  };

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

      <View style={styles.catalogHeader}>
        <Text style={styles.sectionTitle}>Katalogu i produkteve</Text>
        {eshteStaf ? (
          <Pressable accessibilityRole="button" onPress={() => hapeFormen()} style={styles.addProductButton}>
            <Text style={styles.addProductButtonText}>+ Shto produkt</Text>
          </Pressable>
        ) : null}
      </View>
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
      {gabimiPorosise ? <Text accessibilityRole="alert" style={styles.error}>{gabimiPorosise}</Text> : null}
      {porosiaSukses ? (
        <View accessibilityRole="alert" style={styles.successNotice}>
          <Text style={styles.successTitle}>Kërkesa u dërgua</Text>
          <Text style={styles.successText}>{porosiaSukses} · ekipi i optikës do të të kontaktojë për konfirmim.</Text>
        </View>
      ) : null}
      {!roliNgarkuar || dukeNgarkuar ? (
        <ActivityIndicator color="#31594d" style={styles.loader} />
      ) : produktetEFiltruara.length ? (
        produktetEFiltruara.map((produkti) => (
          <View key={produkti.id} style={styles.productCard}>
            <View style={[styles.productIcon, produkti.category === 'sunglasses' && styles.productIconGold]}>
              <Text style={styles.productGlyph}>{IKONAT[produkti.category]}</Text>
            </View>
            <View style={styles.productCopy}>
              <Text style={styles.productName}>{produkti.name}</Text>
              {eshteStaf && !produkti.active ? <Text style={styles.inactiveBadge}>I pauzuar · nuk shihet nga klientët</Text> : null}
              <Text style={styles.productDescription}>{produkti.description || 'Pyet ekipin për më shumë hollësi.'}</Text>
              <Text style={styles.productPrice}>{EURO.format(Number(produkti.price))}</Text>
              {eshteStaf ? (
                <View style={styles.staffProductActions}>
                  <Pressable accessibilityRole="button" onPress={() => hapeFormen(produkti)} style={styles.editProductButton}>
                    <Text style={styles.editProductButtonText}>Ndrysho</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={produktNePerditesim === produkti.id}
                    onPress={() => void ndryshoAktivitetin(produkti)}
                    style={[styles.editProductButton, produkti.active && styles.pauseProductButton]}>
                    <Text style={[styles.editProductButtonText, produkti.active && styles.pauseProductButtonText]}>
                      {produktNePerditesim === produkti.id ? 'Po ruhet…' : produkti.active ? 'Pauzo' : 'Aktivizo'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  disabled={Boolean(porosiaDukeUderguar)}
                  onPress={() => void kerkoProduktin(produkti)}
                  style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>
                    {porosiaDukeUderguar === produkti.id ? 'Po dërgohet…' : 'Kërko këtë produkt'}
                  </Text>
                </Pressable>
              )}
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

      <Modal
        visible={productFormOpen}
        transparent
        animationType="fade"
        onRequestClose={() => { if (!dukeRuajturProdukt) setProductFormOpen(false); }}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.productForm}>
              <View style={styles.productFormHeader}>
                <View style={styles.productFormCopy}>
                  <Text style={styles.eyebrow}>OPTIKA · KATALOGU</Text>
                  <Text style={styles.formTitle}>{produktNeEditim ? 'Ndrysho produktin' : 'Shto produkt'}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mbyll formularin"
                  disabled={dukeRuajturProdukt}
                  onPress={() => setProductFormOpen(false)}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <Text style={styles.formLabel}>Emri i produktit</Text>
              <TextInput value={emri} onChangeText={setEmri} placeholder="p.sh. Kornizë optike" style={styles.formInput} maxLength={100} />

              <Text style={styles.formLabel}>Kategoria</Text>
              <View style={styles.categoryOptions}>
                {KATEGORITE.filter((item) => item.id !== 'all').map((item) => {
                  const aktive = kategoriForm === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: aktive }}
                      onPress={() => setKategoriForm(item.id as Exclude<Kategoria, 'all'>)}
                      style={[styles.categoryOption, aktive && styles.categoryOptionActive]}>
                      <Text style={[styles.categoryOptionText, aktive && styles.categoryOptionTextActive]}>{item.emri}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.formLabel}>Çmimi (€)</Text>
              <TextInput
                value={cmimi}
                onChangeText={setCmimi}
                placeholder="p.sh. 49.90"
                keyboardType="decimal-pad"
                autoCapitalize="none"
                style={styles.formInput}
              />

              <Text style={styles.formLabel}>Përshkrimi (opsional)</Text>
              <TextInput
                value={pershkrimi}
                onChangeText={setPershkrimi}
                placeholder="Materiali, ngjyra ose hollësi të produktit"
                multiline
                maxLength={300}
                textAlignVertical="top"
                style={[styles.formInput, styles.descriptionInput]}
              />

              {gabimiFormes ? <Text accessibilityRole="alert" style={styles.formError}>{gabimiFormes}</Text> : null}
              <Pressable accessibilityRole="button" disabled={dukeRuajturProdukt} onPress={() => void ruajProduktin()} style={styles.saveProductButton}>
                {dukeRuajturProdukt ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveProductButtonText}>Ruaj produktin</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  catalogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addProductButton: { backgroundColor: '#173d37', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12 },
  addProductButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
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
  inactiveBadge: { color: '#8a6630', backgroundColor: '#f7edda', alignSelf: 'flex-start', overflow: 'hidden', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4, fontSize: 9, fontWeight: '700', marginTop: 5 },
  staffProductActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 9 },
  editProductButton: { alignSelf: 'flex-start', backgroundColor: '#e7eee8', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8 },
  editProductButtonText: { color: '#31594d', fontSize: 11, fontWeight: '700' },
  pauseProductButton: { backgroundColor: '#f7edda' },
  pauseProductButtonText: { color: '#8a6630' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(12, 27, 24, 0.58)' },
  modalContent: { flexGrow: 1, justifyContent: 'center', padding: 18 },
  productForm: { width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: '#fbfbf8', borderRadius: 22, padding: 22, borderWidth: 1, borderColor: '#e7e8df' },
  productFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  productFormCopy: { flex: 1 },
  formTitle: { color: '#1d302b', fontSize: 24, fontWeight: '700', marginTop: 5 },
  closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8ebe5', alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { color: '#31594d', fontSize: 26, lineHeight: 28 },
  formLabel: { color: '#30443b', fontSize: 12, fontWeight: '700', marginBottom: 7 },
  formInput: { minHeight: 46, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dfe3db', borderRadius: 11, paddingHorizontal: 12, color: '#253a34', fontSize: 13, marginBottom: 15 },
  descriptionInput: { minHeight: 76, paddingTop: 11 },
  categoryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 15 },
  categoryOption: { borderRadius: 10, backgroundColor: '#f0f1eb', paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: '#e4e7de' },
  categoryOptionActive: { backgroundColor: '#173d37', borderColor: '#173d37' },
  categoryOptionText: { color: '#52635a', fontSize: 10, fontWeight: '600' },
  categoryOptionTextActive: { color: '#fff' },
  formError: { color: '#9f3333', backgroundColor: '#fff0ed', borderRadius: 10, padding: 11, fontSize: 12, lineHeight: 17, marginBottom: 12 },
  saveProductButton: { minHeight: 47, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#173d37' },
  saveProductButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  orderButton: { alignSelf: 'flex-start', backgroundColor: '#173d37', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, marginTop: 9 },
  orderButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  successNotice: { backgroundColor: '#e4eee6', borderRadius: 13, padding: 13, marginBottom: 12 },
  successTitle: { color: '#26483d', fontSize: 13, fontWeight: '700' },
  successText: { color: '#61746a', fontSize: 11, lineHeight: 16, marginTop: 3 },
  loader: { marginVertical: 30 },
  error: { color: '#9f3333', backgroundColor: '#fff0ed', borderRadius: 12, padding: 13, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  emptyState: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 22, marginTop: 2 },
  emptyTitle: { color: '#253a34', fontSize: 14, fontWeight: '700' },
  emptyText: { color: '#7b8580', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
});

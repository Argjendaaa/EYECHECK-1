import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BookingForm } from '@/components/booking-form';

type Roli = 'klient' | 'staf';

const PRODUKTET = [
  { ikona: '◉', emri: 'Korniza optike', detaji: 'Për çdo ditë' },
  { ikona: '☼', emri: 'Syze dielli', detaji: 'Mbrojtje dhe stil' },
  { ikona: '✳', emri: 'Lente kontakti', detaji: 'Komoditet i lehtë' },
];

const TAKIMET = [
  { ora: '09:30', emri: 'Arta K.', sherbimi: 'Kontroll i syve', statusi: 'Në pritje' },
  { ora: '10:15', emri: 'Luan M.', sherbimi: 'Marrje e syzeve', statusi: 'Konfirmuar' },
  { ora: '11:00', emri: 'Elira B.', sherbimi: 'Konsultim për korniza', statusi: 'Konfirmuar' },
];

export default function Index() {
  const [roli, setRoli] = useState<Roli>('klient');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState('Vizitë në optikë');

  const openBooking = (service = 'Vizitë në optikë') => {
    setBookingService(service);
    setBookingOpen(true);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>OPTIKA</Text>
          <Text style={styles.headerCaption}>Kujdes për shikimin, në një vend.</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>O</Text></View>
      </View>

      <View style={styles.roleSwitch}>
        <RoleButton label="Klient" active={roli === 'klient'} onPress={() => setRoli('klient')} />
        <RoleButton label="Staf" active={roli === 'staf'} onPress={() => setRoli('staf')} />
      </View>

      {roli === 'klient' ? <PamjaKlient onRezervo={openBooking} /> : <PamjaStaf />}

      <Text style={styles.footer}>Optika · Shërbim i thjeshtë, kujdes personal</Text>

      {bookingOpen && (
        <BookingForm
          visible={bookingOpen}
          defaultService={bookingService}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </ScrollView>
  );
}

function RoleButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.roleButton, active && styles.roleButtonActive]}>
      <Text style={[styles.roleText, active && styles.roleTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PamjaKlient({ onRezervo }: { onRezervo: (service?: string) => void }) {
  return (
    <>
      <Text style={styles.greeting}>Përshëndetje 👋</Text>
      <Text style={styles.pageTitle}>Gjej kujdesin e duhur për sytë.</Text>

      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <Text style={styles.heroEyebrow}>PLANIFIKO VIZITËN</Text>
        <Text style={styles.heroTitle}>Rezervo një termin</Text>
        <Text style={styles.heroBody}>
          Zgjidh shërbimin, datën dhe orën. Optika do ta konfirmojë kërkesën.
        </Text>
        <ActionButton
          label="Kërko termin"
          onPress={() => onRezervo()}
        />
      </View>

      <SectionHeading title="Shërbimet tona" />
      <View style={styles.serviceRow}>
        <ServiceCard
          icon="◉"
          title="Vizitë në optikë"
          detail="Zgjidh kohën e vizitës"
          onPress={() => onRezervo('Vizitë në optikë')}
        />
        <ServiceCard
          icon="⌕"
          title="Konsultë për korniza"
          detail="Gjej stilin që të përshtatet"
          onPress={() => onRezervo('Konsultë për korniza')}
        />
      </View>

      <SectionHeading title="Koleksioni" />
      {PRODUKTET.map((produkti, index) => (
        <View
          key={produkti.emri}
          style={styles.productRow}
        >
          <View style={[styles.productIcon, index === 1 && styles.productIconGold]}>
            <Text style={styles.productGlyph}>{produkti.ikona}</Text>
          </View>
          <View style={styles.productCopy}>
            <Text style={styles.productName}>{produkti.emri}</Text>
            <Text style={styles.productDetail}>{produkti.detaji}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      ))}
    </>
  );
}

function PamjaStaf() {
  return (
    <>
      <Text style={styles.greeting}>Mirëmëngjes 👋</Text>
      <Text style={styles.pageTitle}>Përmbledhja e ditës</Text>
      <Text style={styles.sampleNote}>Pamje demonstrimi · të dhëna shembull</Text>

      <View style={styles.statsRow}>
        <StatCard value="08" label="Termine sot" />
        <StatCard value="03" label="Në pritje" />
        <StatCard value="12" label="Porosi aktive" />
      </View>

      <View style={styles.staffBanner}>
        <Text style={styles.bannerIcon}>✦</Text>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Gati për ditën</Text>
          <Text style={styles.bannerDetail}>Orari dhe porositë, të gjitha në një vend.</Text>
        </View>
      </View>

      <SectionHeading title="Terminet e radhës" />
      {TAKIMET.map((takimi) => (
        <Pressable
          key={takimi.ora}
          style={styles.appointmentCard}
          onPress={() => Alert.alert(takimi.emri, 'Detajet e klientit do të shfaqen këtu.')}>
          <View style={styles.timeBlock}><Text style={styles.timeText}>{takimi.ora}</Text></View>
          <View style={styles.appointmentCopy}>
            <Text style={styles.customerName}>{takimi.emri}</Text>
            <Text style={styles.appointmentService}>{takimi.sherbimi}</Text>
          </View>
          <View style={[styles.statusPill, takimi.statusi === 'Në pritje' && styles.statusPending]}>
            <Text style={[styles.statusText, takimi.statusi === 'Në pritje' && styles.statusPendingText]}>
              {takimi.statusi}
            </Text>
          </View>
        </Pressable>
      ))}

      <Pressable
        style={styles.secondaryAction}
        onPress={() => Alert.alert('Menaxhimi i porosive', 'Porositë aktive do të hapen këtu.')}>
        <Text style={styles.secondaryActionText}>Menaxho porositë e syzeve</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </>
  );
}

function ServiceCard({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.serviceCard}
      accessibilityRole="button"
      onPress={onPress}>
      <Text style={styles.serviceIcon}>{icon}</Text>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDetail}>{detail}</Text>
    </Pressable>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionButtonText}>{label}</Text>
      <Text style={styles.actionArrow}>↗</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f0' },
  content: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  brand: { color: '#173d37', fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  headerCaption: { color: '#66746f', fontSize: 12, marginTop: 4 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e0e9e3', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#173d37', fontSize: 16, fontWeight: '700' },
  roleSwitch: { flexDirection: 'row', padding: 4, backgroundColor: '#e8ebe5', borderRadius: 14, marginBottom: 24 },
  roleButton: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 11 },
  roleButtonActive: { backgroundColor: '#173d37' },
  roleText: { color: '#64716b', fontSize: 14, fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  greeting: { color: '#738078', fontSize: 14, marginBottom: 6 },
  pageTitle: { color: '#1d302b', fontSize: 26, lineHeight: 32, fontWeight: '700', marginBottom: 20 },
  sampleNote: { color: '#8b958f', fontSize: 11, marginTop: -14, marginBottom: 16 },
  hero: { overflow: 'hidden', backgroundColor: '#173d37', borderRadius: 22, padding: 22, marginBottom: 26 },
  heroOrb: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#24574c', right: -55, top: -70 },
  heroEyebrow: { color: '#b9d2c1', fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  heroTitle: { color: '#fff', fontSize: 23, fontWeight: '700', marginTop: 12 },
  heroBody: { color: '#d0ded7', fontSize: 14, lineHeight: 20, marginTop: 7, marginBottom: 18, maxWidth: 250 },
  actionButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: '#e5c58b', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  actionButtonText: { color: '#1d302b', fontSize: 13, fontWeight: '700' },
  actionArrow: { color: '#1d302b', fontWeight: '700', fontSize: 15 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 2 },
  sectionTitle: { color: '#1d302b', fontSize: 17, fontWeight: '700' },
  sectionAction: { color: '#54756b', fontSize: 12, fontWeight: '600' },
  serviceRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  serviceCard: { flex: 1, backgroundColor: '#fff', borderRadius: 17, padding: 16, borderWidth: 1, borderColor: '#e9e9e2' },
  serviceIcon: { color: '#aa8650', fontSize: 24, marginBottom: 15 },
  serviceTitle: { color: '#253a34', fontSize: 14, fontWeight: '700' },
  serviceDetail: { color: '#7b8580', fontSize: 11, marginTop: 4 },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, padding: 12, marginBottom: 9, borderWidth: 1, borderColor: '#e9e9e2' },
  productIcon: { width: 50, height: 50, borderRadius: 13, backgroundColor: '#edf1eb', alignItems: 'center', justifyContent: 'center' },
  productIconGold: { backgroundColor: '#f4eddf' },
  productGlyph: { color: '#375d51', fontSize: 23 },
  productCopy: { flex: 1, marginLeft: 13 },
  productName: { color: '#253a34', fontSize: 14, fontWeight: '700' },
  productDetail: { color: '#7b8580', fontSize: 12, marginTop: 3 },
  chevron: { color: '#9aa49d', fontSize: 25, paddingHorizontal: 5 },
  statsRow: { flexDirection: 'row', gap: 9, marginBottom: 17 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 10, borderWidth: 1, borderColor: '#e9e9e2' },
  statValue: { color: '#173d37', fontSize: 23, fontWeight: '700' },
  statLabel: { color: '#77827c', fontSize: 10, lineHeight: 14, marginTop: 5 },
  staffBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e5eee7', borderRadius: 16, padding: 15, marginBottom: 25 },
  bannerIcon: { color: '#a68148', fontSize: 23, marginRight: 12 },
  bannerCopy: { flex: 1 },
  bannerTitle: { color: '#26483d', fontSize: 13, fontWeight: '700' },
  bannerDetail: { color: '#61746a', fontSize: 11, marginTop: 3 },
  appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, padding: 12, marginBottom: 9, borderWidth: 1, borderColor: '#e9e9e2' },
  timeBlock: { backgroundColor: '#edf1eb', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 8 },
  timeText: { color: '#31594d', fontSize: 12, fontWeight: '700' },
  appointmentCopy: { flex: 1, marginLeft: 11 },
  customerName: { color: '#253a34', fontSize: 13, fontWeight: '700' },
  appointmentService: { color: '#7b8580', fontSize: 11, marginTop: 4 },
  statusPill: { backgroundColor: '#e5eee7', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  statusText: { color: '#406957', fontSize: 9, fontWeight: '700' },
  statusPending: { backgroundColor: '#f7edda' },
  statusPendingText: { color: '#9b7132' },
  secondaryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 15, paddingVertical: 14, paddingHorizontal: 16, marginTop: 8, borderWidth: 1, borderColor: '#e9e9e2' },
  secondaryActionText: { color: '#31594d', fontSize: 13, fontWeight: '700' },
  footer: { color: '#9aa49d', fontSize: 11, textAlign: 'center', marginTop: 26 },
});

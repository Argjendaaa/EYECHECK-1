import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BookingForm } from '@/components/booking-form';
import { StoreInfoCard } from '@/components/store-info-card';
import { supabase } from '@/utils/supabase';
import { useSesioni } from '@/utils/sesioni';

type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';
type Appointment = {
  id: string;
  service: string;
  requested_at: string;
  status: AppointmentStatus;
};
type OrderStatus = 'received' | 'in_preparation' | 'ready' | 'completed' | 'cancelled';
type CustomerOrder = {
  id: string;
  status: OrderStatus;
  created_at: string;
  order_items: { product_name: string; quantity: number; unit_price: number }[];
};

const PRODUKTET = [
  { ikona: '◉', emri: 'Korniza optike', detaji: 'Për çdo ditë' },
  { ikona: '☼', emri: 'Syze dielli', detaji: 'Mbrojtje dhe stil' },
  { ikona: '✳', emri: 'Lente kontakti', detaji: 'Komoditet i lehtë' },
];

export default function Index() {
  const { sesioni } = useSesioni();
  const [roli, setRoli] = useState<'customer' | 'staff'>('customer');
  const [dukeNgarkuarRolin, setDukeNgarkuarRolin] = useState(true);
  const [terminet, setTerminet] = useState<Appointment[]>([]);
  const [dukeNgarkuarTerminet, setDukeNgarkuarTerminet] = useState(false);
  const [gabimiTermineve, setGabimiTermineve] = useState('');
  const [terminiNePerditesim, setTerminiNePerditesim] = useState<string | null>(null);
  const [porosite, setPorosite] = useState<CustomerOrder[]>([]);
  const [dukeNgarkuarPorosite, setDukeNgarkuarPorosite] = useState(false);
  const [gabimiPorosive, setGabimiPorosive] = useState('');
  const [porosiaNePerditesim, setPorosiaNePerditesim] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState('Vizitë në optikë');

  useEffect(() => {
    let aktiv = true;
    const ngarkoRolin = async () => {
      if (!sesioni?.user.id) {
        if (aktiv) setDukeNgarkuarRolin(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sesioni.user.id)
        .maybeSingle();
      if (aktiv) {
        setRoli(data?.role === 'staff' || data?.role === 'owner' ? 'staff' : 'customer');
        setDukeNgarkuarRolin(false);
      }
    };
    setDukeNgarkuarRolin(true);
    void ngarkoRolin();
    return () => { aktiv = false; };
  }, [sesioni?.user.id]);

  const ngarkoTerminet = useCallback(async () => {
    setDukeNgarkuarTerminet(true);
    setGabimiTermineve('');
    const { data, error } = await supabase
      .from('appointments')
      .select('id, service, requested_at, status')
      .or(`status.eq.requested,requested_at.gte.${new Date().toISOString()}`)
      .order('requested_at', { ascending: true })
      .limit(30);
    if (error) {
      setGabimiTermineve('Terminet nuk u ngarkuan. Kontrollo lidhjen dhe konfigurimin e bazës së të dhënave.');
    } else {
      setTerminet((data ?? []) as Appointment[]);
    }
    setDukeNgarkuarTerminet(false);
  }, []);

  const ngarkoPorosite = useCallback(async () => {
    setDukeNgarkuarPorosite(true);
    setGabimiPorosive('');
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, created_at, order_items(product_name, quantity, unit_price)')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) {
      setGabimiPorosive('Porositë nuk u ngarkuan. Kontrollo lidhjen me Supabase.');
    } else {
      setPorosite((data ?? []) as CustomerOrder[]);
    }
    setDukeNgarkuarPorosite(false);
  }, []);

  useEffect(() => {
    if (!dukeNgarkuarRolin) {
      void ngarkoTerminet();
      void ngarkoPorosite();
    }
  }, [dukeNgarkuarRolin, ngarkoPorosite, ngarkoTerminet, roli]);

  const perditesoStatusin = async (id: string, status: 'confirmed' | 'cancelled') => {
    setTerminiNePerditesim(id);
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) {
      setGabimiTermineve('Statusi nuk u ruajt. Kontrollo që llogaria ka rolin e stafit në Supabase.');
    } else {
      setTerminet((aktualet) => aktualet.map((termini) => termini.id === id ? { ...termini, status } : termini));
    }
    setTerminiNePerditesim(null);
  };

  const perditesoPorosine = async (id: string, status: OrderStatus) => {
    setPorosiaNePerditesim(id);
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      setGabimiPorosive('Statusi i porosisë nuk u ruajt. Kontrollo rolin e stafit në Supabase.');
    } else {
      setPorosite((aktualet) => aktualet.map((porosia) => porosia.id === id ? { ...porosia, status } : porosia));
    }
    setPorosiaNePerditesim(null);
  };

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

      {dukeNgarkuarRolin ? (
        <View style={styles.loadingPanel}><ActivityIndicator color="#31594d" /><Text style={styles.loadingText}>Po përgatitet profili…</Text></View>
      ) : roli === 'customer' ? (
        <PamjaKlient
          onRezervo={openBooking}
          terminet={terminet}
          dukeNgarkuar={dukeNgarkuarTerminet}
          gabimi={gabimiTermineve}
          porosite={porosite}
          dukeNgarkuarPorosite={dukeNgarkuarPorosite}
          gabimiPorosive={gabimiPorosive}
        />
      ) : (
        <PamjaStaf
          terminet={terminet}
          dukeNgarkuar={dukeNgarkuarTerminet}
          terminiNePerditesim={terminiNePerditesim}
          gabimi={gabimiTermineve}
          neNgarko={ngarkoTerminet}
          nePerditeso={perditesoStatusin}
          porosite={porosite}
          dukeNgarkuarPorosite={dukeNgarkuarPorosite}
          gabimiPorosive={gabimiPorosive}
          porosiaNePerditesim={porosiaNePerditesim}
          neNgarkoPorosite={ngarkoPorosite}
          nePerditesoPorosine={perditesoPorosine}
        />
      )}

      <StoreInfoCard />
      <Text style={styles.footer}>Optika · Shërbim i thjeshtë, kujdes personal</Text>

      {bookingOpen && (
        <BookingForm
          visible={bookingOpen}
          defaultService={bookingService}
          onClose={() => {
            setBookingOpen(false);
            void ngarkoTerminet();
            void ngarkoPorosite();
          }}
        />
      )}
    </ScrollView>
  );
}

function PamjaKlient({
  onRezervo,
  terminet,
  dukeNgarkuar,
  gabimi,
  porosite,
  dukeNgarkuarPorosite,
  gabimiPorosive,
}: {
  onRezervo: (service?: string) => void;
  terminet: Appointment[];
  dukeNgarkuar: boolean;
  gabimi: string;
  porosite: CustomerOrder[];
  dukeNgarkuarPorosite: boolean;
  gabimiPorosive: string;
}) {
  const terminetAktive = terminet.filter((termini) => termini.status !== 'cancelled');
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

      <SectionHeading title="Terminet e mia" />
      {gabimi ? (
        <Text accessibilityRole="alert" style={styles.errorText}>{gabimi}</Text>
      ) : dukeNgarkuar ? (
        <ActivityIndicator color="#31594d" style={styles.inlineLoader} />
      ) : terminetAktive.length ? (
        terminetAktive.slice(0, 3).map((termini) => <AppointmentCard key={termini.id} appointment={termini} />)
      ) : (
        <Text style={styles.emptyText}>Ende nuk ke termine. Kërko termin për të planifikuar vizitën.</Text>
      )}

      <SectionHeading title="Porositë e mia" />
      {gabimiPorosive ? (
        <Text accessibilityRole="alert" style={styles.errorText}>{gabimiPorosive}</Text>
      ) : dukeNgarkuarPorosite ? (
        <ActivityIndicator color="#31594d" style={styles.inlineLoader} />
      ) : porosite.length ? (
        porosite.slice(0, 3).map((porosia) => <OrderCard key={porosia.id} order={porosia} />)
      ) : (
        <Text style={styles.emptyText}>Porositë që kërkon nga katalogu do të shfaqen këtu.</Text>
      )}

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

function PamjaStaf({
  terminet,
  dukeNgarkuar,
  terminiNePerditesim,
  gabimi,
  neNgarko,
  nePerditeso,
  porosite,
  dukeNgarkuarPorosite,
  gabimiPorosive,
  porosiaNePerditesim,
  neNgarkoPorosite,
  nePerditesoPorosine,
}: {
  terminet: Appointment[];
  dukeNgarkuar: boolean;
  terminiNePerditesim: string | null;
  gabimi: string;
  neNgarko: () => Promise<void>;
  nePerditeso: (id: string, status: 'confirmed' | 'cancelled') => Promise<void>;
  porosite: CustomerOrder[];
  dukeNgarkuarPorosite: boolean;
  gabimiPorosive: string;
  porosiaNePerditesim: string | null;
  neNgarkoPorosite: () => Promise<void>;
  nePerditesoPorosine: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const nePritje = terminet.filter((termini) => termini.status === 'requested');
  const sot = new Date().toDateString();
  const terminetSot = terminet.filter((termini) => new Date(termini.requested_at).toDateString() === sot);
  return (
    <>
      <Text style={styles.greeting}>Mirëmëngjes 👋</Text>
      <Text style={styles.pageTitle}>Përmbledhja e ditës</Text>

      <View style={styles.statsRow}>
        <StatCard value={String(terminetSot.length).padStart(2, '0')} label="Termine sot" />
        <StatCard value={String(nePritje.length).padStart(2, '0')} label="Në pritje" />
        <StatCard value={String(porosite.filter((porosia) => !['completed', 'cancelled'].includes(porosia.status)).length).padStart(2, '0')} label="Porosi aktive" />
      </View>

      <View style={styles.staffBanner}>
        <Text style={styles.bannerIcon}>✦</Text>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Gati për ditën</Text>
          <Text style={styles.bannerDetail}>Shqyrto kërkesat e termineve dhe konfirmo orarin.</Text>
        </View>
      </View>

      <View style={styles.staffSectionHeading}>
        <SectionHeading title="Kërkesat për termine" />
        <Pressable accessibilityRole="button" disabled={dukeNgarkuar} onPress={() => void neNgarko()}>
          <Text style={styles.refreshText}>{dukeNgarkuar ? 'Po ngarkohen…' : 'Rifresko'}</Text>
        </Pressable>
      </View>
      {gabimi ? <Text accessibilityRole="alert" style={styles.errorText}>{gabimi}</Text> : null}
      {dukeNgarkuar ? (
        <ActivityIndicator color="#31594d" style={styles.inlineLoader} />
      ) : terminet.length ? (
        terminet.map((termini) => (
          <View key={termini.id} style={styles.staffAppointmentWrap}>
            <AppointmentCard appointment={termini} />
            {termini.status === 'requested' ? (
              <View style={styles.appointmentActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={terminiNePerditesim === termini.id}
                  onPress={() => void nePerditeso(termini.id, 'confirmed')}
                  style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>{terminiNePerditesim === termini.id ? 'Po ruhet…' : 'Konfirmo'}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={terminiNePerditesim === termini.id}
                  onPress={() => void nePerditeso(termini.id, 'cancelled')}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Anulo</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nuk ka kërkesa për termine për momentin.</Text>
      )}

      <View style={styles.staffSectionHeading}>
        <SectionHeading title="Porositë e produkteve" />
        <Pressable accessibilityRole="button" disabled={dukeNgarkuarPorosite} onPress={() => void neNgarkoPorosite()}>
          <Text style={styles.refreshText}>{dukeNgarkuarPorosite ? 'Po ngarkohen…' : 'Rifresko'}</Text>
        </Pressable>
      </View>
      {gabimiPorosive ? <Text accessibilityRole="alert" style={styles.errorText}>{gabimiPorosive}</Text> : null}
      {dukeNgarkuarPorosite ? (
        <ActivityIndicator color="#31594d" style={styles.inlineLoader} />
      ) : porosite.length ? (
        porosite.map((porosia) => (
          <View key={porosia.id} style={styles.staffAppointmentWrap}>
            <OrderCard order={porosia} />
            {porosia.status !== 'completed' && porosia.status !== 'cancelled' ? (
              <View style={styles.appointmentActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={porosiaNePerditesim === porosia.id}
                  onPress={() => void nePerditesoPorosine(porosia.id, nextOrderStatus(porosia.status))}
                  style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>
                    {porosiaNePerditesim === porosia.id ? 'Po ruhet…' : orderAction(porosia.status)}
                  </Text>
                </Pressable>
                {porosia.status === 'received' ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={porosiaNePerditesim === porosia.id}
                    onPress={() => void nePerditesoPorosine(porosia.id, 'cancelled')}
                    style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Anulo</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nuk ka porosi për momentin.</Text>
      )}
    </>
  );
}

function nextOrderStatus(status: OrderStatus): OrderStatus {
  if (status === 'received') return 'in_preparation';
  if (status === 'in_preparation') return 'ready';
  return 'completed';
}

function orderAction(status: OrderStatus) {
  if (status === 'received') return 'Nise përgatitjen';
  if (status === 'in_preparation') return 'Shëno gati';
  return 'Përfundo porosinë';
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const statusLabels: Record<OrderStatus, string> = {
    received: 'Pranuar',
    in_preparation: 'Në përgatitje',
    ready: 'Gati për marrje',
    completed: 'Përfunduar',
    cancelled: 'Anuluar',
  };
  const productSummary = order.order_items?.map((item) => `${item.product_name} × ${item.quantity}`).join(', ') || 'Produkt';
  const total = order.order_items?.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0) ?? 0;
  const date = new Date(order.created_at).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' });
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{date}</Text>
        <Text style={styles.orderStatus}>{statusLabels[order.status]}</Text>
      </View>
      <Text style={styles.orderProducts}>{productSummary}</Text>
      <Text style={styles.orderTotal}>Vlera e produkteve: {new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR' }).format(total)}</Text>
    </View>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.requested_at);
  const dateLabel = date.toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' });
  const timeLabel = date.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
  const statusLabel: Record<AppointmentStatus, string> = {
    requested: 'Në pritje',
    confirmed: 'Konfirmuar',
    completed: 'Përfunduar',
    cancelled: 'Anuluar',
  };
  const isPending = appointment.status === 'requested';
  return (
    <View style={styles.appointmentCard}>
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{timeLabel}</Text>
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>
      <View style={styles.appointmentCopy}>
        <Text style={styles.customerName}>{appointment.service}</Text>
        <Text style={styles.appointmentService}>Termin në optikë</Text>
      </View>
      <View style={[styles.statusPill, isPending && styles.statusPending]}>
        <Text style={[styles.statusText, isPending && styles.statusPendingText]}>{statusLabel[appointment.status]}</Text>
      </View>
    </View>
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
  greeting: { color: '#738078', fontSize: 14, marginBottom: 6 },
  pageTitle: { color: '#1d302b', fontSize: 26, lineHeight: 32, fontWeight: '700', marginBottom: 20 },
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
  loadingPanel: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#718078', fontSize: 13 },
  inlineLoader: { marginVertical: 20 },
  emptyText: { color: '#718078', backgroundColor: '#fff', borderRadius: 14, padding: 16, fontSize: 13, lineHeight: 19, marginBottom: 18 },
  errorText: { color: '#9f3333', backgroundColor: '#fff0ed', borderRadius: 12, padding: 13, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  staffSectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refreshText: { color: '#31594d', fontSize: 12, fontWeight: '700', padding: 8 },
  staffAppointmentWrap: { marginBottom: 8 },
  appointmentActions: { flexDirection: 'row', gap: 9, marginTop: -3, marginBottom: 9 },
  confirmButton: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#173d37' },
  confirmButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cancelButton: { minWidth: 88, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff0ed' },
  cancelButtonText: { color: '#9f3333', fontSize: 12, fontWeight: '700' },
  dateText: { color: '#718078', fontSize: 10, marginTop: 3, textAlign: 'center' },
  orderCard: { backgroundColor: '#fff', borderRadius: 15, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e9e9e2' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { color: '#718078', fontSize: 11 },
  orderStatus: { color: '#31594d', backgroundColor: '#e5eee7', overflow: 'hidden', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '700' },
  orderProducts: { color: '#253a34', fontSize: 13, fontWeight: '700', marginTop: 10 },
  orderTotal: { color: '#718078', fontSize: 11, marginTop: 5 },
  footer: { color: '#9aa49d', fontSize: 11, textAlign: 'center', marginTop: 26 },
});

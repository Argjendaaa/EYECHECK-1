import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase, supabaseIsConfigured } from '@/utils/supabase';

const SHERBIMET = [
  'Vizitë në optikë',
  'Konsultë për korniza',
  'Rregullim i syzeve',
  'Marrje e porosisë',
];

function dataNeser() {
  const data = new Date();
  data.setDate(data.getDate() + 1);
  const viti = data.getFullYear();
  const muaji = String(data.getMonth() + 1).padStart(2, '0');
  const dita = String(data.getDate()).padStart(2, '0');
  return `${viti}-${muaji}-${dita}`;
}

function krijoKohen(data: string, ora: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(ora)) {
    return null;
  }

  const [viti, muaji, dita] = data.split('-').map(Number);
  const [oret, minutat] = ora.split(':').map(Number);
  if (oret > 23 || minutat > 59) return null;

  const koha = new Date(viti, muaji - 1, dita, oret, minutat);
  const eshteDateValide =
    koha.getFullYear() === viti &&
    koha.getMonth() === muaji - 1 &&
    koha.getDate() === dita;

  const diteEHapur = koha.getDay() !== 0;
  const oreBrendaOrarit = oret >= 10 && oret < 18;
  if (!eshteDateValide || !diteEHapur || !oreBrendaOrarit || koha.getTime() <= Date.now()) return null;
  return koha;
}

type BookingFormProps = {
  visible: boolean;
  defaultService: string;
  onClose: () => void;
};

export function BookingForm({ visible, defaultService, onClose }: BookingFormProps) {
  const [sherbimi, setSherbimi] = useState(defaultService);
  const [data, setData] = useState(dataNeser);
  const [ora, setOra] = useState('10:00');
  const [shenimi, setShenimi] = useState('');
  const [gabimi, setGabimi] = useState('');
  const [dukeRuajtur, setDukeRuajtur] = useState(false);
  const [uDergua, setUDergua] = useState(false);

  const dergoKerkesen = async () => {
    setGabimi('');

    if (!supabaseIsConfigured) {
      setGabimi('Lidhja me Supabase nuk është konfiguruar. Kontrollo skedarin .env.local.');
      return;
    }

    const koha = krijoKohen(data.trim(), ora.trim());
    if (!koha) {
      setGabimi('Zgjidh një datë nga e hëna në të shtunë dhe orë 10:00–17:59, në të ardhmen.');
      return;
    }

    setDukeRuajtur(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        service: sherbimi,
        requested_at: koha.toISOString(),
        customer_note: shenimi.trim() || null,
      });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          setGabimi('Tabela e termineve mungon. Ekzekuto njëherë eyecheck/supabase/optika_schema.sql në Supabase SQL Editor.');
        } else if (error.code === '42501') {
          setGabimi('Nuk ke qasje për këtë veprim. Kontrollo që je i kyçur në llogari.');
        } else {
          setGabimi('Kërkesa nuk u dërgua. Provo përsëri pas pak.');
        }
        return;
      }

      setUDergua(true);
    } catch {
      setGabimi('Nuk u lidhëm me serverin. Kontrollo internetin dhe provo përsëri.');
    } finally {
      setDukeRuajtur(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.overlayContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>OPTIKA · TERMINET</Text>
                <Text style={styles.title}>{uDergua ? 'Kërkesa u dërgua' : 'Kërko termin'}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mbyll formularin"
                disabled={dukeRuajtur}
                onPress={onClose}
                style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {uDergua ? (
              <View style={styles.successPanel}>
                <Text style={styles.successMark}>✓</Text>
                <Text style={styles.successTitle}>Faleminderit</Text>
                <Text style={styles.successText}>
                  Kërkesa jote është në pritje. Ekipi i optikës do ta konfirmojë termin.
                </Text>
                <Pressable accessibilityRole="button" onPress={onClose} style={styles.submitButton}>
                  <Text style={styles.submitText}>U krye</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.intro}>
                  Dërgo kërkesën tënde. Termini bëhet i konfirmuar pasi ta shqyrtojë ekipi.
                </Text>

                <Text style={styles.label}>Shërbimi</Text>
                <View style={styles.serviceGrid}>
                  {SHERBIMET.map((opsion) => {
                    const aktiv = sherbimi === opsion;
                    return (
                      <Pressable
                        key={opsion}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: aktiv }}
                        onPress={() => setSherbimi(opsion)}
                        style={[styles.serviceChoice, aktiv && styles.serviceChoiceActive]}>
                        <Text style={[styles.serviceChoiceText, aktiv && styles.serviceChoiceTextActive]}>
                          {opsion}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeField}>
                    <Text style={styles.label}>Data</Text>
                    <TextInput
                      accessibilityLabel="Data e terminit"
                      value={data}
                      onChangeText={setData}
                      placeholder="YYYY-MM-DD"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={10}
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.dateTimeField}>
                    <Text style={styles.label}>Ora</Text>
                    <TextInput
                      accessibilityLabel="Ora e terminit"
                      value={ora}
                      onChangeText={setOra}
                      placeholder="HH:MM"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={5}
                      style={styles.input}
                    />
                  </View>
                </View>

                <Text style={styles.label}>Shënim për vizitën (opsional)</Text>
                <TextInput
                  accessibilityLabel="Shënim opsional për vizitën"
                  value={shenimi}
                  onChangeText={setShenimi}
                  placeholder="P.sh. preferenca për orarin"
                  multiline
                  maxLength={300}
                  textAlignVertical="top"
                  style={[styles.input, styles.noteInput]}
                />
                <Text style={styles.privacyNote}>
                  Mos shkruaj këtu receta ose të dhëna të ndjeshme shëndetësore.
                </Text>

                {gabimi ? <Text accessibilityRole="alert" style={styles.error}>{gabimi}</Text> : null}

                <Pressable
                  accessibilityRole="button"
                  disabled={dukeRuajtur}
                  onPress={dergoKerkesen}
                  style={[styles.submitButton, dukeRuajtur && styles.submitButtonDisabled]}>
                  {dukeRuajtur ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Dërgo kërkesën</Text>
                  )}
                </Pressable>
                <Text style={styles.disclaimer}>Optika do të të kontaktojë për konfirmim.</Text>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 27, 24, 0.58)',
  },
  overlayContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#fbfbf8',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e7e8df',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCopy: { flex: 1 },
  eyebrow: { color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  title: { color: '#1d302b', fontSize: 25, lineHeight: 31, fontWeight: '700', marginTop: 5 },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e8ebe5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#31594d', fontSize: 28, lineHeight: 30 },
  intro: { color: '#68776f', fontSize: 13, lineHeight: 19, marginBottom: 21 },
  label: { color: '#30443b', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  serviceChoice: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: '#f0f1eb',
    borderWidth: 1,
    borderColor: '#e4e7de',
  },
  serviceChoiceActive: { backgroundColor: '#173d37', borderColor: '#173d37' },
  serviceChoiceText: { color: '#52635a', fontSize: 12, fontWeight: '600' },
  serviceChoiceTextActive: { color: '#fff' },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateTimeField: { flex: 1 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#dfe3db',
    backgroundColor: '#fff',
    color: '#253a34',
    fontSize: 14,
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 17,
  },
  noteInput: { minHeight: 78, paddingTop: 12 },
  privacyNote: { color: '#7d8982', fontSize: 11, lineHeight: 16, marginTop: -10, marginBottom: 18 },
  error: {
    color: '#a43232',
    backgroundColor: '#fff0ed',
    borderRadius: 10,
    padding: 11,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  submitButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#173d37',
    borderRadius: 13,
    paddingHorizontal: 18,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disclaimer: { color: '#87928c', fontSize: 11, textAlign: 'center', marginTop: 12 },
  successPanel: { alignItems: 'center', paddingTop: 13, paddingBottom: 4 },
  successMark: {
    width: 52,
    height: 52,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 26,
    backgroundColor: '#e4eee6',
    color: '#31594d',
    fontSize: 27,
    lineHeight: 52,
    fontWeight: '700',
    marginBottom: 13,
  },
  successTitle: { color: '#1d302b', fontSize: 19, fontWeight: '700', marginBottom: 7 },
  successText: { color: '#68776f', fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 20 },
});

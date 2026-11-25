import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { hyr, krijoLlogari } from '@/utils/hyrja';
import { supabaseIsConfigured } from '@/utils/supabase';

export default function Hyrja() {
  const [email, setEmail] = useState('');
  const [fjalekalimi, setFjalekalimi] = useState('');
  const [gabim, setGabim] = useState<string | null>(null);
  const [mesazh, setMesazh] = useState<string | null>(null);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(false);

  async function dergo(krijo: boolean) {
    setGabim(null);
    setMesazh(null);
    if (!email.trim() || !fjalekalimi) {
      setGabim('Shkruaj emailin dhe fjalëkalimin.');
      return;
    }
    if (krijo && fjalekalimi.length < 6) {
      setGabim('Fjalëkalimi duhet të ketë së paku 6 karaktere.');
      return;
    }

    setDukeNgarkuar(true);
    try {
      const { data, error } = krijo
        ? await krijoLlogari(email.trim(), fjalekalimi)
        : await hyr(email.trim(), fjalekalimi);
      if (error) setGabim(error.message);
      else if (krijo && !data.session) {
        setMesazh('Llogaria u krijua. Kontrollo emailin për konfirmim, pastaj hyr.');
      }
    } catch (error) {
      setGabim(
        error instanceof Error ? error.message : 'Lidhja dështoi. Kontrollo internetin dhe provo përsëri.',
      );
    } finally {
      setDukeNgarkuar(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulli}>Eyecheck</Text>
      {!supabaseIsConfigured && (
        <Text style={styles.gabim}>
          Konfiguro EXPO_PUBLIC_SUPABASE_URL dhe EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY në .env.local.
        </Text>
      )}
      {gabim && <Text style={styles.gabim}>{gabim}</Text>}
      {mesazh && <Text style={styles.mesazh}>{mesazh}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Fjalëkalimi (min. 6 karaktere)"
        secureTextEntry
        value={fjalekalimi}
        onChangeText={setFjalekalimi}
      />
      <Button
        title={dukeNgarkuar ? 'Duke u lidhur…' : 'Hyr'}
        onPress={() => dergo(false)}
        disabled={dukeNgarkuar || !supabaseIsConfigured}
      />
      <View style={{ height: 8 }} />
      <Button
        title="Krijo llogari"
        onPress={() => dergo(true)}
        disabled={dukeNgarkuar || !supabaseIsConfigured}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  titulli: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  gabim: { color: 'red', marginBottom: 8 },
  mesazh: { color: '#287a48', marginBottom: 8 },
});

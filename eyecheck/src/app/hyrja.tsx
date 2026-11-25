import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { hyr, krijoLlogari } from '@/utils/hyrja';
import { supabase, supabaseIsConfigured } from '@/utils/supabase';
import { useSesioni } from '@/utils/sesioni';

type Pamja = 'auth' | 'request-code' | 'verify-code';

export default function Hyrja() {
  const [pamja, setPamja] = useState<Pamja>('auth');
  const [email, setEmail] = useState('');
  const [fjalekalimi, setFjalekalimi] = useState('');
  const [kodi, setKodi] = useState('');
  const [fjalekalimiRi, setFjalekalimiRi] = useState('');
  const [gabim, setGabim] = useState<string | null>(null);
  const [mesazh, setMesazh] = useState<string | null>(null);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(false);
  const [kodiUVerifikua, setKodiUVerifikua] = useState(false);
  const { setRikuperimFjalekalimi } = useSesioni();

  function pastroMesazhet() {
    setGabim(null);
    setMesazh(null);
  }

  async function dergo(krijo: boolean) {
    pastroMesazhet();
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

  async function dergoKod() {
    pastroMesazhet();
    if (!email.trim()) {
      setGabim('Shkruaj emailin e llogarisë.');
      return;
    }

    setDukeNgarkuar(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) setGabim(error.message);
      else {
        setPamja('verify-code');
        setMesazh('Nëse kjo adresë ka llogari, do të marrësh kodin e rikuperimit në email.');
      }
    } catch (error) {
      setGabim(error instanceof Error ? error.message : 'Emaili nuk u dërgua. Provo përsëri.');
    } finally {
      setDukeNgarkuar(false);
    }
  }

  async function ndryshoFjalekalimin() {
    pastroMesazhet();
    if (!email.trim() || !kodi.trim() || fjalekalimiRi.length < 6) {
      setGabim('Shkruaj emailin, kodin dhe një fjalëkalim të ri me së paku 6 karaktere.');
      return;
    }

    setDukeNgarkuar(true);
    setRikuperimFjalekalimi(true);
    try {
      if (!kodiUVerifikua) {
        const { error: gabimKodi } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: kodi.trim(),
          type: 'recovery',
        });
        if (gabimKodi) {
          setRikuperimFjalekalimi(false);
          setGabim(gabimKodi.message);
          return;
        }
        setKodiUVerifikua(true);
      }

      const { error } = await supabase.auth.updateUser({ password: fjalekalimiRi });
      if (error) {
        setGabim(error.message);
        return;
      }

      setRikuperimFjalekalimi(false);
      setMesazh('Fjalëkalimi u ndryshua. Po të kyçim në llogari…');
    } catch (error) {
      if (!kodiUVerifikua) setRikuperimFjalekalimi(false);
      setGabim(
        error instanceof Error ? error.message : 'Fjalëkalimi nuk u ndryshua. Kontrollo kodin dhe provo përsëri.',
      );
    } finally {
      setDukeNgarkuar(false);
    }
  }

  function kthehuTeHyrja() {
    pastroMesazhet();
    setKodi('');
    setFjalekalimiRi('');
    setKodiUVerifikua(false);
    setRikuperimFjalekalimi(false);
    setPamja('auth');
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
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={(value) => { setEmail(value); pastroMesazhet(); }}
      />

      {pamja === 'auth' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Fjalëkalimi (min. 6 karaktere)"
            secureTextEntry
            autoComplete="password"
            value={fjalekalimi}
            onChangeText={(value) => { setFjalekalimi(value); pastroMesazhet(); }}
          />
          <Button
            title={dukeNgarkuar ? 'Duke u lidhur…' : 'Hyr'}
            onPress={() => dergo(false)}
            disabled={dukeNgarkuar || !supabaseIsConfigured}
          />
          <View style={styles.hapesire} />
          <Button
            title="Krijo llogari"
            onPress={() => dergo(true)}
            disabled={dukeNgarkuar || !supabaseIsConfigured}
          />
          <Pressable onPress={() => { pastroMesazhet(); setPamja('request-code'); }}>
            <Text style={styles.link}>Harrove fjalëkalimin?</Text>
          </Pressable>
        </>
      )}

      {pamja === 'request-code' && (
        <>
          <Text style={styles.udhezim}>Shkruaj emailin dhe do të të dërgojmë kodin për ndryshimin e fjalëkalimit.</Text>
          <Button
            title={dukeNgarkuar ? 'Duke dërguar…' : 'Dërgo kodin'}
            onPress={dergoKod}
            disabled={dukeNgarkuar || !supabaseIsConfigured}
          />
          <Button title="Kthehu te hyrja" onPress={kthehuTeHyrja} disabled={dukeNgarkuar} />
        </>
      )}

      {pamja === 'verify-code' && (
        <>
          <Text style={styles.udhezim}>Kontrollo emailin dhe shkruaj kodin e rikuperimit.</Text>
          <TextInput
            style={styles.input}
            placeholder="Kodi i emailit"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={8}
            value={kodi}
            onChangeText={(value) => { setKodi(value); pastroMesazhet(); }}
          />
          <TextInput
            style={styles.input}
            placeholder="Fjalëkalimi i ri (min. 6 karaktere)"
            secureTextEntry
            autoComplete="new-password"
            value={fjalekalimiRi}
            onChangeText={(value) => { setFjalekalimiRi(value); pastroMesazhet(); }}
          />
          <Button
            title={dukeNgarkuar ? 'Duke ndryshuar…' : 'Ndrysho fjalëkalimin'}
            onPress={ndryshoFjalekalimin}
            disabled={dukeNgarkuar || !supabaseIsConfigured}
          />
          <Button title="Dërgo kod tjetër" onPress={dergoKod} disabled={dukeNgarkuar} />
          <Button title="Kthehu te hyrja" onPress={kthehuTeHyrja} disabled={dukeNgarkuar} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  titulli: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  gabim: { color: 'red', marginBottom: 8 },
  mesazh: { color: '#287a48', marginBottom: 8 },
  udhezim: { color: '#555', marginBottom: 12 },
  hapesire: { height: 8 },
  link: { color: '#1a73e8', textAlign: 'center', marginTop: 18, padding: 8 },
});

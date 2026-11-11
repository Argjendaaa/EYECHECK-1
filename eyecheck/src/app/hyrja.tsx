import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { hyr, krijoLlogari } from '@/utils/hyrja';

export default function Hyrja() {
  const [email, setEmail] = useState('');
  const [fjalekalimi, setFjalekalimi] = useState('');
  const [gabim, setGabim] = useState<string | null>(null);

  async function dergo(krijo: boolean) {
    setGabim(null);
    const { error } = krijo
      ? await krijoLlogari(email.trim(), fjalekalimi)
      : await hyr(email.trim(), fjalekalimi);
    if (error) setGabim(error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulli}>Eyecheck</Text>
      {gabim && <Text style={styles.gabim}>{gabim}</Text>}
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
      <Button title="Hyr" onPress={() => dergo(false)} />
      <View style={{ height: 8 }} />
      <Button title="Krijo llogari" onPress={() => dergo(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  titulli: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  gabim: { color: 'red', marginBottom: 8 },
});
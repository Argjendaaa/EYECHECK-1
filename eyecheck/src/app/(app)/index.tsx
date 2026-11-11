import { useCallback, useEffect, useState } from 'react';
import {
  Button, FlatList, Text, TextInput, View, StyleSheet,
} from 'react-native';
import { supabase } from '@/utils/supabase';

type Diagnoza = { id: number; emri: string; pershkrimi: string | null };

export default function Index() {
  const [screening, setScreeening] = useState<Rezultati[]>([]);
  const [gabim, setGabim] = useState<string | null>(null);
  const [emri, setEmri] = useState('');
  const [pershkrimi, setPershkrimi] = useState('');

  const merr = useCallback(async () => {
    const { data, error } = await supabase.from('screening').select('*');
    if (error) setGabim(error.message);
    else {
      setGabim(null);
      setScreening(data ?? []);
    }
  }, []);

  useEffect(() => {
    merr();
  }, [merr]);

  async function shto() {
    if (!emri.trim()) return;
    // pa pronari_id: e vendos serveri
    const { error } = await supabase
      .from('screening')
      .insert({ emri: emri.trim(), pershkrimi: pershkrimi.trim() || null });
    if (error) {
      setGabim(error.message);
      return;
    }
    setEmri('');
    setPershkrimi('');
    merr();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulli}>Eyecheck</Text>
      {gabim && <Text style={styles.gabim}>Gabim: {gabim}</Text>}

      <TextInput style={styles.input} placeholder="Emri" value={emri} onChangeText={setEmri} />
      <TextInput
        style={styles.input}
        placeholder="Përshkrimi"
        value={pershkrimi}
        onChangeText={setPershkrimi}
      />
      <Button title="Shto" onPress={shto} />

      <FlatList
        style={{ marginTop: 16 }}
        data={screening}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.karta}>
            <Text style={styles.emri}>{item.emri}</Text>
            <Text>{item.pershkrimi}</Text>
          </View>
        )}
      />

      {/* Zëvendësoje me <ButoniDil /> nga ZIP-i kur ta kopjosh */}
      <Button title="Dil" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  titulli: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  karta: { padding: 12, marginBottom: 8, borderRadius: 8, backgroundColor: '#eef' },
  emri: { fontWeight: '600', fontSize: 16 },
  gabim: { color: 'red', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
});

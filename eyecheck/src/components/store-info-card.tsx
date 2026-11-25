import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export function StoreInfoCard() {
  const [dukeTelefonuar, setDukeTelefonuar] = useState(false);

  const telefono = async () => {
    if (dukeTelefonuar) return;
    setDukeTelefonuar(true);
    try {
      await Linking.openURL('tel:+38345840417');
    } catch {
      Alert.alert('Telefonata nuk u hap', 'Mund të telefonosh Optika EYECHECK në +383 45 840 417.');
    } finally {
      setDukeTelefonuar(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>NA VIZITO</Text>
      <Text style={styles.name}>Optika EYECHECK</Text>
      <Text style={styles.detail}>Ali Zeneli</Text>
      <Text style={styles.detail}>E hënë – e shtunë · 10:00–18:00</Text>
      <Pressable accessibilityRole="button" onPress={() => void telefono()} style={styles.callButton}>
        <Text style={styles.callText}>{dukeTelefonuar ? 'Po hapet…' : '☎  +383 45 840 417'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#173d37', borderRadius: 18, padding: 18, marginTop: 22, marginBottom: 8 },
  eyebrow: { color: '#e5c58b', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 7 },
  detail: { color: '#d0ded7', fontSize: 12, lineHeight: 18, marginTop: 5 },
  callButton: { alignSelf: 'flex-start', marginTop: 13, backgroundColor: '#e5c58b', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
  callText: { color: '#173d37', fontSize: 12, fontWeight: '800' },
});

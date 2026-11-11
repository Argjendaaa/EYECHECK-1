import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SesioniProvider, useSesioni } from '@/utils/sesioni';

SplashScreen.preventAutoHideAsync();

function Rrugete() {
  const { sesioni, dukeNgarkuar } = useSesioni();
  if (dukeNgarkuar) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!sesioni}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!sesioni}>
        <Stack.Screen name="hyrja" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SesioniProvider>
        <AnimatedSplashOverlay />
        <Rrugete />
      </SesioniProvider>
    </ThemeProvider>
  );
}
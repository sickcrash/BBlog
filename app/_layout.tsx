import { Stack } from 'expo-router';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../src/theme';
import { WorkoutProvider } from '../src/context/WorkoutContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <WorkoutProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </WorkoutProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

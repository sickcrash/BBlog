import { Stack } from 'expo-router';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../src/theme';
import { WorkoutProvider } from '../src/context/WorkoutContext';

export default function Layout() {
  return (
    <ThemeProvider theme={theme}>
      <WorkoutProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </WorkoutProvider>
    </ThemeProvider>
  );
}

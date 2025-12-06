import React, { useEffect, useCallback } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import * as SplashScreen from 'expo-splash-screen';

import { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme/terminal';
import { useGameStore } from './src/store/gameStore';

// Screens
import { NewGameScreen } from './src/screens/NewGameScreen';
import { MainScreen } from './src/screens/MainScreen';
import { TradeScreen } from './src/screens/TradeScreen';
import { BoilerScreen } from './src/screens/BoilerScreen';
import { MarksScreen } from './src/screens/MarksScreen';
import { ProtectionScreen } from './src/screens/ProtectionScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors - splash screen might already be hidden
});

const Stack = createNativeStackNavigator<RootStackParamList>();

// Dark theme for navigation
const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

// Navigator wrapper that handles game over state
const AppNavigator: React.FC = () => {
  const { gameStarted, gameOver } = useGameStore();

  // Determine initial route based on game state
  const getInitialRoute = (): keyof RootStackParamList => {
    if (gameOver) return 'GameOver';
    if (gameStarted) return 'Main';
    return 'NewGame';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="NewGame" component={NewGameScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Trade" component={TradeScreen} />
      <Stack.Screen name="Boiler" component={BoilerScreen} />
      <Stack.Screen name="Marks" component={MarksScreen} />
      <Stack.Screen name="Protection" component={ProtectionScreen} />
      <Stack.Screen name="GameOver" component={GameOverScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    VT323_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <NavigationContainer theme={DarkTheme}>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

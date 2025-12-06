import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/types';
import { generateFirmName } from '../data/names';
import { hasSave } from '../utils/storage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewGame'>;
};

export const NewGameScreen: React.FC<Props> = ({ navigation }) => {
  const [firmName, setFirmName] = useState('');
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const { startNewGame, loadSavedGame } = useGameStore();

  useEffect(() => {
    // Generate a random firm name suggestion
    setFirmName(generateFirmName());

    // Check for saved game
    hasSave().then(setHasSavedGame);
  }, []);

  const handleNewGame = () => {
    if (firmName.trim()) {
      startNewGame(firmName.trim());
      navigation.replace('Main');
    }
  };

  const handleContinue = async () => {
    const loaded = await loadSavedGame();
    if (loaded) {
      navigation.replace('Main');
    }
  };

  const handleRandomName = () => {
    setFirmName(generateFirmName());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>BOILER ROOM</Text>
        <Text style={styles.subtitle}>Wall Street, 1985</Text>
      </View>

      {/* ASCII Art */}
      <View style={styles.asciiContainer}>
        <Text style={styles.ascii}>{`
  ╔═══════════════════════════╗
  ║  $$$   STOCK   $$$        ║
  ║  ███   TICKER  ███        ║
  ║  ▲▼▲   ▼▲▼▲▼   ▲▼▲        ║
  ╚═══════════════════════════╝
        `}</Text>
      </View>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Buy penny stocks. Pump them to suckers.{'\n'}
        Dump before the crash. Escape with $10M.
      </Text>

      {/* Firm Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>YOUR FIRM NAME:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={firmName}
            onChangeText={setFirmName}
            placeholder="Enter firm name..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
          <Button
            title="?"
            onPress={handleRandomName}
            variant="ghost"
            size="small"
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="[ NEW GAME ]"
          onPress={handleNewGame}
          variant="primary"
          size="large"
          disabled={!firmName.trim()}
          style={styles.button}
        />

        {hasSavedGame && (
          <Button
            title="[ CONTINUE ]"
            onPress={handleContinue}
            variant="secondary"
            size="large"
            style={styles.button}
          />
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        A game about financial crimes.{'\n'}
        Don't try this at home.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.title,
    color: colors.accent,
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.textDim,
  },
  asciiContainer: {
    marginBottom: spacing.lg,
  },
  ascii: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  footer: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Animated } from 'react-native';
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

const ASCII_ART = `
    ██████╗  ██████╗ ██╗██╗     ███████╗██████╗
    ██╔══██╗██╔═══██╗██║██║     ██╔════╝██╔══██╗
    ██████╔╝██║   ██║██║██║     █████╗  ██████╔╝
    ██╔══██╗██║   ██║██║██║     ██╔══╝  ██╔══██╗
    ██████╔╝╚██████╔╝██║███████╗███████╗██║  ██║
    ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
                    ██████╗  ██████╗  ██████╗ ███╗   ███╗
                    ██╔══██╗██╔═══██╗██╔═══██╗████╗ ████║
                    ██████╔╝██║   ██║██║   ██║██╔████╔██║
                    ██╔══██╗██║   ██║██║   ██║██║╚██╔╝██║
                    ██║  ██║╚██████╔╝╚██████╔╝██║ ╚═╝ ██║
                    ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝
`;

const STOCK_DISPLAY = `
 ╔════════════════════════════════════════╗
 ║  DJIA    ▲ 1,546.67  +12.34  (+0.81%)  ║
 ║  NASDAQ  ▲   324.93   +4.12  (+1.28%)  ║
 ║  S&P     ▲   211.28   +2.87  (+1.38%)  ║
 ╠════════════════════════════════════════╣
 ║  >>> PENNY STOCKS HOT <<<              ║
 ║  PUMP ALERT: OPPORTUNITIES AWAIT       ║
 ╚════════════════════════════════════════╝
`;

export const NewGameScreen: React.FC<Props> = ({ navigation }) => {
  const [firmName, setFirmName] = useState('');
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const { startNewGame, loadSavedGame } = useGameStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Generate a random firm name suggestion
    setFirmName(generateFirmName());

    // Check for saved game
    hasSave().then(setHasSavedGame);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Blinking cursor
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    // Pulsing glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(cursorInterval);
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
      <Animated.View style={[styles.fadeContainer, { opacity: fadeAnim }]}>
        {/* Terminal Border Top */}
        <View style={styles.terminalBorder}>
          <Text style={styles.borderText}>
            {'═'.repeat(42)}
          </Text>
          <Text style={styles.borderCorner}>STRATTON TERMINAL v2.1</Text>
        </View>

        {/* ASCII Title with glow */}
        <Animated.View style={[styles.asciiContainer, { opacity: glowAnim }]}>
          <Text style={styles.ascii}>{ASCII_ART}</Text>
        </Animated.View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>WALL STREET, 1985</Text>
          <Text style={styles.subSubtitle}>"Greed is Good"</Text>
        </View>

        {/* Stock Display */}
        <View style={styles.stockContainer}>
          <Text style={styles.stockDisplay}>{STOCK_DISPLAY}</Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineBox}>
          <Text style={styles.tagline}>
            Buy penny stocks. Pump them to suckers.
          </Text>
          <Text style={styles.tagline}>
            Dump before the crash. Escape with $10M.
          </Text>
        </View>

        {/* Firm Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{'>'} ENTER FIRM NAME:</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={firmName}
                onChangeText={setFirmName}
                placeholder=""
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
              <Text style={[styles.cursor, !showCursor && styles.cursorHidden]}>_</Text>
            </View>
            <Button
              title="RND"
              onPress={handleRandomName}
              variant="ghost"
              size="small"
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title=">>> NEW GAME <<<"
            onPress={handleNewGame}
            variant="primary"
            size="large"
            disabled={!firmName.trim()}
            style={styles.button}
          />

          {hasSavedGame && (
            <Button
              title=">>> CONTINUE <<<"
              onPress={handleContinue}
              variant="secondary"
              size="large"
              style={styles.button}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerLine}>{'─'.repeat(40)}</Text>
          <Text style={styles.footer}>
            A simulation of financial crimes.
          </Text>
          <Text style={styles.footerDisclaimer}>
            For entertainment purposes only.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  fadeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  terminalBorder: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  borderText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.primaryDim,
  },
  borderCorner: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  asciiContainer: {
    marginBottom: spacing.sm,
  },
  ascii: {
    fontFamily: fontFamily.mono,
    fontSize: 8,
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 10,
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    color: colors.primary,
    letterSpacing: 4,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subSubtitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.textDim,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  stockContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  stockDisplay: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    color: colors.primary,
    textAlign: 'left',
    lineHeight: 14,
  },
  taglineBox: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 176, 0, 0.05)',
  },
  tagline: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cursor: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.primary,
    paddingRight: spacing.sm,
  },
  cursorHidden: {
    opacity: 0,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerLine: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.borderDim,
    marginBottom: spacing.sm,
  },
  footer: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerDisclaimer: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

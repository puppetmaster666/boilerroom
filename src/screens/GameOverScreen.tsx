import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing, formatMoney } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/types';
import { updateStats } from '../utils/storage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameOver'>;
};

export const GameOverScreen: React.FC<Props> = ({ navigation }) => {
  const {
    won,
    gameOverReason,
    day,
    cash,
    heat,
    totalEarnings,
    totalPumps,
    marksScammed,
    firmName,
    resetGame,
  } = useGameStore();

  const netWorth = useGameStore(s => s.netWorth());

  useEffect(() => {
    // Update stats
    updateStats(won, netWorth, day, totalEarnings, marksScammed);
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    navigation.replace('NewGame');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Result */}
      <View style={styles.resultContainer}>
        <Text style={[styles.result, won ? styles.winText : styles.loseText]}>
          {won ? 'YOU WIN' : 'GAME OVER'}
        </Text>
        <Text style={styles.firmName}>{firmName}</Text>
      </View>

      {/* Reason */}
      <View style={styles.reasonContainer}>
        <Text style={styles.reason}>{gameOverReason}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsPanel}>
        <Text style={styles.statsTitle}>// FINAL STATS</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Days Survived</Text>
          <Text style={styles.statValue}>{day}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Final Net Worth</Text>
          <Text style={[styles.statValue, styles.moneyValue]}>
            {formatMoney(netWorth)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Final Cash</Text>
          <Text style={[styles.statValue, styles.moneyValue]}>
            {formatMoney(cash)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Final Heat</Text>
          <Text style={[styles.statValue, heat >= 75 ? styles.dangerValue : styles.normalValue]}>
            {heat}%
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Earnings</Text>
          <Text style={[styles.statValue, styles.moneyValue]}>
            {formatMoney(totalEarnings)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Pumps Executed</Text>
          <Text style={styles.statValue}>{totalPumps}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Marks Scammed</Text>
          <Text style={styles.statValue}>{marksScammed}</Text>
        </View>
      </View>

      {/* ASCII Art */}
      {won ? (
        <View style={styles.asciiContainer}>
          <Text style={styles.asciiWin}>{`
   $$$$$$$$$$$$$$$$$$
   $                $
   $   YOU MADE IT  $
   $                $
   $$$$$$$$$$$$$$$$$$
          `}</Text>
        </View>
      ) : (
        <View style={styles.asciiContainer}>
          <Text style={styles.asciiLose}>{`
   ╔═══════════════╗
   ║   FEDERAL     ║
   ║   PRISON      ║
   ║   ▓▓▓▓▓▓▓▓▓   ║
   ╚═══════════════╝
          `}</Text>
        </View>
      )}

      {/* Quote */}
      <View style={styles.quoteContainer}>
        {won ? (
          <Text style={styles.quote}>
            "The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it."
            {'\n'}- Jordan Belfort
          </Text>
        ) : (
          <Text style={styles.quote}>
            "I've been a poor man, and I've been a rich man. And I choose rich every time."
            {'\n'}- Jordan Belfort
          </Text>
        )}
      </View>

      {/* Play Again */}
      <Button
        title="[ PLAY AGAIN ]"
        onPress={handlePlayAgain}
        variant="primary"
        size="large"
        style={styles.playAgainButton}
      />
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
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  result: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.title,
    marginBottom: spacing.xs,
  },
  winText: {
    color: colors.money,
    textShadowColor: colors.money,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loseText: {
    color: colors.danger,
    textShadowColor: colors.danger,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  firmName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
  },
  reasonContainer: {
    marginBottom: spacing.lg,
  },
  reason: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsPanel: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  statValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  moneyValue: {
    color: colors.money,
  },
  normalValue: {
    color: colors.text,
  },
  dangerValue: {
    color: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDim,
    marginVertical: spacing.sm,
  },
  asciiContainer: {
    marginBottom: spacing.lg,
  },
  asciiWin: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.money,
    textAlign: 'center',
  },
  asciiLose: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
  },
  quoteContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  quote: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  playAgainButton: {
    width: '100%',
  },
});

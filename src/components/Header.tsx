import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontFamily, formatMoney, getHeatColor, spacing, commonStyles } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';

export const Header: React.FC = () => {
  const { day, cash, heat, firmName } = useGameStore();
  const netWorth = useGameStore(s => s.netWorth());

  return (
    <View style={styles.container}>
      {/* Top Bar: Firm Name & Day */}
      <View style={styles.topBar}>
        <Text style={styles.firmName}>{firmName}</Text>
        <View style={styles.dayBadge}>
          <Text style={styles.dayText}>DAY {day}</Text>
        </View>
      </View>

      {/* HUD Grid */}
      <View style={styles.hudGrid}>

        {/* Cash Module */}
        <View style={[styles.hudModule, styles.cashModule]}>
          <Text style={styles.label}>LIQUID CASH</Text>
          <Text style={styles.cashValue}>{formatMoney(cash)}</Text>
        </View>

        {/* Net Worth Module */}
        <View style={[styles.hudModule, styles.netWorthModule]}>
          <Text style={styles.label}>NET WORTH</Text>
          <Text style={styles.netWorthValue}>{formatMoney(netWorth)}</Text>
          {netWorth >= 10000000 && (
            <Text style={styles.goalText}>GOAL REACHED</Text>
          )}
        </View>

        {/* Heat Module */}
        <View style={[styles.hudModule, styles.heatModule]}>
          <View style={styles.heatHeader}>
            <Text style={styles.label}>HEAT LEVEL</Text>
            <Text style={[styles.heatValue, { color: getHeatColor(heat) }]}>{heat}%</Text>
          </View>
          <View style={styles.heatBarBg}>
            <View
              style={[
                styles.heatBarFill,
                { width: `${heat}%`, backgroundColor: getHeatColor(heat) }
              ]}
            />
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg, // Status bar spacing
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  firmName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.text,
    letterSpacing: 1,
  },
  dayBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.accent,
  },
  hudGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hudModule: {
    ...commonStyles.box,
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  cashModule: {
    flex: 1.2,
    borderColor: colors.primaryDim,
  },
  netWorthModule: {
    flex: 1.2,
    borderColor: colors.accentDim,
  },
  heatModule: {
    flex: 1,
    borderColor: colors.dangerDim,
  },
  label: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    color: colors.textDim,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  cashValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.money,
    fontWeight: 'bold',
  },
  netWorthValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 8,
    color: colors.warning,
    position: 'absolute',
    top: 2,
    right: 4,
  },
  heatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heatValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  heatBarBg: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  heatBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontFamily, formatMoney, getHeatColor } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';

export const Header: React.FC = () => {
  const { day, cash, heat, firmName } = useGameStore();
  const netWorth = useGameStore(s => s.netWorth());

  return (
    <View style={styles.container}>
      {/* Top Row: Firm Name and Day */}
      <View style={styles.topRow}>
        <Text style={styles.firmName}>{firmName}</Text>
        <Text style={styles.day}>DAY {day}</Text>
      </View>

      {/* Main Stats Row */}
      <View style={styles.mainStats}>
        {/* Cash */}
        <View style={styles.mainStat}>
          <Text style={styles.mainLabel}>CASH</Text>
          <Text style={styles.mainValue}>{formatMoney(cash)}</Text>
        </View>

        {/* Net Worth - Most prominent */}
        <View style={[styles.mainStat, styles.netWorthStat]}>
          <Text style={styles.mainLabel}>NET WORTH</Text>
          <Text style={[styles.mainValue, styles.netWorthValue]}>{formatMoney(netWorth)}</Text>
          {netWorth >= 10000000 && (
            <Text style={styles.goalReached}>★ GOAL REACHED ★</Text>
          )}
        </View>
      </View>

      {/* Heat Bar - Full Width */}
      <View style={styles.heatSection}>
        <View style={styles.heatHeader}>
          <Text style={styles.heatLabel}>HEAT</Text>
          <Text style={[styles.heatPercent, { color: getHeatColor(heat) }]}>
            {heat}%
          </Text>
        </View>
        <View style={styles.heatBarBg}>
          <View
            style={[
              styles.heatBarFill,
              {
                width: `${heat}%`,
                backgroundColor: getHeatColor(heat),
              },
            ]}
          />
          {/* Threshold markers */}
          <View style={[styles.threshold, { left: '25%' }]} />
          <View style={[styles.threshold, { left: '50%' }]} />
          <View style={[styles.threshold, { left: '75%' }]} />
        </View>
        {heat >= 75 && (
          <Text style={styles.heatWarning}>! DANGER ZONE !</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  firmName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
  },
  day: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mainStat: {
    flex: 1,
  },
  netWorthStat: {
    alignItems: 'flex-end',
  },
  mainLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    marginBottom: 2,
  },
  mainValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xxl,
    color: colors.money,
  },
  netWorthValue: {
    color: colors.accent,
  },
  goalReached: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.warning,
    marginTop: 2,
  },
  heatSection: {
    marginTop: 4,
  },
  heatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heatLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  heatPercent: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  heatBarBg: {
    height: 12,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderDim,
    position: 'relative',
  },
  heatBarFill: {
    height: '100%',
  },
  threshold: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.textMuted,
  },
  heatWarning: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 4,
  },
});

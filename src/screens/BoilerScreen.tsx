import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing, formatMoney } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/types';
import { CALLER_TIERS, OFFICE_CAPACITY, OFFICE_COSTS, PERSONALITY_EFFECTS } from '../data/callers';
import { CallerTier, Caller } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Boiler'>;
};

export const BoilerScreen: React.FC<Props> = ({ navigation }) => {
  const {
    callers,
    marks,
    stocks,
    officeLevel,
    activePump,
    cash,
    hireCaller,
    fireCaller,
    startPump,
    endPump,
    upgradeOffice,
  } = useGameStore();

  const [showHire, setShowHire] = useState(false);
  const [selectedPumpStock, setSelectedPumpStock] = useState<string | null>(null);

  const capacity = OFFICE_CAPACITY[officeLevel];
  const canHireMore = callers.length < capacity;
  const trustingMarks = marks.filter(m => m.trust >= 3).length;

  const pennyStocks = Object.values(stocks).filter(s => s != null && !s.isBlueChip);
  const pumpStock = activePump ? stocks[activePump.stockKey] : null;

  const renderCaller = (caller: Caller) => {
    const personality = PERSONALITY_EFFECTS[caller.personality];

    return (
      <View key={caller.id} style={styles.callerCard}>
        <View style={styles.callerInfo}>
          <Text style={styles.callerName}>{caller.name}</Text>
          <Text style={styles.callerTier}>
            {CALLER_TIERS[caller.tier].name} | {caller.personality.toUpperCase()}
          </Text>
          <Text style={styles.callerStats}>
            {caller.callsPerDay} calls/day | {(caller.conversionRate * 100).toFixed(0)}% conversion
          </Text>
          <Text style={styles.callerSalary}>
            Salary: {formatMoney(caller.salary)}/week
          </Text>
        </View>
        <Button
          title="FIRE"
          onPress={() => fireCaller(caller.id)}
          variant="danger"
          size="small"
        />
      </View>
    );
  };

  const renderHireOption = (tier: CallerTier) => {
    const template = CALLER_TIERS[tier];
    const canAfford = cash >= template.costToHire;

    return (
      <TouchableOpacity
        key={tier}
        style={[styles.hireOption, !canAfford && styles.hireOptionDisabled]}
        onPress={() => canAfford && canHireMore && hireCaller(tier)}
        disabled={!canAfford || !canHireMore}
      >
        <Text style={styles.hireName}>{template.name}</Text>
        <Text style={styles.hireStats}>
          {template.callsPerDay} calls | {(template.conversionRate * 100).toFixed(0)}% conv
        </Text>
        <Text style={styles.hireCost}>
          Hire: {formatMoney(template.costToHire)} | Salary: {formatMoney(template.salary)}/wk
        </Text>
        <Text style={styles.hireDesc}>{template.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        {/* Office Status */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// OFFICE: {officeLevel.toUpperCase()}</Text>
          <Text style={styles.panelText}>
            Callers: {callers.length} / {capacity}
          </Text>
          {officeLevel !== 'empire' && (
            <Button
              title={`UPGRADE (${formatMoney(OFFICE_COSTS[
                officeLevel === 'home' ? 'small' :
                officeLevel === 'small' ? 'full' : 'empire'
              ].upgrade)})`}
              onPress={upgradeOffice}
              variant="secondary"
              size="small"
              style={styles.upgradeButton}
              disabled={cash < OFFICE_COSTS[
                officeLevel === 'home' ? 'small' :
                officeLevel === 'small' ? 'full' : 'empire'
              ].upgrade}
            />
          )}
        </View>

        {/* Active Pump */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// PUMP OPERATION</Text>
          {activePump && pumpStock ? (
            <View>
              <Text style={styles.pumpActive}>
                PUMPING: {pumpStock.name} ({pumpStock.key})
              </Text>
              <Text style={styles.pumpInfo}>
                Day {activePump.daysActive + 1} of 7 | Hype: {(pumpStock.hypeMultiplier * 100).toFixed(0)}%
              </Text>
              <Text style={styles.pumpInfo}>
                Start: {formatMoney(activePump.startPrice)} | Current: {formatMoney(pumpStock.price)}
              </Text>
              <Text style={styles.pumpInfo}>
                Trusting marks: {trustingMarks}
              </Text>
              <Button
                title="[ END PUMP & DUMP ]"
                onPress={endPump}
                variant="danger"
                size="medium"
                style={styles.endPumpButton}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.panelText}>
                Select a penny stock to pump:
              </Text>
              <View style={styles.pumpOptions}>
                {pennyStocks.map(stock => (
                  <TouchableOpacity
                    key={stock.key}
                    style={[
                      styles.pumpOption,
                      selectedPumpStock === stock.key && styles.pumpOptionSelected,
                    ]}
                    onPress={() => setSelectedPumpStock(stock.key)}
                  >
                    <Text style={styles.pumpStockName}>{stock.key}</Text>
                    <Text style={styles.pumpStockPrice}>{formatMoney(stock.price)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedPumpStock && (
                <Button
                  title="[ START PUMP ]"
                  onPress={() => {
                    startPump(selectedPumpStock);
                    setSelectedPumpStock(null);
                  }}
                  variant="primary"
                  size="medium"
                  disabled={trustingMarks === 0}
                  style={styles.startPumpButton}
                />
              )}
              {trustingMarks === 0 && (
                <Text style={styles.warningText}>
                  Need marks with trust 3+ to pump!
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Marks Overview */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>// MARKS ({marks.length})</Text>
            <Button
              title="[ MANAGE ]"
              onPress={() => navigation.navigate('Marks')}
              variant="primary"
              size="small"
            />
          </View>
          <View style={styles.markStats}>
            <View style={styles.markStat}>
              <Text style={styles.markStatValue}>{marks.filter(m => m.trust === 1).length}</Text>
              <Text style={styles.markStatLabel}>New</Text>
            </View>
            <View style={styles.markStat}>
              <Text style={styles.markStatValue}>{marks.filter(m => m.trust === 2).length}</Text>
              <Text style={styles.markStatLabel}>Warm</Text>
            </View>
            <View style={styles.markStat}>
              <Text style={[styles.markStatValue, styles.trustingValue]}>
                {marks.filter(m => m.trust >= 3).length}
              </Text>
              <Text style={styles.markStatLabel}>Trusting</Text>
            </View>
            <View style={styles.markStat}>
              <Text style={[styles.markStatValue, styles.whaleValue]}>
                {marks.filter(m => m.trust === 5).length}
              </Text>
              <Text style={styles.markStatLabel}>Whales</Text>
            </View>
          </View>
          <Text style={styles.markTip}>
            Tap MANAGE to sell stocks to marks and build trust!
          </Text>
        </View>

        {/* Callers */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>// CALLERS</Text>
            {canHireMore && (
              <Button
                title="[ HIRE ]"
                onPress={() => setShowHire(!showHire)}
                variant="secondary"
                size="small"
              />
            )}
          </View>

          {showHire && (
            <View style={styles.hirePanel}>
              {([1, 2, 3, 4] as CallerTier[]).map(renderHireOption)}
            </View>
          )}

          {callers.length === 0 ? (
            <Text style={styles.noCallers}>
              No callers hired. You're making all 50 calls yourself.
            </Text>
          ) : (
            callers.map(renderCaller)
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="[ BACK ]"
          onPress={() => navigation.goBack()}
          variant="secondary"
          size="medium"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  panelTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },
  panelText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  upgradeButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  pumpActive: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  pumpInfo: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  endPumpButton: {
    marginTop: spacing.md,
  },
  pumpOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pumpOption: {
    borderWidth: 1,
    borderColor: colors.borderDim,
    padding: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  pumpOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(255, 176, 0, 0.1)',
  },
  pumpStockName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  pumpStockPrice: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.money,
  },
  startPumpButton: {
    marginTop: spacing.md,
  },
  warningText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  markStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  markStat: {
    alignItems: 'center',
  },
  markStatValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  markStatLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  trustingValue: {
    color: colors.primary,
  },
  whaleValue: {
    color: colors.accent,
  },
  markTip: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noCallers: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  callerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDim,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  callerInfo: {
    flex: 1,
  },
  callerName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  callerTier: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  callerStats: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  callerSalary: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.money,
  },
  hirePanel: {
    marginBottom: spacing.md,
  },
  hireOption: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  hireOptionDisabled: {
    opacity: 0.4,
  },
  hireName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.accent,
  },
  hireStats: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  hireCost: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.money,
  },
  hireDesc: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    fontStyle: 'italic',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

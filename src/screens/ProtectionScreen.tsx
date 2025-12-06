import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing, formatMoney, getHeatColor } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Protection'>;
};

export const ProtectionScreen: React.FC<Props> = ({ navigation }) => {
  const {
    heat,
    cash,
    callers,
    activeInvestigation,
    bribeCop,
    hireLawyer,
    useFallGuy,
  } = useGameStore();

  const getHeatLevel = () => {
    if (heat < 25) return { label: 'CLEAN', description: 'No heat. Keep it up.' };
    if (heat < 50) return { label: 'WATCHED', description: 'They\'re watching. Be careful.' };
    if (heat < 75) return { label: 'INVESTIGATED', description: 'Active investigation. Take action.' };
    if (heat < 90) return { label: 'INDICTED', description: 'DANGER! You need help NOW.' };
    return { label: 'ARRESTED', description: 'Game Over imminent!' };
  };

  const heatLevel = getHeatLevel();
  const heatColor = getHeatColor(heat);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        {/* Heat Meter */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// HEAT LEVEL</Text>

          <View style={styles.heatMeter}>
            <View style={styles.heatBarBg}>
              <View
                style={[
                  styles.heatBarFill,
                  { width: `${heat}%`, backgroundColor: heatColor },
                ]}
              />
              {/* Threshold markers */}
              <View style={[styles.threshold, { left: '25%' }]} />
              <View style={[styles.threshold, { left: '50%' }]} />
              <View style={[styles.threshold, { left: '75%' }]} />
              <View style={[styles.threshold, { left: '90%' }]} />
            </View>
            <Text style={[styles.heatValue, { color: heatColor }]}>{heat}%</Text>
          </View>

          <Text style={[styles.heatLabel, { color: heatColor }]}>
            {heatLevel.label}
          </Text>
          <Text style={styles.heatDescription}>
            {heatLevel.description}
          </Text>

          {/* Heat reduction info */}
          <Text style={styles.heatTip}>
            Not pumping? Heat drops 3/day automatically.
          </Text>
        </View>

        {/* Active Investigation */}
        {activeInvestigation && (
          <View style={[styles.panel, styles.dangerPanel]}>
            <Text style={styles.panelTitle}>// ACTIVE INVESTIGATION</Text>
            <Text style={styles.investigationType}>
              {activeInvestigation.type.toUpperCase()}
            </Text>
            <Text style={styles.investigationInfo}>
              Days remaining: {activeInvestigation.daysRemaining}
            </Text>
            <Text style={styles.investigationWarning}>
              Resolve this before time runs out!
            </Text>
          </View>
        )}

        {/* Bribes */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// BRIBES</Text>
          <Text style={styles.sectionDesc}>
            Pay off the cops. Success not guaranteed.
          </Text>

          <View style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Beat Cop</Text>
              <Text style={styles.optionEffect}>-10 Heat (90% success)</Text>
              <Text style={styles.optionCost}>{formatMoney(5000)}</Text>
            </View>
            <Button
              title="BRIBE"
              onPress={() => bribeCop('beat')}
              variant="secondary"
              size="small"
              disabled={cash < 5000}
            />
          </View>

          <View style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Detective</Text>
              <Text style={styles.optionEffect}>-20 Heat (75% success)</Text>
              <Text style={styles.optionCost}>{formatMoney(20000)}</Text>
            </View>
            <Button
              title="BRIBE"
              onPress={() => bribeCop('detective')}
              variant="secondary"
              size="small"
              disabled={cash < 20000}
            />
          </View>

          <View style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Captain</Text>
              <Text style={styles.optionEffect}>-35 Heat (60% success)</Text>
              <Text style={styles.optionCost}>{formatMoney(75000)}</Text>
            </View>
            <Button
              title="BRIBE"
              onPress={() => bribeCop('captain')}
              variant="secondary"
              size="small"
              disabled={cash < 75000}
            />
          </View>

          <Text style={styles.warningText}>
            Warning: Failed bribes add +20 Heat!
          </Text>
        </View>

        {/* Lawyers */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// LAWYERS</Text>
          <Text style={styles.sectionDesc}>
            Legal protection. Guaranteed results.
          </Text>

          <View style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Basic Lawyer</Text>
              <Text style={styles.optionEffect}>-15 Heat (guaranteed)</Text>
              <Text style={styles.optionCost}>{formatMoney(10000)} retainer</Text>
            </View>
            <Button
              title="HIRE"
              onPress={() => hireLawyer('basic')}
              variant="secondary"
              size="small"
              disabled={cash < 10000}
            />
          </View>

          <View style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Good Lawyer</Text>
              <Text style={styles.optionEffect}>-30 Heat (guaranteed)</Text>
              <Text style={styles.optionCost}>{formatMoney(50000)} retainer</Text>
            </View>
            <Button
              title="HIRE"
              onPress={() => hireLawyer('good')}
              variant="secondary"
              size="small"
              disabled={cash < 50000}
            />
          </View>

          <View style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Best Lawyer</Text>
              <Text style={styles.optionEffect}>-50 Heat (guaranteed)</Text>
              <Text style={styles.optionCost}>{formatMoney(200000)} retainer</Text>
            </View>
            <Button
              title="HIRE"
              onPress={() => hireLawyer('best')}
              variant="secondary"
              size="small"
              disabled={cash < 200000}
            />
          </View>
        </View>

        {/* Fall Guy */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// FALL GUY</Text>
          <Text style={styles.sectionDesc}>
            Sacrifice a caller to take the blame.
          </Text>

          <View style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Use Fall Guy</Text>
              <Text style={styles.optionEffect}>-40 Heat + lose 1 caller</Text>
              <Text style={styles.optionCost}>
                {formatMoney(10000)} + {callers.length > 0 ? callers[0]?.name : 'No callers'}
              </Text>
            </View>
            <Button
              title="USE"
              onPress={useFallGuy}
              variant="danger"
              size="small"
              disabled={callers.length === 0 || cash < 10000}
            />
          </View>
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
  dangerPanel: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
  },
  panelTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },
  heatMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heatBarBg: {
    flex: 1,
    height: 24,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderDim,
    marginRight: spacing.md,
    position: 'relative',
  },
  heatBarFill: {
    height: '100%',
  },
  threshold: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.textMuted,
  },
  heatValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    width: 60,
    textAlign: 'right',
  },
  heatLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heatDescription: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heatTip: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  investigationType: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    color: colors.danger,
  },
  investigationInfo: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  investigationWarning: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  sectionDesc: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDim,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionEffect: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  optionCost: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.money,
  },
  warningText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.warning,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

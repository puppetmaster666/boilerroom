import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing, formatMoney } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/types';
import { EVENT_TEMPLATES } from '../data/events';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

export const MainScreen: React.FC<Props> = ({ navigation }) => {
  const {
    day,
    marks,
    callers,
    activePump,
    officeLevel,
    advanceDay,
    stocks,
    gameOver,
    currentEvent,
    dismissEvent,
    handleEventChoice,
  } = useGameStore();

  // Navigate to GameOver when game ends
  useEffect(() => {
    if (gameOver) {
      navigation.replace('GameOver');
    }
  }, [gameOver, navigation]);

  const netWorth = useGameStore(s => s.netWorth());
  const weeklyExpenses = useGameStore(s => s.weeklyExpenses());

  // Quick stats
  const trustingMarks = marks.filter(m => m.trust >= 3).length;
  const pumpStock = activePump ? stocks[activePump.stockKey] : null;

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        {/* Status Panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// STATUS</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Office</Text>
              <Text style={styles.statusValue}>{officeLevel.toUpperCase()}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Callers</Text>
              <Text style={styles.statusValue}>{callers.length}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Marks</Text>
              <Text style={styles.statusValue}>{marks.length}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Trusting</Text>
              <Text style={styles.statusValue}>{trustingMarks}</Text>
            </View>
          </View>
        </View>

        {/* Active Pump */}
        {activePump && pumpStock && (
          <View style={[styles.panel, styles.pumpPanel]}>
            <Text style={styles.panelTitle}>// ACTIVE PUMP</Text>
            <Text style={styles.pumpStock}>{pumpStock.name} ({pumpStock.key})</Text>
            <Text style={styles.pumpInfo}>
              Day {activePump.daysActive + 1}/7 | Price: {formatMoney(pumpStock.price)}
            </Text>
            <Text style={styles.pumpInfo}>
              Peak: {formatMoney(activePump.peakPrice)} | Volume: {formatMoney(activePump.totalVolumePumped)}
            </Text>
          </View>
        )}

        {/* Weekly Expenses Warning */}
        {day % 7 === 6 && weeklyExpenses > 0 && (
          <View style={[styles.panel, styles.warningPanel]}>
            <Text style={styles.warningText}>
              WEEKLY EXPENSES DUE TOMORROW: {formatMoney(weeklyExpenses)}
            </Text>
          </View>
        )}

        {/* Tutorial Tips - show for first 7 days */}
        {day <= 7 && (
          <View style={[styles.panel, styles.tipPanel]}>
            <Text style={styles.tipTitle}>// TIP - DAY {day}</Text>
            <Text style={styles.tipText}>
              {day === 1 && "Welcome to Wall Street. Start by TRADING - buy some penny stocks cheap."}
              {day === 2 && "Visit BOILER ROOM to see your marks. Cold calls bring in new suckers daily."}
              {day === 3 && "Marks need TRUST level 3+ before they'll buy penny stocks. First, sell them blue chips."}
              {day === 4 && "When you have enough trusting marks, START A PUMP on a penny stock you own."}
              {day === 5 && "Pumps last 7 days max. Sell YOUR shares before the hype dies and price crashes."}
              {day === 6 && "HEAT attracts feds. Use PROTECTION to bribe cops or hire lawyers."}
              {day === 7 && "Reach $10M net worth to escape. Stay under 100 heat or you're arrested."}
            </Text>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navGrid}>
          <Button
            title="[ TRADE ]"
            onPress={() => navigation.navigate('Trade')}
            variant="secondary"
            size="large"
            style={styles.navButton}
          />
          <Button
            title="[ BOILER ROOM ]"
            onPress={() => navigation.navigate('Boiler')}
            variant="secondary"
            size="large"
            style={styles.navButton}
          />
          <Button
            title="[ PROTECTION ]"
            onPress={() => navigation.navigate('Protection')}
            variant="secondary"
            size="large"
            style={styles.navButton}
          />
        </View>

        {/* Progress to Win */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>// ESCAPE FUND</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (netWorth / 10000000) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatMoney(netWorth)} / $10M to escape
          </Text>
        </View>
      </ScrollView>

      {/* Next Day Button */}
      <View style={styles.footer}>
        <Button
          title="[ NEXT DAY >>> ]"
          onPress={advanceDay}
          variant="primary"
          size="large"
          style={styles.nextDayButton}
        />
      </View>

      {/* Event Modal */}
      <Modal
        visible={!!currentEvent}
        transparent
        animationType="fade"
        onRequestClose={dismissEvent}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {currentEvent && (
              <>
                <Text style={styles.eventType}>// {currentEvent.type.toUpperCase()}</Text>
                <Text style={styles.eventTitle}>{currentEvent.title}</Text>
                <Text style={styles.eventDescription}>{currentEvent.description}</Text>

                {/* Choices or dismiss */}
                {currentEvent.choices && currentEvent.choices.length > 0 ? (
                  <View style={styles.choicesContainer}>
                    {EVENT_TEMPLATES.find(t => t.title === currentEvent.title)?.choices?.map((choice, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.choiceButton}
                        onPress={() => handleEventChoice(choice.effectKey)}
                      >
                        <Text style={styles.choiceText}>{choice.text}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Button
                    title="[ OK ]"
                    onPress={dismissEvent}
                    variant="primary"
                    size="medium"
                    style={styles.okButton}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  panelTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusItem: {
    width: '50%',
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statusValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  pumpPanel: {
    borderColor: colors.accent,
  },
  pumpStock: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
  },
  pumpInfo: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
  },
  warningPanel: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
  },
  tipPanel: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 255, 65, 0.05)',
  },
  tipTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  warningText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  navButton: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderDim,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.money,
  },
  progressText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  nextDayButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  eventType: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    marginBottom: spacing.xs,
  },
  eventTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  eventDescription: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  choicesContainer: {
    gap: spacing.sm,
  },
  choiceButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
  },
  choiceText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  okButton: {
    alignSelf: 'center',
  },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing, formatMoney, commonStyles } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { StockTicker } from '../components/StockTicker';
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

  const weeklyExpenses = useGameStore(s => s.weeklyExpenses());

  // Quick stats
  const trustingMarks = marks.filter(m => m.trust >= 3).length;
  const pumpStock = activePump ? stocks[activePump.stockKey] : null;

  return (
    <View style={styles.container}>
      <Header />
      <StockTicker />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

        {/* Active Operations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>// ACTIVE OPERATIONS</Text>

          {/* Active Pump Card */}
          {activePump && pumpStock ? (
            <View style={[styles.card, styles.pumpCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>PUMP IN PROGRESS</Text>
                <Text style={styles.pumpDays}>DAY {activePump.daysActive + 1}/7</Text>
              </View>
              <Text style={styles.pumpStockName}>{pumpStock.name} ({pumpStock.key})</Text>
              <View style={styles.pumpStats}>
                <Text style={styles.pumpStat}>Price: {formatMoney(pumpStock.price)}</Text>
                <Text style={styles.pumpStat}>Vol: {formatMoney(activePump.totalVolumePumped)}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyText}>NO ACTIVE PUMPS</Text>
              <Text style={styles.emptySubtext}>Start a pump in the Boiler Room</Text>
            </View>
          )}

          {/* Weekly Expenses Warning */}
          {day % 7 === 6 && weeklyExpenses > 0 && (
            <View style={[styles.card, styles.warningCard]}>
              <Text style={styles.warningTitle}>PAYMENT DUE TOMORROW</Text>
              <Text style={styles.warningAmount}>{formatMoney(weeklyExpenses)}</Text>
            </View>
          )}
        </View>

        {/* Office Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>// OFFICE STATUS</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>OFFICE</Text>
              <Text style={styles.statusValue}>{officeLevel.toUpperCase()}</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>STAFF</Text>
              <Text style={styles.statusValue}>{callers.length}</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>MARKS</Text>
              <Text style={styles.statusValue}>{marks.length}</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>TRUSTING</Text>
              <Text style={styles.statusValue}>{trustingMarks}</Text>
            </View>
          </View>
        </View>

        {/* Command Deck */}
        <View style={styles.commandDeck}>
          <Text style={styles.sectionTitle}>// COMMAND DECK</Text>
          <View style={styles.commandGrid}>
            <Button
              title=">>> TRADE STOCKS"
              onPress={() => navigation.navigate('Trade')}
              variant="primary"
              size="large"
              style={styles.commandButton}
            />
            <Button
              title=">>> BOILER ROOM"
              onPress={() => navigation.navigate('Boiler')}
              variant="secondary"
              size="large"
              style={styles.commandButton}
            />
            <Button
              title=">>> PROTECTION"
              onPress={() => navigation.navigate('Protection')}
              variant="danger"
              size="large"
              style={styles.commandButton}
            />
          </View>
        </View>

      </ScrollView>

      {/* Footer / Next Day */}
      <View style={styles.footer}>
        <Button
          title="END DAY >>"
          onPress={advanceDay}
          variant="secondary"
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
                <View style={styles.modalHeader}>
                  <Text style={styles.eventType}>{currentEvent.type}</Text>
                </View>
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
                    title="ACKNOWLEDGE"
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
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for footer
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  card: {
    ...commonStyles.box,
    marginBottom: spacing.sm,
  },
  pumpCard: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceHighlight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.accent,
  },
  pumpDays: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  pumpStockName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pumpStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pumpStat: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  emptyCard: {
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    opacity: 0.7,
  },
  emptyText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.textDim,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  warningCard: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(255, 221, 0, 0.1)',
    alignItems: 'center',
  },
  warningTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  warningAmount: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.warning,
    fontWeight: 'bold',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusCard: {
    ...commonStyles.box,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statusLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  commandDeck: {
    marginTop: spacing.md,
  },
  commandGrid: {
    gap: spacing.md,
  },
  commandButton: {
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextDayButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    ...commonStyles.box,
    borderColor: colors.primary,
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: colors.primaryDim,
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eventType: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  eventDescription: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  choicesContainer: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  choiceButton: {
    ...commonStyles.interactiveBox,
    alignItems: 'center',
  },
  choiceText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  okButton: {
    margin: spacing.md,
  },
});

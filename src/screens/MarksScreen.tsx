import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing, formatMoney, commonStyles } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/types';
import { Mark, StockState } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Marks'>;
};

const TRUST_LABELS = ['', 'NEW', 'WARM', 'READY', 'LOYAL', 'WHALE'];
const TRUST_COLORS = ['', colors.textMuted, colors.text, colors.primary, colors.trust, colors.accent];

export const MarksScreen: React.FC<Props> = ({ navigation }) => {
  const { marks, stocks, sellToMark, activePump } = useGameStore();
  const [selectedMark, setSelectedMark] = useState<Mark | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);

  const blueChips = Object.values(stocks).filter(s => s && s.isBlueChip);
  const pennyStocks = Object.values(stocks).filter(s => s && !s.isBlueChip);

  const getMarkInvestmentCapacity = (mark: Mark) => {
    // Marks invest based on trust level
    const percentages = [0, 0.05, 0.10, 0.15, 0.25, 0.50];
    return Math.floor(mark.netWorth * percentages[mark.trust]);
  };

  const handleSellStock = (stock: StockState) => {
    if (!selectedMark) return;

    const amount = getMarkInvestmentCapacity(selectedMark);
    const shares = Math.floor(amount / stock.price);

    if (shares > 0) {
      sellToMark(selectedMark.id, stock.key, shares);
      setShowSellModal(false);
      setSelectedMark(null);
    }
  };

  const canSellPennyStock = (mark: Mark) => mark.trust >= 3;

  const renderMark = (mark: Mark) => {
    const capacity = getMarkInvestmentCapacity(mark);
    const holdingsValue = Object.entries(mark.holdings).reduce((sum, [key, shares]) => {
      const stock = stocks[key];
      return sum + (stock ? shares * stock.price : 0);
    }, 0);

    return (
      <TouchableOpacity
        key={mark.id}
        style={styles.markCard}
        onPress={() => {
          setSelectedMark(mark);
          setShowSellModal(true);
        }}
      >
        <View style={styles.markHeader}>
          <Text style={styles.markName}>{mark.name}</Text>
          <View style={[styles.trustBadge, { borderColor: TRUST_COLORS[mark.trust] }]}>
            <Text style={[styles.trustText, { color: TRUST_COLORS[mark.trust] }]}>
              {TRUST_LABELS[mark.trust]}
            </Text>
          </View>
        </View>

        <View style={styles.markStats}>
          <View style={styles.markStat}>
            <Text style={styles.statLabel}>NET WORTH</Text>
            <Text style={styles.statValue}>{formatMoney(mark.netWorth)}</Text>
          </View>
          <View style={styles.markStat}>
            <Text style={styles.statLabel}>INVESTED</Text>
            <Text style={styles.statValue}>{formatMoney(holdingsValue)}</Text>
          </View>
          <View style={styles.markStat}>
            <Text style={styles.statLabel}>CAPACITY</Text>
            <Text style={[styles.statValue, styles.capacityValue]}>{formatMoney(capacity)}</Text>
          </View>
        </View>

        {Object.keys(mark.holdings).length > 0 && (
          <View style={styles.holdingsList}>
            <Text style={styles.holdingsLabel}>HOLDINGS:</Text>
            {Object.entries(mark.holdings).map(([key, shares]) => {
              const stock = stocks[key];
              if (!stock) return null;
              return (
                <Text key={key} style={styles.holdingItem}>
                  {key}: {shares} shares @ {formatMoney(stock.price)}
                </Text>
              );
            })}
          </View>
        )}

        <Text style={styles.tapHint}>TAP TO SELL STOCKS</Text>
      </TouchableOpacity>
    );
  };

  const renderStockOption = (stock: StockState, isPenny: boolean) => {
    if (!selectedMark) return null;

    const disabled = isPenny && !canSellPennyStock(selectedMark);
    const amount = getMarkInvestmentCapacity(selectedMark);
    const shares = Math.floor(amount / stock.price);
    const isPumpTarget = activePump?.stockKey === stock.key;

    return (
      <TouchableOpacity
        key={stock.key}
        style={[
          styles.stockOption,
          disabled && styles.stockOptionDisabled,
          isPumpTarget && styles.stockOptionPump,
        ]}
        onPress={() => !disabled && handleSellStock(stock)}
        disabled={disabled}
      >
        <View style={styles.stockHeader}>
          <Text style={[styles.stockName, disabled && styles.stockNameDisabled]}>
            {stock.key}
          </Text>
          {isPumpTarget && <Text style={styles.pumpBadge}>PUMPING</Text>}
        </View>
        <Text style={[styles.stockPrice, disabled && styles.stockPriceDisabled]}>
          {formatMoney(stock.price)}
        </Text>
        {!disabled && (
          <Text style={styles.stockShares}>
            Will buy: {shares} shares ({formatMoney(shares * stock.price)})
          </Text>
        )}
        {disabled && (
          <Text style={styles.needTrust}>Need Trust 3+</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Sort marks by trust level (highest first)
  const sortedMarks = [...marks].sort((a, b) => b.trust - a.trust);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>// HOW TO BUILD TRUST</Text>
          <Text style={styles.infoText}>
            {'>'} Sell BLUE CHIPS to new marks (trust 1-2){'\n'}
            {'>'} When their stocks go UP, trust increases{'\n'}
            {'>'} Trust 3+ marks will buy PENNY STOCKS{'\n'}
            {'>'} Start a PUMP and they'll drive up the price{'\n'}
            {'>'} DUMP before the crash - they lose, you win
          </Text>
        </View>

        {/* Marks List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            // YOUR MARKS ({marks.length})
          </Text>

          {marks.length === 0 ? (
            <Text style={styles.noMarks}>
              No marks yet. Advance days to acquire marks through cold calling.
            </Text>
          ) : (
            sortedMarks.map(renderMark)
          )}
        </View>
      </ScrollView>

      {/* Sell Modal */}
      <Modal
        visible={showSellModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSellModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMark && (
              <>
                <Text style={styles.modalTitle}>
                  SELL TO {selectedMark.name.toUpperCase()}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Trust: {TRUST_LABELS[selectedMark.trust]} |
                  Capacity: {formatMoney(getMarkInvestmentCapacity(selectedMark))}
                </Text>

                <Text style={styles.stockSectionTitle}>BLUE CHIPS (Safe)</Text>
                <View style={styles.stockGrid}>
                  {blueChips.map(s => renderStockOption(s, false))}
                </View>

                <Text style={styles.stockSectionTitle}>PENNY STOCKS (Risky)</Text>
                <View style={styles.stockGrid}>
                  {pennyStocks.map(s => renderStockOption(s, true))}
                </View>

                <Button
                  title="CANCEL"
                  onPress={() => {
                    setShowSellModal(false);
                    setSelectedMark(null);
                  }}
                  variant="secondary"
                  size="medium"
                  style={styles.cancelButton}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

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
  infoBox: {
    ...commonStyles.box,
    borderColor: colors.primaryDim,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },
  noMarks: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.lg,
  },
  markCard: {
    ...commonStyles.box,
    marginBottom: spacing.sm,
  },
  markHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  markName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  trustBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  trustText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
  },
  markStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  markStat: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  statValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  capacityValue: {
    color: colors.primary,
  },
  holdingsList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  holdingsLabel: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  holdingItem: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.money,
  },
  tapHint: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    ...commonStyles.box,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stockSectionTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stockOption: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: spacing.sm,
    minWidth: 100,
    flex: 1,
  },
  stockOptionDisabled: {
    opacity: 0.4,
  },
  stockOptionPump: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(255, 176, 0, 0.1)',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
  },
  stockNameDisabled: {
    color: colors.textMuted,
  },
  pumpBadge: {
    fontFamily: fontFamily.mono,
    fontSize: 8,
    color: colors.accent,
    backgroundColor: 'rgba(255, 176, 0, 0.2)',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  stockPrice: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.money,
  },
  stockPriceDisabled: {
    color: colors.textMuted,
  },
  stockShares: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    color: colors.textDim,
    marginTop: 4,
  },
  needTrust: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    color: colors.danger,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
});

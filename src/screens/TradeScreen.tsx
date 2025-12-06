import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontFamily, spacing, formatMoney, formatPercent, formatPrice, commonStyles } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { StockTicker } from '../components/StockTicker';
import { RootStackParamList } from '../navigation/types';
import { StockState } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Trade'>;
};

export const TradeScreen: React.FC<Props> = ({ navigation }) => {
  const { stocks, portfolio, cash, buyStock, sellStock } = useGameStore();
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(100);

  const stockList = Object.values(stocks).filter(s => s != null);
  const pennyStocks = stockList.filter(s => !s.isBlueChip);
  const blueChips = stockList.filter(s => s.isBlueChip);

  const selected = selectedStock ? stocks[selectedStock] : null;
  const holding = selectedStock ? portfolio[selectedStock] : null;

  const getChange = (stock: StockState) => {
    if (stock.previousPrice === 0) return 0;
    return (stock.price - stock.previousPrice) / stock.previousPrice;
  };

  const handleBuy = () => {
    if (selected && quantity > 0) {
      buyStock(selected.key, quantity);
    }
  };

  const handleSell = () => {
    if (selected && quantity > 0) {
      sellStock(selected.key, quantity);
    }
  };

  const canBuy = selected && cash >= selected.price * quantity;
  const canSell = holding && holding.shares >= quantity;

  const renderStock = (stock: StockState) => {
    const change = getChange(stock);
    const isSelected = selectedStock === stock.key;
    const myHolding = portfolio[stock.key];

    return (
      <TouchableOpacity
        key={stock.key}
        style={[styles.stockRow, isSelected && styles.stockRowSelected]}
        onPress={() => setSelectedStock(stock.key)}
      >
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{stock.key}</Text>
          <Text style={styles.stockName}>{stock.name}</Text>
        </View>
        <View style={styles.stockPrice}>
          <Text style={styles.priceText}>{formatPrice(stock.price)}</Text>
          <Text style={[styles.changeText, change >= 0 ? styles.positive : styles.negative]}>
            {formatPercent(change)}
          </Text>
        </View>
        {myHolding && (
          <Text style={styles.holdingText}>{myHolding.shares}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <StockTicker />

      <ScrollView style={styles.content}>
        {/* Penny Stocks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>// PENNY STOCKS (Pumpable)</Text>
          {pennyStocks.map(renderStock)}
        </View>

        {/* Blue Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>// BLUE CHIPS (Safe)</Text>
          {blueChips.map(renderStock)}
        </View>

        {/* Selected Stock Details */}
        {selected && (
          <View style={styles.tradePanel}>
            <Text style={styles.tradePanelTitle}>
              TRADE: {selected.name} ({selected.key})
            </Text>

            <View style={styles.tradeInfo}>
              <Text style={styles.tradeInfoText}>
                Price: {formatPrice(selected.price)}
              </Text>
              <Text style={styles.tradeInfoText}>
                Sector: {selected.sector.toUpperCase()}
              </Text>
              <Text style={styles.tradeInfoText}>
                Volatility: {selected.volatility.toUpperCase()}
              </Text>
              {holding && (
                <>
                  <Text style={styles.tradeInfoText}>
                    You own: {holding.shares} @ avg {formatPrice(holding.avgCost)}
                  </Text>
                  <Text style={[
                    styles.tradeInfoText,
                    holding.avgCost < selected.price ? styles.positive : styles.negative
                  ]}>
                    P/L: {formatMoney((selected.price - holding.avgCost) * holding.shares)}
                  </Text>
                </>
              )}
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>QTY:</Text>
              <Button
                title="-100"
                onPress={() => setQuantity(Math.max(100, quantity - 100))}
                variant="ghost"
                size="small"
              />
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Button
                title="+100"
                onPress={() => setQuantity(quantity + 100)}
                variant="ghost"
                size="small"
              />
              <Button
                title="MAX"
                onPress={() => {
                  if (selected) {
                    setQuantity(Math.floor(cash / selected.price));
                  }
                }}
                variant="ghost"
                size="small"
              />
            </View>

            <Text style={styles.totalText}>
              Total: {formatMoney(selected.price * quantity)}
            </Text>

            {/* Buy/Sell Buttons */}
            <View style={styles.tradeButtons}>
              <Button
                title="[ BUY ]"
                onPress={handleBuy}
                variant="primary"
                size="large"
                disabled={!canBuy}
                style={styles.tradeButton}
              />
              <Button
                title="[ SELL ]"
                onPress={handleSell}
                variant="danger"
                size="large"
                disabled={!canSell}
                style={styles.tradeButton}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Back Button */}
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },
  stockRow: {
    ...commonStyles.interactiveBox,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    backgroundColor: colors.surface, // Override interactive highlight unless selected
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  stockRowSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.accent,
    transform: [{ scale: 1.02 }], // Subtle pop
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: 'bold',
  },
  stockName: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  stockPrice: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  priceText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    color: colors.money,
  },
  changeText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
  },
  positive: {
    color: colors.primary,
  },
  negative: {
    color: colors.danger,
  },
  holdingText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.accent,
    width: 50,
    textAlign: 'right',
  },
  tradePanel: {
    ...commonStyles.box,
    borderColor: colors.accent,
    marginBottom: spacing.md,
  },
  tradePanelTitle: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.accent,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDim,
    paddingBottom: spacing.xs,
  },
  tradeInfo: {
    marginBottom: spacing.md,
  },
  tradeInfoText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 4,
  },
  quantityLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.textDim,
    marginRight: spacing.sm,
  },
  quantityValue: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 60,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  totalText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    color: colors.money,
    marginBottom: spacing.md,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tradeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tradeButton: {
    flex: 1,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});

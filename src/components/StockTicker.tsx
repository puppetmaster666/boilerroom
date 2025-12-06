import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, fontSize, fontFamily, spacing } from '../theme/terminal';
import { useGameStore } from '../store/gameStore';

const { width } = Dimensions.get('window');

export const StockTicker: React.FC = () => {
  const stocks = useGameStore(s => s.stocks);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const stockList = Object.values(stocks).filter(s => s != null);

  // Calculate content width (approximate)
  const contentWidth = stockList.length * 140;

  useEffect(() => {
    const animate = () => {
      scrollAnim.setValue(width);
      Animated.timing(scrollAnim, {
        toValue: -contentWidth,
        duration: stockList.length * 3000, // 3 seconds per stock
        useNativeDriver: true,
      }).start(() => animate());
    };

    animate();

    return () => scrollAnim.stopAnimation();
  }, [stockList.length]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.tickerContent,
          { transform: [{ translateX: scrollAnim }] }
        ]}
      >
        {stockList.map(stock => {
          const change = stock.price - stock.previousPrice;
          const changePercent = (change / stock.previousPrice) * 100;
          const isUp = change >= 0;

          return (
            <View key={stock.key} style={styles.stockItem}>
              <Text style={styles.stockSymbol}>{stock.key}</Text>
              <Text style={styles.stockPrice}>${stock.price.toFixed(2)}</Text>
              <Text style={[styles.stockChange, isUp ? styles.up : styles.down]}>
                {isUp ? '▲' : '▼'}{Math.abs(changePercent).toFixed(1)}%
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 28,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderDim,
    overflow: 'hidden',
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
    gap: spacing.xs,
  },
  stockSymbol: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: 'bold',
  },
  stockPrice: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  stockChange: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
  },
  up: {
    color: colors.primary,
  },
  down: {
    color: colors.danger,
  },
});

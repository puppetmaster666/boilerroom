import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const ScanlineOverlay: React.FC = () => {
  // Create scanlines every 2 pixels
  const lines = Math.ceil(height / 3);

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={styles.scanline} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    opacity: 0.03, // Very subtle
  },
  scanline: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 2,
  },
});

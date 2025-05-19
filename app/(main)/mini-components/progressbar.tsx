import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ progress, backgroundColor, progressBarColor }: { progress: number, backgroundColor: string, progressBarColor: string }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={[styles.progressBar, {backgroundColor: progressBarColor}, { width: `${clampedProgress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 5,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
  },
});

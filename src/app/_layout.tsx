import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Slot } from 'expo-router';
import { AppProvider } from '@/context/AppContext';
import { ClayHeader } from '@/components/clay/ClayHeader';
import { ClayTabBar } from '@/components/clay/ClayTabBar';
import { ClayColors } from '@/constants/clayTheme';

export default function RootLayout() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.appContainer}>
          <ClayHeader />
          <View style={styles.contentContainer}>
            <Slot />
          </View>
          <ClayTabBar />
        </View>
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appContainer: {
    flex: 1,
    backgroundColor: ClayColors.background,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 84 : 72,
  },
});

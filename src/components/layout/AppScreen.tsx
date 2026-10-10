import React, {ReactNode} from 'react';
import {
  StatusBar,
  StatusBarStyle,
  StyleSheet,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

interface AppScreenProps {
  children: ReactNode;

  backgroundColor?: string;

  barStyle?: StatusBarStyle;
}

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  backgroundColor = '#F8F9FB',
  barStyle = 'dark-content',
}) => {
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={barStyle}
      />

      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor,
          },
        ]}>
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </>
  );
};

export default AppScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});

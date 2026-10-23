import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface AppLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const AppLogo = ({
  size = 120,
  style,
}: AppLogoProps) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default AppLogo;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
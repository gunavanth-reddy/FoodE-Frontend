import React from 'react';
import {Text, TextProps, StyleSheet} from 'react-native';
import Colors from '../../constants/colors';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

const AppText = ({children, style, ...props}: AppTextProps) => {
  return (
    <Text {...props} style={[styles.text, style]}>
      {children}
    </Text>
  );
};

export default AppText;

const styles = StyleSheet.create({
  text: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
});

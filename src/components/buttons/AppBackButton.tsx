import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {ArrowLeft} from 'phosphor-react-native';
import {useNavigation} from '@react-navigation/native';

interface AppBackButtonProps extends TouchableOpacityProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const AppBackButton: React.FC<AppBackButtonProps> = ({
  onPress,
  color = '#1E232C',
  size = 20,
  style,
  ...rest
}) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Go back"
      activeOpacity={0.75}
      onPress={handlePress}
      style={[styles.button, style]}
      {...rest}>
      <ArrowLeft size={size} color={color} weight="bold" />
    </TouchableOpacity>
  );
};

export default AppBackButton;

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
});

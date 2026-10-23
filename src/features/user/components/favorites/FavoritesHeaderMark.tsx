import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Heart} from 'phosphor-react-native';

interface FavoritesHeaderMarkProps {
  size?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

const FavoritesHeaderMark: React.FC<FavoritesHeaderMarkProps> = ({
  size = 27,
  containerStyle,
}) => (
  <View style={[styles.container, containerStyle]}>
    <Heart size={size} color="#FF7A00" weight="fill" />
  </View>
);

export default FavoritesHeaderMark;

const styles = StyleSheet.create({
  container: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

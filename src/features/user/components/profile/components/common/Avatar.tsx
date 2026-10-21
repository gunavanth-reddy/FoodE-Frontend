import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {User} from 'phosphor-react-native';
import {COLORS} from '../../styles';

interface Props {
  uri?: string;
  size?: number;
}

const Avatar = ({uri, size = 72}: Props) => (
  <View style={[
    styles.container,
    {width: size, height: size, borderRadius: size / 2},
  ]}>
    {uri ? (
      <Image
        source={{uri, cache: 'force-cache'}}
        style={{width: size, height: size, borderRadius: size / 2}}
        resizeMode="cover"
      />
    ) : (
      <View style={[
        styles.placeholder,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
        <User size={size * 0.58} color={COLORS.primary} weight="fill" />
      </View>
    )}
  </View>
);

export default Avatar;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFE4D2',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF5200',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  placeholder: {
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

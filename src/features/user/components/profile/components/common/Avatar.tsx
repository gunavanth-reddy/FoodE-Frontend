import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {UserCircle} from 'phosphor-react-native';
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
        <UserCircle size={size * 0.78} color={COLORS.primary} weight="fill" />
      </View>
    )}
  </View>
);

export default Avatar;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFB36F',
    backgroundColor: '#FFF0E3',
  },
  placeholder: {
    backgroundColor: '#FFF0E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

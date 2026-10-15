import React from 'react';

import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';

interface BannerCardProps {
  image: ImageSourcePropType;
  width: number;
  onPress?: () => void;
}

const BannerCard = ({
  image,
  width,
  onPress,
}: BannerCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={[styles.wrapper, {width}]}
      onPress={onPress}>

      <View style={[styles.card, {width: Math.max(width - 28, 0)}]}>

        <Image
          source={image}
          resizeMode="cover"
          style={styles.image}
        />

      </View>

    </TouchableOpacity>
  );
};

export default BannerCard;

const styles = StyleSheet.create({

  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',

    marginVertical: 8,
  },

  card: {
    maxWidth: 640,

    height: 174,

    borderRadius: 24,

    overflow: 'hidden',

    backgroundColor:
      '#F3F3F3',

    shadowColor: '#000',

    shadowOpacity: 0.10,

    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  image: {
    width: '100%',
    height: '100%',
  },

});

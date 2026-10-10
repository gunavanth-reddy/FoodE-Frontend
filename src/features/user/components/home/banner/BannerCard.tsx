import React from 'react';

import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';

const {width} =
  Dimensions.get('window');

interface BannerCardProps {
  image: ImageSourcePropType;
  onPress?: () => void;
}

const BannerCard = ({
  image,
  onPress,
}: BannerCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.wrapper}
      onPress={onPress}>

      <View style={styles.card}>

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
    width: width,

    justifyContent: 'center',
    alignItems: 'center',

    marginVertical: 8,
  },

  card: {
    width: width - 28,

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

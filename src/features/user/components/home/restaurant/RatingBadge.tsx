import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Star} from 'phosphor-react-native';

interface RatingBadgeProps {
  rating: number;
}

const RatingBadge: React.FC<RatingBadgeProps> = ({rating}) => {
  return (
    <View style={styles.container}>
      <Star
        weight="fill"
        size={11}
        color="#FFFFFF"
      />
      <Text style={styles.rating}>{rating.toFixed(1)}</Text>
    </View>
  );
};

export default RatingBadge;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  rating: {
    marginLeft: 5,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

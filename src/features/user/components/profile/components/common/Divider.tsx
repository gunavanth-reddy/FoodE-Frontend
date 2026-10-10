import React from 'react';
import {StyleSheet, View} from 'react-native';

import {COLORS} from '../../styles';

const Divider = () => <View style={styles.divider} />;

export default Divider;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
});

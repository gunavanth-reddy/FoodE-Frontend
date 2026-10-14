import React from 'react';
import {CaretRight} from 'phosphor-react-native';
import {COLORS} from '../../styles';

const Chevron = () => (
  <CaretRight
    size={20}
    color={COLORS.textSecondary}
    weight="bold"
  />
);

export default Chevron;

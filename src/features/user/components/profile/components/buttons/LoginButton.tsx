import React from 'react';
import PrimaryButton from './PrimaryButton';

interface Props {
  onPress: () => void;
}

const LoginButton = ({onPress}: Props) => {
  return (
    <PrimaryButton
      title="Login / Register"
      onPress={onPress}
    />
  );
};

export default LoginButton;

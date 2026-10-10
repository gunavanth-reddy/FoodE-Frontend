import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

import {Colors} from '../../theme';

import AppLogo from '../common/AppLogo';

interface LoaderProps {
  text?: string;
}

const Loader = ({
  text = 'Loading...',
}: LoaderProps) => {
  return (
    <View style={styles.container}>

      <AppLogo />

      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={styles.loader}
      />

      <Text style={styles.text}>
        {text}
      </Text>

    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({

  container:{
    flex:1,

    justifyContent:'center',

    alignItems:'center',

    backgroundColor:Colors.white,
  },

  loader:{
    marginTop:20,
  },

  text:{
    marginTop:12,

    fontSize:16,

    color:Colors.textSecondary,
  },

});

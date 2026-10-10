import {StyleSheet} from 'react-native';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../theme';

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:Colors.background,
  },

  scroll:{
    flexGrow:1,
    padding:Spacing.lg,
    justifyContent:'center',
  },

  header:{
    alignItems:'center',
    marginVertical:30,
  },

  title:{
    fontSize:Typography.h2,
    fontWeight:'700',
    color:Colors.textPrimary,
  },

  subtitle:{
    marginTop:8,
    color:Colors.textSecondary,
    textAlign:'center',
  },

  loginButton:{
    alignItems:'center',
    marginTop:30,
  },

  loginText:{
    color:Colors.primary,
    fontWeight:'700',
  },

});

export default styles;

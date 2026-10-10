import {StyleSheet} from 'react-native';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scroll: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },

  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },

  title: {
    fontSize: Typography.h2,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    color: Colors.textSecondary,
  },

  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },

  forgotText: {
    color: Colors.primary,
    fontWeight: '600',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },

  orText: {
    marginHorizontal: 12,
    color: Colors.textSecondary,
  },

  registerButton: {
    alignItems: 'center',
  },

  registerText: {
    color: Colors.primary,
    fontWeight: '700',
  },

  partnerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },

  partnerTitle: {
    color: Colors.textSecondary,
  },

  partnerLink: {
    color: Colors.primary,
    marginTop: 5,
    fontWeight: '700',
  },

  version: {
    marginTop: 50,
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: Typography.caption,
  },
});

export default styles;

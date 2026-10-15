import {StyleSheet} from 'react-native';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../styles';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },

  logoutContainer: {
    width: '100%',

    marginBottom: SPACING.sm,
  },

  copyright: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    ...TYPOGRAPHY.caption,
  },
});

import {StyleSheet} from 'react-native';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../styles';

export default StyleSheet.create({
  container: {
    alignItems: 'center',

    marginTop: SPACING.xxl,

    paddingBottom: SPACING.xxxl,
  },

  logoutContainer: {
    width: '100%',

    marginBottom: SPACING.md,
  },

  version: {
    color: COLORS.textSecondary,

    marginTop: SPACING.md,

    textAlign: 'center',

    ...TYPOGRAPHY.caption,
  },

  copyright: {
    color: COLORS.textLight,

    marginTop: SPACING.sm,

    textAlign: 'center',

    ...TYPOGRAPHY.caption,
  },
});

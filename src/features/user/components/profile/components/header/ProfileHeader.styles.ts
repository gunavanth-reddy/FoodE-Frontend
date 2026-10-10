import {StyleSheet} from 'react-native';
import {COLORS, SPACING, TYPOGRAPHY} from '../../styles';

export default StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.sm, paddingTop: SPACING.xs,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  textContainer: {flex: 1, marginRight: SPACING.md},
  title: {color: COLORS.textPrimary, ...TYPOGRAPHY.h1},
  subtitle: {marginTop: 3, color: COLORS.textSecondary, ...TYPOGRAPHY.body},
  notificationButton: {
    width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFD0A8',
  },
  badge: {
    position: 'absolute', top: 7, right: 7, width: 9, height: 9,
    borderRadius: 5, backgroundColor: COLORS.primary, borderWidth: 1.5, borderColor: COLORS.surface,
  },
});

import {StyleSheet} from 'react-native';
import {COLORS, SHADOWS, SPACING, TYPOGRAPHY} from '../../styles';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    ...SHADOWS.card,
  },
  avatarContainer: {marginBottom: 10},
  name: {color: COLORS.textPrimary, textAlign: 'center', ...TYPOGRAPHY.h2},
  email: {color: COLORS.textSecondary, marginTop: 5, textAlign: 'center', ...TYPOGRAPHY.body},
  badgeContainer: {marginTop: 10},
  divider: {height: 1, width: '100%', backgroundColor: COLORS.divider, marginVertical: 14},
  statsRow: {width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  stat: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  statValue: {color: COLORS.textPrimary, ...TYPOGRAPHY.h2},
  statLabel: {color: COLORS.textSecondary, marginTop: 4, textAlign: 'center', ...TYPOGRAPHY.caption},
  statDivider: {width: 1, height: 30, backgroundColor: COLORS.divider},
  editProfileButton: {
    width: '100%', minHeight: 48, marginTop: 14, borderRadius: 14,
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.sm,
  },
  editProfileButtonText: {color: '#FFFFFF', ...TYPOGRAPHY.button},
});

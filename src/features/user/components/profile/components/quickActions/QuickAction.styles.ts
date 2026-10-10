import {StyleSheet} from 'react-native';
import {COLORS, SHADOWS, SPACING, TYPOGRAPHY} from '../../styles';

export default StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    marginTop: SPACING.sm, marginBottom: SPACING.xs,
  },
  card: {
    width: '48.2%', minHeight: 124, backgroundColor: '#FFFFFF',
    borderRadius: 18, paddingVertical: 13, paddingHorizontal: SPACING.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: '#FFD7B6', borderBottomWidth: 3,
    borderBottomColor: '#FFB36F', ...SHADOWS.card,
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF0E3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 9,
  },
  title: {color: COLORS.textPrimary, textAlign: 'center', ...TYPOGRAPHY.title},
  subtitle: {color: COLORS.primaryDark, textAlign: 'center', marginTop: 4, ...TYPOGRAPHY.caption},
});

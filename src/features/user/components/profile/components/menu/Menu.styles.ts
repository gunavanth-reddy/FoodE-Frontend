import {StyleSheet} from 'react-native';
import {COLORS, SHADOWS, SPACING, TYPOGRAPHY} from '../../styles';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface, borderRadius: 20, overflow: 'hidden',
    marginBottom: SPACING.md, borderWidth: 1, borderColor: '#FFD7B6',
    borderTopWidth: 2, borderTopColor: '#FF9A43', ...SHADOWS.card,
  },
  itemContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 12, minHeight: 68,
  },
  leftContainer: {flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm},
  iconContainer: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF0E3',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  textContainer: {flex: 1},
  title: {color: COLORS.textPrimary, ...TYPOGRAPHY.title},
  subtitle: {color: COLORS.textSecondary, marginTop: 3, ...TYPOGRAPHY.caption},
  arrowContainer: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF0E3',
    justifyContent: 'center', alignItems: 'center',
  },
});

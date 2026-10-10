import {StyleSheet} from 'react-native';

const ORANGE = '#F47721';
const INACTIVE = '#7A8490';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'visible',
    zIndex: 100,
    elevation: 10,
  },

  bar: {
    width: '100%',
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0E6DF',
    shadowColor: '#24170F',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },

  tabButton: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconHolder: {
    width: 36,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconHolder: {
    backgroundColor: '#FFF0E5',
  },

  cartContent: {
    marginTop: -16,
  },

  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ORANGE,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 7,
  },

  label: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '600',
    color: INACTIVE,
    textAlign: 'center',
  },

  activeLabel: {
    color: ORANGE,
    fontWeight: '700',
  },

  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ORANGE,
    marginTop: 2,
  },
});

export default styles;

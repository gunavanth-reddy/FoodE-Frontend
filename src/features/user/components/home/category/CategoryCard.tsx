import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ArrowUpRight} from 'phosphor-react-native';

interface Props {
  item: {
    id: string;
    name: string;
    image: ImageSourcePropType;
  };
  selected: boolean;
  onPress: () => void;
}

const CategoryCard: React.FC<Props> = ({item, selected, onPress}) => {
  const isAll = item.id === 'all';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.container, pressed && styles.pressed]}>
      <View style={[styles.card, selected && styles.selectedCard, isAll && styles.allCard]}>
        <View style={[styles.glow, selected && styles.selectedGlow]} />

        <View style={[styles.imageShell, selected && styles.selectedImageShell, isAll && styles.allImageShell]}>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
          {isAll && (
            <View style={styles.arrowBadge}>
              <ArrowUpRight size={11} color="#FFFFFF" weight="bold" />
            </View>
          )}
        </View>

        <View style={styles.textArea}>
          <Text numberOfLines={1} style={[styles.title, selected && styles.selectedTitle]}>
            {item.name}
          </Text>
          <View style={[styles.activeLine, selected && styles.activeLineVisible]} />
        </View>
      </View>
    </Pressable>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    width: 88,
    marginRight: 10,
  },
  pressed: {
    transform: [{scale: 0.96}],
    opacity: 0.9,
  },
  card: {
    height: 108,
    borderRadius: 22,
    paddingTop: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#F0F1F3',
    shadowColor: '#111111',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  selectedCard: {
    backgroundColor: '#FFF7EF',
    borderColor: '#FF7A00',
    borderWidth: 1.5,
    shadowColor: '#FF7A00',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  allCard: {
    backgroundColor: '#FFF1E4',
    borderColor: '#FF7A00',
  },
  glow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    top: -24,
    right: -18,
    backgroundColor: '#FFF1E4',
  },
  selectedGlow: {
    backgroundColor: '#FFE0C2',
  },
  imageShell: {
    width: 57,
    height: 57,
    borderRadius: 19,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7F0',
    borderWidth: 1,
    borderColor: '#FFE9D5',
  },
  selectedImageShell: {
    backgroundColor: '#FFFCF8',
    borderColor: '#FFD5B2',
  },
  allImageShell: {
    backgroundColor: '#25252A',
    borderColor: '#3A3A41',
  },
  image: {
    width: 42,
    height: 42,
  },
  arrowBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#25252A',
  },
  textArea: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 7,
  },
  title: {
    maxWidth: 78,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '800',
    color: '#34373D',
    textAlign: 'center',
  },
  selectedTitle: {
    color: '#FF7A00',
  },
  activeLine: {
    width: 0,
    height: 2.5,
    borderRadius: 2,
    marginTop: 4,
    backgroundColor: '#FF7A00',
  },
  activeLineVisible: {
    width: 18,
  },
});

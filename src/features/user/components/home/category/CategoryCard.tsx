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

const CategoryCard: React.FC<Props> = ({
  item,
  selected,
  onPress,
}) => {
  const isAll = item.id === 'all';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name} category`}
      accessibilityState={{selected}}
      onPress={onPress}
      style={({pressed}) => [
        styles.container,
        pressed && styles.pressed,
      ]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />

          {isAll && (
            <View style={styles.arrowBadge}>
              <ArrowUpRight
                size={13}
                color="#FFFFFF"
                weight="bold"
              />
            </View>
          )}
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.title,
            selected && styles.selectedTitle,
          ]}>
          {item.name}
        </Text>

        <View
          style={[
            styles.activeLine,
            selected && styles.activeLineVisible,
          ]}
        />
      </View>
    </Pressable>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    width: 74,
    marginRight: 9,
    alignItems: 'center',
  },

  pressed: {
    transform: [{scale: 0.96}],
    opacity: 0.85,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  imageContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  arrowBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    maxWidth: 74,
    marginTop: 5,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#38332F',
    textAlign: 'center',
  },

  selectedTitle: {
    color: '#FF6B00',
    fontWeight: '800',
  },

  activeLine: {
    width: 0,
    height: 2,
    borderRadius: 2,
    marginTop: 3,
    backgroundColor: '#FF6B00',
  },

  activeLineVisible: {
    width: 18,
  },
});
import React, {useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CaretRight, SquaresFour} from 'phosphor-react-native';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../../../navigation/AppNavigator';
import CategoryCard from './CategoryCard';
import {categories} from './categoryData';

type CategoryNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

const CategorySection: React.FC = () => {
  const navigation = useNavigation<CategoryNavigationProp>();
  const [selected, setSelected] = useState(categories[0]?.id ?? '');

  const handleCategoryPress = (item: (typeof categories)[number]) => {
    setSelected(item.id);

    if (item.id === 'all') {
      navigation.navigate('AllCategories');
      return;
    }

    navigation.navigate('CategoryFoods', {
      categoryName: item.name,
    });
  };

  const handleSeeAllPress = () => {
    navigation.navigate('AllCategories');
  };

  return (
    <View style={styles.container}>
      {/* Section heading */}
      <View style={styles.headingRow}>
        <View style={styles.headingLeft}>
          <View style={styles.headingIcon}>
            <SquaresFour size={18} color="#FF6B00" weight="fill" />
          </View>

          <View style={styles.headingTextContainer}>
            <Text style={styles.title}>Explore categories</Text>
            <Text style={styles.subtitle}>
              Find something delicious today
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSeeAllPress}
          style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See all</Text>
          <CaretRight size={13} color="#FF6B00" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Horizontally scrolling categories */}
      <FlatList
        horizontal
        data={categories}
        renderItem={({item}) => (
          <CategoryCard
            item={item}
            selected={selected === item.id}
            onPress={() => handleCategoryPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        initialNumToRender={6}
        removeClippedSubviews={false}
      />
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 10,
  },

  headingRow: {
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headingIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFF0E4',
    borderWidth: 1,
    borderColor: '#FFE2CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headingTextContainer: {
    justifyContent: 'center',
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#211B17',
    letterSpacing: -0.45,
  },

  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#96908A',
    marginTop: 3,
    letterSpacing: 0.1,
  },

  list: {
    paddingHorizontal: 20,
    paddingRight: 24,
    paddingTop: 2,
    paddingBottom: 10,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFF2EA',
    gap: 3,
  },

  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B00',
  },
});

import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {ArrowRight, Sparkle} from 'phosphor-react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../../../navigation/AppNavigator';
import CategoryCard from './CategoryCard';
import {categories} from './categoryData';

type CategoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const CategorySection: React.FC = () => {
  const navigation = useNavigation<CategoryNavigationProp>();
  const [selected, setSelected] = useState(categories[0]?.id ?? '');

  const handleCategoryPress = (item: (typeof categories)[number]) => {
    setSelected(item.id);
    navigation.navigate('CategoryFoods', {
      categoryName: item.id === 'all' ? 'All' : item.name,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingLeft}>
          <View style={styles.headingIcon}>
            <Sparkle size={15} color="#FF7A00" weight="fill" />
          </View>
          <View>
            <Text style={styles.title}>Explore categories</Text>
            <Text style={styles.subtitle}>Pick a mood, find your food</Text>
          </View>
        </View>
        <View style={styles.scrollHint}>
          <ArrowRight size={15} color="#8A8F98" weight="bold" />
        </View>
      </View>

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
      />
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 7,
  },
  headingRow: {
    paddingHorizontal: 20,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#17171B',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8F98',
    marginTop: 2,
  },
  scrollHint: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#F4F5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingRight: 24,
    paddingTop: 1,
    paddingBottom: 7,
  },
});

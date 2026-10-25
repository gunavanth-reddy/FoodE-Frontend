import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  CaretRight,
  MagnifyingGlass,
  SquaresFour,
} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../navigation/AppNavigator';
import {categories} from '../components/home/category/categoryData';
import AppTextInput from '../../../components/inputs/AppTextInput';

const ORANGE = '#FF6B00';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AllCategories'
>;

const AllCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {width} = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter out the 'See All' card itself to show only actual food categories
  const actualCategories = useMemo(
    () => categories.filter(c => c.id !== 'all'),
    [],
  );

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return actualCategories;
    return actualCategories.filter(c =>
      c.name.toLowerCase().includes(q),
    );
  }, [actualCategories, searchQuery]);

  const numColumns = width >= 600 ? 3 : 2;
  const cardGap = 12;

  const handleSelectCategory = (categoryName: string) => {
    navigation.navigate('CategoryFoods', {
      categoryName,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor="#FF7A00"
        barStyle="light-content"
        hidden={false}
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppBackButton />

          <View>
            <Text style={styles.heading}>All Categories</Text>
            <Text style={styles.subheading}>
              Explore cuisines & food types
            </Text>
          </View>
        </View>

        <View style={styles.categoryCountBadge}>
          <Text style={styles.categoryCountText}>
            {actualCategories.length}
          </Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color="#8A92A0" weight="bold" />
          <AppTextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search categories (Biryani, Pizza, Momos...)"
            placeholderTextColor="#8A92A0"
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* CATEGORIES GRID */}
      <FlatList
        data={filteredCategories}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        key={`cols-${numColumns}`}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? {gap: cardGap} : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <SquaresFour size={36} color="#D1D5DB" weight="duotone" />
            <Text style={styles.emptyTitle}>No category found</Text>
            <Text style={styles.emptyText}>
              Try searching for something else like "Biryani" or "Desserts".
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            style={({pressed}) => [
              styles.categoryCard,
              pressed && styles.categoryCardPressed,
            ]}
            onPress={() => handleSelectCategory(item.name)}>
            <View style={styles.imageContainer}>
              <Image
                source={item.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.categoryName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.exploreRow}>
                <Text style={styles.exploreText}>View menu</Text>
                <CaretRight size={12} color={ORANGE} weight="bold" />
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

export default AllCategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E232C',
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: '#8A92A0',
    fontWeight: '500',
    marginTop: 2,
  },
  categoryCountBadge: {
    backgroundColor: '#FFF2E6',
    borderWidth: 1,
    borderColor: '#FFE0C2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryCountText: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E232C',
    fontWeight: '500',
    padding: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryCardPressed: {
    transform: [{scale: 0.97}],
    backgroundColor: '#FFFBF5',
    borderColor: '#FFD9B3',
  },
  imageContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryImage: {
    width: 52,
    height: 52,
  },
  cardInfo: {
    alignItems: 'center',
    width: '100%',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E232C',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  exploreText: {
    fontSize: 11,
    color: ORANGE,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

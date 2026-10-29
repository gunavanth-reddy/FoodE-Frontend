import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";
import {SafeAreaView} from 'react-native-safe-area-context';
import {MagnifyingGlass, Warning} from 'phosphor-react-native';
import {useNavigation} from '@react-navigation/native';
import AppBackButton from '../../../components/buttons/AppBackButton';

import RestaurantCard from '../components/home/restaurant/RestaurantCard';
import type {Restaurant as RestaurantCardData} from '../components/home/restaurant/restaurantData';
import {
  getRestaurants,
  type Restaurant as ApiRestaurant,
} from '../services/restaurantService';

const RestaurantsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollOffset = useRef(new Animated.Value(0)).current;

  const loadRestaurants = useCallback(async () => {
    try {
      setError(null);
      const results = await getRestaurants();
      const cards = results.map((restaurant: ApiRestaurant) => ({
        ...restaurant,
        image: restaurant.coverImage || restaurant.image || restaurant.logo || '',
        coverImage:
          restaurant.coverImage || restaurant.image || restaurant.logo || '',
        logo: restaurant.logo || '',
        cuisine: restaurant.cuisines || restaurant.cuisine || [],
        cuisines: restaurant.cuisines || restaurant.cuisine || [],
      }));
      setRestaurants(cards);
    } catch (loadError: unknown) {
      console.error('FoodE: Load restaurants error:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load restaurants.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const filteredRestaurants = useMemo(() => {
    const search = query.trim().toLowerCase();
    const sorted = [...restaurants].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0),
    );

    if (!search) {
      return sorted;
    }

    return sorted.filter(restaurant => {
      const cuisines = Array.isArray(restaurant.cuisines)
        ? restaurant.cuisines.join(' ')
        : restaurant.cuisines || '';

      return `${restaurant.name} ${cuisines}`
        .toLowerCase()
        .includes(search);
    });
  }, [query, restaurants]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRestaurants();
  }, [loadRestaurants]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        {navigation.canGoBack() && (
          <AppBackButton style={styles.backButton} />
        )}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>All Restaurants</Text>
          <Text style={styles.headerSubtitle}>
            {restaurants.length > 0
              ? `${restaurants.length} spots to satisfy your cravings`
              : 'Explore delicious food spots near you'}
          </Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <MagnifyingGlass size={19} color="#858B95" />
        <AppTextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search restaurants, cuisines..."
          placeholderTextColor="#858B95"
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search restaurants"
        />
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color="#F47721" />
          <Text style={styles.stateMessage}>Loading restaurants...</Text>
        </View>
      );
    }

    return (
      <View style={styles.state}>
        {error ? (
          <Warning size={30} color="#D92D20" />
        ) : (
          <MagnifyingGlass size={30} color="#F47721" />
        )}
        <Text style={styles.stateTitle}>
          {error ? 'Unable to load restaurants' : 'No restaurants found'}
        </Text>
        <Text style={styles.stateMessage}>
          {error || (query ? 'Try a different search.' : 'Restaurants will appear here when available.')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FFF9F4" barStyle="dark-content" />
      {renderHeader()}
      <FlatList
        data={filteredRestaurants}
        keyExtractor={item => item._id || item.id || item.name}
        renderItem={({item}) => (
          <RestaurantCard
            restaurant={item}
            onPress={restaurant =>
              navigation.navigate('RestaurantDetails', {restaurant})
            }
            scrollOffset={scrollOffset}
          />
        )}
        onScroll={event =>
          scrollOffset.setValue(event.nativeEvent.contentOffset.y)
        }
        scrollEventThrottle={16}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#F47721']}
            tintColor="#F47721"
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

export default RestaurantsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFF9F4',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#211A16',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#79716B',
    marginTop: 2,
    fontWeight: '500',
  },
  searchBox: {
    width: '100%',
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0E7DF',
  },
  searchInput: {
    flex: 1,
    color: '#201A16',
    fontSize: 14,
    paddingVertical: 0,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  state: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  stateTitle: {
    marginTop: 12,
    color: '#201A16',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateMessage: {
    marginTop: 8,
    color: '#858B95',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});

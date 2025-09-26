
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Restaurant } from '../lib/supabase';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import SupabaseNotice from '../components/SupabaseNotice';
import LoadingScreen from '../components/LoadingScreen';

// Mock data for restaurants (since we don't have Supabase set up yet)
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Spice Garden',
    tags: ['Indian', 'Curry', 'Vegetarian'],
    logo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop',
    min_order: 50,
    delivery_from: 30,
    eta: '25-35 min',
    available_in: ['Mtubatuba', 'St Lucia'],
  },
  {
    id: '2',
    name: 'Ocean Breeze Seafood',
    tags: ['Seafood', 'Fresh Fish', 'Prawns'],
    logo_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=200&h=200&fit=crop',
    min_order: 80,
    delivery_from: 45,
    eta: '30-40 min',
    available_in: ['St Lucia', 'Richards Bay'],
  },
  {
    id: '3',
    name: 'Mama\'s Kitchen',
    tags: ['Traditional', 'Home Cooking', 'African'],
    logo_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
    min_order: 40,
    delivery_from: 25,
    eta: '20-30 min',
    available_in: ['Empangeni', 'Richards Bay'],
  },
  {
    id: '4',
    name: 'Pizza Palace',
    tags: ['Pizza', 'Italian', 'Fast Food'],
    logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
    min_order: 60,
    delivery_from: 20,
    eta: '15-25 min',
    available_in: ['Mtubatuba', 'St Lucia', 'Empangeni', 'Richards Bay'],
  },
];

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [showSupabaseNotice, setShowSupabaseNotice] = useState(true);

  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    console.log('Home: Loading restaurants');

    try {
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');

      if (error) {
        console.log('Home: Supabase not configured, using mock data');
        // Use mock data if Supabase is not set up
        setRestaurants(mockRestaurants);
      } else {
        console.log('Home: Loaded restaurants from Supabase:', data?.length || 0);
        setRestaurants(data || []);
      }
    } catch (error) {
      console.log('Home: Error loading restaurants, using mock data:', error);
      setRestaurants(mockRestaurants);
    }

    setLoadingRestaurants(false);
  };

  // Move useEffect before any conditional returns
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Redirect to signin if not authenticated
  if (!loading && !user) {
    return <Redirect href="/signin" />;
  }

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderRestaurant = (restaurant: Restaurant) => (
    <Link href={`/restaurant/${restaurant.id}`} key={restaurant.id} asChild>
      <TouchableOpacity style={commonStyles.restaurantCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: restaurant.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop' }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              marginRight: 16,
            }}
          />
          
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '600', marginBottom: 4 }]}>
              {restaurant.name}
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
              {restaurant.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.backgroundAlt,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    marginRight: 6,
                    marginBottom: 2,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.textLight }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: colors.textLight }}>
                Min R{restaurant.min_order} • {restaurant.eta}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="location" size={14} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 4 }}>
                  {restaurant.available_in.join(', ')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.background,
      }}>
        <View>
          <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 4 }]}>
            LuciaFood Express
          </Text>
          <Text style={[commonStyles.text, { fontSize: 14, color: colors.textLight, marginBottom: 0 }]}>
            Delivering to Mtubatuba, St Lucia, Empangeni & Richards Bay
          </Text>
        </View>
        
        <Link href="/profile" asChild>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="person" size={20} color={colors.white} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.backgroundAlt,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <Icon name="search" size={20} color={colors.textLight} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: colors.text,
            }}
            placeholder="Search restaurants or cuisine..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Supabase Notice */}
      {showSupabaseNotice && (
        <SupabaseNotice onDismiss={() => setShowSupabaseNotice(false)} />
      )}

      {/* Restaurants List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loadingRestaurants ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[commonStyles.text, { marginTop: 16 }]}>Loading restaurants...</Text>
          </View>
        ) : filteredRestaurants.length > 0 ? (
          <>
            <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '600', marginBottom: 16 }]}>
              Available Restaurants ({filteredRestaurants.length})
            </Text>
            {filteredRestaurants.map(renderRestaurant)}
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Icon name="restaurant" size={60} color={colors.textLight} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              {searchQuery ? 'No restaurants found matching your search' : 'No restaurants available'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 16,
                }}
              >
                <Text style={{ color: colors.white, fontWeight: '600' }}>
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

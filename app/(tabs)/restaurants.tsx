
import React, { useState, useEffect, useCallback } from 'react';
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
import { router } from 'expo-router';
import { supabase, Restaurant, MenuItem, getRestaurantsByTag, getMenuItemsByCategory } from '../../lib/supabase';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

// Import restaurant logos including new ones - PEDROS INTEGRATION
const restaurantLogos = {
  'KFC': require('../../assets/images/ea004ca1-a296-4e39-984b-2089e42444f5.jpeg'),
  'Galito\'s Chicken': require('../../assets/images/f3b869c8-2861-4512-997d-1c12896caf88.jpeg'),
  'Nando\'s': require('../../assets/images/23f5887f-3eee-46c9-a4fe-38bc1310eb7a.jpeg'),
  'Spur': require('../../assets/images/a49cf35b-b89b-413e-8d90-f264b2fd9558.jpeg'),
  'Hungry Lion': require('../../assets/images/8af68d59-ba87-4566-9b1c-897d59d34f63.jpeg'),
  'Steers': require('../../assets/images/50beda68-6257-422c-94a0-312838d1cb22.jpeg'),
  'Pedros': require('../../assets/images/774fbac8-ee5d-4ba9-8de3-b634430b39e8.jpeg'),
};

interface MenuItemWithRestaurant extends MenuItem {
  restaurant: {
    name: string;
    tags?: string[];
  };
}

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // MENU FILTERING FEATURE: Add menu items state for filtering
  const [menuItems, setMenuItems] = useState<MenuItemWithRestaurant[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItemWithRestaurant[]>([]);
  const [showMenuItems, setShowMenuItems] = useState(false);

  // TAXONOMY FILTER IMPLEMENTATION: Filter by food categories/tags instead of restaurant names
  const foodCategories = [
    { key: 'all', label: 'All', icon: 'restaurant' },
    { key: 'Burgers', label: 'Burgers', icon: 'fast-food' },
    { key: 'Chicken', label: 'Chicken', icon: 'nutrition' },
    { key: 'Fast Food', label: 'Fast Food', icon: 'flash' },
    { key: 'Ribs', label: 'Ribs', icon: 'flame' },
    { key: 'Portuguese', label: 'Portuguese', icon: 'globe' },
    { key: 'Steakhouse', label: 'Steakhouse', icon: 'restaurant' }
  ];

  // CRITICAL FIX: Define filterRestaurants function BEFORE useEffect
  const filterRestaurants = useCallback(async () => {
    console.log('🔍 Filtering restaurants with query:', searchQuery, 'filter:', selectedFilter);
    
    try {
      let filtered = restaurants;

      // TAXONOMY FILTER: Filter by food categories/tags instead of restaurant name
      if (selectedFilter !== 'all') {
        console.log(`🏷️ Filtering by category: ${selectedFilter}`);
        
        // Use the new tag-based filtering
        const { data: tagFilteredRestaurants, error } = await getRestaurantsByTag(selectedFilter);
        
        if (error) {
          console.error('Error filtering by tag:', error);
          // Fallback to local filtering
          filtered = restaurants.filter(restaurant => 
            restaurant.tags?.includes(selectedFilter)
          );
        } else {
          filtered = tagFilteredRestaurants;
        }
      }

      // Filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter(restaurant =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.tags?.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }

      console.log(`✅ Filtered ${filtered.length} restaurants from ${restaurants.length} total`);
      setFilteredRestaurants(filtered);
    } catch (error) {
      console.error('❌ Error filtering restaurants:', error);
      setFilteredRestaurants(restaurants);
    }
  }, [searchQuery, selectedFilter, restaurants]);

  // MENU FILTERING FEATURE: Filter menu items by category
  const filterMenuItems = useCallback(async () => {
    console.log('🔍 Filtering menu items with query:', searchQuery, 'filter:', selectedFilter);
    
    try {
      let filtered = menuItems;

      // TAXONOMY FILTER: Filter by food categories instead of restaurant name
      if (selectedFilter !== 'all') {
        console.log(`🏷️ Filtering menu items by category: ${selectedFilter}`);
        
        // Use the new category-based filtering
        const { data: categoryFilteredItems, error } = await getMenuItemsByCategory(selectedFilter);
        
        if (error) {
          console.error('Error filtering menu items by category:', error);
          // Fallback to local filtering
          filtered = menuItems.filter(item => 
            item.category === selectedFilter ||
            item.restaurant?.tags?.includes(selectedFilter)
          );
        } else {
          filtered = categoryFilteredItems;
        }
      }

      // Filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.restaurant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      console.log(`✅ Filtered ${filtered.length} menu items from ${menuItems.length} total`);
      setFilteredMenuItems(filtered);
    } catch (error) {
      console.error('❌ Error filtering menu items:', error);
      setFilteredMenuItems(menuItems);
    }
  }, [searchQuery, selectedFilter, menuItems]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadRestaurants(),
          loadMenuItems()
        ]);
      } catch (error) {
        console.error('RestaurantsScreen: Error initializing data:', error);
      }
    };

    initializeData().catch(error => {
      console.error('RestaurantsScreen: Failed to initialize data:', error);
    });
  }, []);

  // Now filterRestaurants is defined, so this useEffect can safely use it
  useEffect(() => {
    filterRestaurants().catch(console.error);
    filterMenuItems().catch(console.error);
  }, [filterRestaurants, filterMenuItems]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading restaurants...');
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error loading restaurants:', error);
        return;
      }

      console.log(`✅ Loaded ${data?.length || 0} restaurants`);
      setRestaurants(data || []);
    } catch (error) {
      console.error('❌ Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  // MENU FILTERING FEATURE: Load all menu items with restaurant info
  const loadMenuItems = async () => {
    try {
      console.log('📊 Loading menu items...');
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurant:restaurants(name, tags)
        `)
        .order('category')
        .order('name');

      if (error) {
        console.error('❌ Error loading menu items:', error);
        return;
      }

      console.log(`✅ Loaded ${data?.length || 0} menu items`);
      setMenuItems(data || []);
    } catch (error) {
      console.error('❌ Error loading menu items:', error);
    }
  };

  const renderRestaurant = (restaurant: Restaurant) => (
    <TouchableOpacity
      key={restaurant.id}
      style={[commonStyles.restaurantCard, { marginBottom: 16 }]}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
      <View style={{ flexDirection: 'row' }}>
        <Image
          source={
            restaurantLogos[restaurant.name as keyof typeof restaurantLogos] ||
            { uri: restaurant.logo_url || restaurant.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop' }
          }
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            marginRight: 16,
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
          }}>
            {restaurant.name}
          </Text>
          
          {/* TAXONOMY FILTER: Show restaurant tags prominently */}
          {restaurant.tags && restaurant.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {restaurant.tags.slice(0, 3).map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: selectedFilter === tag ? colors.primary : colors.backgroundAlt,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 4,
                  }}
                  onPress={() => setSelectedFilter(tag)}
                >
                  <Text style={{
                    fontSize: 12,
                    color: selectedFilter === tag ? colors.white : colors.textLight,
                    fontWeight: '500',
                  }}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{
                fontSize: 14,
                color: colors.textLight,
                marginBottom: 2,
              }}>
                Min order: R{restaurant.min_order}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textLight,
              }}>
                Delivery from: R{restaurant.delivery_from}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{
                fontSize: 14,
                color: colors.primary,
                fontWeight: '600',
                marginBottom: 2,
              }}>
                {restaurant.eta || '30-45 min'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color={colors.primary} />
                <Text style={{
                  fontSize: 14,
                  color: colors.text,
                  fontWeight: '600',
                  marginLeft: 4,
                }}>
                  {restaurant.rating || '4.5'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // MENU FILTERING FEATURE: Render menu item with only lucia_price
  const renderMenuItem = (item: MenuItemWithRestaurant) => (
    <TouchableOpacity
      key={item.id}
      style={[commonStyles.card, { marginBottom: 16 }]}
      onPress={() => router.push(`/restaurant/${item.restaurant_id}`)}
    >
      <View style={{ flexDirection: 'row' }}>
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              marginRight: 16,
            }}
            resizeMode="cover"
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
          }}>
            {item.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textLight,
            marginBottom: 4,
          }}>
            from {item.restaurant?.name}
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.primary,
            fontWeight: '600',
            marginBottom: 8,
          }}>
            {item.category}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* PRICE DISPLAY CLEANUP: Only show lucia_price */}
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.primary,
            }}>
              R{(item.lucia_price || item.price).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <View style={{ padding: 20 }}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>
          Restaurants & Menu
        </Text>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.backgroundAlt,
          borderRadius: 12,
          paddingHorizontal: 16,
          marginBottom: 16,
        }}>
          <Icon name="search" size={20} color={colors.textLight} />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingHorizontal: 12,
              fontSize: 16,
              color: colors.text,
            }}
            placeholder="Search by food category, restaurant..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* TAXONOMY FILTER: Horizontal scrollable category filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <View style={{ flexDirection: 'row' }}>
            {foodCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={{
                  backgroundColor: selectedFilter === category.key ? colors.primary : colors.backgroundAlt,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 25,
                  marginRight: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  minWidth: 80,
                }}
                onPress={() => setSelectedFilter(category.key)}
              >
                <Icon 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedFilter === category.key ? colors.white : colors.textLight}
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  color: selectedFilter === category.key ? colors.white : colors.text,
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* View Toggle */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: colors.backgroundAlt, 
          borderRadius: 12, 
          padding: 4,
          marginBottom: 20,
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: !showMenuItems ? colors.primary : 'transparent',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setShowMenuItems(false)}
          >
            <Text style={{
              color: !showMenuItems ? colors.white : colors.text,
              fontWeight: '600',
            }}>
              Restaurants ({filteredRestaurants.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: showMenuItems ? colors.primary : 'transparent',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setShowMenuItems(true)}
          >
            <Text style={{
              color: showMenuItems ? colors.white : colors.text,
              fontWeight: '600',
            }}>
              Menu Items ({filteredMenuItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 16, color: colors.textLight }}>
              Loading {showMenuItems ? 'menu items' : 'restaurants'}...
            </Text>
          </View>
        ) : showMenuItems ? (
          // MENU FILTERING FEATURE: Show filtered menu items
          filteredMenuItems.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Icon name="restaurant" size={60} color={colors.textLight} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginTop: 16,
                textAlign: 'center',
              }}>
                No menu items found
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textLight,
                marginTop: 8,
                textAlign: 'center',
              }}>
                Try a different category or search term
              </Text>
            </View>
          ) : (
            <>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}>
                {filteredMenuItems.length} menu items found
                {selectedFilter !== 'all' && ` in ${selectedFilter}`}
              </Text>
              {filteredMenuItems.map(renderMenuItem)}
            </>
          )
        ) : (
          // Show filtered restaurants
          filteredRestaurants.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Icon name="restaurant" size={60} color={colors.textLight} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginTop: 16,
                textAlign: 'center',
              }}>
                {searchQuery ? 'No restaurants found' : 'No restaurants available'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textLight,
                marginTop: 8,
                textAlign: 'center',
              }}>
                {searchQuery ? 'Try a different search term' : 'Check back later for new restaurants'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}>
                {filteredRestaurants.length} restaurants found
                {selectedFilter !== 'all' && ` with ${selectedFilter}`}
              </Text>
              {filteredRestaurants.map(renderRestaurant)}
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

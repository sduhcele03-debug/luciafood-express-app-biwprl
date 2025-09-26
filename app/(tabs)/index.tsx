
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Restaurant } from '../../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import LoadingScreen from '../../components/LoadingScreen';

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  useEffect(() => {
    loadFeaturedRestaurants();
  }, []);

  const loadFeaturedRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_featured', true)
        .limit(6);

      if (error) {
        console.error('Error loading featured restaurants:', error);
        return;
      }

      setRestaurants(data || []);
    } catch (error) {
      console.error('Error loading featured restaurants:', error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={{ color: colors.primary, fontSize: 16 }}>
          {i < fullStars ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const renderRestaurant = (restaurant: Restaurant) => (
    <TouchableOpacity
      key={restaurant.id}
      style={[commonStyles.restaurantCard, { width: '48%', marginHorizontal: '1%' }]}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
      <Image
        source={{ 
          uri: restaurant.image || restaurant.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop'
        }}
        style={{
          width: '100%',
          height: 120,
          borderRadius: 12,
          marginBottom: 12,
        }}
        resizeMode="cover"
      />
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
      }}>
        {restaurant.name}
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {renderStars(restaurant.rating || 4.5)}
      </View>
      <TouchableOpacity
        style={[buttonStyles.primary, { paddingVertical: 8, marginTop: 8 }]}
        onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      >
        <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
          Order Now
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={[commonStyles.container, { paddingBottom: 80 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={{
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 250,
          }}
        >
          <Text style={{
            fontSize: 32,
            fontWeight: '800',
            color: colors.white,
            textAlign: 'center',
            marginBottom: 16,
          }}>
            Fastest delivery in town
          </Text>
          <Text style={{
            fontSize: 18,
            color: colors.white,
            textAlign: 'center',
            marginBottom: 24,
            opacity: 0.9,
          }}>
            Get your favorite food delivered in 30 minutes or less
          </Text>
          <TouchableOpacity
            style={[buttonStyles.secondary, { 
              backgroundColor: colors.white,
              paddingVertical: 16,
              paddingHorizontal: 32,
            }]}
            onPress={() => router.push('/(tabs)/restaurants')}
          >
            <Text style={{ 
              color: colors.primary, 
              fontWeight: '700',
              fontSize: 16,
            }}>
              Order Now
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Features Grid */}
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.title, { marginBottom: 20, fontSize: 24 }]}>
            Why Choose Us?
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            {[
              { icon: 'flash', title: 'Fastest Delivery', desc: '30 min or less' },
              { icon: 'restaurant', title: 'Quality Food', desc: 'Fresh & delicious' },
              { icon: 'globe', title: 'Wide Coverage', desc: 'All major areas' },
              { icon: 'shield-checkmark', title: 'Reliable Service', desc: '24/7 support' },
            ].map((feature, index) => (
              <View
                key={index}
                style={[commonStyles.card, {
                  width: '48%',
                  alignItems: 'center',
                  padding: 20,
                  marginBottom: 16,
                }]}
              >
                <Icon 
                  name={feature.icon as any} 
                  size={40} 
                  color={colors.primary}
                  style={{ marginBottom: 12 }}
                />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                  textAlign: 'center',
                  marginBottom: 4,
                }}>
                  {feature.title}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textLight,
                  textAlign: 'center',
                }}>
                  {feature.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Restaurants */}
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.title, { marginBottom: 20, fontSize: 24 }]}>
            Featured Restaurants
          </Text>
          {loadingRestaurants ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
              {restaurants.map(renderRestaurant)}
            </View>
          )}
        </View>

        {/* Bottom CTA */}
        {!user && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={[commonStyles.title, { marginBottom: 16, fontSize: 20 }]}>
              Ready to order?
            </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity style={buttonStyles.primary}>
                <Text style={{ 
                  color: colors.white, 
                  fontWeight: '700',
                  fontSize: 16,
                }}>
                  Sign Up to Order Now
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

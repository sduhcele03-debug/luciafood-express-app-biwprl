
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oieaxdrjiwkotgxbkowp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZWF4ZHJqaXdrb3RneGJrb3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNTU0MDEsImV4cCI6MjA3MzczMTQwMX0.oEWam7pOSJdBwJyQptpDt_pf8YavsJCi2UhazbiRfB0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Restaurant {
  id: string;
  name: string;
  tags?: string[];
  logo_url?: string;
  image?: string;
  logo?: string;
  cuisine_type?: string;
  rating?: number;
  delivery_time?: string;
  delivery_fee?: number;
  is_featured?: boolean;
  min_order: number;
  delivery_from: number;
  eta: string;
  available_in?: string[];
  created_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category: string;
  name: string;
  price: number;
  original_price?: number;
  lucia_price?: number;
  image_url?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  town: string;
  restaurant_id: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  status: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Steers menu data with 7% markup
export const STEERS_PREMIUM_BEEF_BURGERS = [
  {
    category: 'Premium Beef Burgers',
    name: 'Mighty King Steer',
    price: 119.90,
    lucia_price: 128.29,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477606%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Double Cheesy Bacon Burger',
    price: 104.90,
    lucia_price: 112.24,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477604%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Big Bacon King Steer',
    price: 104.90,
    lucia_price: 112.24,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477605%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mega Ribster Burger',
    price: 84.90,
    lucia_price: 90.84,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477602%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mo\' Mjojo Burger',
    price: 84.90,
    lucia_price: 90.84,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477603%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mjojo Cheese',
    price: 79.90,
    lucia_price: 85.49,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477590%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mo\' Cheesy',
    price: 79.90,
    lucia_price: 85.49,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477591%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Prince',
    price: 74.90,
    lucia_price: 80.14,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477589%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Bacon & Cheese',
    price: 69.90,
    lucia_price: 74.79,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477575%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Cheese',
    price: 64.90,
    lucia_price: 69.44,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477588%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: '1/4 Faya',
    price: 64.90,
    lucia_price: 69.44,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477576%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Rave',
    price: 54.90,
    lucia_price: 58.74,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477586%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Steers',
    price: 54.90,
    lucia_price: 58.74,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477587%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Veggie Burger',
    price: 49.90,
    lucia_price: 53.39,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477600%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  }
];

export const STEERS_PHANDA_VALUE_RANGE = [
  {
    category: 'Phanda Value Range',
    name: 'Chicken Burger Duo & Chips',
    price: 129.90,
    lucia_price: 138.99,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477570%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Double Burgers & Chips',
    price: 119.90,
    lucia_price: 128.29,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477571%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Chicken Cheese Burger, Small Chips & 300ml Drink',
    original_price: 74.90,
    price: 74.90,
    lucia_price: 80.14,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477578%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Cheesy BBQ Triple',
    original_price: 49.90,
    price: 49.90,
    lucia_price: 53.39,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477579%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Cheesy BBQ Double',
    original_price: 39.90,
    price: 39.90,
    lucia_price: 42.69,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477580%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda King Burger',
    original_price: 39.90,
    price: 39.90,
    lucia_price: 42.69,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477581%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Cheesy BBQ',
    original_price: 29.90,
    price: 29.90,
    lucia_price: 31.99,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477582%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Cheese Burger',
    original_price: 29.90,
    price: 29.90,
    lucia_price: 31.99,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477583%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Steers Burger',
    original_price: 19.90,
    price: 19.90,
    lucia_price: 21.29,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477584%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Rave Burger',
    original_price: 19.90,
    price: 19.90,
    lucia_price: 21.29,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477585%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  }
];

export const STEERS_FLAME_GRILLED_PORTIONS = [
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: 'Pork Loin Ribs',
    original_price: 249.90,
    price: 249.90,
    lucia_price: 267.39,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477608%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: 'Full Chicken',
    original_price: 164.90,
    price: 164.90,
    lucia_price: 176.44,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477612%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: '1/2 Chicken',
    original_price: 109.90,
    price: 109.90,
    lucia_price: 117.59,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477611%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: '5 Full Wings',
    original_price: 64.90,
    price: 64.90,
    lucia_price: 69.44,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477609%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: '1/4 Chicken',
    original_price: 44.90,
    price: 44.90,
    lucia_price: 48.04,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477610%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: '6 Nuggets',
    original_price: 49.90,
    price: 49.90,
    lucia_price: 53.39,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477601%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: 'Bacon Loaded Chips',
    original_price: 47.90,
    price: 47.90,
    lucia_price: 51.25,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477617%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Flame-Grilled Portions & Ribs',
    name: 'Jalapeno Loaded Chips',
    original_price: 44.90,
    price: 44.90,
    lucia_price: 48.04,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477619%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  }
];

// Helper function to add menu items to database
export const addSteersMenuItems = async () => {
  try {
    // Get Steers restaurant ID
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('name', 'Steers')
      .single();

    if (restaurantError || !restaurant) {
      console.error('Error finding Steers restaurant:', restaurantError);
      return { error: 'Steers restaurant not found' };
    }

    const restaurantId = restaurant.id;

    // Combine all menu items
    const allMenuItems = [...STEERS_PREMIUM_BEEF_BURGERS, ...STEERS_PHANDA_VALUE_RANGE, ...STEERS_FLAME_GRILLED_PORTIONS];

    // Add restaurant_id to each item
    const menuItemsWithRestaurant = allMenuItems.map(item => ({
      ...item,
      restaurant_id: restaurantId
    }));

    // Insert menu items
    const { data, error } = await supabase
      .from('menu_items')
      .insert(menuItemsWithRestaurant);

    if (error) {
      console.error('Error adding menu items:', error);
      return { error };
    }

    console.log('Successfully added Steers menu items:', data);
    return { data };
  } catch (error) {
    console.error('Error in addSteersMenuItems:', error);
    return { error };
  }
};

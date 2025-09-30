
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

// RUNTIME ERROR FIX: Improved Steers menu data with proper error handling
export const STEERS_PREMIUM_BEEF_BURGERS = [
  {
    category: 'Premium Beef Burgers',
    name: 'Mighty King Steer',
    original_price: 119.90,
    price: 119.90,
    lucia_price: 128.29,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477606%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Double Cheesy Bacon Burger',
    original_price: 104.90,
    price: 104.90,
    lucia_price: 112.24,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477604%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Big Bacon King Steer',
    original_price: 104.90,
    price: 104.90,
    lucia_price: 112.24,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477605%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mega Ribster Burger',
    original_price: 84.90,
    price: 84.90,
    lucia_price: 90.84,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477602%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mo\' Mjojo Burger',
    original_price: 84.90,
    price: 84.90,
    lucia_price: 90.84,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477603%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mjojo Cheese',
    original_price: 79.90,
    price: 79.90,
    lucia_price: 85.49,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477590%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Mo\' Cheesy',
    original_price: 79.90,
    price: 79.90,
    lucia_price: 85.49,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477591%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Prince',
    original_price: 74.90,
    price: 74.90,
    lucia_price: 80.14,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477589%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Bacon & Cheese',
    original_price: 69.90,
    price: 69.90,
    lucia_price: 74.79,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477575%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Cheese',
    original_price: 64.90,
    price: 64.90,
    lucia_price: 69.44,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477588%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: '1/4 Faya',
    original_price: 64.90,
    price: 64.90,
    lucia_price: 69.44,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477576%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Rave',
    original_price: 54.90,
    price: 54.90,
    lucia_price: 58.74,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477586%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Steers',
    original_price: 54.90,
    price: 54.90,
    lucia_price: 58.74,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477587%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Premium Beef Burgers',
    name: 'Veggie Burger',
    original_price: 49.90,
    price: 49.90,
    lucia_price: 53.39,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477600%26ts%3D1755676667000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  }
];

export const STEERS_PHANDA_VALUE_RANGE = [
  {
    category: 'Phanda Value Range',
    name: 'Chicken Burger Duo & Chips',
    original_price: 129.90,
    price: 129.90,
    lucia_price: 138.99,
    image_url: 'https://iraas.yumbi.com/?url=https%3A%2F%2Fstatic.yumbi.com%2Fmanagement%2Fapi%2Fresource%2F%3Fid%3D477570%26ts%3D1755676666000&devicePixelRatio=1.6&width=135&height=90&resizeMode=Crop'
  },
  {
    category: 'Phanda Value Range',
    name: 'Phanda Double Burgers & Chips',
    original_price: 119.90,
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

// RUNTIME ERROR FIX: Improved helper function with comprehensive error handling
export const addSteersMenuItems = async () => {
  try {
    console.log('Starting addSteersMenuItems function...');
    
    // Get Steers restaurant ID with better error handling
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('name', 'Steers')
      .single();

    if (restaurantError) {
      console.error('Error finding Steers restaurant:', restaurantError);
      return { error: `Steers restaurant not found: ${restaurantError.message}` };
    }

    if (!restaurant) {
      console.error('Steers restaurant not found in database');
      return { error: 'Steers restaurant not found in database' };
    }

    const restaurantId = restaurant.id;
    console.log('Found Steers restaurant with ID:', restaurantId);

    // Combine all menu items with proper validation
    const allMenuItems = [
      ...STEERS_PREMIUM_BEEF_BURGERS, 
      ...STEERS_PHANDA_VALUE_RANGE, 
      ...STEERS_FLAME_GRILLED_PORTIONS
    ];

    console.log(`Preparing to add ${allMenuItems.length} menu items...`);

    // Add restaurant_id to each item and validate data
    const menuItemsWithRestaurant = allMenuItems.map((item, index) => {
      // RUNTIME ERROR FIX: Ensure all required fields are present and properly typed
      const menuItem = {
        restaurant_id: restaurantId,
        category: item.category || 'Uncategorized',
        name: item.name || `Item ${index + 1}`,
        price: Number(item.price) || 0,
        original_price: item.original_price ? Number(item.original_price) : null,
        lucia_price: item.lucia_price ? Number(item.lucia_price) : null,
        image_url: item.image_url || null
      };

      // Validate that lucia_price is calculated correctly (7% markup)
      if (menuItem.original_price && !menuItem.lucia_price) {
        menuItem.lucia_price = Number((menuItem.original_price * 1.07).toFixed(2));
      }

      console.log(`Prepared menu item ${index + 1}:`, {
        name: menuItem.name,
        price: menuItem.price,
        lucia_price: menuItem.lucia_price,
        original_price: menuItem.original_price
      });

      return menuItem;
    });

    // Insert menu items with proper error handling
    console.log('Inserting menu items into database...');
    const { data, error } = await supabase
      .from('menu_items')
      .insert(menuItemsWithRestaurant)
      .select();

    if (error) {
      console.error('Error adding menu items to database:', error);
      return { error: `Database error: ${error.message}` };
    }

    console.log(`Successfully added ${data?.length || 0} Steers menu items to database`);
    return { data, success: true };
  } catch (error) {
    console.error('Unexpected error in addSteersMenuItems:', error);
    return { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

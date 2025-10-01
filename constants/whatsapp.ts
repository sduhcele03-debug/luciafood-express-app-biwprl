
import { Platform, Linking, Alert } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Global WhatsApp Number Configuration for LuciaFood Express

/**
 * WHATSAPP NUMBER VERIFICATION: Food Order Checkout Number
 * Used for: Final WhatsApp checkout when customers place food orders
 * CRITICAL: This is the correct number (0822116064) as specified in requirements
 */
export const FOOD_ORDER_CHECKOUT_NUMBER = '0822116064';

/**
 * Local Trades Booking & Advertising Number  
 * Used for: Verified Plumbers, Verified Electricians booking requests, and Advertising CTA
 */
export const LOCAL_TRADES_BOOKING_NUMBER = '0787549186';

/**
 * Advertising Number (same as local trades)
 * Used for: Business advertising inquiries
 */
export const ADVERTISING_NUMBER = '0787549186';

/**
 * Generate WhatsApp deep link URL
 * @param phoneNumber - Phone number without country code (e.g., '0822116064')
 * @param message - Message to pre-fill
 * @returns Complete WhatsApp URL
 */
export const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  // WHATSAPP NUMBER VERIFICATION: Ensure correct format with country code
  const formattedNumber = phoneNumber.startsWith('27') ? phoneNumber : `27${phoneNumber}`;
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};

/**
 * Enhanced WhatsApp link handler with platform-specific fallbacks
 * Handles the "WhatsApp not installed" issue on downloaded apps (iOS/Android)
 * 
 * Features:
 * - Uses Universal Link format (https://wa.me/) as primary method
 * - Falls back to deep link (whatsapp://) for older versions
 * - Detects downloaded app environment vs web
 * - Shows app store fallback for failed attempts
 * - Comprehensive error handling and user feedback
 */
export const openWhatsAppWithFallback = async (phoneNumber: string, message: string): Promise<boolean> => {
  const encodedMessage = encodeURIComponent(message);
  
  // WHATSAPP NUMBER VERIFICATION: Ensure correct format
  const formattedNumber = phoneNumber.startsWith('27') ? phoneNumber : `27${phoneNumber}`;
  
  // Primary: Use Universal Link format (most reliable for all platforms)
  const universalUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  
  // Secondary: Traditional deep link (for older versions)
  const deepLinkUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
  
  console.log('Attempting to open WhatsApp...');
  console.log('Phone Number:', phoneNumber);
  console.log('Formatted Number:', formattedNumber);
  console.log('Platform:', Platform.OS);
  console.log('Device Type:', Device.deviceType);
  console.log('Is Device:', Device.isDevice);
  console.log('App Ownership:', Constants.appOwnership);
  
  try {
    // First, try the universal link (works best in most environments)
    const canOpenUniversal = await Linking.canOpenURL(universalUrl);
    console.log('Can open universal link:', canOpenUniversal);
    
    if (canOpenUniversal) {
      console.log('Opening WhatsApp via universal link...');
      await Linking.openURL(universalUrl);
      return true;
    }
    
    // Fallback 1: Try deep link (for native apps)
    const canOpenDeepLink = await Linking.canOpenURL(deepLinkUrl);
    console.log('Can open deep link:', canOpenDeepLink);
    
    if (canOpenDeepLink) {
      console.log('Opening WhatsApp via deep link...');
      await Linking.openURL(deepLinkUrl);
      return true;
    }
    
    // Fallback 2: Check if we're in a downloaded app environment
    const isDownloadedApp = Constants.appOwnership === 'standalone' || 
                           Constants.appOwnership === 'expo' ||
                           Device.isDevice;
    
    if (isDownloadedApp) {
      console.log('Detected downloaded app environment, showing app store fallback...');
      
      // Show user-friendly message with app store redirect
      Alert.alert(
        'WhatsApp Required',
        'WhatsApp is required to send your order. Would you like to install or update WhatsApp?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Install WhatsApp',
            onPress: () => openAppStore(),
          },
          {
            text: 'Try Again',
            onPress: () => {
              // Retry with universal link
              Linking.openURL(universalUrl).catch(() => {
                console.log('Retry failed, opening app store...');
                openAppStore();
              });
            },
          },
        ]
      );
      return false;
    }
    
    // Fallback 3: For web or other environments, try opening anyway
    console.log('Attempting to open WhatsApp in web/other environment...');
    await Linking.openURL(universalUrl);
    return true;
    
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    
    // Final fallback: Show error with app store option
    Alert.alert(
      'Unable to Open WhatsApp',
      'There was an issue opening WhatsApp. Please ensure WhatsApp is installed and try again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Install WhatsApp',
          onPress: () => openAppStore(),
        },
      ]
    );
    return false;
  }
};

/**
 * Open the appropriate app store to install WhatsApp
 */
const openAppStore = async (): Promise<void> => {
  try {
    let appStoreUrl: string;
    
    if (Platform.OS === 'ios') {
      appStoreUrl = 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
    } else if (Platform.OS === 'android') {
      appStoreUrl = 'https://play.google.com/store/apps/details?id=com.whatsapp';
    } else {
      // Web or other platforms
      appStoreUrl = 'https://www.whatsapp.com/download';
    }
    
    console.log('Opening app store:', appStoreUrl);
    const canOpen = await Linking.canOpenURL(appStoreUrl);
    
    if (canOpen) {
      await Linking.openURL(appStoreUrl);
    } else {
      // Final fallback: open WhatsApp website
      await Linking.openURL('https://www.whatsapp.com/download');
    }
  } catch (error) {
    console.error('Error opening app store:', error);
    Alert.alert('Error', 'Unable to open app store. Please manually install WhatsApp from your device\'s app store.');
  }
};

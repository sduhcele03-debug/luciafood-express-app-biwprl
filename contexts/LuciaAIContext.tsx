
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePathname } from 'expo-router';

/**
 * LUCIA AI CONTEXT
 * 
 * Global state management for Lucia AI assistant.
 * 
 * Features:
 * - Screen-aware AI responses based on current route
 * - Mini view (35-40% height) with quick action buttons
 * - Full-screen chat view with message history
 * - WhatsApp escalation for complex issues
 * - Conversation history management
 * 
 * Usage:
 * 1. Wrap your app with <LuciaAIProvider>
 * 2. Use useLuciaAI() hook to access AI functionality
 * 3. Place <LuciaAIContainer> at root level for global access
 * 4. Add <LuciaAIIcon> to headers for easy access
 */

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type LuciaAIContextType = {
  isVisible: boolean;
  isExpanded: boolean;
  messages: Message[];
  isLoading: boolean;
  showLucia: () => void;
  hideLucia: () => void;
  toggleLucia: () => void;
  expandLucia: () => void;
  collapseLucia: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  currentScreen: string;
};

const LuciaAIContext = createContext<LuciaAIContextType | undefined>(undefined);

export function LuciaAIProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const getCurrentScreenName = useCallback(() => {
    if (!pathname) return 'Unknown';
    
    if (pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index') return 'Home';
    if (pathname.includes('/restaurants')) return 'Restaurants';
    if (pathname.includes('/restaurant/')) return 'Restaurant';
    if (pathname.includes('/cart')) return 'Cart';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/services')) return 'Services';
    
    return 'App';
  }, [pathname]);

  const showLucia = useCallback(() => {
    setIsVisible(true);
    setIsExpanded(false);
  }, []);

  const hideLucia = useCallback(() => {
    setIsVisible(false);
    setIsExpanded(false);
  }, []);

  const toggleLucia = useCallback(() => {
    setIsVisible(prev => !prev);
    if (isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible]);

  const expandLucia = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapseLucia = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { supabase } = await import('../lib/supabase');
      
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('lucia-ai-chat', {
        body: {
          message: messageText,
          screenName: getCurrentScreenName(),
          conversationHistory,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response from Lucia AI');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.shouldEscalateToWhatsApp) {
        const whatsappMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '💬 Would you like to contact our support team on WhatsApp? Tap the "Order via WhatsApp" button below.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, whatsappMessage]);
      }
    } catch (error) {
      console.error('Error sending message to Lucia AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now 😔 Please try again or contact us on WhatsApp at 0743844253.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, getCurrentScreenName]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: LuciaAIContextType = {
    isVisible,
    isExpanded,
    messages,
    isLoading,
    showLucia,
    hideLucia,
    toggleLucia,
    expandLucia,
    collapseLucia,
    sendMessage,
    clearMessages,
    currentScreen: getCurrentScreenName(),
  };

  return (
    <LuciaAIContext.Provider value={value}>
      {children}
    </LuciaAIContext.Provider>
  );
}

export function useLuciaAI() {
  const context = useContext(LuciaAIContext);
  if (context === undefined) {
    throw new Error('useLuciaAI must be used within a LuciaAIProvider');
  }
  return context;
}

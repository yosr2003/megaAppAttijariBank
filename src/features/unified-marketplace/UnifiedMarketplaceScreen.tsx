import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { StarField } from '@/src/components/ui';
import { MarketplaceHomeScreen } from '@/src/features/ai-marketplace';
import { P2PMarketplaceScreen } from '@/src/features/p2p-marketplace/screens/p2p-marketplace-screen';
import { useTheme } from '@/src/hooks/use-theme';

export function UnifiedMarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const theme = useTheme();

  // Shared value: 0 = products (left), 1 = services (right)
  const tabOffset = useSharedValue(0);

  const handleSetTab = (tab: 'products' | 'services') => {
    setActiveTab(tab);
    tabOffset.value = tab === 'products' ? 0 : 1;
  };

  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(tabOffset.value * 150, {
            damping: 18,
            stiffness: 140,
          }),
        },
      ],
    };
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="light" />
      {theme.mode === 'dark' && <StarField />}

      {/* Ambient top-right glow */}
      <View style={{
        position: 'absolute',
        top: -80,
        right: -40,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#2F80ED',
        opacity: 0.18,
      }} />
      {/* Ambient bottom-left glow */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        left: -60,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#7B2FBE',
        opacity: 0.10,
      }} />

      {/* Header */}
      <View style={{
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 14,
      }}>
        <Text style={{
          fontSize: 11,
          fontWeight: '700',
          color: '#2F80ED',
          letterSpacing: 2.5,
          marginBottom: 4,
          textTransform: 'uppercase',
        }}>
          Super Tounsii
        </Text>
        <Text style={{
          fontSize: 30,
          fontWeight: '800',
          color: theme.colors.textPrimary,
          letterSpacing: -0.5,
        }}>
          Marketplace
        </Text>
      </View>

      {/* Segmented control */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View style={{
          flexDirection: 'row',
          borderRadius: 28,
          borderWidth: 1,
          borderColor: 'rgba(47, 128, 237, 0.3)',
          padding: 4,
          backgroundColor: 'rgba(47, 128, 237, 0.08)',
          position: 'relative',
          height: 50,
          alignItems: 'center',
        }}>
          {/* Sliding pill indicator — pointerEvents none so taps pass through to Pressables */}
          <Animated.View
            pointerEvents="none"
            style={[{
            position: 'absolute',
            width: '50%',
            height: 42,
            borderRadius: 22,
            backgroundColor: '#2F80ED',
            left: 4,
            shadowColor: '#2F80ED',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 8,
          }, sliderStyle]} />

          <Pressable
            onPress={() => handleSetTab('products')}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '700',
              color: activeTab === 'products' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              letterSpacing: 0.3,
            }}>
              🛍️ Produits
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSetTab('services')}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '700',
              color: activeTab === 'services' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              letterSpacing: 0.3,
            }}>
              🤖 Services AI
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'products' ? (
          <P2PMarketplaceScreen />
        ) : (
          <MarketplaceHomeScreen />
        )}
      </View>
    </SafeAreaView>
  );
}

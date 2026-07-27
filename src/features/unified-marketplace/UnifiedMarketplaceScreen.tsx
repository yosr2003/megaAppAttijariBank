import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, Pressable, ScrollView } from 'react-native';
import { StarField } from '@/src/components/ui';
import { MarketplaceHomeScreen } from '@/src/features/ai-marketplace';
import { P2PMarketplaceScreen } from '@/src/features/p2p-marketplace/screens/p2p-marketplace-screen';
import { useTheme } from '@/src/hooks/use-theme';

export function UnifiedMarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="light" />
      {theme.mode === 'dark' && <StarField />}
      
      {/* Ambient glow similar to other screens */}
      <View style={{ 
        position: 'absolute',
        top: -50,
        right: -20,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: theme.colors.primary,
        opacity: 0.12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 50,
      }} />

      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 16, 
        paddingBottom: 10 
      }}>
        <View>
          <Text style={{ 
            fontSize: 11, 
            fontWeight: '700', 
            color: theme.colors.textSecondary, 
            letterSpacing: 1.5, 
            marginBottom: 4 
          }}>
            MARKETPLACE
          </Text>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: theme.colors.textPrimary 
          }}>
            Super Marketplace
          </Text>
        </View>
      </View>

      {/* Segmented Tabs */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={{ 
          flexDirection: 'row', 
          borderRadius: 24, 
          borderWidth: 1, 
          borderColor: theme.colors.border + '30', 
          padding: 3, 
          backgroundColor: theme.colors.surface + '80' 
        }}>
          <Pressable
            onPress={() => setActiveTab('products')}
            style={{ 
              flex: 1, 
              alignItems: 'center', 
              justifyContent: 'center', 
              paddingVertical: 10, 
              borderRadius: 20,
              backgroundColor: activeTab === 'products' ? theme.colors.primary : 'transparent'
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: activeTab === 'products' ? theme.colors.primaryOn : theme.colors.textSecondary 
            }}>
              Produits
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('services')}
            style={{ 
              flex: 1, 
              alignItems: 'center', 
              justifyContent: 'center', 
              paddingVertical: 10, 
              borderRadius: 20,
              backgroundColor: activeTab === 'services' ? theme.colors.primary : 'transparent'
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: activeTab === 'services' ? theme.colors.primaryOn : theme.colors.textSecondary 
            }}>
              Services & Apps
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content based on active tab */}
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

import { Tabs } from 'expo-router';

import { BottomNavigation, type BottomNavigationItem } from '@/src/components/ui';

const navigationItems: readonly BottomNavigationItem[] = [
  { icon: 'home-outline', key: 'index', label: 'Home' },
  { icon: 'storefront-outline', key: 'marketplace', label: 'Marketplace' },
  { icon: 'compass-outline', key: 'explore', label: 'Explore' },
];

/** Expo Router remains the navigation owner; the shared component supplies the visual tab bar. */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ navigation, state }) => (
        <BottomNavigation
          activeKey={state.routes[state.index]?.name ?? 'index'}
          items={navigationItems}
          onChange={(key) => {
            if (key === 'index') navigation.navigate('index');
            if (key === 'marketplace') navigation.navigate('marketplace');
            if (key === 'explore') navigation.navigate('explore');
          }}
        />
      )}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="marketplace" options={{ title: 'Marketplace' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
    </Tabs>
  );
}

import { useState, useEffect } from 'react';
import { FoodItem, Restaurant } from '../types';
import { MOCK_FOOD_ITEMS } from '../mocks';
import { foodApi, RESTAURANT_CATEGORY_MAP } from '../services/food-api';

export function useRestaurantMenu(restaurant: Restaurant) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Check local structured mock menu first
        const localItems = MOCK_FOOD_ITEMS[restaurant.id];
        if (localItems && localItems.length > 0) {
          if (isMounted) {
            setFoodItems(localItems);
            setIsLoading(false);
          }
          return;
        }

        // 2. Fallback to API if not in local mock
        const mealDbCategory = RESTAURANT_CATEGORY_MAP[restaurant.id] || 'Miscellaneous';
        const items = await foodApi.fetchMealsByCategory(mealDbCategory, restaurant.id);
        
        if (isMounted) {
          setFoodItems(items);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load menu. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (restaurant && restaurant.id) {
      loadMenu();
    }

    return () => {
      isMounted = false;
    };
  }, [restaurant?.id]);

  return { foodItems, isLoading, error };
}

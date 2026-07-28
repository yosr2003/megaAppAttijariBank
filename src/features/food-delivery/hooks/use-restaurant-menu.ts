import { useState, useEffect } from 'react';
import { FoodItem, Restaurant } from '../types';
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
        // Get the TheMealDB category for this restaurant, default to 'Miscellaneous' if not found
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

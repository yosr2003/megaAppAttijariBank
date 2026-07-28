import axios from 'axios';
import { FoodItem } from '../types';

const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// We map our mock restaurants to TheMealDB categories
export const RESTAURANT_CATEGORY_MAP: Record<string, string> = {
  '1': 'Lamb',    // Dar Zaman (Tunisian/Middle Eastern)
  '2': 'Pasta',   // Pizza Paradiso (Italian)
  '3': 'Beef',    // Burger Factory (American)
  '4': 'Seafood', // Sushi Master (Japanese)
};

interface MealDBResponse {
  meals: {
    strMeal: string;
    strMealThumb: string;
    idMeal: string;
  }[] | null;
}

export const foodApi = {
  async fetchMealsByCategory(categoryId: string, restaurantId: string): Promise<FoodItem[]> {
    try {
      const response = await axios.get<MealDBResponse>(`${THEMEALDB_BASE_URL}/filter.php?c=${categoryId}`);
      
      if (!response.data.meals) {
        return [];
      }
      
      // Limit to 10 items per restaurant so it doesn't get overwhelming
      return response.data.meals.slice(0, 10).map((meal) => {
        // Generate a stable, realistic price using the idMeal string
        const idNumber = parseInt(meal.idMeal, 10) || 0;
        const generatedPrice = (idNumber % 25) + 12; // Price between 12 and 36 TND
        
        return {
          id: meal.idMeal,
          restaurantId: restaurantId,
          name: meal.strMeal,
          image: meal.strMealThumb,
          description: `Delicious ${meal.strMeal} prepared with fresh ingredients.`,
          price: generatedPrice,
          category: 'Main Dishes',
          isPopular: idNumber % 3 === 0, // Roughly 1 in 3 items is popular
          ingredients: [],
          allergies: [],
        };
      });
    } catch (error) {
      console.error('Error fetching meals from TheMealDB:', error);
      return [];
    }
  }
};

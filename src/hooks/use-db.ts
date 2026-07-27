import { useCallback, useEffect, useState } from 'react';
import { dbService } from '../services/db-service';

export const TEST_USER_ID = 'local-demo-user';

async function seedLocalData() {
  if ((await dbService.getCards(TEST_USER_ID)).length === 0) {
    await dbService.createCard({ user_id: TEST_USER_ID, card_number: '5412 •••• •••• 3891', cardholder_name: 'Nour Ben Salah', expiry_date: '09/28', card_type: 'Platinum', status: 'active', balance: 12540 });
    await dbService.createCard({ user_id: TEST_USER_ID, card_number: '4111 •••• •••• 7720', cardholder_name: 'Nour Ben Salah', expiry_date: '03/27', card_type: 'Gold', status: 'active', balance: 4500 });
  }
  if ((await dbService.getTransactions(TEST_USER_ID)).length === 0) {
    await dbService.createTransaction({ user_id: TEST_USER_ID, title: 'Café Sidi Bou', category: 'Food & drink', amount: -18.5, currency: 'TND', icon: 'cafe-outline' });
    await dbService.createTransaction({ user_id: TEST_USER_ID, title: 'Salary deposit', category: 'Salary', amount: 2450, currency: 'TND', icon: 'arrow-down-outline' });
    await dbService.createTransaction({ user_id: TEST_USER_ID, title: 'Bolt Tunisia', category: 'Transport', amount: -42.9, currency: 'TND', icon: 'car-outline' });
  }
  if ((await dbService.getDocuments(TEST_USER_ID)).length === 0) {
    await dbService.createDocument({ user_id: TEST_USER_ID, title: 'National identity card', subtitle: 'Expires 17 Sep 2031', status: 'Verified', icon: 'card-outline' });
    await dbService.createDocument({ user_id: TEST_USER_ID, title: 'Proof of address', subtitle: 'Issued 12 Jan 2026', status: 'Verified', icon: 'document-text-outline' });
  }
  if ((await dbService.getMarketplaceItems()).length === 0) {
    await dbService.createMarketplaceItem({ title: 'Smart Commerce AI', description: 'AI-powered inventory and customer insights for local shops.', price_text: 'From 29 TND / month', price_amount: 29, icon: 'apps-outline' });
    await dbService.createMarketplaceItem({ title: 'Tunisian Tax Helper', description: 'Automatic tax estimation and declaration assistance.', price_text: 'From 15 TND / month', price_amount: 15, icon: 'calculator-outline' });
  }
}

export function useDb() {
  const [isReady, setIsReady] = useState(false);
  const initializeDatabase = useCallback(async () => {
    try {
      await seedLocalData();
      setIsReady(true);
    } catch (error) {
      console.error('Local data initialization failed:', error);
    }
  }, []);

  useEffect(() => { initializeDatabase(); }, [initializeDatabase]);
  return { userId: TEST_USER_ID, isReady, refresh: initializeDatabase };
}

import type { MarketplaceCardProps, QuickActionProps, SavingCardProps, TransactionRowProps } from '@/src/components/ui';

export const quickActions: readonly Pick<QuickActionProps, 'icon' | 'label'>[] = [
  { icon: 'send-outline', label: 'Send' },
  { icon: 'card-outline', label: 'Pay' },
  { icon: 'add-circle-outline', label: 'Top up' },
  { icon: 'scan-outline', label: 'Scan' },
];

export const recentTransactions: readonly TransactionRowProps[] = [
  { amount: '− 18.500 TND', icon: 'cafe-outline', subtitle: 'Today · Food & drink', title: 'Café Sidi Bou' },
  { amount: '+ 2,450.000 TND', icon: 'arrow-down-outline', subtitle: 'Yesterday · Salary', title: 'Salary deposit' },
  { amount: '− 42.900 TND', icon: 'car-outline', subtitle: 'Yesterday · Transport', title: 'Bolt Tunisia' },
];

export const marketplacePreview: MarketplaceCardProps = { description: 'AI-powered inventory and customer insights for local shops.', price: 'From 29 TND / month', title: 'Smart Commerce AI' };
export const savingPreview: SavingCardProps = { currentAmount: '1,250 TND', goalAmount: '2,000 TND', progress: 0.625, title: 'Summer escape' };

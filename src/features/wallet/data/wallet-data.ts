import type { DocumentCardProps, WalletNavigationCardProps } from '../components';
import type { TransactionRowProps } from '@/src/components/ui';

export type WalletDestination = Pick<WalletNavigationCardProps, 'description' | 'icon' | 'title'> & { route: string };

export const walletDestinations: readonly WalletDestination[] = [
  { description: 'Manage your physical and virtual cards', icon: 'card-outline', route: '/wallet/cards', title: 'Cards' },
  { description: 'Keep your verified documents in one place', icon: 'document-text-outline', route: '/wallet/documents', title: 'Documents' },
  { description: 'Review every movement in your wallet', icon: 'receipt-outline', route: '/wallet/transactions', title: 'Transactions' },
  { description: 'Get guidance from your personal AI coach', icon: 'sparkles-outline', route: '/wallet/ai-coach', title: 'AI Coach' },
];

export const documents: readonly DocumentCardProps[] = [
  { icon: 'card-outline', status: 'Verified', subtitle: 'Expires 17 Sep 2031', title: 'National identity card' },
  { icon: 'document-text-outline', status: 'Verified', subtitle: 'Issued 12 Jan 2026', title: 'Proof of address' },
  { icon: 'shield-checkmark-outline', status: 'Secure', subtitle: 'Encrypted in your wallet', title: 'Financial consent' },
];

export const walletTransactions: readonly TransactionRowProps[] = [
  { amount: '− 18.500 TND', icon: 'cafe-outline', subtitle: 'Today · Food & drink', title: 'Café Sidi Bou' },
  { amount: '− 42.900 TND', icon: 'car-outline', subtitle: 'Yesterday · Transport', title: 'Bolt Tunisia' },
  { amount: '+ 2,450.000 TND', icon: 'arrow-down-outline', subtitle: '12 Jul · Salary', title: 'Salary deposit' },
  { amount: '− 75.000 TND', icon: 'phone-portrait-outline', subtitle: '10 Jul · Mobile', title: 'Ooredoo top-up' },
];

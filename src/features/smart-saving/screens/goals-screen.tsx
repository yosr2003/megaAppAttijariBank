import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { MotionCard, PrimaryButton, Screen, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { SavingGoalCard } from '../components';
import { getGoalVisual } from '../utils/goal-visual-config';
import { useDb } from '@/src/hooks/use-db';
import { dbService, SavingsGoal } from '@/src/services/db-service';

export function GoalsScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userId, isReady } = useDb();
  const theme = useTheme();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const userGoals = await dbService.getSavingsGoals(userId);
      setGoals(userGoals);
    } catch (e) {
      console.error("Error fetching savings goals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      fetchGoals();
    }
  }, [isReady, userId, isFocused]);

  return (
    <Screen>
      <View>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Smart Saving</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Transformez vos choix quotidiens en projets concrets.</Text>
      </View>

      <PrimaryButton 
        label="Créer un objectif" 
        onPress={() => router.push('/savings/create-goal' as any)} 
      />

      <View style={{ gap: 24 }}>
        <SectionTitle title="Vos objectifs d'épargne" />
        
        {loading && goals.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : goals.length > 0 ? (
          <View style={styles.goals}>
            {goals.map((goal, index) => {
              const currentVal = Number(goal.current_amount);
              const goalVal = Number(goal.goal_amount);
              const progressRatio = goalVal > 0 ? currentVal / goalVal : 0;
              const visual = getGoalVisual(goal.title);
              
              return (
                <MotionCard delay={index * 70} key={goal.id}>
                  <SavingGoalCard 
                    label={goal.title}
                    icon={visual.icon}
                    progress={progressRatio}
                    currentAmount={`${currentVal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND`}
                    goalAmount={`${goalVal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND`}
                    onPress={() => router.push({
                      pathname: '/savings/goal-details',
                      params: { id: goal.id }
                    } as any)}
                  />
                </MotionCard>
              );
            })}
          </View>
        ) : (
          <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.surface + '33', borderColor: theme.colors.border + '1A' }]}>
            <Ionicons name="leaf-outline" size={40} color={theme.colors.textSecondary + '60'} />
            <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
              Aucun objectif d'épargne créé pour le moment.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { 
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: { 
    fontSize: 14,
    marginTop: 8,
  },
  goals: { 
    gap: 16,
  },
  placeholderContainer: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
  }
});

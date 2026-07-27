import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Input, PrimaryButton, Screen } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { useFormValidation } from '@/src/hooks/use-form-validation';
import { useDb } from '@/src/hooks/use-db';
import { dbService } from '@/src/services/db-service';
import { format, V } from '@/src/utils/form-validation';
import { prefetchGoalBlueprint } from '../services/goal-blueprint-service';

/** Stateful creation form for composing a new savings goal on this device. */
export function CreateGoalScreen() {
  const router = useRouter();
  const { userId } = useDb();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { errors, validate, clearError } = useFormValidation();

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGoal = async () => {
    if (!userId) return;

    const isValid = validate({
      goalName: { value: goalName, rules: [V.goalTitle] },
      targetAmount: { value: targetAmount, rules: [V.tndAmount({ min: 1, max: 999_999 })] },
    });
    if (!isValid) return;

    try {
      setLoading(true);
      const created = await dbService.createSavingsGoal({
        user_id: userId,
        title: goalName.trim(),
        goal_amount: parseFloat(targetAmount),
        current_amount: 0.000,
      });

      // Fire-and-forget: ask Gemini to classify this goal while the user is still seeing the success haptic.
      // The result is cached by goalId so goal-details opens with the right 3D shape instantly.
      if (created.id) {
        prefetchGoalBlueprint(created.id, goalName.trim()).catch(() => {/* ignore – local fallback */});
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (created.id) {
        router.replace({
          pathname: '/savings/goal-details',
          params: { id: created.id },
        } as any);
      } else {
        router.back();
      }
    } catch (e) {
      console.error('Failed to create savings goal:', e);
      Alert.alert('Erreur', "Impossible de créer l'objectif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Créer un objectif</Text>
        <Text style={styles.subtitle}>Donnez une destination claire à votre épargne.</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Nom de l'objectif"
          placeholder="ex. Voyage à Djerba, Achat PC..."
          value={goalName}
          onChangeText={(text) => {
            setGoalName(text);
            clearError('goalName');
          }}
          onBlur={() => validate({ goalName: { value: goalName, rules: [V.goalTitle] } })}
          error={errors.goalName}
          maxLength={60}
        />
        <Input
          keyboardType="decimal-pad"
          label="Montant cible (TND)"
          placeholder="ex. 500.000"
          value={targetAmount}
          onChangeText={(text) => {
            setTargetAmount(format.tndAmount(text));
            clearError('targetAmount');
          }}
          onBlur={() =>
            validate({ targetAmount: { value: targetAmount, rules: [V.tndAmount({ min: 1, max: 999_999 })] } })
          }
          error={errors.targetAmount}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <PrimaryButton label="Créer l'objectif" onPress={handleCreateGoal} />
      )}
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    title: { ...theme.typography.heading, color: theme.colors.textPrimary },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs },
    form: { gap: theme.spacing.md },
  });

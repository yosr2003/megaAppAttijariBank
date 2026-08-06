import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator, Alert, Modal, TextInput, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

import { Card, PrimaryButton, Screen, SectionTitle } from '@/src/components/ui';
import { Goal3DBuilder } from '../components/goal-3d-builder';
import { useTheme } from '@/src/hooks/use-theme';
import { useFormValidation } from '@/src/hooks/use-form-validation';
import { dbService, SavingsGoal, WalletCard } from '@/src/services/db-service';
import { format, V } from '@/src/utils/form-validation';
import { useGoalBlueprint } from '../hooks/use-goal-blueprint';
import { useDb } from '@/src/hooks/use-db';

/** Detailed view of a goal with local contribution controls. */
export function GoalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { errors, validate, clearError, clearAll } = useFormValidation();
  const { userId } = useDb();

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [buildTrigger, setBuildTrigger] = useState(0);

  // Wallet Cards Integration
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  // Gemini-powered blueprint: classifies the goal and picks the right 3D shape + colours.
  // Falls back to local keyword matching if Gemini is unavailable.
  const { blueprint, loading: blueprintLoading } = useGoalBlueprint(
    goal?.title ?? '',
    { goalId: id, preferRemote: true },
  );

  const fetchGoalDetails = async () => {
    if (!id || !userId) return;
    try {
      setLoading(true);
      const [fetchedGoal, fetchedCards] = await Promise.all([
        dbService.getSavingsGoal(id),
        dbService.getCards(userId)
      ]);
      setGoal(fetchedGoal);
      setCards(fetchedCards);
      if (fetchedCards.length > 0) {
        setSelectedCardId(fetchedCards[0].id || '');
      }
    } catch (e) {
      console.error("Error loading goal details:", e);
      Alert.alert("Erreur", "Impossible de charger les détails de l'objectif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchGoalDetails();
    }
  }, [id, userId]);

  const handleAddContribution = async () => {
    if (!goal || !goal.id || !userId) return;

    const remaining = Math.max(0, Number(goal.goal_amount) - Number(goal.current_amount));
    const isValid = validate({
      depositAmount: { value: depositAmount, rules: [V.depositAmount(remaining)] },
    });
    if (!isValid) return;

    const selectedCard = cards.find(c => c.id === selectedCardId);
    if (!selectedCard) {
      Alert.alert("Erreur", "Veuillez sélectionner un moyen de paiement.");
      return;
    }

    const amountToAdd = parseFloat(depositAmount);
    if (Number(selectedCard.balance) < amountToAdd) {
      Alert.alert(
        "Solde insuffisant",
        `Le solde de la carte sélectionnée (${Number(selectedCard.balance).toFixed(3)} TND) est insuffisant pour verser ${amountToAdd.toFixed(3)} TND.`
      );
      return;
    }

    try {
      setLoading(true);
      const previousProgress = Number(goal.goal_amount) > 0
        ? Number(goal.current_amount) / Number(goal.goal_amount)
        : 0;

      // 1. Deduct amount from selected card balance
      const newBalance = Number(selectedCard.balance) - amountToAdd;
      await dbService.updateCardBalance(selectedCardId, newBalance);

      // 2. Log transaction in wallet
      await dbService.createTransaction({
        user_id: userId,
        card_id: selectedCardId,
        title: `Épargne: ${goal.title}`,
        category: "Savings",
        amount: -amountToAdd,
        currency: "TND",
        icon: "wallet-outline"
      });

      // 3. Update the savings goal current amount
      await dbService.depositToSavingsGoal(goal.id, goal.current_amount, amountToAdd);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const newCurrent = Number(goal.current_amount) + amountToAdd;
      const newProgress = Number(goal.goal_amount) > 0 ? newCurrent / Number(goal.goal_amount) : 0;

      setIsDepositModalVisible(false);
      setDepositAmount('');
      clearAll();
      setBuildTrigger((n) => n + 1);

      router.push({
        pathname: '/savings/progress-animation',
        params: {
          goalId: id,
          title: goal.title,
          progress: String(Math.min(1, newProgress)),
          previousProgress: String(Math.min(1, previousProgress)),
          amountAdded: String(amountToAdd),
        },
      } as any);
    } catch (e) {
      console.error("Failed to deposit to savings goal:", e);
      Alert.alert("Erreur", "Le dépôt a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = () => {
    if (!goal || !goal.id) return;
    Alert.alert(
      "Supprimer l'objectif",
      `Êtes-vous sûr de vouloir supprimer l'objectif d'épargne "${goal.title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await dbService.deleteSavingsGoal(goal.id!);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              router.back();
            } catch (e) {
              console.error("Failed to delete goal:", e);
              Alert.alert("Erreur", "Impossible de supprimer l'objectif.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading && !goal) {
    return (
      <Screen contentContainerStyle={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  if (!goal) {
    return (
      <Screen>
        <Text style={styles.errorText}>Objectif introuvable.</Text>
      </Screen>
    );
  }

  const currentVal = Number(goal.current_amount);
  const goalVal = Number(goal.goal_amount);
  const progressRatio = goalVal > 0 ? currentVal / goalVal : 0;
  const remainingAmount = goalVal - currentVal;
  const isGoalReached = remainingAmount <= 0;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.subtitle}>
            Statut : {isGoalReached ? "Objectif Atteint 🎉" : "En cours de construction"}
          </Text>
        </View>

        <Pressable style={styles.deleteButton} onPress={handleDeleteGoal}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
        </Pressable>
      </View>

      <View style={styles.builderCard}>
        <Goal3DBuilder
          progress={progressRatio}
          label={goal.title}
          blueprint={blueprint}
          buildTrigger={buildTrigger}
          loading={blueprintLoading}
        />
        <View style={[styles.amounts, { backgroundColor: blueprint.accent + '12', borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: blueprint.accent + '33' }]}>
          <Text style={[styles.current, { color: blueprint.accent }]}>
            {currentVal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
          </Text>
          <Text style={[styles.goal, { color: theme.colors.textSecondary }]}>
            sur {goalVal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
          </Text>
        </View>
      </View>

      <View>
        <SectionTitle title="Prochaine étape" />
        <Card elevated style={styles.milestone}>
          {isGoalReached ? (
            <Text style={styles.milestoneText}>
              Félicitations ! Vous avez atteint 100% de votre objectif d'épargne.
            </Text>
          ) : (
            <View>
              <Text style={styles.milestoneValue}>
                {remainingAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
              </Text>
              <Text style={styles.milestoneText}>
                restant pour compléter entièrement votre projet d'épargne.
              </Text>
            </View>
          )}
        </Card>
      </View>

      <View style={styles.actionButtons}>
        {!isGoalReached && (
          <PrimaryButton
            label="💰 Ajouter de l'argent"
            onPress={() => setIsDepositModalVisible(true)}
          />
        )}
        <PrimaryButton
          label="🎬 Voir la célébration"
          onPress={() =>
            router.push({
              pathname: '/savings/progress-animation',
              params: {
                goalId: id,
                title: goal.title,
                progress: String(progressRatio),
                previousProgress: String(Math.max(0, progressRatio - 0.05)),
              },
            } as any)
          }
        />
      </View>

      <Modal
        visible={isDepositModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsDepositModalVisible(false);
          clearAll();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Épargner pour l'objectif</Text>
            <Text style={styles.modalDesc}>
              Combien souhaitez-vous ajouter à "{goal.title}" ?
            </Text>

            {/* Card Selector */}
            <View style={[styles.inputGroup, { marginBottom: 14 }]}>
              <Text style={styles.inputLabel}>Moyen de paiement</Text>
              {cards.length > 0 ? (
                <View style={{ gap: 8, marginTop: 6 }}>
                  {cards.map((card) => {
                    const isActive = selectedCardId === card.id;
                    return (
                      <Pressable
                        key={card.id}
                        style={[
                          styles.cardSelectorItem,
                          isActive && styles.cardSelectorItemActive,
                          {
                            backgroundColor: theme.colors.surfaceSubtle,
                            borderColor: theme.colors.border + '40',
                          },
                          isActive && {
                            backgroundColor: '#2F80ED15',
                            borderColor: '#2F80ED',
                          }
                        ]}
                        onPress={() => setSelectedCardId(card.id || '')}
                      >
                        <Ionicons 
                          name={isActive ? "radio-button-on-outline" : "radio-button-off-outline"} 
                          size={18} 
                          color={isActive ? "#2F80ED" : theme.colors.textSecondary} 
                        />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary }}>
                            {card.card_type} (•••• {card.card_number.slice(-4)})
                          </Text>
                          <Text style={{ fontSize: 11, color: '#27AE60', fontWeight: '600' }}>
                            Solde: {Number(card.balance).toFixed(3)} TND
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <Text style={{ color: theme.colors.danger, fontSize: 12 }}>
                  Aucune carte de paiement disponible. Veuillez d'abord en ajouter une dans le portefeuille.
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Montant du Dépôt (TND)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.depositAmount && { borderColor: theme.colors.danger },
                ]}
                placeholder="ex: 50.000"
                placeholderTextColor={theme.colors.textSecondary + '80'}
                value={depositAmount}
                onChangeText={(text) => {
                  setDepositAmount(format.tndAmount(text));
                  clearError('depositAmount');
                }}
                keyboardType="decimal-pad"
              />
              {errors.depositAmount ? (
                <Text style={[styles.fieldError, { color: theme.colors.danger }]}>
                  {errors.depositAmount}
                </Text>
              ) : null}
            </View>

            <View style={styles.rowButtons}>
              <Pressable
                style={styles.buttonCancel}
                onPress={() => {
                  setIsDepositModalVisible(false);
                  clearAll();
                }}
              >
                <Text style={styles.buttonCancelText}>Annuler</Text>
              </Pressable>
              <Pressable 
                style={[styles.buttonSubmit, cards.length === 0 && { backgroundColor: theme.colors.textSecondary + '40' }]} 
                disabled={cards.length === 0} 
                onPress={handleAddContribution}
              >
                <Text style={styles.buttonSubmitText}>Confirmer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      ...theme.typography.heading,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xxs,
    },
    deleteButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.colors.danger + '15',
      borderColor: theme.colors.danger + '40',
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    builderCard: {
      gap: 14,
    },
    amounts: {
      alignItems: 'baseline',
      flexDirection: 'row',
      gap: 8,
    },
    current: {
      fontSize: 22,
      fontWeight: '900',
    },
    goal: {
      fontSize: 14,
      fontWeight: '600',
    },
    milestone: {
      gap: theme.spacing.xxs,
    },
    milestoneValue: {
      ...theme.typography.title,
      color: theme.colors.action,
    },
    milestoneText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    actionButtons: {
      gap: 12,
      marginTop: 8,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 40,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.mode === 'dark' ? 'rgba(3, 12, 22, 0.85)' : 'rgba(248, 249, 250, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1.2,
      borderColor: theme.colors.primary + '4D',
      padding: 24,
      width: '100%',
      maxWidth: 380,
      gap: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    modalDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: 10,
    },
    inputGroup: {
      gap: 6,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    textInput: {
      backgroundColor: theme.colors.surfaceSubtle,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border + '50',
      color: theme.colors.textPrimary,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
    },
    cardSelectorItem: {
      width: '100%',
      borderRadius: 12,
      borderWidth: 1.2,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardSelectorItemActive: {},
    fieldError: {
      fontSize: 12,
      marginTop: 4,
    },
    rowButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    buttonCancel: {
      flex: 1,
      borderColor: theme.colors.border + '60',
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonCancelText: {
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    buttonSubmit: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSubmitText: {
      color: theme.colors.primaryOn,
      fontWeight: '700',
    },
  });

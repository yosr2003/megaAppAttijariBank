import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';

export function WalletAICoachScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [tndScore, setTndScore] = useState(85);
  const [simulationAmount, setSimulationAmount] = useState('');
  const [simulationCategory, setSimulationCategory] = useState('Repas');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Hardcoded financial scans
  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Abonnement Netflix 📺',
      desc: 'Renouvellement dans 2 jours (35.000 DT). Votre solde (28.000 DT) est insuffisant.',
      cta: 'Transférer 10 DT',
      action: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Transfert Réussi', '10.000 DT ont été transférés de votre carte Gold pour couvrir Netflix.');
      }
    },
    {
      id: '2',
      type: 'caution',
      title: 'Budget Dar Zaman ⏱️',
      desc: 'Vos dépenses restaurant ce mois sont 15% plus élevées. Risque de dépassement.',
      cta: 'Voir les Coupons',
    },
    {
      id: '3',
      type: 'success',
      title: 'Opportunité Économie 💡',
      desc: 'Utilisez le coupon de livraison gratuite gagné hier pour économiser 4.500 DT.',
      cta: 'Appliquer',
    }
  ];

  const handleSimulate = () => {
    const amt = parseFloat(simulationAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (amt > 150) {
      setSimulationResult(
        `🚨 Alerte : Cette dépense de ${amt.toFixed(3)} DT réduira votre Score TND à 71/100 (Critique). Votre objectif 'Vacances d'été' sera retardé de 3 semaines.`
      );
    } else {
      setSimulationResult(
        `🔮 Oracle : Dépense de ${amt.toFixed(3)} DT approuvée. Votre Score TND passera à 83/100 (Stable). Objectif 'Vacances d'été' préservé !`
      );
    }
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>ORACLE FINANCIER IA 🔮</Text>
          <Text style={styles.headerTitle}>Prédictions & Analyse</Text>
        </View>

        {/* 1. Score Gauge Widget */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <GlassCard style={styles.scoreCard} strong>
            <View style={styles.scoreRow}>
              <View style={styles.circularBadge}>
                <Text style={styles.scoreVal}>{tndScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.scoreTitle}>Score Financier Tounsi</Text>
                <Text style={styles.scoreSub}>Excellent &bull; Épargne stable</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${tndScore}%` }]} />
                </View>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* 2. Alertes IA */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <SectionTitle>Alertes & Opportunités IA</SectionTitle>
          {alerts.map((al) => (
            <View key={al.id} style={{ marginBottom: 12 }}>
              <GlassCard
                style={[
                  styles.alertCard,
                  al.type === 'warning' && { borderColor: 'rgba(239, 68, 68, 0.3)' },
                  al.type === 'caution' && { borderColor: 'rgba(245, 158, 11, 0.3)' },
                  al.type === 'success' && { borderColor: 'rgba(34, 197, 94, 0.3)' },
                ]}
              >
                <View style={styles.alertHeader}>
                  <Ionicons
                    name={
                      al.type === 'warning'
                        ? 'alert-circle'
                        : al.type === 'caution'
                        ? 'warning'
                        : 'sparkles'
                    }
                    size={20}
                    color={
                      al.type === 'warning'
                        ? '#EF4444'
                        : al.type === 'caution'
                        ? '#F59E0B'
                        : '#22C55E'
                    }
                  />
                  <Text style={styles.alertTitle}>{al.title}</Text>
                </View>
                <Text style={styles.alertDesc}>{al.desc}</Text>
                {al.cta && (
                  <Pressable
                    style={styles.alertCta}
                    onPress={al.action ? al.action : () => Alert.alert('Action', 'Redirection en cours...')}
                  >
                    <Text style={styles.alertCtaText}>{al.cta} &rarr;</Text>
                  </Pressable>
                )}
              </GlassCard>
            </View>
          ))}
        </View>

        {/* 3. Expense Simulator */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <SectionTitle>Simuler une dépense future 💸</SectionTitle>
          <GlassCard style={{ padding: 16, gap: 14 }}>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              Analysez l'impact d'un achat sur votre score d'épargne avant de dépenser :
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: '#00000030', borderRadius: 12, paddingHorizontal: 12, height: 48, justifyContent: 'center' }}>
                <TextInput
                  placeholder="Montant (DT)"
                  placeholderTextColor="#7891B280"
                  style={{ color: theme.colors.textPrimary, fontSize: 14 }}
                  keyboardType="decimal-pad"
                  value={simulationAmount}
                  onChangeText={setSimulationAmount}
                />
              </View>
              
              <View style={{ flexDirection: 'row', gap: 6, flex: 1.2 }}>
                {['Repas', 'Loisirs'].map((cat) => {
                  const active = simulationCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setSimulationCategory(cat)}
                      style={{
                        flex: 1,
                        backgroundColor: active ? theme.colors.primary : '#00000030',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFF' : theme.colors.textSecondary }}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={handleSimulate}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Prédire l'impact avec l'IA</Text>
            </Pressable>

            {simulationResult && (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderColor: '#334155', borderWidth: 1 }}>
                <Text style={{ fontSize: 12, color: theme.colors.textPrimary, lineHeight: 18 }}>{simulationResult}</Text>
              </View>
            )}
          </GlassCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
    },
    headerLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    scoreCard: {
      padding: 16,
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    circularBadge: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    scoreVal: {
      fontSize: 22,
      fontWeight: '800',
      color: '#3B82F6',
    },
    scoreMax: {
      fontSize: 11,
      color: '#B7C3D0',
      marginTop: 6,
    },
    scoreTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    scoreSub: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 3,
      marginTop: 4,
    },
    progressBarFill: {
      height: 6,
      backgroundColor: '#3B82F6',
      borderRadius: 3,
    },
    alertCard: {
      padding: 14,
      gap: 6,
      borderWidth: 1,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    alertTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    alertDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    alertCta: {
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    alertCtaText: {
      fontSize: 12,
      color: '#60A5FA',
      fontWeight: '800',
    },
  });

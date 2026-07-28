import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Screen, GlassCard, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { dbService, DbOrder } from '@/src/services/db-service';
import { TEST_USER_ID } from '@/src/hooks/use-db';
import { MOCK_DRIVER } from '../mocks';

export function OrderTrackingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [latestOrder, setLatestOrder] = useState<DbOrder | null>(null);
  const [currentStep, setCurrentStep] = useState(2); // 0: Confirmed, 1: Preparing, 2: Picked Up, 3: On The Way, 4: Delivered

  useEffect(() => {
    async function fetchOrder() {
      const order = await dbService.getLatestOrder(TEST_USER_ID);
      setLatestOrder(order);
    }
    fetchOrder();

    // Live status step progression simulation
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : 4));
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const steps = [
    { title: 'Commande Confirmée', desc: 'Le restaurant a reçu votre commande' },
    { title: 'En Préparation', desc: 'Les chefs cuisinent votre repas' },
    { title: 'Commande Récupérée', desc: 'Le livreur a pris votre sac' },
    { title: 'En Cours de Livraison', desc: 'Le livreur est en route vers chez vous' },
    { title: 'Livrée !', desc: 'Bon appétit ! 🎉' },
  ];

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={() => router.replace('/food-delivery' as any)}
          >
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Suivi en Direct
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Estimated Arrival Banner */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <GlassCard style={{ padding: 20, alignItems: 'center', backgroundColor: '#00A08215', borderColor: '#00A08250' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#00A082', letterSpacing: 1, textTransform: 'uppercase' }}>
                Heure d'arrivée estimée
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: theme.colors.textPrimary, marginVertical: 6 }}>
                20 - 30 min
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                {latestOrder?.restaurant_name || 'Dar Zaman'} · #{latestOrder?.id?.slice(0, 8) || 'SD-2025'}
              </Text>
            </GlassCard>
          </View>

          {/* Timeline Progress */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SectionTitle title="Évolution de la livraison" />
            <GlassCard style={{ padding: 20 }}>
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <View key={idx} style={styles.timelineRow}>
                    {/* Left Icon / Dot Indicator */}
                    <View style={styles.indicatorCol}>
                      <View
                        style={[
                          styles.dot,
                          isCompleted && { backgroundColor: '#00A082' },
                          isCurrent && { backgroundColor: '#FFC244', transform: [{ scale: 1.2 }] },
                        ]}
                      >
                        {isCompleted && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      {idx < steps.length - 1 && (
                        <View style={[styles.line, idx < currentStep && { backgroundColor: '#00A082' }]} />
                      )}
                    </View>

                    {/* Step Details */}
                    <View style={styles.stepInfo}>
                      <Text
                        style={[
                          styles.stepTitle,
                          { color: isCompleted ? theme.colors.textPrimary : theme.colors.textSecondary },
                          isCurrent && { color: '#FFC244', fontWeight: '800' },
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
                        {step.desc}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </GlassCard>
          </View>

          {/* Driver Information Card */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SectionTitle title="Votre Livreur" />
            <GlassCard style={{ padding: 18 }}>
              <View style={styles.driverRow}>
                <Image source={{ uri: MOCK_DRIVER.avatar }} style={styles.driverAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.textPrimary }}>
                    {MOCK_DRIVER.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                    {MOCK_DRIVER.vehicle} · ⭐ {MOCK_DRIVER.rating}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable style={styles.actionBtn}>
                    <Ionicons name="call" size={20} color="#000000" />
                  </Pressable>
                  <Pressable style={styles.actionBtn}>
                    <Ionicons name="chatbubble-ellipses" size={20} color="#000000" />
                  </Pressable>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Return Home */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginTop: 10 }}>
            <Pressable style={styles.homeBtn} onPress={() => router.replace('/food-delivery' as any)}>
              <Text style={styles.homeBtnText}>Retour à l'Accueil</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    minHeight: 50,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#3A3A3C',
    marginVertical: 4,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFC244',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBtn: {
    backgroundColor: '#FFC244',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '800',
  },
});

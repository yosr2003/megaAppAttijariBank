import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Animated, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Screen, GlassCard, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { dbService, DbOrder } from '@/src/services/db-service';
import { TEST_USER_ID } from '@/src/hooks/use-db';

interface DriverProfile {
  name: string;
  vehicle: string;
  rating: number;
  avatar: string;
  phone: string;
  speed: string;
}

const DRIVERS: DriverProfile[] = [
  {
    name: "Ahmed Chaabane",
    vehicle: "Sym Orbit III (Blanc) · 103-TUN-4589",
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    phone: "+216 98 123 456",
    speed: "Rapide"
  },
  {
    name: "Yassine Mejri",
    vehicle: "Peugeot 103 (Rouge) · 88-TUN-1245",
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    phone: "+216 95 789 012",
    speed: "Super-rapide"
  },
  {
    name: "Farouk Dridi",
    vehicle: "Vespa Primavera (Bleu) · 105-TUN-9912",
    rating: 4.7,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&q=80",
    phone: "+216 22 456 789",
    speed: "Standard"
  }
];

const TRACKING_STEPS = [
  { title: "Commande Acceptée", desc: "Le restaurant prépare votre commande", eta: "35 min", msg: "Votre commande a été transmise aux fourneaux." },
  { title: "Préparation en cuisine", desc: "Le chef prépare vos plats", eta: "30 min", msg: "Les ingrédients sont frais et en préparation." },
  { title: "Mijotage en cours", desc: "Les saveurs s'assemblent", eta: "25 min", msg: "Votre plat mijote doucement au feu de bois." },
  { title: "Emballage soigné", desc: "Mise en boîte thermique", eta: "22 min", msg: "Votre commande est emballée sous opercule thermique." },
  { title: "Livreur assigné", desc: "Le coursier récupère la feuille de route", eta: "20 min", msg: "Votre coursier a accepté la course." },
  { title: "Livreur en route vers le resto", desc: "Transit du coursier", eta: "17 min", msg: "Je roule vers le restaurant pour charger votre sac." },
  { title: "Livreur en attente", desc: "Récupération au comptoir", eta: "12 min", msg: "Le restaurant termine l'emballage. Je patiente au comptoir! 😊" },
  { title: "Commande récupérée", desc: "Sac sécurisé dans le caisson", eta: "10 min", msg: "Sac chaud récupéré! Je prends la route vers votre adresse." },
  { title: "Transit en cours", desc: "Le livreur est sur la route principale", eta: "7 min", msg: "Circulation fluide, je traverse le rond-point." },
  { title: "Livreur tout près", desc: "Recherche du numéro de porte", eta: "2 min", msg: "Je suis dans votre rue, je descends du scooter !" },
  { title: "Livrée !", desc: "Bon appétit ! 🎉", eta: "0 min", msg: "Commande livrée en mains propres. Bon appétit !" }
];

export function OrderTrackingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [latestOrder, setLatestOrder] = useState<DbOrder | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [driver, setDriver] = useState<DriverProfile>(DRIVERS[0]);
  const [driverMessage, setDriverMessage] = useState(TRACKING_STEPS[0].msg);
  
  // Animation coordinates for the courier scooter
  const courierProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function fetchOrder() {
      const order = await dbService.getLatestOrder(TEST_USER_ID);
      setLatestOrder(order);
    }
    fetchOrder();

    // Pick a random driver
    const randomDriver = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
    setDriver(randomDriver);

    // Live status step progression simulation
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev < TRACKING_STEPS.length - 1 ? prev + 1 : TRACKING_STEPS.length - 1;
        setDriverMessage(TRACKING_STEPS[next].msg);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Update animated courier progress based on step
  useEffect(() => {
    Animated.timing(courierProgress, {
      toValue: currentStep / (TRACKING_STEPS.length - 1),
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [currentStep]);

  // Interpolate courier layout position coordinates along simulated map path
  const courierTranslateX = courierProgress.interpolate({
    inputRange: [0, 0.5, 0.7, 1],
    outputRange: [30, 90, 160, 230] // slides from restaurant (30px) to home (230px)
  });

  const courierTranslateY = courierProgress.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [60, 40, 80, 50] // simulated curvy street route
  });

  const activeStepInfo = TRACKING_STEPS[currentStep];

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
            Suivi de commande en direct
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Estimated Arrival Banner */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <GlassCard style={{ padding: 20, alignItems: 'center', backgroundColor: '#00A08215', borderColor: '#00A08250' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#00A082', letterSpacing: 1 }}>
                TEMPS RESTANT ESTIMÉ
              </Text>
              <Text style={{ fontSize: 34, fontWeight: '900', color: theme.colors.textPrimary, marginVertical: 6 }}>
                {activeStepInfo.eta}
              </Text>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                {latestOrder?.restaurant_name || 'Dar Zaman'} · Commande #{latestOrder?.id?.slice(0, 8) || 'SD-9952'}
              </Text>
            </GlassCard>
          </View>

          {/* 🗺️ VISUAL SIMULATED MAP TRACKING CONTAINER */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SectionTitle title="Carte de livraison en direct" />
            <GlassCard style={{ height: 160, position: 'relative', overflow: 'hidden', backgroundColor: theme.mode === 'dark' ? '#091E3660' : '#F4F7FC', padding: 0 }}>
              {/* Simulated Map Streets (Grid vectors) */}
              <View style={{ position: 'absolute', top: 50, left: 0, right: 0, height: 4, backgroundColor: 'rgba(47, 128, 237, 0.15)' }} />
              <View style={{ position: 'absolute', top: 90, left: 0, right: 0, height: 4, backgroundColor: 'rgba(47, 128, 237, 0.15)' }} />
              <View style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: 4, backgroundColor: 'rgba(47, 128, 237, 0.15)' }} />
              <View style={{ position: 'absolute', left: 180, top: 0, bottom: 0, width: 4, backgroundColor: 'rgba(47, 128, 237, 0.15)' }} />
              
              {/* Dashed Route Path */}
              <View style={{ position: 'absolute', top: 60, left: 40, right: 40, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#00A082', height: 1 }} />

              {/* Restaurant Pin 🏪 */}
              <View style={{ position: 'absolute', left: 24, top: 46, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#FFC244', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 }}>
                  <Ionicons name="restaurant" size={16} color="#000" />
                </View>
                <Text style={{ fontSize: 9, fontWeight: '800', color: theme.colors.textSecondary, marginTop: 2 }}>Shop</Text>
              </View>

              {/* Customer Home Pin 🏠 */}
              <View style={{ position: 'absolute', right: 24, top: 46, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#2F80ED', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 }}>
                  <Ionicons name="home" size={16} color="#FFF" />
                </View>
                <Text style={{ fontSize: 9, fontWeight: '800', color: theme.colors.textSecondary, marginTop: 2 }}>Moi</Text>
              </View>

              {/* Moving Courier Scooter Icon 🛵 */}
              <Animated.View style={{
                position: 'absolute',
                left: courierTranslateX,
                top: courierTranslateY,
                transform: [{ translateY: -15 }, { translateX: -15 }]
              }}>
                <View style={{ backgroundColor: '#00A082', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4 }}>
                  <Ionicons name="bicycle" size={18} color="#FFF" />
                </View>
              </Animated.View>
            </GlassCard>
          </View>

          {/* Timeline Progress */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SectionTitle title="Évolution de la livraison" />
            <GlassCard style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <View style={{ backgroundColor: '#00A08220', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ color: '#00A082', fontSize: 13, fontWeight: '800' }}>{activeStepInfo.title}</Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{activeStepInfo.desc}</Text>
              </View>

              {/* Horizontal Multi-Step dots bar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                {TRACKING_STEPS.map((s, idx) => {
                  const isPassed = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <View key={idx} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: isCurrent ? '#FFC244' : isPassed ? '#00A082' : theme.colors.border,
                        borderWidth: isCurrent ? 3 : 0,
                        borderColor: '#FFF'
                      }} />
                      {idx < TRACKING_STEPS.length - 1 && (
                        <View style={{ flex: 1, height: 3, backgroundColor: idx < currentStep ? '#00A082' : theme.colors.border }} />
                      )}
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </View>

          {/* Driver Information Card */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SectionTitle title="Votre Livreur" />
            <GlassCard style={{ padding: 18, gap: 12 }}>
              <View style={styles.driverRow}>
                <Image source={{ uri: driver.avatar }} style={styles.driverAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary }}>
                    {driver.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }} numberOfLines={1}>
                    {driver.vehicle} · ⭐ {driver.rating}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => Alert.alert("Appel", `Appel du livreur au ${driver.phone}...`)}
                  >
                    <Ionicons name="call" size={18} color="#000" />
                  </Pressable>
                </View>
              </View>

              {/* Simulated Live message chat bubble */}
              <View style={{ backgroundColor: theme.mode === 'dark' ? '#091E36' : '#F7FAFF', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#FFC244' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFC244', marginBottom: 2 }}>MESSAGE EN DIRECT</Text>
                <Text style={{ fontSize: 13, color: theme.colors.textPrimary }}>"{driverMessage}"</Text>
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

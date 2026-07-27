import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PrimaryButton, Screen } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { Goal3DBuilder } from '../components/goal-3d-builder';
import { useGoalBlueprint } from '../hooks/use-goal-blueprint';


type Params = {
  goalId?: string;
  title?: string;
  progress?: string;
  previousProgress?: string;
  amountAdded?: string;
};

// ─── One confetti piece falling from top ─────────────────────────────────────
const CONFETTI_PIECES = [
  { color: '#FF6B9D', emoji: '🎉', x: '8%'  },
  { color: '#FFCE54', emoji: '⭐', x: '22%' },
  { color: '#48CFAD', emoji: '💚', x: '38%' },
  { color: '#AC92EC', emoji: '💜', x: '55%' },
  { color: '#4FC1E9', emoji: '💙', x: '70%' },
  { color: '#FF6B9D', emoji: '🌸', x: '85%' },
  { color: '#FFCE54', emoji: '✨', x: '15%' },
  { color: '#48CFAD', emoji: '🎊', x: '48%' },
  { color: '#FF8A65', emoji: '🔥', x: '78%' },
  { color: '#E91E63', emoji: '💖', x: '32%' },
];

function FallingPiece({ emoji, x, delay }: { emoji: string; x: string; delay: number }) {
  const fall = useSharedValue(-60);
  const wobble = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    fall.value = withDelay(
      delay,
      withTiming(720, { duration: 2200, easing: Easing.in(Easing.quad) }),
    );
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1600, withTiming(0, { duration: 400 })),
    ));
    wobble.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 350, easing: Easing.inOut(Easing.sin) }),
        ),
        6,
      ),
    );
  }, [delay, fall, opacity, wobble]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: fall.value },
      { translateX: wobble.value * 14 },
      { rotate: `${wobble.value * 22}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.confettiPiece, { left: x }, style]}
    >
      <Text style={styles.confettiEmoji}>{emoji}</Text>
    </Animated.View>
  );
}

// ─── Animated stat chip ───────────────────────────────────────────────────────
function StatChip({
  emoji, label, value, color, delay,
}: { emoji: string; label: string; value: string; color: string; delay: number }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 10, stiffness: 200 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.chip, { backgroundColor: color + '20', borderColor: color + '77' }, style]}>
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <View>
        <Text style={[styles.chipLabel, { color: color }]}>{label}</Text>
        <Text style={[styles.chipValue, { color: color }]}>{value}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main celebration screen ──────────────────────────────────────────────────
export function ProgressAnimationScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<Params>();

  const title       = params.title ?? 'Mon objectif';
  const goalId      = params.goalId;
  const targetProg  = Math.min(1, Math.max(0, parseFloat(params.progress ?? '0') || 0));
  const startProg   = Math.min(targetProg, Math.max(0, parseFloat(params.previousProgress ?? '0') || 0));
  const amountAdded = parseFloat(params.amountAdded ?? '0') || 0;

  const { blueprint, loading: blueprintLoading } = useGoalBlueprint(title, {
    goalId,
    preferRemote: false,
  });

  const [displayProgress, setDisplayProgress] = useState(startProg);
  const [buildTrigger, setBuildTrigger] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const headingScale  = useSharedValue(0.6);
  const headingOpacity = useSharedValue(0);
  const pillScale     = useSharedValue(0);
  const buttonSlide   = useSharedValue(60);
  const buttonOpacity = useSharedValue(0);

  const isGoalComplete = targetProg >= 1;

  useEffect(() => {
    // Entrance animations
    headingScale.value  = withSpring(1, { damping: 12, stiffness: 180 });
    headingOpacity.value = withTiming(1, { duration: 400 });
    pillScale.value      = withDelay(200, withSpring(1, { damping: 10, stiffness: 200 }));

    const timer = setTimeout(async () => {
      setDisplayProgress(targetProg);
      setBuildTrigger((n) => n + 1);
      setShowConfetti(true);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (isGoalComplete) {
        // Extra celebration haptics for goal completion
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 600);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 900);
      }

      buttonSlide.value  = withDelay(400, withSpring(0, { damping: 14, stiffness: 180 }));
      buttonOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    }, 350);

    return () => clearTimeout(timer);
  }, [targetProg]);

  const headingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headingScale.value }],
    opacity: headingOpacity.value,
  }));

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pillScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonSlide.value }],
    opacity: buttonOpacity.value,
  }));

  const accentColor = blueprint.accent;

  return (
    <Screen contentContainerStyle={styles.container}>
      {/* Falling confetti */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {CONFETTI_PIECES.map((p, i) => (
            <FallingPiece key={i} emoji={p.emoji} x={p.x} delay={i * 90} />
          ))}
        </View>
      )}

      {/* Header */}
      <Animated.View style={[styles.headerBlock, headingStyle]}>
        <Text style={styles.mainEmoji}>
          {isGoalComplete ? '🏆' : '🚀'}
        </Text>
        <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
          {isGoalComplete
            ? 'Objectif Atteint !'
            : 'Votre objectif grandit !'}
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
          {amountAdded > 0
            ? `+${amountAdded.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND viennent d'être ajoutés ✨`
            : 'Chaque dirham vous rapproche de votre rêve.'}
        </Text>
      </Animated.View>

      {/* 3D Builder */}
      <Goal3DBuilder
        progress={displayProgress}
        label={title}
        blueprint={blueprint}
        buildTrigger={buildTrigger}
        loading={blueprintLoading}
        showLabel
        style={styles.builder}
      />

      {/* Stat chips */}
      {amountAdded > 0 && (
        <View style={styles.chipsRow}>
          <StatChip
            emoji="💰"
            label="Ajouté"
            value={`${amountAdded.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND`}
            color={accentColor}
            delay={500}
          />
          <StatChip
            emoji="📈"
            label="Progression"
            value={`${Math.round(targetProg * 100)}%`}
            color="#48CFAD"
            delay={650}
          />
        </View>
      )}

      {/* Back button */}
      <Animated.View style={[styles.actions, buttonStyle]}>
        <PrimaryButton
          label={isGoalComplete ? '🎊 Voir mon trophée !' : '← Retour à l\'objectif'}
          onPress={() => router.back()}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 16,
  },

  // Confetti
  confettiPiece: {
    position: 'absolute',
    top: 0,
    zIndex: 99,
  },
  confettiEmoji: {
    fontSize: 20,
  },

  // Header
  headerBlock: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  mainEmoji: {
    fontSize: 48,
    lineHeight: 56,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  // Builder
  builder: {
    // full width, no extra padding
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  chipEmoji: { fontSize: 22 },
  chipLabel: { fontSize: 11, fontWeight: '600', opacity: 0.8 },
  chipValue: { fontSize: 15, fontWeight: '900' },

  // Button
  actions: {
    marginTop: 4,
  },
});

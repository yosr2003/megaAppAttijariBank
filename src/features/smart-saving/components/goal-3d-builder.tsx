import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/src/hooks/use-theme';
import { buildLocalBlueprint } from '@/src/services/gemini-service';
import { getShapeBounds, getShapeSlots } from '../data/shape-templates';
import type { GoalBlueprint } from '../types/goal-blueprint';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Floating confetti dots scattered across the stage ───────────────────────
const CONFETTI: { left: string; top: string; size: number; drift: number; color: string }[] = [
  { left: '8%',  top: '18%', size: 9,  drift: -14, color: '#FF6B9D' },
  { left: '20%', top: '72%', size: 6,  drift: 10,  color: '#FFCE54' },
  { left: '78%', top: '12%', size: 7,  drift: -9,  color: '#48CFAD' },
  { left: '88%', top: '55%', size: 10, drift: 13,  color: '#AC92EC' },
  { left: '63%', top: '78%', size: 6,  drift: -11, color: '#4FC1E9' },
  { left: '35%', top: '10%', size: 8,  drift: 8,   color: '#FFCE54' },
  { left: '55%', top: '68%', size: 5,  drift: -12, color: '#FF6B9D' },
];

// ─── Coin burst particles ─────────────────────────────────────────────────────
const COINS = [
  { angle: 0,   radius: 55 },
  { angle: 45,  radius: 62 },
  { angle: 90,  radius: 50 },
  { angle: 135, radius: 58 },
  { angle: 180, radius: 52 },
  { angle: 225, radius: 60 },
  { angle: 270, radius: 54 },
  { angle: 315, radius: 56 },
];

export interface Goal3DBuilderProps {
  progress: number;
  label?: string;
  icon?: IconName;
  blueprint?: GoalBlueprint;
  buildTrigger?: number;
  compact?: boolean;
  showLabel?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ─── One floating confetti piece ─────────────────────────────────────────────
function ConfettiDot({
  left, top, size, drift, color, index,
}: (typeof CONFETTI)[number] & { index: number }) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withDelay(
      index * 220,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1100 + index * 120, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100 + index * 120, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, [float, index]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 + float.value * 0.5,
    transform: [
      { translateY: drift * float.value },
      { rotate: `${float.value * 180}deg` },
      { scale: 0.6 + float.value * 0.5 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

// ─── One coin burst particle ──────────────────────────────────────────────────
function CoinBurst({
  angle, radius, burst, color,
}: { angle: number; radius: number; burst: SharedValue<number>; color: string }) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * radius;
  const ty = Math.sin(rad) * radius;

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(burst.value, [0, 0.3, 0.8, 1], [0, 1, 0.8, 0], 'clamp'),
    transform: [
      { translateX: tx * burst.value },
      { translateY: ty * burst.value - 20 * burst.value },
      { scale: 0.3 + burst.value * 0.9 },
      { rotate: `${burst.value * 360}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.coin, { backgroundColor: color, borderColor: color + 'AA' }, style]}
    >
      <Text style={styles.coinEmoji}>⭐</Text>
    </Animated.View>
  );
}

// Helper to colorize specific parts of the 3D model (e.g. wheels, windows, roof) to look like real objects
const getBlockColors = (shape: string, slot: { x: number; y: number; layer: number }, blueprint: GoalBlueprint) => {
  const defaults = {
    top: blueprint.blockTop,
    front: blueprint.blockFront,
    side: blueprint.blockSide,
  };

  if (shape === 'car') {
    // Wheels at bottom corners (x=0 or x=3, and y=0 or y=2)
    if (slot.layer === 0 && (slot.x === 0 || slot.x === 3) && (slot.y === 0 || slot.y === 2)) {
      return { top: '#2D3748', front: '#1A202C', side: '#10141D' };
    }
    // Cabin windshields/windows (layer 2)
    if (slot.layer === 2) {
      return { top: '#A5F3FC', front: '#22D3EE', side: '#0891B2' };
    }
    // Cabin roof (layer 3)
    if (slot.layer === 3) {
      return { top: '#FF6B6B', front: '#EF4444', side: '#C92A2A' };
    }
    // Body of the car (layer 1 and parts of layer 0)
    return { top: '#FFD93D', front: '#FFC244', side: '#D99E10' };
  }

  if (shape === 'house') {
    // Roof ridge/chimney (layer 3)
    if (slot.layer === 3) {
      if (slot.x === 2 && slot.y === 2) {
        // Chimney (Red Brick)
        return { top: '#FCA5A5', front: '#EF4444', side: '#B91C1C' };
      }
      // Roof ridge (Rosy Red tiles)
      return { top: '#FDA4AF', front: '#F43F5E', side: '#BE123C' };
    }
    // Ceiling/Roof Overhang (layer 2)
    if (slot.layer === 2) {
      return { top: '#FDA4AF', front: '#F43F5E', side: '#BE123C' };
    }
    // Main walls
    return { top: '#F8FAFC', front: '#E2E8F0', side: '#94A3B8' };
  }

  if (shape === 'phone') {
    // Screen blocks in the center
    if (slot.layer === 1 && slot.x === 1 && slot.y >= 1 && slot.y <= 3) {
      return { top: '#93C5FD', front: '#3B82F6', side: '#1D4ED8' };
    }
    // Matte Titanium frame
    return { top: '#475569', front: '#334155', side: '#1E293B' };
  }

  if (shape === 'plane') {
    // Wingtips (extreme left x=0 and right x=6 on layer 0) and tail fin (layer 2/3)
    if (slot.layer >= 2 || (slot.layer === 0 && (slot.x === 0 || slot.x === 6))) {
      return { top: '#FDA4AF', front: '#F43F5E', side: '#BE123C' };
    }
    // Cockpit windows (layer 2 center)
    if (slot.layer === 2 && slot.x === 3 && slot.y === 1) {
      return { top: '#A5F3FC', front: '#22D3EE', side: '#0891B2' };
    }
    // Main fuselage body (white)
    return { top: '#F8FAFC', front: '#E2E8F0', side: '#94A3B8' };
  }

  return defaults;
};

// ─── One voxel block with cartoon styling ────────────────────────────────────
function VoxelBlock({
  index,
  blockCount,
  progressValue,
  pulse,
  blueprint,
  blockSize,
  slot,
}: {
  index: number;
  blockCount: number;
  progressValue: SharedValue<number>;
  pulse: SharedValue<number>;
  blueprint: GoalBlueprint;
  blockSize: number;
  slot: { x: number; y: number; layer: number };
}) {
  const threshold = (index + 1) / blockCount;
  const jiggle = useSharedValue(0);
  const hasAppeared = useSharedValue(0);

  const blockColors = getBlockColors(blueprint.shape, slot, blueprint);

  const blockStyle = useAnimatedStyle(() => {
    const appear = interpolate(progressValue.value, [threshold - 0.1, threshold], [0, 1], 'clamp');
    const bounce = appear >= 1 ? pulse.value * 0.12 : 0;

    // Trigger jiggle once when block first fully appears
    if (appear >= 1 && hasAppeared.value === 0) {
      hasAppeared.value = 1;
      jiggle.value = withSequence(
        withSpring(1.18, { damping: 4, stiffness: 280 }),
        withSpring(0.92, { damping: 8, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 180 }),
      );
    }

    return {
      opacity: appear,
      transform: [
        { translateY: interpolate(appear, [0, 1], [-blockSize * 2, 0]) },
        { scale: (appear < 1 ? appear : (jiggle.value > 0 ? jiggle.value : 1)) * (1 + bounce) },
      ],
    };
  });

  const left = slot.x * (blockSize * 0.76);
  const bottom = slot.y * (blockSize * 0.76) + slot.layer * (blockSize * 0.58);

  return (
    <Animated.View
      style={[
        styles.blockSlot,
        { left, bottom, width: blockSize, height: blockSize },
        blockStyle,
      ]}
    >
      {/* Top face */}
      <View
        style={[
          styles.blockTop,
          {
            backgroundColor: blockColors.top,
            width: blockSize,
            height: blockSize * 0.38,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
          },
        ]}
      />
      {/* Shine highlight on top */}
      <View style={[styles.blockShine, { width: blockSize * 0.32, backgroundColor: '#FFFFFF', opacity: 0.65 }]} />
      {/* Front face */}
      <View
        style={[
          styles.blockFront,
          {
            backgroundColor: blockColors.front,
            width: blockSize,
            height: blockSize * 0.62,
            borderBottomLeftRadius: 5,
          },
        ]}
      >
        {/* Kawaii Face Overlay */}
        {(index % 4 === 0) && (
          <View style={{ position: 'absolute', top: 2, left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(18, 24, 38, 0.8)' }} />
            <Text style={{ fontSize: 7, color: 'rgba(18, 24, 38, 0.8)', fontWeight: '900', marginTop: -3 }}>‿</Text>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(18, 24, 38, 0.8)' }} />
          </View>
        )}
      </View>
      {/* Side face */}
      <View
        style={[
          styles.blockSide,
          {
            backgroundColor: blockColors.side,
            width: blockSize * 0.36,
            height: blockSize * 0.62,
            borderBottomRightRadius: 5,
          },
        ]}
      />
      {/* Cartoon border outline */}
      <View
        style={[
          styles.blockOutline,
          {
            width: blockSize + 2,
            height: blockSize + 2,
            borderRadius: 6,
            borderColor: '#121826',
            borderWidth: 1.5,
          },
        ]}
      />
    </Animated.View>
  );
}

// ─── Main 3D Builder ──────────────────────────────────────────────────────────
export function Goal3DBuilder({
  progress,
  label,
  icon,
  blueprint: blueprintProp,
  buildTrigger = 0,
  compact = false,
  showLabel = true,
  loading = false,
  style,
}: Goal3DBuilderProps) {
  const theme = useTheme();
  const blueprint = blueprintProp ?? buildLocalBlueprint(label ?? '');
  const displayIcon = icon ?? blueprint.icon;
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const progressPercent = Math.round(clampedProgress * 100);

  const slots = useMemo(() => {
    const rawSlots = getShapeSlots(blueprint.shape);
    // Sort slots back-to-front:
    // 1. Bottom layer first (layer ascending)
    // 2. Back row first (y descending, higher y is further back)
    // 3. Left-most first (x ascending, lower x is further back)
    return [...rawSlots].sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      if (a.y !== b.y) return b.y - a.y;
      return a.x - b.x;
    });
  }, [blueprint.shape]);
  const bounds = useMemo(() => getShapeBounds(slots), [slots]);
  const blockCount = slots.length;

  // Shared animation values
  const animatedProgress = useSharedValue(clampedProgress);
  const scenePulse       = useSharedValue(0);
  const iconBounce       = useSharedValue(1);
  const burstVal         = useSharedValue(0);
  const shimmerVal       = useSharedValue(0);
  const iconWiggle       = useSharedValue(0);
  const stageGlow        = useSharedValue(0);

  const blockSize   = compact ? 24 : 32;
  const stackWidth  = (bounds.maxX + 1) * blockSize * 0.76 + blockSize;
  const stackHeight = (bounds.maxY + 1) * blockSize * 0.76 + (bounds.maxLayer + 1) * blockSize * 0.58 + blockSize;
  const sceneHeight = compact ? 200 : 270;

  // Level based on progress (1–5 stars)
  const starCount = Math.max(1, Math.ceil(clampedProgress * 5));

  // Animate progress
  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 1100,
      easing: Easing.out(Easing.back(1.4)),
    });
  }, [animatedProgress, clampedProgress]);

  // Continuous shimmer on progress bar
  useEffect(() => {
    shimmerVal.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.linear }),
      -1,
    );
  }, [shimmerVal]);

  // Idle icon breathing
  useEffect(() => {
    iconBounce.value = withRepeat(
      withSequence(
        withSpring(1.08, { damping: 6, stiffness: 120 }),
        withSpring(1.0, { damping: 8, stiffness: 100 }),
      ),
      -1,
    );
  }, [iconBounce]);

  // Deposit celebration burst
  useEffect(() => {
    if (buildTrigger <= 0) return;

    // Coin burst
    burstVal.value = 0;
    burstVal.value = withSequence(
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 200 }),
    );

    // Scene pulse
    scenePulse.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 300 }),
      withTiming(0, { duration: 500 }),
    );

    // Icon wiggle
    iconWiggle.value = withSequence(
      withTiming(-12, { duration: 80 }),
      withTiming(14, { duration: 80 }),
      withTiming(-10, { duration: 80 }),
      withTiming(8,  { duration: 80 }),
      withTiming(0,  { duration: 100 }),
    );

    // Stage glow flash
    stageGlow.value = withSequence(
      withTiming(1, { duration: 250 }),
      withTiming(0, { duration: 600 }),
    );
  }, [buildTrigger, burstVal, iconWiggle, scenePulse, stageGlow]);

  // ── Animated styles ──────────────────────────────────────────────────────
  const sceneStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: '50deg' },
      { rotateZ: `-8deg` },
      { scale: 1 + scenePulse.value * 0.05 },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedProgress.value, [0.3, 0.6], [0, 1], 'clamp'),
    transform: [
      { scale: iconBounce.value + scenePulse.value * 0.12 },
      { rotate: `${iconWiggle.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + animatedProgress.value * 0.4 + stageGlow.value * 0.35,
    transform: [{ scale: 0.85 + animatedProgress.value * 0.3 + scenePulse.value * 0.2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  const stageFlashStyle = useAnimatedStyle(() => ({
    opacity: stageGlow.value * 0.28,
  }));

  const shapeLabel = blueprint.label || label;

  return (
    <View style={[styles.wrapper, style]}>

      {/* ── Stage ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.stage,
          {
            height: sceneHeight,
            backgroundColor: theme.mode === 'dark' ? '#1A1040' : '#F8F4FF',
            borderColor: blueprint.accent + '55',
          },
        ]}
      >
        {/* Soft radial blobs */}
        <View style={[styles.blob1, { backgroundColor: blueprint.accent + '22' }]} />
        <View style={[styles.blob2, { backgroundColor: blueprint.blockTop + '18' }]} />

        {/* Loading overlay */}
        {loading ? (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingEmoji}>🔮</Text>
            <ActivityIndicator color={blueprint.accent} size="large" />
            <Text style={[styles.loadingText, { color: blueprint.accent }]}>
              Gemini crée votre monde…
            </Text>
          </View>
        ) : null}

        {/* Stage flash on burst */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: blueprint.accent, borderRadius: 24, zIndex: 8 },
            stageFlashStyle,
          ]}
        />

        {/* Floating confetti dots */}
        {!compact &&
          CONFETTI.map((c, i) => (
            <ConfettiDot key={i} {...c} index={i} />
          ))}

        {/* Glow orb */}
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: blueprint.accent, shadowColor: blueprint.accent },
            glowStyle,
          ]}
        />

        {/* Coin burst on deposit */}
        {!compact && COINS.map((coin, i) => (
          <CoinBurst
            key={i}
            angle={coin.angle}
            radius={coin.radius}
            burst={burstVal}
            color={[blueprint.accent, blueprint.blockTop, '#FFCE54', '#FF6B9D'][i % 4]}
          />
        ))}

        {/* Icon badge */}
        <Animated.View
          style={[
            styles.iconBadge,
            {
              backgroundColor: blueprint.accent + '20',
              borderColor: blueprint.accent + 'AA',
            },
            iconStyle,
          ]}
        >
          <Ionicons color={blueprint.accent} name={displayIcon} size={compact ? 30 : 42} />
        </Animated.View>

        {/* Isometric voxel scene */}
        <Animated.View style={[styles.scene, sceneStyle]}>
          {/* Ground platform */}
          <View
            style={[
              styles.platform,
              {
                width: stackWidth * 1.15,
                height: stackWidth * 1.15,
                backgroundColor: blueprint.accent + '18',
                borderColor: blueprint.accent + '66',
              },
            ]}
          />
          {/* Voxel blocks */}
          <View style={[styles.stack, { width: stackWidth, height: stackHeight }]}>
            {slots.map((slot, index) => (
              <VoxelBlock
                key={`${slot.x}-${slot.y}-${slot.layer}`}
                index={index}
                blockCount={blockCount}
                progressValue={animatedProgress}
                pulse={scenePulse}
                blueprint={blueprint}
                blockSize={blockSize}
                slot={slot}
              />
            ))}
          </View>
        </Animated.View>

        {/* Build hint pill */}
        {clampedProgress < 1 && !loading ? (
          <View
            style={[
              styles.buildHint,
              { backgroundColor: blueprint.accent + '18', borderColor: blueprint.accent + '55' },
            ]}
          >
            <Text style={styles.buildHintEmoji}>✨</Text>
            <Text style={[styles.buildHintText, { color: blueprint.accent }]}>
              {blueprint.buildCaption}
            </Text>
          </View>
        ) : clampedProgress >= 1 && !loading ? (
          <View
            style={[
              styles.buildHint,
              { backgroundColor: '#48CFAD22', borderColor: '#48CFADAA' },
            ]}
          >
            <Text style={styles.buildHintEmoji}>🎉</Text>
            <Text style={[styles.buildHintText, { color: '#48CFAD' }]}>
              Objectif atteint ! Félicitations !
            </Text>
          </View>
        ) : null}

        {/* AI badge */}
        {blueprint.source === 'gemini' && !compact ? (
          <View style={[styles.aiBadge, { backgroundColor: blueprint.accent + '25', borderColor: blueprint.accent + '66' }]}>
            <Text style={{ fontSize: 9 }}>✨</Text>
            <Text style={[styles.aiBadgeText, { color: blueprint.accent }]}>IA</Text>
          </View>
        ) : null}
      </View>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      {showLabel ? (
        <View style={styles.footer}>
          {/* Label + stars row */}
          <View style={styles.labelRow}>
            {shapeLabel ? (
              <Text style={[styles.label, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {shapeLabel}
              </Text>
            ) : null}
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Text key={s} style={[styles.star, { opacity: s <= starCount ? 1 : 0.2 }]}>
                  ⭐
                </Text>
              ))}
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.track, { backgroundColor: blueprint.accent + '25' }]}>
            <Animated.View
              style={[
                styles.fill,
                { backgroundColor: blueprint.accent },
                fillStyle,
              ]}
            />
            {/* Shimmer overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmer,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [
                    {
                      translateX: shimmerVal.value
                        ? interpolate(shimmerVal.value, [0, 1], [-80, 200])
                        : -80,
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Percentage pill */}
          <View style={[styles.percentPill, { backgroundColor: blueprint.accent + '20', borderColor: blueprint.accent + '55' }]}>
            <Text style={[styles.percentEmoji]}>🏗️</Text>
            <Text style={[styles.percentText, { color: blueprint.accent }]}>
              {progressPercent}% construit
            </Text>
            {progressPercent >= 100 && <Text style={styles.percentEmoji}>🎊</Text>}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 16 },

  // Stage
  stage: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 28,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  // Background blobs
  blob1: {
    borderRadius: 999,
    height: 200,
    position: 'absolute',
    right: -80,
    top: -60,
    width: 200,
  },
  blob2: {
    borderRadius: 999,
    bottom: -80,
    height: 220,
    left: -80,
    position: 'absolute',
    width: 220,
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    zIndex: 10,
    gap: 10,
    borderRadius: 28,
  },
  loadingEmoji: { fontSize: 32 },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Glow
  glow: {
    borderRadius: 999,
    height: 130,
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 35,
    width: 130,
  },

  // Icon badge
  iconBadge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2.5,
    height: 70,
    justifyContent: 'center',
    position: 'absolute',
    top: 18,
    width: 70,
    zIndex: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  // Isometric scene
  scene: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  platform: {
    borderRadius: 12,
    borderWidth: 2,
    opacity: 0.8,
    position: 'absolute',
    transform: [{ rotateZ: '45deg' }],
  },
  stack: {
    position: 'relative',
  },

  // Voxel block parts
  blockSlot: {
    position: 'absolute',
  },
  blockTop: {
    left: 0,
    position: 'absolute',
    top: 0,
    transform: [{ skewX: '-35deg' }, { scaleY: 0.55 }],
  },
  blockShine: {
    borderRadius: 999,
    height: 4,
    left: 6,
    opacity: 0.45,
    position: 'absolute',
    top: 7,
  },
  blockFront: {
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  blockSide: {
    bottom: 0,
    position: 'absolute',
    right: -7,
    transform: [{ skewY: '-35deg' }],
  },
  blockOutline: {
    borderWidth: 1.5,
    position: 'absolute',
    left: -1,
    top: -1,
    pointerEvents: 'none',
  },

  // Coin burst
  coin: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    width: 22,
    zIndex: 6,
  },
  coinEmoji: { fontSize: 10 },

  // Build hint pill
  buildHint: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
    maxWidth: '90%',
    paddingHorizontal: 14,
    paddingVertical: 7,
    position: 'absolute',
  },
  buildHintEmoji: { fontSize: 13 },
  buildHintText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // AI badge
  aiBadge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  // Footer
  footer: { gap: 8 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 17, fontWeight: '800', flex: 1 },
  stars: { flexDirection: 'row', gap: 1 },
  star: { fontSize: 12 },

  // Progress bar
  track: {
    borderRadius: 999,
    height: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    borderRadius: 999,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  shimmer: {
    borderRadius: 999,
    height: '100%',
    opacity: 0.25,
    position: 'absolute',
    width: 60,
    top: 0,
  },

  // Percentage pill
  percentPill: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  percentEmoji: { fontSize: 13 },
  percentText: { fontSize: 13, fontWeight: '800' },
});

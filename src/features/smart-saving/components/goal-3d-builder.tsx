import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useTheme } from '@/src/hooks/use-theme';
import type { GoalBlueprint } from '../types/goal-blueprint';

interface Goal3DBuilderProps {
  progress: number;
  label?: string;
  blueprint?: GoalBlueprint;
  buildTrigger?: number;
  compact?: boolean;
  loading?: boolean;
}

export function Goal3DBuilder({
  progress,
  label,
  blueprint,
  buildTrigger = 0,
  compact = false,
  loading = false,
}: Goal3DBuilderProps) {
  const theme = useTheme();
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const progressPercent = Math.round(clampedProgress * 100);
  const shape = blueprint?.shape ?? 'tower';

  // Animation values
  const scaleVal = useSharedValue(0.9);
  const rotateVal = useSharedValue(0);
  const fillVal = useSharedValue(0);
  const bounceVal = useSharedValue(0);

  useEffect(() => {
    scaleVal.value = withSpring(1, { damping: 10, stiffness: 100 });
    fillVal.value = withTiming(clampedProgress, { duration: 1200 });
  }, [clampedProgress]);

  // Idle animation: gentle float/bounce
  useEffect(() => {
    bounceVal.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  // Trigger celebration on deposit
  useEffect(() => {
    if (buildTrigger > 0) {
      scaleVal.value = withSequence(
        withSpring(1.2, { damping: 5, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
      rotateVal.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [buildTrigger]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(bounceVal.value, [0, 1], [0, -8]) },
      { scale: scaleVal.value },
      { rotate: `${rotateVal.value}deg` }
    ]
  }));

  const fillPercentStyle = useAnimatedStyle(() => ({
    height: `${fillVal.value * 100}%`,
    transform: [
      { rotate: `${interpolate(bounceVal.value, [0, 1], [-1.2, 1.2])}deg` }
    ]
  }));

  // Render cartoonish illustrations using styled vector containers
  const renderIllustration = () => {
    // Determine milestone activation states
    const hasWheels = progress > 0.15;
    const hasWindshield = progress > 0.65;
    const hasDetails = progress > 0.4;

    switch (shape) {
      case 'car':
        return (
          <View style={styles.container3D}>
            {/* Cartoon Car Frame */}
            <View style={styles.carBodyOutline}>
              {/* Windshield / Roof */}
              <View 
                style={[
                  styles.carWindshield, 
                  { opacity: hasWindshield ? 1 : 0.25, borderColor: hasWindshield ? '#1E293B' : '#64748B' }
                ]} 
              />
              
              {/* Car Main Cabin */}
              <View style={styles.carCabinMain}>
                {/* Colored fill overlay reflecting progress */}
                <Animated.View style={[styles.carFillColor, fillPercentStyle]} />
                {/* Cute cartoon headlights */}
                <View style={[styles.headlight, { left: 8, opacity: hasDetails ? 1 : 0.3 }]} />
                <View style={[styles.headlight, { right: 8, opacity: hasDetails ? 1 : 0.3 }]} />
              </View>
            </View>

            {/* Wheels */}
            <View style={[styles.wheelsRow, { opacity: hasWheels ? 1 : 0.3 }]}>
              <View style={styles.wheelOuter}>
                <View style={styles.wheelInner} />
              </View>
              <View style={styles.wheelOuter}>
                <View style={styles.wheelInner} />
              </View>
            </View>
            {/* Ground Shadow */}
            <View style={styles.groundShadow} />
          </View>
        );

      case 'house':
        return (
          <View style={styles.container3D}>
            {/* Cozy Cottage */}
            <View style={styles.houseFrame}>
              {/* Red Sloped Roof */}
              <View style={[styles.houseRoof, { borderBottomColor: hasWindshield ? '#F43F5E' : '#94A3B8', opacity: hasWindshield ? 1 : 0.35 }]} />
              
              {/* Main House Wall */}
              <View style={styles.houseWall}>
                {/* Progress color fill */}
                <Animated.View style={[styles.houseFillColor, fillPercentStyle]} />
                
                {/* Center Door */}
                <View style={[styles.houseDoor, { opacity: hasDetails ? 1 : 0.25 }]} />
                {/* Window */}
                <View style={[styles.houseWindow, { opacity: hasDetails ? 1 : 0.25 }]} />
              </View>
            </View>
            <View style={styles.groundShadow} />
          </View>
        );

      case 'phone':
        return (
          <View style={styles.container3D}>
            {/* Cartoon Smartphone */}
            <View style={styles.phoneFrame}>
              <View style={styles.phoneScreen}>
                {/* Color progress fill */}
                <Animated.View style={[styles.phoneFillColor, fillPercentStyle]} />
                
                {/* Inner screen content */}
                <View style={styles.phoneInnerNotch} />
                {progress > 0.75 && (
                  <Ionicons name="sparkles" size={24} color="#FFF" style={{ marginTop: 20 }} />
                )}
              </View>
            </View>
            <View style={styles.groundShadow} />
          </View>
        );

      case 'plane':
      case 'plane':
        return (
          <View style={styles.container3D}>
            {/* Travel Jet */}
            <View style={styles.planeFrame}>
              {/* Wings */}
              <View style={[styles.planeWings, { opacity: hasWheels ? 1 : 0.3 }]} />
              {/* Main Fuselage */}
              <View style={styles.planeFuselage}>
                {/* Progress fill */}
                <Animated.View style={[styles.planeFillColor, fillPercentStyle]} />
                {/* Cockpit Window */}
                <View style={[styles.planeCockpit, { opacity: hasWindshield ? 1 : 0.25 }]} />
              </View>
            </View>
            <View style={styles.groundShadow} />
          </View>
        );

      default: // Generic Safe/Vault
        return (
          <View style={styles.container3D}>
            {/* 3D Savings Chest/Vault */}
            <View style={{
              width: 90,
              height: 90,
              backgroundColor: '#1E293B',
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#64748B',
              justifyContent: 'flex-end',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Gold Progress Fill */}
              <Animated.View style={[{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#ECC863',
              }, fillPercentStyle]} />

              {/* Vault Handle/Lock */}
              <View style={{
                position: 'absolute',
                top: '30%',
                alignSelf: 'center',
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 3,
                borderColor: '#F8FAFC',
                backgroundColor: '#334155',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: hasDetails ? 1 : 0.3
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#F8FAFC'
                }} />
              </View>
            </View>
            <View style={styles.groundShadow} />
          </View>
        );
    }
  };

  return (
    <View style={styles.wrapper}>
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <View style={{ position: 'relative', width: 220, alignItems: 'center' }}>
          {/* Floating Sparkle Stars */}
          {progress > 0.5 && (
            <>
              <Text style={{ position: 'absolute', top: 20, left: 10, fontSize: 18, color: '#ECC863', zIndex: 10 }}>⭐</Text>
              <Text style={{ position: 'absolute', top: 50, right: 15, fontSize: 14, color: '#ECC863', zIndex: 10 }}>✨</Text>
              <Text style={{ position: 'absolute', bottom: 60, left: 20, fontSize: 12, color: '#ECC863', zIndex: 10 }}>⭐</Text>
            </>
          )}

          <Animated.View style={[styles.illustrationWrapper, floatStyle]}>
            {renderIllustration()}
          </Animated.View>
        </View>
      )}

      {/* Progress pill overlay */}
      <View style={[styles.progressBadge, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.progressText}>{progressPercent}% Épargné</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingWrapper: {
    height: 180,
    justifyContent: 'center',
  },
  illustrationWrapper: {
    height: 220,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container3D: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundShadow: {
    width: 140,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 8,
  },

  // 🚗 Cartoon Car Styles
  carBodyOutline: {
    width: 140,
    height: 75,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  carWindshield: {
    width: 80,
    height: 35,
    backgroundColor: '#A5F3FC',
    borderColor: '#1E293B',
    borderWidth: 3,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginBottom: -3,
  },
  carCabinMain: {
    width: 140,
    height: 45,
    backgroundColor: '#334155',
    borderColor: '#1E293B',
    borderWidth: 3,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carFillColor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFC244',
  },
  headlight: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
    borderColor: '#1E293B',
    borderWidth: 2,
    zIndex: 2,
  },
  wheelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 110,
    marginTop: -8,
    zIndex: 3,
  },
  wheelOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
  },
  wheelInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#94A3B8',
  },

  // 🏠 Cartoon House Styles
  houseFrame: {
    width: 120,
    height: 110,
    alignItems: 'center',
  },
  houseRoof: {
    width: 130,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 65,
    borderRightWidth: 65,
    borderBottomWidth: 45,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F43F5E',
  },
  houseWall: {
    width: 110,
    height: 65,
    backgroundColor: '#E2E8F0',
    borderColor: '#1E293B',
    borderWidth: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  houseFillColor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
  houseDoor: {
    width: 24,
    height: 38,
    backgroundColor: '#8B5CF6',
    borderColor: '#1E293B',
    borderWidth: 2.5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    position: 'absolute',
    bottom: 0,
    left: 43,
  },
  houseWindow: {
    width: 20,
    height: 20,
    backgroundColor: '#A5F3FC',
    borderColor: '#1E293B',
    borderWidth: 2,
    borderRadius: 4,
    position: 'absolute',
    top: 10,
    left: 12,
  },

  // 📱 Cartoon Phone Styles
  phoneFrame: {
    width: 75,
    height: 130,
    backgroundColor: '#1E293B',
    borderColor: '#0F172A',
    borderWidth: 4,
    borderRadius: 18,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  phoneFillColor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
  },
  phoneInnerNotch: {
    width: 25,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginTop: 4,
  },

  // ✈️ Cartoon Plane Styles
  planeFrame: {
    width: 140,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeWings: {
    width: 130,
    height: 18,
    backgroundColor: '#E2E8F0',
    borderColor: '#1E293B',
    borderWidth: 3,
    borderRadius: 9,
    position: 'absolute',
    zIndex: 1,
  },
  planeFuselage: {
    width: 42,
    height: 90,
    backgroundColor: '#F8FAFC',
    borderColor: '#1E293B',
    borderWidth: 3,
    borderRadius: 20,
    zIndex: 2,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  planeFillColor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EF4444',
  },
  planeCockpit: {
    width: 26,
    height: 16,
    backgroundColor: '#A5F3FC',
    borderColor: '#1E293B',
    borderWidth: 2.5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 10,
  },

  progressBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

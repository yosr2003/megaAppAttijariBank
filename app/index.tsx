import { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StarField } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';

export default function SplashScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {theme.mode === 'dark' && <StarField />}

      <View style={styles.content}>
        <View style={styles.logoGlow} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/supertounsi_logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>
            <Text style={styles.brandSuper}>Super</Text>
            <Text style={styles.brandTounsi}>Tounsi</Text>
          </Text>
          <View style={styles.redDot} />
        </View>

        <Text style={styles.tagline}>• YOUR LIFE. ONE APP.</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoGlow: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.colors.primary,
      opacity: 0.15,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 40,
    },
    logoContainer: {
      width: 140,
      height: 140,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 8,
      marginBottom: 40,
    },
    logoImage: {
      width: '100%',
      height: '100%',
    },
    brandContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    brandText: {
      fontSize: 42,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    brandSuper: {
      color: theme.colors.textPrimary,
    },
    brandTounsi: {
      color: theme.colors.primary,
    },
    redDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.danger,
      marginTop: 8,
    },
    tagline: {
      fontSize: 12,
      fontWeight: '300',
      color: theme.colors.textSecondary,
      letterSpacing: 4,
      marginTop: 10,
      opacity: 0.8,
    },
  });

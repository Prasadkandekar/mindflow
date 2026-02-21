import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#FFD1B0", "#FFF9F5"]}
      style={styles.container}
    >
      <View style={styles.center}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🌙</Text>
        </View>

        <Text style={styles.appName}>MoonDiary</Text>
        <Text style={styles.tagline}>Your Mindful Space</Text>

        <ActivityIndicator size="small" color="#FF7B1B" style={{ marginTop: 48 }} />
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          🔒 End-to-End Encrypted
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center' },
  logoBox: {
    width: 160, height: 160, backgroundColor: 'white',
    borderRadius: 50, justifyContent: 'center', alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  logoEmoji: { fontSize: 70 },
  appName: { fontSize: 36, color: '#3D2C2E', fontWeight: 'bold', letterSpacing: -0.5 },
  tagline: { fontSize: 18, color: '#8E7E77', marginTop: 8, fontWeight: '500' },
  badge: {
    position: 'absolute', bottom: 48,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
  },
  badgeText: { fontSize: 12, color: '#8E7E77', fontWeight: '600' },
});


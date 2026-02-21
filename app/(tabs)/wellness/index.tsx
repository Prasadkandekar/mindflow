import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../services/supabase';
import { generateWeeklyReport } from '../../../services/wellness-report';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

const RecommendedCard = ({ title, subtitle, tag, color, onPress, imageUrl }: { title: string, subtitle: string, tag: string, color: string, onPress: () => void, imageUrl: string }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className={`${color} w-64 h-80 rounded-[48px] p-8 mr-4 shadow-soft relative overflow-hidden`}
  >
    {/* Illustration from Web */}
    <Image
      source={{ uri: imageUrl }}
      className="absolute right-[25] top-[40] w-48 h-48 opacity-40"
      resizeMode="contain"
    />

    <View className="flex-row justify-between items-start z-10">
      <View className="bg-white/30 px-4 py-1.5 rounded-full">
        <Text className="text-textPrimary font-bold text-[10px] uppercase tracking-wider">{tag}</Text>
      </View>
      <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
        <Ionicons name="play" size={18} color="#2D1E17" />
      </View>
    </View>

    <View className="flex-1" />

    <View className="z-10">
      <Text className="text-textPrimary font-bold text-2xl leading-tight mb-1">{title}</Text>
      <Text className="text-textPrimary/60 font-medium text-sm">{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const CategoryCard = ({ title, icon, color, onPress, count, illustrationUrl }: { title: string, icon: any, color: string, onPress: () => void, count: string, illustrationUrl: string }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white p-5 rounded-[40px] mb-4 flex-row items-center justify-between shadow-card border border-secondary/10 overflow-hidden"
  >
    <View className="flex-row items-center flex-1">
      <View className={`${color} w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-soft`}>
        <Ionicons name={icon} size={28} color="white" />
      </View>
      <View>
        <Text className="text-textPrimary font-bold text-lg">{title}</Text>
        <Text className="text-textSecondary text-xs font-medium">{count} activities</Text>
      </View>
    </View>
    <View className="flex-row items-center">
      <Image
        source={{ uri: illustrationUrl }}
        className="w-16 h-16 mr-2 opacity-80"
        resizeMode="contain"
      />
      <View className="w-8 h-8 rounded-full bg-background items-center justify-center">
        <Ionicons name="chevron-forward" size={18} color="#FF7B1B" />
      </View>
    </View>
  </TouchableOpacity>
);

export default function WellnessHubScreen() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [wellbeingScore, setWellbeingScore] = React.useState<number | null>(null);
  const [report, setReport] = React.useState<any>(null);

  const fetchData = React.useCallback(async () => {
    try {
      const { data } = await supabase
        .from('wellbeing_scores')
        .select('composite_score')
        .eq('user_id', ACTOR_ID)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setWellbeingScore(Number(data.composite_score));

      const reportData = await generateWeeklyReport(ACTOR_ID);
      setReport(reportData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#FF7B1B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-6 flex-row justify-between items-center">
        <View className="w-10 h-10 rounded-full bg-textPrimary items-center justify-center">
          <Ionicons name="leaf" size={20} color="white" />
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-card">
          <Ionicons name="search" size={20} color="#2D1E17" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 mb-8">
          <Text className="text-textSecondary font-bold text-sm uppercase tracking-widest mb-1">Daily Practices</Text>
          <Text className="text-4xl font-bold text-textPrimary leading-tight">
            Exercises based on your <Text className="text-primary italic">needs</Text>
          </Text>
        </View>

        {/* Recommended Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center px-6 mb-6">
            <Text className="text-textPrimary text-xl font-bold">Recommended for You</Text>
            <TouchableOpacity>
              <Text className="text-textSecondary font-bold text-sm">See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {wellbeingScore !== null && wellbeingScore < 60 ? (
              <>
                <RecommendedCard
                  tag="Focus"
                  title={"Deep\nRelaxation"}
                  subtitle="Calm your mind now"
                  color="bg-[#CEDDFB]"
                  imageUrl="https://img.freepik.com/free-vector/meditation-concept-illustration_114360-1510.jpg"
                  onPress={() => router.push("/wellness/breathing")}
                />
                <RecommendedCard
                  tag="Heal"
                  title={"Safe\nSpace"}
                  subtitle="Finding your inner peace"
                  color="bg-[#FFD1B0]"
                  imageUrl="https://img.freepik.com/free-vector/woman-home-relaxing-with-tea_23-2148512143.jpg"
                  onPress={() => router.push("/wellness/sounds")}
                />
              </>
            ) : (
              <>
                <RecommendedCard
                  tag="Focus"
                  title={"3-Min\nBreathing"}
                  subtitle="Quick reset for anxiety"
                  color="bg-[#CEDDFB]"
                  imageUrl="https://img.freepik.com/free-vector/breathing-exercise-concept-illustration_114360-10118.jpg"
                  onPress={() => router.push("/wellness/breathing")}
                />
                <RecommendedCard
                  tag="Journal"
                  title={"Gratitude\nShift"}
                  subtitle="Shift your perspective"
                  color="bg-[#F9E7B3]"
                  imageUrl="https://img.freepik.com/free-vector/personal-diary-concept-illustration_114360-5343.jpg"
                  onPress={() => router.push("/(tabs)/journal")}
                />
                <RecommendedCard
                  tag="Relax"
                  title={"Night\nSounds"}
                  subtitle="Drift into deep sleep"
                  color="bg-[#FFD1B0]"
                  imageUrl="https://img.freepik.com/free-vector/sleep-concept-illustration_114360-1282.jpg"
                  onPress={() => router.push("/wellness/sounds")}
                />
              </>
            )}
          </ScrollView>
        </View>

        <View className="px-6 mb-20">
          <Text className="text-textPrimary text-xl font-bold mb-6">Explore Tools</Text>
          <CategoryCard
            title="Breathing"
            icon="water"
            color="bg-primary"
            onPress={() => router.push("/wellness/breathing")}
            count="12"
            illustrationUrl="https://cdn-icons-png.flaticon.com/512/2855/2855141.png"
          />
          <CategoryCard
            title="Exercises"
            icon="fitness"
            color="bg-mood-calm"
            onPress={() => router.push("/wellness/exercises")}
            count="8"
            illustrationUrl="https://cdn-icons-png.flaticon.com/512/2548/2548540.png"
          />
          <CategoryCard
            title="Relaxation Sounds"
            icon="musical-notes"
            color="bg-accent"
            onPress={() => router.push("/wellness/sounds")}
            count="15"
            illustrationUrl="https://cdn-icons-png.flaticon.com/512/3093/3093144.png"
          />
        </View>

        {/* Weekly Report Section */}
        {report && !report.error && (
          <View className="px-6 mb-12">
            <View className="bg-white p-8 rounded-[48px] shadow-card border border-primary/10">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-textPrimary text-2xl font-bold">Mental Insight</Text>
                  <Text className="text-textSecondary text-xs">Weekly Clinical Estimate</Text>
                </View>
                <View className={`px-4 py-2 rounded-2xl ${report.riskLevel.level === 'Low' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Text className={`font-bold text-xs ${report.riskLevel.level === 'Low' ? 'text-green-600' : 'text-red-600'}`}>
                    {report.riskLevel.color} {report.riskLevel.level} RISK
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-blue-50/50 p-5 rounded-[32px] border border-blue-100">
                  <Text className="text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-1">PHQ-9 (Mood)</Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-textPrimary text-2xl font-bold">{report.clinical.phq9}</Text>
                    <Text className="text-textSecondary text-[10px] ml-1">/27</Text>
                  </View>
                  <Text className="text-blue-500 text-[10px] font-bold mt-1">{report.clinical.phq9Severity}</Text>
                </View>
                <View className="flex-1 bg-purple-50/50 p-5 rounded-[32px] border border-purple-100">
                  <Text className="text-purple-600 font-bold text-[10px] uppercase tracking-wider mb-1">GAD-7 (Anxiety)</Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-textPrimary text-2xl font-bold">{report.clinical.gad7}</Text>
                    <Text className="text-textSecondary text-[10px] ml-1">/21</Text>
                  </View>
                  <Text className="text-purple-500 text-[10px] font-bold mt-1">{report.clinical.gad7Severity}</Text>
                </View>
              </View>

              <View className="bg-background/50 p-5 rounded-[32px] border border-secondary/10">
                <Text className="text-textPrimary font-bold text-sm mb-3">AI Recommendations</Text>
                {report.recommendations.map((rec: string, idx: number) => (
                  <View key={idx} className="flex-row mb-3 last:mb-0">
                    <Text className="text-primary mr-2">•</Text>
                    <Text className="text-textSecondary text-xs leading-relaxed flex-1">{rec}</Text>
                  </View>
                ))}
              </View>

              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-textSecondary text-[10px] font-medium italic">
                  Trend: {report.trends.arrow} {report.trends.overall}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
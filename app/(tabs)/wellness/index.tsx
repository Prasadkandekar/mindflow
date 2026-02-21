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
  const [showDetailedReport, setShowDetailedReport] = React.useState(false);
  const [profile, setProfile] = React.useState<any>(null);

  const fetchData = React.useCallback(async () => {
    try {
      const [scoreRes, profileRes] = await Promise.all([
        supabase.from('wellbeing_scores').select('composite_score').eq('user_id', ACTOR_ID).order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('profiles').select('full_name').eq('id', ACTOR_ID).maybeSingle()
      ]);

      if (scoreRes.data) setWellbeingScore(Number(scoreRes.data.composite_score));
      if (profileRes.data) setProfile(profileRes.data);

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
                  <Text className="text-textPrimary text-2xl font-bold">Health Synthesis</Text>
                  <Text className="text-textSecondary text-xs">Based on clinical observations</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDetailedReport(true)}
                  className="bg-primary/10 px-4 py-2 rounded-2xl flex-row items-center"
                >
                  <Ionicons name="document-text" size={14} color="#FF7B1B" className="mr-2" />
                  <Text className="text-primary font-bold text-xs ml-1">Full Report</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-background/40 p-6 rounded-[32px] border border-secondary/10 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-textPrimary font-bold">Assessment Summary</Text>
                  <View className={`px-3 py-1 rounded-full ${report.riskLevel.level === 'Low' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-[10px] font-bold ${report.riskLevel.level === 'Low' ? 'text-green-700' : 'text-red-700'}`}>
                      {report.riskLevel.level.toUpperCase()} RISK
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-textSecondary text-[10px] font-bold uppercase mb-1">Composite Score</Text>
                    <Text className="text-textPrimary text-3xl font-bold">{report.weeklyAverages.composite}%</Text>
                  </View>
                  <View className="h-10 w-[1px] bg-secondary/20 mx-4" />
                  <View className="flex-1">
                    <Text className="text-textSecondary text-[10px] font-bold uppercase mb-1">Clinical Trend</Text>
                    <Text className={`text-xl font-bold ${report.trends.overall === 'Improving' ? 'text-green-600' : 'text-textPrimary'}`}>
                      {report.trends.arrow} {report.trends.overall}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-4 mb-6">
                <View className="flex-1 bg-blue-50/50 p-5 rounded-[32px] border border-blue-100">
                  <Text className="text-blue-600 font-bold text-[10px] uppercase mb-1">Mood (PHQ-9)</Text>
                  <Text className="text-textPrimary text-xl font-bold">{report.clinical.phq9}/27</Text>
                  <Text className="text-blue-500 text-[10px] font-bold">{report.clinical.phq9Severity}</Text>
                </View>
                <View className="flex-1 bg-purple-50/50 p-5 rounded-[32px] border border-purple-100">
                  <Text className="text-purple-600 font-bold text-[10px] uppercase mb-1">Anxiety (GAD-7)</Text>
                  <Text className="text-textPrimary text-xl font-bold">{report.clinical.gad7}/21</Text>
                  <Text className="text-purple-500 text-[10px] font-bold">{report.clinical.gad7Severity}</Text>
                </View>
              </View>

              <View className="bg-primary/5 p-5 rounded-[32px] border border-primary/10">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="bulb" size={16} color="#FF7B1B" />
                  <Text className="text-textPrimary font-bold text-sm ml-2">Clinical Protocol</Text>
                </View>
                {report.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                  <View key={idx} className="flex-row mb-2">
                    <Text className="text-primary mr-2">•</Text>
                    <Text className="text-textSecondary text-[11px] leading-tight flex-1">{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Detailed Medical Report Modal */}
        {report && (
          <View>
            {showDetailedReport && (
              <View
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, backgroundColor: 'white' }}
                className="flex-1"
              >
                <SafeAreaView className="flex-1">
                  <View className="px-6 py-4 flex-row justify-between items-center border-b border-background">
                    <Text className="text-textPrimary font-bold text-lg">Medical Report</Text>
                    <TouchableOpacity
                      onPress={() => setShowDetailedReport(false)}
                      className="w-10 h-10 rounded-full bg-background items-center justify-center"
                    >
                      <Ionicons name="close" size={24} color="#2D1E17" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                    <View className="p-8">
                      {/* Logo and Institution Placeholder */}
                      <View className="flex-row justify-between items-start mb-10">
                        <View>
                          <Text className="text-primary font-black text-3xl">MOON<Text className="text-textPrimary">DIARY</Text></Text>
                          <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px]">Mental Health Assessment Lab</Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-textPrimary font-bold text-xs">Report ID: {Math.random().toString(36).substring(7).toUpperCase()}</Text>
                          <Text className="text-textSecondary text-[10px]">{new Date().toLocaleDateString()}</Text>
                        </View>
                      </View>

                      {/* Header Section */}
                      <View className="bg-textPrimary p-6 rounded-3xl mb-8">
                        <Text className="text-white text-xl font-bold mb-1">Psychological Status Report</Text>
                        <Text className="text-white/60 text-xs mb-4">Patient Assessment Summary (Weekly View)</Text>
                        <View className="flex-row">
                          <View className="flex-1">
                            <Text className="text-white/40 text-[9px] uppercase font-bold">Patient Name</Text>
                            <Text className="text-white font-medium">{profile?.full_name || 'Pravin'}</Text>
                          </View>
                          <View className="flex-1 border-l border-white/10 pl-4">
                            <Text className="text-white/40 text-[9px] uppercase font-bold">Assessment Period</Text>
                            <Text className="text-white font-medium">{report.reportPeriod.from} – {report.reportPeriod.to}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Summary Grid */}
                      <View className="mb-10">
                        <Text className="text-textPrimary font-bold text-sm uppercase tracking-wider mb-4 border-b border-background pb-2">Clinical Summary</Text>
                        <View className="flex-row gap-4 mb-4">
                          <View className="flex-1 bg-background p-5 rounded-3xl items-center">
                            <Text className="text-textSecondary text-[9px] font-bold uppercase mb-1">Composite</Text>
                            <Text className="text-textPrimary text-3xl font-bold">{report.weeklyAverages.composite}%</Text>
                          </View>
                          <View className="flex-1 bg-background p-5 rounded-3xl items-center">
                            <Text className="text-textSecondary text-[9px] font-bold uppercase mb-1">Risk Status</Text>
                            <Text className={`text-xl font-bold ${report.riskLevel.level === 'Low' ? 'text-green-600' : 'text-red-600'}`}>
                              {report.riskLevel.level.toUpperCase()}
                            </Text>
                          </View>
                          <View className="flex-1 bg-background p-5 rounded-3xl items-center">
                            <Text className="text-textSecondary text-[9px] font-bold uppercase mb-1">Trend</Text>
                            <Text className="text-textPrimary text-xl font-bold">{report.trends.arrow} {report.trends.overall}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Clinical Scales */}
                      <View className="mb-10">
                        <Text className="text-textPrimary font-bold text-sm uppercase tracking-wider mb-4 border-b border-background pb-2">Clinical Scales (Estimations)</Text>

                        <View className="mb-6">
                          <View className="flex-row justify-between mb-2">
                            <Text className="text-textPrimary font-bold">PHQ-9 (Depression Inventory)</Text>
                            <Text className="text-textPrimary font-bold">{report.clinical.phq9}/27</Text>
                          </View>
                          <View className="h-2 bg-background rounded-full overflow-hidden">
                            <View
                              className={`h-full ${report.clinical.phq9 <= 9 ? 'bg-green-500' : report.clinical.phq9 <= 14 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${(report.clinical.phq9 / 27) * 100}%` }}
                            />
                          </View>
                          <Text className="text-textSecondary text-[10px] mt-2 italic">Interpretation: {report.clinical.phq9Severity} symptoms</Text>
                        </View>

                        <View>
                          <View className="flex-row justify-between mb-2">
                            <Text className="text-textPrimary font-bold">GAD-7 (Anxiety Inventory)</Text>
                            <Text className="text-textPrimary font-bold">{report.clinical.gad7}/21</Text>
                          </View>
                          <View className="h-2 bg-background rounded-full overflow-hidden">
                            <View
                              className={`h-full ${report.clinical.gad7 <= 9 ? 'bg-green-500' : report.clinical.gad7 <= 14 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${(report.clinical.gad7 / 21) * 100}%` }}
                            />
                          </View>
                          <Text className="text-textSecondary text-[10px] mt-2 italic">Interpretation: {report.clinical.gad7Severity} symptoms</Text>
                        </View>
                      </View>

                      {/* Performance Table */}
                      <View className="mb-10">
                        <Text className="text-textPrimary font-bold text-sm uppercase tracking-wider mb-4 border-b border-background pb-2">Weekly Performance metrics</Text>
                        <View className="bg-background/20 rounded-3xl overflow-hidden border border-background">
                          <View className="flex-row bg-background/50 p-4 border-b border-background">
                            <Text className="flex-1 text-textSecondary font-bold text-[10px] uppercase">Metric</Text>
                            <Text className="w-20 text-textSecondary font-bold text-[10px] uppercase text-right">Avg Score</Text>
                            <Text className="w-20 text-textSecondary font-bold text-[10px] uppercase text-right">Status</Text>
                          </View>
                          {[
                            { label: 'Mood Balance', val: report.weeklyAverages.mood, unit: '/10' },
                            { label: 'Stress Resilience', val: report.weeklyAverages.stress, unit: '/10' },
                            { label: 'Sleep Hygiene', val: report.weeklyAverages.sleep, unit: 'h' },
                            { label: 'Emotional Tone', val: report.weeklyAverages.sentiment, unit: '%' }
                          ].map((item, i) => (
                            <View key={i} className="flex-row p-4 border-b border-background">
                              <Text className="flex-1 text-textPrimary font-medium text-xs">{item.label}</Text>
                              <Text className="w-20 text-textPrimary font-bold text-xs text-right">{item.val}{item.unit}</Text>
                              <Text className={`w-20 font-bold text-[10px] text-right ${Number(item.val) > 7 || item.label === 'Sleep Hygiene' && Number(item.val) > 7 ? 'text-green-600' : 'text-orange-500'}`}>
                                {Number(item.val) > 7 || item.label === 'Sleep Hygiene' && Number(item.val) > 7 ? 'OPTIMAL' : 'MONITOR'}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Recommendations */}
                      <View className="mb-10">
                        <Text className="text-textPrimary font-bold text-sm uppercase tracking-wider mb-4 border-b border-background pb-2">Professional Recommendations</Text>
                        <View className="bg-primary/5 p-6 rounded-3xl border border-primary/20">
                          {report.recommendations.map((rec: string, idx: number) => (
                            <View key={idx} className="flex-row mb-4 last:mb-0">
                              <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-3" />
                              <Text className="text-textPrimary text-xs leading-relaxed flex-1">{rec}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Daily Log */}
                      <View className="mb-20">
                        <Text className="text-textPrimary font-bold text-sm uppercase tracking-wider mb-4 border-b border-background pb-2">Daily Monitoring dataset</Text>
                        <View className="bg-background/10 rounded-3xl overflow-hidden border border-background">
                          <View className="flex-row bg-background/30 p-4 border-b border-background">
                            <Text className="w-24 text-textSecondary font-bold text-[9px] uppercase">Date</Text>
                            <Text className="flex-1 text-textSecondary font-bold text-[9px] uppercase text-center">Mood</Text>
                            <Text className="flex-1 text-textSecondary font-bold text-[9px] uppercase text-center">Stress</Text>
                            <Text className="flex-1 text-textSecondary font-bold text-[9px] uppercase text-center">Sleep</Text>
                            <Text className="w-12 text-textSecondary font-bold text-[9px] uppercase text-right">Risk</Text>
                          </View>
                          {report.dailyScores.map((day: any, i: number) => (
                            <View key={i} className="flex-row p-4 border-b border-background last:border-0">
                              <Text className="w-24 text-textPrimary font-medium text-[10px]">{day.date}</Text>
                              <Text className="flex-1 text-textPrimary text-[10px] text-center">{day.mood ?? '--'}</Text>
                              <Text className="flex-1 text-textPrimary text-[10px] text-center">{day.stress ?? '--'}</Text>
                              <Text className="flex-1 text-textPrimary text-[10px] text-center">{day.sleep ?? '--'}</Text>
                              <View className="w-12 items-end">
                                <View className={`w-3 h-3 rounded-full ${day.risk === 'low' ? 'bg-green-500' : day.risk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Footer */}
                      <View className="items-center pb-10 border-t border-background pt-8">
                        <Text className="text-textSecondary text-[10px] text-center mb-1">THIS IS AN AI-GENERATED ESTIMATION AND SHOULD NOT BE USED AS A DEFINITIVE MEDICAL DIAGNOSIS.</Text>
                        <Text className="text-textSecondary text-[10px] text-center italic">MoonDiary Labs Assessment Protocol v1.4.2</Text>
                      </View>
                    </View>
                  </ScrollView>
                </SafeAreaView>
              </View>
            )}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WELLNESS_TOOLS, WellnessTool } from '../../../constants/tools';
import { fetchUserInterventions, getSmartRecommendations, Intervention } from '../../../services/intervention-service';
import { supabase } from '../../../services/supabase';
import { generateWeeklyReport } from '../../../services/wellness-report';

const ACTOR_ID = '6ceaaeea-91f5-427d-bb4e-d651e2a2fd61';

const PreventiveCareCard = ({
  daysConsistency,
  onBreathwork,
  onPhysicalActivity,
  onReflection,
  reflectionPrompt
}: {
  daysConsistency: number,
  onBreathwork: () => void,
  onPhysicalActivity: () => void,
  onReflection: () => void,
  reflectionPrompt: string
}) => (
  <View className="bg-white p-8 rounded-[48px] shadow-card border border-green-100 mb-8 overflow-hidden relative">
    <LinearGradient
      colors={['rgba(240, 253, 244, 0.5)', 'rgba(255, 255, 255, 0)']}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    />

    <View className="mb-6 relative z-10">
      <View className="flex-row items-center mb-1">
        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
        <Text className="text-green-600 font-bold text-[10px] uppercase tracking-widest">Maintaining Balance</Text>
      </View>
      <Text className="text-textPrimary text-2xl font-bold">Your recent check-ins show steady well-being.</Text>
    </View>

    <Text className="text-textSecondary text-sm mb-6 leading-relaxed relative z-10">
      Consistent habits are supporting you. Small daily patterns are working in your favor.
    </Text>

    <View className="mb-6 relative z-10">
      <TouchableOpacity
        onPress={onBreathwork}
        activeOpacity={0.8}
        className="bg-green-500 py-4 rounded-3xl items-center shadow-soft mb-3"
      >
        <Text className="text-white font-bold">Do 3-Minute Reset</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onPhysicalActivity}
        activeOpacity={0.8}
        className="bg-white border border-green-200 py-4 rounded-3xl items-center"
      >
        <Text className="text-green-600 font-bold text-sm">Daily Physical Activity</Text>
      </TouchableOpacity>
    </View>

    <TouchableOpacity
      onPress={onReflection}
      activeOpacity={0.8}
      className="bg-background p-5 rounded-[32px] border border-secondary/10 mb-6 relative z-10"
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider">Weekly Reflection</Text>
        <Ionicons name="sparkles" size={14} color="#10B981" />
      </View>
      <Text className="text-textPrimary font-medium text-sm">{reflectionPrompt}</Text>
    </TouchableOpacity>

    <View className="flex-row items-center justify-center pt-4 border-t border-green-50 relative z-10">
      <Ionicons name="shield-checkmark" size={14} color="#10B981" />
      <Text className="text-textSecondary text-[10px] font-bold ml-2">
        {daysConsistency} days of consistent tracking.
      </Text>
    </View>
  </View>
);

const EarlySupportCard = ({
  phq9,
  gad7,
  onAction,
  planDay = 3,
  reassessmentDays = 4
}: {
  phq9: number,
  gad7: number,
  onAction: () => void,
  planDay?: number,
  reassessmentDays?: number
}) => {
  const isPhqElevated = phq9 >= 5 && phq9 <= 9;
  const isGadElevated = gad7 >= 5 && gad7 <= 9;

  let insight = "You’ve reported mild shifts in mood and stress.";
  let focus1 = "3-Minute Daily Reset";
  let focus2 = "Daily Micro-structure";
  let actionTitle = "Start Today’s Step";

  if (isPhqElevated && !isGadElevated) {
    insight = "You’ve reported lower energy and enjoyment recently.";
    focus2 = "Schedule 1 small enjoyable activity";
  } else if (isGadElevated && !isPhqElevated) {
    insight = "You’ve reported increased worry and tension.";
    focus2 = "Write 1 worry and label: solvable or hypothetical";
  } else if (isPhqElevated && isGadElevated) {
    insight = "You’ve reported mild shifts in mood and stress.";
    focus2 = "Focus on stability habits";
  }

  return (
    <View className="bg-white p-8 rounded-[48px] shadow-card border border-amber-100 mb-8 overflow-hidden relative">
      <LinearGradient
        colors={['rgba(255, 243, 224, 0.5)', 'rgba(255, 255, 255, 0)']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <View className="mb-6 relative z-10">
        <View className="flex-row items-center mb-1">
          <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
          <Text className="text-amber-600 font-bold text-[10px] uppercase tracking-widest">Early Support Mode</Text>
        </View>
        <Text className="text-textPrimary text-2xl font-bold">Strengthen your balance.</Text>
      </View>

      <Text className="text-textSecondary text-sm mb-6 leading-relaxed relative z-10">
        {insight} Let’s use some gentle tools to course-correct.
      </Text>

      <View className="bg-amber-50/50 p-6 rounded-[32px] border border-amber-100 mb-6 relative z-10">
        <Text className="text-amber-800 font-bold text-[10px] uppercase tracking-wider mb-3">Your 14-Day Reset Plan</Text>
        <View className="flex-row items-center mb-3">
          <Ionicons name="ellipse" size={8} color="#D97706" />
          <Text className="text-textPrimary text-xs font-medium ml-3">{focus1}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="ellipse" size={8} color="#D97706" />
          <Text className="text-textPrimary text-xs font-medium ml-3">{focus2}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onAction}
        activeOpacity={0.8}
        className="bg-amber-500 py-4 rounded-3xl items-center shadow-soft mb-6 relative z-10"
      >
        <Text className="text-white font-bold">{actionTitle}</Text>
      </TouchableOpacity>

      <View className="flex-row justify-between items-center pt-4 border-t border-amber-50 relative z-10">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#D97706" />
          <Text className="text-textSecondary text-[10px] font-bold ml-2">Day {planDay} of 14</Text>
        </View>
        <Text className="text-textSecondary text-[10px] font-bold">Next check-in in {reassessmentDays} days</Text>
      </View>
    </View>
  );
};

const CrisisSupportCard = ({ onSchedule, onSOS }: { onSchedule: () => void, onSOS: () => void }) => (
  <View className="bg-white p-8 rounded-[48px] shadow-card border border-red-100 mb-8 overflow-hidden relative">
    <LinearGradient
      colors={['rgba(254, 226, 226, 0.5)', 'rgba(255, 255, 255, 0)']}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    />

    <View className="mb-6 relative z-10">
      <View className="flex-row items-center mb-1">
        <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
        <Text className="text-red-600 font-bold text-[10px] uppercase tracking-widest">Priority Support Required</Text>
      </View>
      <Text className="text-textPrimary text-2xl font-bold">We're here for you.</Text>
    </View>

    <Text className="text-textSecondary text-sm mb-6 leading-relaxed relative z-10">
      Your recent patterns suggest you're going through a very difficult time. Please don't face this alone.
    </Text>

    <View className="mb-6 relative z-10">
      <TouchableOpacity
        onPress={onSchedule}
        activeOpacity={0.8}
        className="bg-red-500 py-4 rounded-3xl items-center shadow-soft mb-3"
      >
        <Text className="text-white font-bold">Schedule Priority Therapy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSOS}
        activeOpacity={0.8}
        className="bg-white border border-red-200 py-4 rounded-3xl items-center"
      >
        <Text className="text-red-600 font-bold text-sm">Emergency SOS Hotline</Text>
      </TouchableOpacity>
    </View>

    <View className="flex-row items-center justify-center pt-4 border-t border-red-50 relative z-10">
      <Ionicons name="shield" size={14} color="#EF4444" />
      <Text className="text-textSecondary text-[10px] font-bold ml-2">
        Clinical support is available 24/7.
      </Text>
    </View>
  </View>
);
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
        <Text className="text-textSecondary text-xs font-medium capitalize">Tier: {count.replace('_', ' ')}</Text>
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
  const [interventions, setInterventions] = React.useState<Intervention[]>([]);
  const [softRecommendations, setSoftRecommendations] = React.useState<WellnessTool[]>([]);

  const fetchData = React.useCallback(async () => {
    try {
      const [scoreRes, profileRes] = await Promise.all([
        supabase.from('wellbeing_scores').select('composite_score').eq('user_id', ACTOR_ID).order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('profiles').select('full_name').eq('id', ACTOR_ID).maybeSingle()
      ]);

      if (scoreRes.data) setWellbeingScore(Number(scoreRes.data.composite_score));
      if (profileRes.data) setProfile(profileRes.data);

      const [reportData, activeInterventions] = await Promise.all([
        generateWeeklyReport(ACTOR_ID),
        fetchUserInterventions(ACTOR_ID)
      ]);
      setReport(reportData);
      setInterventions(activeInterventions);

      const score = scoreRes.data ? Number(scoreRes.data.composite_score) : 84;
      setSoftRecommendations(getSmartRecommendations(score));
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
            {/* Hard Database Interventions */}
            {interventions.map((item) => (
              <RecommendedCard
                key={item.id}
                tag="Priority"
                title={"Urgent\nSupport"}
                subtitle={item.intervention_text}
                color="bg-[#FFD1B0]"
                imageUrl="https://img.freepik.com/free-vector/doctor-concept-illustration_114360-1268.jpg"
                onPress={() => item.action_type === 'consultation' ? router.push('/chat') : router.push('/wellness')}
              />
            ))}

            {/* Smart/Soft Recommendations */}
            {softRecommendations.map((tool) => (
              <RecommendedCard
                key={tool.id}
                tag={tool.category.replace('_', ' ').toUpperCase()}
                title={tool.name.replace(' ', '\n')}
                subtitle={tool.description}
                color={tool.category === 'priority' ? "bg-[#FFD1B0]" : tool.category === 'preventive' ? "bg-[#CEDDFB]" : "bg-[#F9E7B3]"}
                imageUrl={tool.illustrationUrl}
                onPress={() => router.push(tool.route as any)}
              />
            ))}

            {/* Fallback if nothing is there */}
            {interventions.length === 0 && softRecommendations.length === 0 && (
              <RecommendedCard
                tag="Daily"
                title={"Growth\nHabit"}
                subtitle="Keep track of your wins"
                color="bg-[#CEDDFB]"
                imageUrl="https://img.freepik.com/free-vector/personal-diary-concept-illustration_114360-5343.jpg"
                onPress={() => router.push("/(tabs)/journal")}
              />
            )}
          </ScrollView>
        </View>

        {/* Preventive Care, Early Support, and Crisis Sections (Dynamic) */}
        <View className="px-6">
          {report?.clinical && report.clinical.phq9 < 5 && report.clinical.gad7 < 5 && (
            <PreventiveCareCard
              daysConsistency={report.dailyScores.filter((d: any) => d.mood).length}
              onBreathwork={() => router.push("/wellness/breathing")}
              onPhysicalActivity={() => router.push("/wellness/exercises")}
              onReflection={() => router.push("/(tabs)/journal")}
              reflectionPrompt="What helped you feel steady this week?"
            />
          )}

          {report?.clinical && (
            (report.clinical.phq9 >= 5 && report.clinical.phq9 <= 9) ||
            (report.clinical.gad7 >= 5 && report.clinical.gad7 <= 9)
          ) && (
              <EarlySupportCard
                phq9={report.clinical.phq9}
                gad7={report.clinical.gad7}
                onAction={() => router.push("/wellness/early-support")}
              />
            )}

          {report?.clinical && (report.clinical.phq9 >= 10 || report.clinical.gad7 >= 10) && (
            <CrisisSupportCard
              onSchedule={() => router.push("/wellness/therapy-scheduler")}
              onSOS={() => Alert.alert("SOS", "Connecting to emergency response...")}
            />
          )}
        </View>

        <View className="px-6 mb-20">
          <Text className="text-textPrimary text-xl font-bold mb-6">Explore Tools</Text>
          {WELLNESS_TOOLS.map((tool) => (
            <CategoryCard
              key={tool.id}
              title={tool.name}
              icon={tool.icon}
              color={tool.color}
              onPress={() => router.push(tool.route as any)}
              count={tool.category.replace('_', ' ')}
              illustrationUrl={tool.illustrationUrl}
            />
          ))}
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
                  <View className={`px-3 py-1 rounded-full ${report.riskLevel.level === 'Low' ? 'bg-green-100' : report.riskLevel.level === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                    <Text className={`text-[10px] font-bold ${report.riskLevel.level === 'Low' ? 'text-green-700' : report.riskLevel.level === 'Medium' ? 'text-yellow-700' : 'text-red-700'}`}>
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
import { supabase } from './supabase';

/**
 * Push a new wellbeing score record to Supabase
 */
export async function pushWellbeingScore(data: {
    user_id: string;
    mood_avg: number;
    stress_avg: number;
    sleep_avg: number;
    sentiment_avg?: number;
    composite_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    phq9_score?: number;
    gad7_score?: number;
}) {
    const { error } = await supabase
        .from('wellbeing_scores')
        .insert([data]);

    if (error) throw error;
    return { success: true };
}

/**
 * Recalculates today's averages from logs and updates the wellbeing_scores table
 */
export async function syncTodayWellbeingScore(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch the latest logs for today
    const [moodRes, sleepRes, stressRes, journalRes] = await Promise.all([
        supabase.from('mood_logs').select('mood_score').eq('user_id', userId).eq('entry_date', today).order('created_at', { ascending: false }).limit(1),
        supabase.from('sleep_logs').select('sleep_hours').eq('user_id', userId).eq('entry_date', today).order('created_at', { ascending: false }).limit(1),
        supabase.from('stress_logs').select('stress_level').eq('user_id', userId).eq('entry_date', today).order('created_at', { ascending: false }).limit(1),
        supabase.from('journals').select('id, sentiment_analysis(sentiment_score)').eq('user_id', userId).eq('entry_date', today).limit(5)
    ]);

    const mood = moodRes.data?.[0]?.mood_score || null;
    const sleep = sleepRes.data?.[0]?.sleep_hours || null;
    const stress = stressRes.data?.[0]?.stress_level || null;

    // Handle sentiment nested data
    const sentiments = journalRes.data?.map(j => (j.sentiment_analysis as any)?.[0]?.sentiment_score).filter(s => s !== undefined) || [];
    const sentimentAvg = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : null;

    if (mood === null && sleep === null && stress === null) return null;

    // 2. Calculate Composite Score (0-100)
    const moodPart = (mood || 5) * 10;                     // 1-10 -> 10-100
    const stressPart = (10 - (stress || 5)) * 10;          // 1-10 (invert) -> 10-100
    const sleepPart = Math.min(((sleep || 7) / 8) * 100, 100); // 8h = 100

    const composite = Math.round((moodPart + stressPart + sleepPart) / 3);

    // Estimate PHQ-9 and GAD-7
    const phq9 = estimatePHQ9(mood);
    const gad7 = estimateGAD7(stress);

    const risk = composite >= 75 ? 'low' : composite >= 50 ? 'medium' : composite >= 30 ? 'high' : 'critical';

    // 3. Push to Supabase (Upsert for today)
    const result = await pushWellbeingScore({
        user_id: userId,
        mood_avg: mood || 0,
        stress_avg: stress || 0,
        sleep_avg: sleep || 0,
        sentiment_avg: sentimentAvg ? Math.round(sentimentAvg * 100) / 100 : 0,
        composite_score: composite,
        risk_level: risk as any,
        phq9_score: phq9 || 0,
        gad7_score: gad7 || 0
    });

    // 4. Check for interventions
    if (phq9 !== null || gad7 !== null) {
        await checkAndGenerateInterventions(userId, phq9, gad7);
    }

    return result;
}

/**
 * Check scores and generate interventions in the database
 */
export async function checkAndGenerateInterventions(userId: string, phq9: number | null, gad7: number | null) {
    const interventions = [];
    const today = new Date().toISOString().split('T')[0];

    if (phq9 !== null && phq9 >= 10) {
        interventions.push({
            user_id: userId,
            week_start_date: today,
            intervention_text: phq9 >= 20 ? "Your mood scores indicate severe distress. Please consider professional support immediately." : "Your mood scores indicate moderate depression symptoms. We recommend checking out our 'Heal' exercises.",
            severity: phq9 >= 20 ? 'high' : 'medium',
            action_type: phq9 >= 20 ? 'consultation' : 'wellness_exercise',
            action_payload: { category: 'depression', score: phq9 },
            status: 'pending'
        });
    }

    if (gad7 !== null && gad7 >= 10) {
        interventions.push({
            user_id: userId,
            week_start_date: today,
            intervention_text: gad7 >= 15 ? "Your anxiety levels are very high. Try our 'Deep Relaxation' breathing exercise." : "You're experiencing moderate anxiety. Small breaks and breathing exercises can help.",
            severity: gad7 >= 15 ? 'high' : 'medium',
            action_type: 'wellness_exercise',
            action_payload: { category: 'anxiety', score: gad7, recommended: 'breathing' },
            status: 'pending'
        });
    }

    if (interventions.length > 0) {
        const { error } = await supabase.from('user_interventions').insert(interventions);
        if (error) console.error('Error generating interventions:', error);
    }
}

/**
 * Generate weekly mental health report with PHQ‑9 & GAD‑7 mapping
 */
export async function generateWeeklyReport(userId: string, days = 7) {
    // 1. Fetch last N wellbeing scores
    const { data: scores, error } = await supabase
        .from('wellbeing_scores')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(days);

    if (error) throw error;
    if (!scores || !scores.length) return { error: 'No data available for this user' };

    // 2. Calculate weekly averages
    const weeklyAvg = {
        mood: average(scores.map(s => s.mood_avg)),
        stress: average(scores.map(s => s.stress_avg)),
        sleep: average(scores.map(s => s.sleep_avg)),
        sentiment: average(scores.map(s => s.sentiment_avg)),
        composite: average(scores.map(s => s.composite_score))
    };

    // 3. Determine risk level from composite
    const riskLevel = getRiskLevel(Number(weeklyAvg.composite));

    // 4. Calculate trends
    const trends = calculateTrends(scores);

    // 5. Estimate PHQ‑9 and GAD‑7 scores
    const phq9 = estimatePHQ9(Number(weeklyAvg.mood));
    const gad7 = estimateGAD7(Number(weeklyAvg.stress));

    // 6. Generate recommendations based on PHQ‑9/GAD‑7 severity
    const recommendations = generateRecommendations(phq9, gad7, trends);

    // 7. Data quality summary
    const dataQuality = {
        daysWithData: scores.length,
        completeness: {
            mood: scores.filter(s => s.mood_avg !== null).length,
            stress: scores.filter(s => s.stress_avg !== null).length,
            sleep: scores.filter(s => s.sleep_avg !== null).length,
            sentiment: scores.filter(s => s.sentiment_avg !== null).length
        }
    };

    // 8. Build report object
    const report = {
        userId,
        reportPeriod: {
            from: scores[scores.length - 1]?.calculated_at?.split('T')[0],
            to: scores[0]?.calculated_at?.split('T')[0],
            daysRequested: days,
            daysAvailable: scores.length
        },
        weeklyAverages: weeklyAvg,
        riskLevel,
        trends,
        clinical: {
            phq9: phq9,
            gad7: gad7,
            phq9Severity: phq9Severity(phq9),
            gad7Severity: gad7Severity(gad7)
        },
        recommendations,
        dataQuality,
        dailyScores: scores.map(s => ({
            date: s.calculated_at?.split('T')[0],
            mood: s.mood_avg,
            stress: s.stress_avg,
            sleep: s.sleep_avg,
            sentiment: s.sentiment_avg,
            composite: s.composite_score,
            risk: s.risk_level
        }))
    };

    return report;
}

// Helper: average ignoring nulls
function average(arr: any[]) {
    const valid = arr.filter(v => v !== null && v !== undefined);
    if (!valid.length) return null;
    const sum = valid.reduce((a, b) => Number(a) + Number(b), 0);
    return Math.round((sum / valid.length) * 10) / 10;
}

function getRiskLevel(composite: number | null) {
    if (composite === null) return { level: 'Unknown', color: '⚪' };
    if (composite >= 70) return { level: 'Low', color: '🟢' };
    if (composite >= 40) return { level: 'Medium', color: '🟡' };
    return { level: 'High', color: '🔴' };
}

function calculateTrends(scores: any[]) {
    const half = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, half).map(s => s.composite_score).filter(v => v !== null);
    const secondHalf = scores.slice(half).map(s => s.composite_score).filter(v => v !== null);

    const avgFirst = firstHalf.length ? firstHalf.reduce((a, b) => Number(a) + Number(b), 0) / firstHalf.length : null;
    const avgSecond = secondHalf.length ? secondHalf.reduce((a, b) => Number(a) + Number(b), 0) / secondHalf.length : null;

    let trend = 'Stable';
    let arrow = '→';
    if (avgFirst !== null && avgSecond !== null) {
        if (avgSecond > avgFirst + 5) { trend = 'Improving'; arrow = '↑'; }
        else if (avgSecond < avgFirst - 5) { trend = 'Declining'; arrow = '↓'; }
    }
    return { overall: trend, arrow };
}

function estimatePHQ9(moodAvg: number | null) {
    if (moodAvg === null) return null;
    // Input moodAvg is 1-10 (10 being best)
    // PHQ-9 is 0-27 (27 being worst)
    // 10 mood -> 0-4 PHQ
    // 1 mood -> 20-27 PHQ
    const raw = 27 * (1 - (moodAvg - 1) / 9);
    return Math.min(27, Math.max(0, Math.round(raw)));
}

function estimateGAD7(stressAvg: number | null) {
    if (stressAvg === null) return null;
    // Input stressAvg is 1-10 (1 being best/low stress)
    // GAD-7 is 0-21 (21 being worst/high anxiety)
    // 1 stress -> 0-3 GAD
    // 10 stress -> 15-21 GAD
    const raw = 21 * ((stressAvg - 1) / 9);
    return Math.min(21, Math.max(0, Math.round(raw)));
}

function phq9Severity(score: number | null) {
    if (score === null) return 'No data';
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    if (score <= 19) return 'Moderately Severe';
    return 'Severe';
}

function gad7Severity(score: number | null) {
    if (score === null) return 'No data';
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    return 'Severe';
}

function generateRecommendations(phq9: number | null, gad7: number | null, trends: { overall: string, arrow: string }) {
    const recs = [];

    if (phq9 !== null) {
        if (phq9 <= 4) recs.push('✅ Depression symptoms are minimal. Keep up healthy habits!');
        else if (phq9 <= 9) recs.push('😐 Mild depression symptoms. Consider mood-boosting activities.');
        else if (phq9 <= 14) recs.push('😟 Moderate depression symptoms. We suggest speaking with a counselor.');
        else recs.push('🔴 Severe depression symptoms. Please seek professional help immediately.');
    }

    if (gad7 !== null) {
        if (gad7 <= 4) recs.push('✅ Anxiety symptoms are minimal.');
        else if (gad7 <= 9) recs.push('😐 Mild anxiety. Try relaxation techniques.');
        else if (gad7 <= 14) recs.push('😟 Moderate anxiety. Consider stress management strategies.');
        else recs.push('🔴 Severe anxiety. Professional support is recommended.');
    }

    if (trends.overall === 'Declining') {
        recs.push('📉 Your scores have been dropping. Please reach out for support if needed.');
    }

    if (recs.length === 0) recs.push('No data available for recommendations.');

    return recs;
}

export function printReport(report: any) {
    console.log('\n' + '='.repeat(60));
    console.log('🧠 WEEKLY MENTAL HEALTH REPORT (PHQ‑9 / GAD‑7)');
    console.log('='.repeat(60));
    console.log(`User ID: ${report.userId}`);
    console.log(`Period: ${report.reportPeriod.from} to ${report.reportPeriod.to}`);
    console.log(`Days with data: ${report.dataQuality.daysWithData}/${report.reportPeriod.daysRequested}`);
    console.log('');

    console.log(`OVERALL RISK: ${report.riskLevel.color} ${report.riskLevel.level}`);
    console.log(`Composite Score: ${report.weeklyAverages.composite ?? 'N/A'}`);
    console.log(`Trend: ${report.trends.arrow} ${report.trends.overall}`);
    console.log('');

    console.log('📊 WEEKLY AVERAGES (0‑100, higher = better)');
    console.log(`  Mood:      ${formatScore(report.weeklyAverages.mood)}`);
    console.log(`  Stress:    ${formatScore(report.weeklyAverages.stress)} (inverted)`);
    console.log(`  Sleep:     ${formatScore(report.weeklyAverages.sleep)}`);
    console.log(`  Sentiment: ${formatScore(report.weeklyAverages.sentiment)}`);
    console.log('');

    console.log('📈 CLINICAL ESTIMATES');
    if (report.clinical.phq9 !== null) {
        console.log(`  PHQ‑9:      ${report.clinical.phq9} (${report.clinical.phq9Severity})`);
    } else {
        console.log(`  PHQ‑9:      No data`);
    }
    if (report.clinical.gad7 !== null) {
        console.log(`  GAD‑7:      ${report.clinical.gad7} (${report.clinical.gad7Severity})`);
    } else {
        console.log(`  GAD‑7:      No data`);
    }
    console.log('');

    console.log('💡 RECOMMENDATIONS');
    report.recommendations.forEach((r: string) => console.log(`  • ${r}`));
    console.log('');

    console.log('📅 DAILY BREAKDOWN');
    console.log('Date       Mood  Stress Sleep Sentiment Risk');
    report.dailyScores.forEach((d: any) => {
        console.log(`${d.date}  ${d.mood?.toFixed(1) ?? '--'}   ${d.stress?.toFixed(1) ?? '--'}    ${d.sleep?.toFixed(1) ?? '--'}    ${d.sentiment?.toFixed(1) ?? '--'}      ${d.risk?.[0]?.toUpperCase() ?? '-'}`);
    });
    console.log('='.repeat(60));
}

function formatScore(s: number | null) {
    return s !== null ? s.toFixed(1) : '--';
}

export { gad7Severity, phq9Severity };


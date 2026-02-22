import { ToolCategory, WELLNESS_TOOLS } from '../constants/tools';
import { supabase } from './supabase';

export interface Intervention {
    id: string;
    user_id: string;
    week_start_date: string;
    protocol_id?: string;
    severity_assessment_id?: string;
    intervention_text: string;
    severity: 'crisis' | 'high' | 'medium' | 'low' | 'info';
    action_type: string;
    action_payload: any;
    status: 'pending' | 'viewed' | 'acted' | 'dismissed';
    created_at: string;
}

/**
 * Fetch active interventions for a user
 */
export async function fetchUserInterventions(userId: string): Promise<Intervention[]> {
    const { data, error } = await supabase
        .from('user_interventions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching interventions:', error);
        return [];
    }
    return data || [];
}

/**
 * Update the status of an intervention
 */
export async function updateInterventionStatus(interventionId: string, status: 'viewed' | 'acted' | 'dismissed') {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (status === 'viewed') update.viewed_at = new Date().toISOString();
    if (status === 'acted') update.acted_at = new Date().toISOString();
    if (status === 'dismissed') update.dismissed_at = new Date().toISOString();

    const { error } = await supabase
        .from('user_interventions')
        .update(update)
        .eq('id', interventionId);

    if (error) throw error;
    return { success: true };
}

/**
 * Get "soft" recommendations based on current wellbeing score
 * Returns tools from the registry that match the user's current risk level
 */
export function getSmartRecommendations(compositeScore: number) {
    let categories: ToolCategory[] = [];

    if (compositeScore >= 80) {
        categories = ['preventive']; // Focus on growth and habits
    } else if (compositeScore >= 60) {
        categories = ['preventive', 'light_cbt']; // Prevention + early support
    } else if (compositeScore >= 40) {
        categories = ['light_cbt', 'structured']; // Needs more structure
    } else if (compositeScore >= 20) {
        categories = ['intensive']; // Requires daily monitoring
    } else {
        categories = ['priority']; // Crisis/Immediate support
    }

    return WELLNESS_TOOLS.filter(tool => categories.includes(tool.category)).map(tool => {
        if (tool.id === 'intensive-support' || tool.id === 'priority-support') {
            return { ...tool, route: '/wellness/therapy-scheduler' };
        }
        return tool;
    });
}


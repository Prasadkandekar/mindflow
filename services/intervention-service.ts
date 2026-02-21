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

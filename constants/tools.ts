export type ToolCategory = 'preventive' | 'light_cbt' | 'structured' | 'intensive' | 'priority';

export interface WellnessTool {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;
    icon: string;
    color: string;
    route: string;
    illustrationUrl: string;
}

export const WELLNESS_TOOLS: WellnessTool[] = [
    {
        id: 'breath',
        name: '3-Min Breathing',
        description: 'Quick reset for immediate anxiety and stress relief.',
        category: 'preventive',
        icon: 'water',
        color: 'bg-primary',
        route: '/wellness/breathing',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/2855/2855141.png'
    },
    {
        id: 'yoga',
        name: 'Morning Yoga',
        description: 'Gentle flow to start your day with mindfulness.',
        category: 'preventive',
        icon: 'body',
        color: 'bg-mood-calm',
        route: '/wellness/exercises',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/2548/2548540.png'
    },
    {
        id: 'early-support',
        name: 'Early Support',
        description: 'Guided journaling and light cognitive behavioral tools.',
        category: 'light_cbt',
        icon: 'journal',
        color: 'bg-accent',
        route: '/(tabs)/journal',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/3093/3093144.png'
    },
    {
        id: 'structured-support',
        name: 'Structured Support',
        description: 'Scheduled monthly check-ins and moderated support groups.',
        category: 'structured',
        icon: 'calendar',
        color: 'bg-secondary',
        route: '/home/questionnaires',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/4311/4311116.png'
    },
    {
        id: 'phq9-assessment',
        name: 'PHQ-9 Assessment',
        description: 'Clinically validated depression screening tool.',
        category: 'structured',
        icon: 'clipboard',
        color: 'bg-indigo-500',
        route: '/home/questionnaires',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/2666/2666505.png'
    },
    {
        id: 'intensive-support',
        name: 'Intensive Support',
        description: 'Daily clinical monitoring and personalized AI therapy paths.',
        category: 'intensive',
        icon: 'pulse',
        color: 'bg-mood-stressed',
        route: '/home/tracking',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/2966/2966486.png'
    },
    {
        id: 'gad7-assessment',
        name: 'GAD-7 Assessment',
        description: 'Clinically validated anxiety screening tool.',
        category: 'intensive',
        icon: 'analytics',
        color: 'bg-purple-500',
        route: '/home/questionnaires',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/3090/3090156.png'
    },

    {
        id: 'priority-support',
        name: 'Priority Support',
        description: 'Immediate SOS response and therapist trigger for crisis.',
        category: 'priority',
        icon: 'alert-circle',
        color: 'bg-red-500',
        route: '/wellness/therapy-scheduler',
        illustrationUrl: 'https://cdn-icons-png.flaticon.com/512/1022/1022315.png'
    }
];

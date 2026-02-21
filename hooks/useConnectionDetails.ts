import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// The token endpoint (your ngrok or backend server URL)
// For Android emulator, use 10.0.2.2 instead of localhost
const TOKEN_ENDPOINT = Platform.select({
    android: 'https://voice-agent-token-generator.onrender.com/getToken',
    ios: 'https://voice-agent-token-generator.onrender.com/getToken',
    default: 'https://voice-agent-token-generator.onrender.com/getToken',
});

/**
 * Retrieves a LiveKit token from your backend.
 */
export function useConnectionDetails(): ConnectionDetails | undefined {
    const [details, setDetails] = useState<ConnectionDetails | undefined>(undefined);

    useEffect(() => {
        fetchToken().then(d => {
            if (d) setDetails(d);
        });
    }, []);

    return details;
}

export async function fetchToken(): Promise<ConnectionDetails | undefined> {
    try {
        const response = await fetch(TOKEN_ENDPOINT);
        const data = await response.json();

        // Server returns { token: string, success: boolean }
        const token = data?.token as string;

        if (token) {
            return {
                url: 'wss://mental-wellness-3z07873b.livekit.cloud',
                token,
            };
        }
        return undefined;
    } catch (e) {
        console.error('Failed to fetch LiveKit token', e);
        return undefined;
    }
}

export type ConnectionDetails = {
    url: string;
    token: string;
};

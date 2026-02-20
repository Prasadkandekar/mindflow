import { useEffect, useState } from 'react';

// The token endpoint (your ngrok or backend server URL)
const TOKEN_ENDPOINT = 'http://localhost:3000/getToken';

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

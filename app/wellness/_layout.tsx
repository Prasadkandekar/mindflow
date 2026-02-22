import { Stack } from "expo-router";

export default function WellnessLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="breathing" />
            <Stack.Screen name="exercises" />
            <Stack.Screen name="sounds" />
            <Stack.Screen name="early-support" />
        </Stack>
    );
}

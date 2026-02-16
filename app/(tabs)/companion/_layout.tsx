import { Stack } from "expo-router";

export default function CompanionLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="active-session" />
            <Stack.Screen name="summary" />
        </Stack>
    );
}

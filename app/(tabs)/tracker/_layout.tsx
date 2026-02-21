import { Stack } from "expo-router";

export default function TrackerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="streak" />
            <Stack.Screen name="rewards" />
            <Stack.Screen name="mood-log" />
            <Stack.Screen name="sleep-log" />
            <Stack.Screen name="stress-log" />
        </Stack>
    );
}


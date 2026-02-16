import { Stack } from "expo-router";

export default function HomeLayout() {
   return (
      <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="index" />
         <Stack.Screen name="profile" />
         <Stack.Screen name="tracking" />
         <Stack.Screen name="questionnaires" />
         <Stack.Screen name="wellness-preview" />
         <Stack.Screen name="add-journal" />
         <Stack.Screen name="text-journal" />
         <Stack.Screen name="voice-journal" />
      </Stack>
   );
}

// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#10b981", // Emerald 500 (Wellness theme)
        tabBarInactiveTintColor: "#6b7280", // Gray 500
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6", // Gray 100
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "journal" : "journal-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="companion"
        options={{
          title: "Companion",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "mic" : "mic-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "leaf" : "leaf-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "flame" : "flame-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

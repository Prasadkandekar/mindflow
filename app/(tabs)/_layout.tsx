// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FF7B1B", // Primary Orange
        tabBarInactiveTintColor: "#8E7E77", // Muted Earthy Gray
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          height: 75,
          paddingBottom: 20,
          paddingTop: 12,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10,
          shadowColor: '#FF7B1B',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
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
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={size} color={color} />
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

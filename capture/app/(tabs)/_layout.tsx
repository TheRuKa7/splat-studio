import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#050505" },
        headerTintColor: "#f5f5f5",
        tabBarStyle: { backgroundColor: "#050505", borderTopColor: "#222" },
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#8b8b8b",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scenes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

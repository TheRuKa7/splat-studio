import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={qc}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#050505" },
            headerTintColor: "#f5f5f5",
            contentStyle: { backgroundColor: "#050505" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="capture" options={{ title: "Capture" }} />
          <Stack.Screen name="scene/[id]" options={{ title: "Scene" }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

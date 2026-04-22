import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useApp } from "../../lib/store";

export default function Settings() {
  const { apiBaseUrl, setApiBaseUrl } = useApp();
  const [url, setUrl] = useState(apiBaseUrl);

  return (
    <ScrollView className="bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View>
        <Text className="text-white font-semibold mb-1">Training API base URL</Text>
        <TextInput
          className="rounded-xl border border-border bg-surface text-white px-3 py-3"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <Text className="text-muted text-xs mt-1">
          Points at the GPU host running training/. Upload triggers preflight +
          COLMAP + gsplat on the server.
        </Text>
      </View>
      <Pressable
        className="rounded-xl bg-primary py-3 items-center active:opacity-80"
        onPress={() => {
          setApiBaseUrl(url.trim());
          Alert.alert("Saved");
        }}
      >
        <Text className="text-black font-semibold">Save</Text>
      </Pressable>

      <View className="mt-6">
        <Text className="text-muted text-xs">
          Capture tips: steady 360° orbit, ~45° elevation shots, keep subject at
          least 70% of frame, ~30–60 s clip works well on a phone.
        </Text>
      </View>
    </ScrollView>
  );
}

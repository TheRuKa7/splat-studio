import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { useApp } from "../../lib/store";
import type { Scene } from "../../lib/types";

function statusTone(s: Scene["status"]): string {
  switch (s) {
    case "ready":
      return "bg-success/20 text-success";
    case "training":
    case "uploading":
      return "bg-primary/20 text-primary";
    case "failed":
      return "bg-danger/20 text-danger";
    default:
      return "bg-muted/20 text-muted";
  }
}

export default function Scenes() {
  const scenes = useApp((s) => s.scenes);
  return (
    <View className="flex-1 bg-background">
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 96 }}
        data={scenes}
        keyExtractor={(s) => s.id}
        ListEmptyComponent={
          <Text className="text-muted text-center mt-16">
            Tap the camera to capture your first scene.
          </Text>
        }
        renderItem={({ item }) => (
          <Link href={`/scene/${item.id}`} asChild>
            <Pressable className="rounded-xl border border-border bg-surface overflow-hidden active:opacity-70">
              <View className="flex-row">
                {item.thumb_uri ? (
                  <Image
                    source={{ uri: item.thumb_uri }}
                    style={{ width: 110, height: 80 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-[110px] h-20 bg-border items-center justify-center">
                    <Ionicons name="videocam-outline" size={22} color="#8b8b8b" />
                  </View>
                )}
                <View className="flex-1 p-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white font-medium" numberOfLines={1}>
                      {item.title || "Untitled"}
                    </Text>
                    <Text
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusTone(item.status)}`}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text className="text-muted text-xs mt-1">
                    {item.duration_s.toFixed(1)}s · {item.resolution}
                  </Text>
                  {item.stage ? (
                    <Text className="text-muted text-[11px] mt-1">
                      {item.stage}
                      {item.progress != null ? ` · ${(item.progress * 100).toFixed(0)}%` : ""}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          </Link>
        )}
      />
      <Link href="/capture" asChild>
        <Pressable className="absolute right-5 bottom-6 h-16 w-16 rounded-full bg-primary items-center justify-center active:opacity-85 shadow-lg">
          <Ionicons name="videocam" size={26} color="black" />
        </Pressable>
      </Link>
    </View>
  );
}

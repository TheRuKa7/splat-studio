import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { getScene, uploadScene, VIEWER_URL } from "../../lib/api";
import { useApp } from "../../lib/store";

export default function SceneDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scene = useApp((s) => s.scenes.find((x) => x.id === id));
  const updateScene = useApp((s) => s.updateScene);
  const [pct, setPct] = useState(0);

  const up = useMutation({
    mutationFn: async () => {
      if (!scene?.local_uri) throw new Error("missing local file");
      updateScene(scene.id, { status: "uploading" });
      const res = await uploadScene(scene.local_uri, scene.title, setPct);
      updateScene(scene.id, {
        status: "training",
        server_id: res.id,
        stage: res.stage ?? "queued",
      });
      return res;
    },
    onError: (e: unknown) => {
      if (scene) updateScene(scene.id, { status: "failed" });
      Alert.alert("Upload failed", e instanceof Error ? e.message : "");
    },
  });

  const poll = useQuery({
    queryKey: ["scene", scene?.server_id],
    queryFn: () => getScene(scene!.server_id!),
    enabled: !!scene?.server_id && scene.status !== "ready" && scene.status !== "failed",
    refetchInterval: 4000,
  });

  if (!scene) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Scene not found.</Text>
      </View>
    );
  }

  const serverScene = poll.data;
  if (serverScene && serverScene.status !== scene.status) {
    updateScene(scene.id, {
      status: serverScene.status,
      stage: serverScene.stage,
      progress: serverScene.progress,
      error_code: serverScene.error_code,
      thumb_uri: serverScene.thumb_uri ?? scene.thumb_uri,
    });
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View className="rounded-xl border border-border bg-surface p-3">
        <Text className="text-white text-lg font-semibold">{scene.title}</Text>
        <Text className="text-muted text-xs mt-1">
          {scene.duration_s.toFixed(1)}s · {scene.resolution} ·{" "}
          {new Date(scene.captured_at).toLocaleString()}
        </Text>
      </View>

      <View className="rounded-xl border border-border bg-surface p-3">
        <Text className="text-white font-semibold">Pipeline</Text>
        <Text className="text-muted text-xs mt-1 capitalize">
          Status: {scene.status}
          {scene.stage ? ` · ${scene.stage}` : ""}
        </Text>
        {scene.progress != null ? (
          <View className="h-2 w-full rounded-full bg-border overflow-hidden mt-2">
            <View
              className="h-full bg-primary"
              style={{ width: `${scene.progress * 100}%` }}
            />
          </View>
        ) : null}
        {scene.status === "uploading" ? (
          <Text className="text-muted text-xs mt-2">
            Upload {Math.round(pct * 100)}%
          </Text>
        ) : null}
        {scene.error_code ? (
          <Text className="text-danger text-xs mt-2">error: {scene.error_code}</Text>
        ) : null}
      </View>

      {scene.status === "local" ? (
        <Pressable
          className="rounded-xl bg-primary py-3 items-center active:opacity-80"
          onPress={() => up.mutate()}
          disabled={up.isPending}
        >
          <Text className="text-black font-semibold">
            {up.isPending ? "Uploading…" : "Upload for training"}
          </Text>
        </Pressable>
      ) : null}

      {scene.status === "ready" && scene.server_id ? (
        <Pressable
          className="rounded-xl bg-success py-3 items-center active:opacity-80"
          onPress={() => Linking.openURL(VIEWER_URL(scene.server_id!))}
        >
          <Text className="text-black font-semibold">Open in viewer</Text>
        </Pressable>
      ) : null}

      {(scene.status === "training" || scene.status === "uploading") && up.isPending ? (
        <ActivityIndicator color="#f59e0b" />
      ) : null}
    </ScrollView>
  );
}

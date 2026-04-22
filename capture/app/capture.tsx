import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { localId } from "../lib/api";
import { useApp } from "../lib/store";

const GUIDANCE = [
  "Steady orbit around the subject",
  "Keep subject framed — ~70% of view",
  "Include top-down and side angles",
  "Avoid reflective surfaces / glass",
];

export default function Capture() {
  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const camRef = useRef<CameraView>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const addScene = useApp((s) => s.addScene);

  if (!camPerm || !micPerm) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#f59e0b" />
      </View>
    );
  }

  if (!camPerm.granted || !micPerm.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6 gap-3">
        <Text className="text-white text-center">
          Camera + mic access is required to capture scenes.
        </Text>
        <Pressable
          className="rounded-xl bg-primary px-4 py-2"
          onPress={() => {
            requestCam();
            requestMic();
          }}
        >
          <Text className="text-black font-semibold">Grant permissions</Text>
        </Pressable>
      </View>
    );
  }

  async function start() {
    if (!camRef.current || recording) return;
    setRecording(true);
    setSeconds(0);
    tickRef.current = setInterval(() => setSeconds((n) => n + 1), 1000);
    try {
      const video = await camRef.current.recordAsync({ maxDuration: 90 });
      if (!video?.uri) return;
      const id = localId();
      addScene({
        id,
        title: `Scene ${new Date().toLocaleTimeString()}`,
        captured_at: new Date().toISOString(),
        duration_s: seconds,
        resolution: "1920x1080",
        status: "local",
        local_uri: video.uri,
        thumb_uri: null,
        stage: null,
        progress: null,
      });
      router.replace(`/scene/${id}`);
    } finally {
      if (tickRef.current) clearInterval(tickRef.current);
      setRecording(false);
    }
  }

  function stop() {
    camRef.current?.stopRecording();
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={camRef}
        style={{ flex: 1 }}
        facing="back"
        mode="video"
        videoStabilizationMode="cinematic"
      />

      {/* Coaching overlay */}
      <View className="absolute top-4 left-4 right-4 rounded-xl bg-black/60 border border-white/10 p-3">
        <Text className="text-white font-semibold mb-1">Orbit capture</Text>
        {GUIDANCE.map((g) => (
          <Text key={g} className="text-white/80 text-xs">
            · {g}
          </Text>
        ))}
      </View>

      {/* Timer */}
      {recording ? (
        <View className="absolute top-4 self-center rounded-full bg-danger px-3 py-1">
          <Text className="text-white text-xs font-semibold tabular-nums">
            ● REC {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </Text>
        </View>
      ) : null}

      {/* Record button */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <Pressable
          onPress={recording ? stop : start}
          className={`h-20 w-20 rounded-full items-center justify-center border-4 ${recording ? "border-danger bg-danger/30" : "border-white bg-white/20"}`}
        >
          <Ionicons
            name={recording ? "square" : "videocam"}
            size={recording ? 28 : 32}
            color="white"
          />
        </Pressable>
      </View>
    </View>
  );
}

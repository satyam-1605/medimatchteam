import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export type CallStatus = "idle" | "waiting" | "connecting" | "connected" | "reconnecting" | "ended" | "failed";

interface UseWebRTCOptions {
  sessionId: string;
  isInitiator: boolean; // patient = true, doctor = false
}

export function useWebRTC({ sessionId, isInitiator }: UseWebRTCOptions) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError("Camera/microphone access denied. Please allow permissions.");
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote tracks
      const remote = new MediaStream();
      setRemoteStream(remote);
      pc.ontrack = (e) => {
        e.streams[0]?.getTracks().forEach((track) => remote.addTrack(track));
        setRemoteStream(new MediaStream(remote.getTracks()));
      };

      // ICE candidate handling — write to DB
      pc.onicecandidate = async (e) => {
        if (!e.candidate) return;
        const field = isInitiator ? "ice_candidates_offer" : "ice_candidates_answer";
        // Fetch current candidates then append
        const { data } = await supabase
          .from("video_sessions")
          .select(field)
          .eq("id", sessionId)
          .single();
        if (data) {
          const current = (data as any)[field] || [];
          await supabase
            .from("video_sessions")
            .update({ [field]: [...current, e.candidate.toJSON()] } as any)
            .eq("id", sessionId);
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") setCallStatus("connected");
        else if (state === "disconnected") {
          setCallStatus("reconnecting");
          reconnectTimerRef.current = setTimeout(() => {
            if (pcRef.current?.connectionState !== "connected") {
              setCallStatus("failed");
            }
          }, 30000);
        } else if (state === "failed") {
          setCallStatus("failed");
        }
      };

      return pc;
    },
    [sessionId, isInitiator]
  );

  // Subscribe to realtime changes for signaling
  const subscribeToSession = useCallback(() => {
    const channel = supabase
      .channel(`video-session-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "video_sessions", filter: `id=eq.${sessionId}` },
        async (payload) => {
          const row = payload.new as any;
          const pc = pcRef.current;
          if (!pc) return;

          // If we're the initiator and we get an answer
          if (isInitiator && row.answer && pc.remoteDescription === null) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(row.answer));
              setCallStatus("connecting");
            } catch (err) {
              console.error("Error setting remote description:", err);
            }
          }

          // If we're the joiner and we get an offer
          if (!isInitiator && row.offer && pc.remoteDescription === null) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(row.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await supabase
                .from("video_sessions")
                .update({ answer: answer as any, status: "connected" } as any)
                .eq("id", sessionId);
              setCallStatus("connecting");
            } catch (err) {
              console.error("Error handling offer:", err);
            }
          }

          // Process ICE candidates from the other side
          const candidatesField = isInitiator ? "ice_candidates_answer" : "ice_candidates_offer";
          const candidates = row[candidatesField] || [];
          for (const c of candidates) {
            try {
              if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              }
            } catch (err) {
              // Ignore duplicate candidates
            }
          }
        }
      )
      .subscribe();
    channelRef.current = channel;
  }, [sessionId, isInitiator]);

  const startCall = useCallback(async () => {
    try {
      setCallStatus("waiting");
      setError(null);
      const stream = await getMedia();
      const pc = createPeerConnection(stream);
      subscribeToSession();

      if (isInitiator) {
        // Create offer and write to DB
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await supabase
          .from("video_sessions")
          .update({ offer: offer as any, status: "waiting" } as any)
          .eq("id", sessionId);
      } else {
        // Joiner: check if offer already exists
        const { data } = await supabase
          .from("video_sessions")
          .select("offer, ice_candidates_offer")
          .eq("id", sessionId)
          .single();
        if (data?.offer) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer as any));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await supabase
            .from("video_sessions")
            .update({ answer: answer as any, status: "connected" } as any)
            .eq("id", sessionId);
          setCallStatus("connecting");

          // Process existing ICE candidates
          const candidates = (data.ice_candidates_offer as any[]) || [];
          for (const c of candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (!error) setError(err?.message || "Failed to start call");
      setCallStatus("failed");
    }
  }, [getMedia, createPeerConnection, subscribeToSession, isInitiator, sessionId, error]);

  const endCall = useCallback(async () => {
    cleanup();
    setCallStatus("ended");
    await supabase
      .from("video_sessions")
      .update({ status: "ended" } as any)
      .eq("id", sessionId);
  }, [cleanup, sessionId]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((p) => !p);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCameraOff((p) => !p);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    callStatus,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}

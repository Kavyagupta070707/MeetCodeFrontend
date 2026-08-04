import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

function useWebRTCCall(session, loadingSession, user, canJoin) {
  const callId = session?.callId;
  const sessionStatus = session?.status;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteSocketIdRef = useRef(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [remoteUser, setRemoteUser] = useState(null);

  useEffect(() => {
    if (!callId || loadingSession || !user || !canJoin || sessionStatus === "completed") {
      setIsInitializingCall(false);
      return;
    }

    let isMounted = true;

    const createPeerConnection = () => {
      const peer = new RTCPeerConnection({ iceServers });

      localStreamRef.current?.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });

      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate && remoteSocketIdRef.current) {
          socketRef.current?.emit("ice-candidate", {
            to: remoteSocketIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (isMounted) {
          setIsConnected(peer.connectionState === "connected");
        }
      };

      peerRef.current = peer;
      return peer;
    };

    const startCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;
        const socket = io(socketUrl, {
          transports: ["websocket", "polling"],
          withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join-room", {
            roomId: callId,
            user: {
              id: user.id,
              name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress,
              image: user.imageUrl,
            },
          });
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error", error);
          toast.error("Unable to connect to call server");
        });

        socket.on("room-users", async ({ users }) => {
          const firstUser = users?.[0];
          if (!firstUser) return;

          remoteSocketIdRef.current = firstUser.socketId;
          setRemoteUser(firstUser.user);

          const peer = createPeerConnection();
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit("offer", { to: firstUser.socketId, offer });
        });

        socket.on("user-joined", ({ socketId, user: joinedUser }) => {
          remoteSocketIdRef.current = socketId;
          setRemoteUser(joinedUser);

          if (!peerRef.current) {
            createPeerConnection();
          }
        });

        socket.on("offer", async ({ from, offer }) => {
          remoteSocketIdRef.current = from;
          const peer = peerRef.current || createPeerConnection();
          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer", { to: from, answer });
        });

        socket.on("answer", async ({ answer }) => {
          if (!peerRef.current) return;
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async ({ candidate }) => {
          if (!peerRef.current) return;
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on("chat-message", (message) => {
          setMessages((current) => [...current, message]);
        });

        socket.on("user-left", () => {
          remoteSocketIdRef.current = null;
          setRemoteUser(null);
          setIsConnected(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          peerRef.current?.close();
          peerRef.current = null;
        });
      } catch (error) {
        console.error("Error starting WebRTC call", error);
        toast.error("Unable to access camera or microphone");
      } finally {
        if (isMounted) setIsInitializingCall(false);
      }
    };

    startCall();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [callId, sessionStatus, loadingSession, user, canJoin]);

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()?.[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMicOn(audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()?.[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOn(videoTrack.enabled);
  };

  const sendMessage = (text) => {
    if (!text.trim() || !socketRef.current || !callId) return;

    socketRef.current.emit("chat-message", {
      roomId: callId,
      message: {
        text: text.trim(),
        sender: {
          id: user.id,
          name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress,
          image: user.imageUrl,
        },
      },
    });
  };

  const leaveCall = () => {
    socketRef.current?.disconnect();
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
  };

  return {
    localVideoRef,
    remoteVideoRef,
    isInitializingCall,
    isConnected,
    isMicOn,
    isCameraOn,
    messages,
    remoteUser,
    toggleMic,
    toggleCamera,
    sendMessage,
    leaveCall,
  };
}

export default useWebRTCCall;

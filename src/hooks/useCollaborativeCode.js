import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

function useCollaborativeCode({ roomId, user, canJoin, onRemoteCodeChange, onRemoteLanguageChange }) {
  const socketRef = useRef(null);
  const isApplyingRemoteChangeRef = useRef(false);
  const [isCodeSocketConnected, setIsCodeSocketConnected] = useState(false);

  useEffect(() => {
    if (!roomId || !user || !canJoin) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsCodeSocketConnected(true);
      socket.emit("join-code-room", { roomId });
    });

    socket.on("disconnect", () => {
      setIsCodeSocketConnected(false);
    });

    socket.on("code-change", ({ code, language }) => {
      isApplyingRemoteChangeRef.current = true;
      onRemoteCodeChange(code, language);
      queueMicrotask(() => {
        isApplyingRemoteChangeRef.current = false;
      });
    });

    socket.on("language-change", ({ language, code }) => {
      isApplyingRemoteChangeRef.current = true;
      onRemoteLanguageChange(language, code);
      queueMicrotask(() => {
        isApplyingRemoteChangeRef.current = false;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, user, canJoin, onRemoteCodeChange, onRemoteLanguageChange]);

  const broadcastCodeChange = (code, language) => {
    if (isApplyingRemoteChangeRef.current || !socketRef.current || !roomId) return;
    socketRef.current.emit("code-change", { roomId, code: code || "", language });
  };

  const broadcastLanguageChange = (language, code) => {
    if (isApplyingRemoteChangeRef.current || !socketRef.current || !roomId) return;
    socketRef.current.emit("language-change", { roomId, language, code: code || "" });
  };

  return {
    isCodeSocketConnected,
    broadcastCodeChange,
    broadcastLanguageChange,
  };
}

export default useCollaborativeCode;

import {
  CameraIcon,
  CameraOffIcon,
  LogOutIcon,
  MessageSquareIcon,
  MicIcon,
  MicOffIcon,
  SendIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

function VideoCallUI({
  localVideoRef,
  remoteVideoRef,
  isConnected,
  isMicOn,
  isCameraOn,
  messages,
  remoteUser,
  currentUser,
  onToggleMic,
  onToggleCamera,
  onSendMessage,
  onLeaveCall,
}) {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (!messageText.trim()) return;

    onSendMessage(messageText);
    setMessageText("");
  };

  const handleLeave = () => {
    onLeaveCall();
    navigate("/dashboard");
  };

  return (
    <div className="h-full flex gap-3">
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-2 min-w-0">
            <UsersIcon className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold truncate">
              {isConnected ? "2 participants connected" : "Waiting for participant"}
            </span>
          </div>

          <button
            onClick={() => setIsChatOpen((value) => !value)}
            className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
            title={isChatOpen ? "Hide chat" : "Show chat"}
          >
            <MessageSquareIcon className="size-4" />
            Chat
          </button>
        </div>

        <div className="flex-1 grid grid-rows-2 gap-3 min-h-0">
          <div className="relative rounded-lg overflow-hidden bg-neutral text-neutral-content">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {!remoteUser && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <p className="text-lg font-semibold">Waiting for the other person to join</p>
              </div>
            )}
            {remoteUser && (
              <div className="absolute left-3 bottom-3 badge badge-neutral">
                {remoteUser.name || "Participant"}
              </div>
            )}
          </div>

          <div className="relative rounded-lg overflow-hidden bg-neutral text-neutral-content">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral">
                <CameraOffIcon className="size-12 opacity-70" />
              </div>
            )}
            <div className="absolute left-3 bottom-3 badge badge-neutral">
              {currentUser?.fullName || currentUser?.username || "You"}
            </div>
          </div>
        </div>

        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center gap-3">
          <button
            onClick={onToggleMic}
            className={`btn btn-circle ${isMicOn ? "btn-ghost" : "btn-error"}`}
            title={isMicOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isMicOn ? <MicIcon className="size-5" /> : <MicOffIcon className="size-5" />}
          </button>

          <button
            onClick={onToggleCamera}
            className={`btn btn-circle ${isCameraOn ? "btn-ghost" : "btn-error"}`}
            title={isCameraOn ? "Turn camera off" : "Turn camera on"}
          >
            {isCameraOn ? (
              <CameraIcon className="size-5" />
            ) : (
              <CameraOffIcon className="size-5" />
            )}
          </button>

          <button onClick={handleLeave} className="btn btn-circle btn-error" title="Leave call">
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </div>

      <div
        className={`flex flex-col rounded-lg shadow overflow-hidden bg-base-100 transition-all duration-300 ease-in-out ${
          isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
        }`}
      >
        {isChatOpen && (
          <>
            <div className="p-3 border-b border-base-300 flex items-center justify-between">
              <h3 className="font-semibold">Session Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
                title="Close chat"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-base-content/60 text-center mt-8">
                  No messages yet
                </p>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender?.id === currentUser?.id;

                  return (
                    <div key={message.id} className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
                      <div className="chat-header text-xs opacity-70">
                        {isMine ? "You" : message.sender?.name || "Participant"}
                      </div>
                      <div className={`chat-bubble ${isMine ? "chat-bubble-primary" : ""}`}>
                        {message.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-base-300 flex gap-2">
              <input
                className="input input-bordered input-sm flex-1 min-w-0"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Message"
              />
              <button className="btn btn-primary btn-sm btn-circle" title="Send message">
                <SendIcon className="size-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default VideoCallUI;

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMessageCircle, FiSend } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import api from "../../utils/api.js";
import { format } from "date-fns";
import "./Patient.css";

export default function ConsultationRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  // Video state
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState("chat"); // chat | video

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const peerRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`).then(({ data }) => {
      setAppointment(data.appointment);
    }).catch(() => navigate(-1));
  }, [appointmentId]);

  useEffect(() => {
    if (!socket || !appointment) return;

    socket.emit("joinConsultation", { appointmentId, userId: user._id });

    socket.on("chatHistory", (msgs) => setMessages(msgs));
    socket.on("newMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("userTyping", ({ userId, isTyping }) => {
      if (userId !== user._id) setTyping(isTyping);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("newMessage");
      socket.off("userTyping");
    };
  }, [socket, appointment]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start video
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  useEffect(() => {
    if (appointment?.consultationType === "video") startVideo();
    return () => { localStream?.getTracks().forEach((t) => t.stop()); };
  }, [appointment]);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setMicOn(!micOn); }
    }
  };

  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; setCamOn(!camOn); }
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit("sendMessage", {
      appointmentId,
      senderId: user._id,
      senderRole: user.role,
      content: input.trim(),
    });
    setInput("");
    socket.emit("typing", { appointmentId, userId: user._id, isTyping: false });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket?.emit("typing", { appointmentId, userId: user._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit("typing", { appointmentId, userId: user._id, isTyping: false });
    }, 1500);
  };

  const handleEndCall = async () => {
    localStream?.getTracks().forEach((t) => t.stop());
    navigate(user.role === "patient" ? "/patient/appointments" : "/doctor/appointments");
  };

  if (!appointment) return <div className="loading-screen" style={{ background: "var(--dark)" }}><div className="spinner" /></div>;

  const other = user.role === "patient" ? appointment.doctor?.user : appointment.patient;
  const otherName = user.role === "patient" ? `Dr. ${appointment.doctor?.user?.name}` : appointment.patient?.name;

  return (
    <div className="consultation-room">
      {/* Video Area */}
      {appointment.consultationType === "video" && (
        <div className="video-area">
          <div className="video-main" style={{ background: "var(--dark-3)", position: "relative" }}>
            {/* Remote video placeholder */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "var(--text-light)" }}>
              <div className="avatar avatar-xl" style={{ background: "var(--dark-2)", color: "#fff", fontSize: 32 }}>
                {otherName?.charAt(0)}
              </div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>{otherName}</p>
              <p style={{ fontSize: 13, opacity: 0.5 }}>Waiting for connection...</p>
            </div>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "none" }} />
          </div>

          {/* Self video */}
          <div className="video-self">
            {camOn ? <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
              <div style={{ width: "100%", height: "100%", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <FiVideoOff />
              </div>}
          </div>

          {/* Controls */}
          <div className="video-controls">
            <button className={`ctrl-btn ${micOn ? "active" : ""}`} onClick={toggleMic} title={micOn ? "Mute" : "Unmute"}>
              {micOn ? <FiMic /> : <FiMicOff />}
            </button>
            <button className={`ctrl-btn ${camOn ? "active" : ""}`} onClick={toggleCam} title={camOn ? "Turn off camera" : "Turn on camera"}>
              {camOn ? <FiVideo /> : <FiVideoOff />}
            </button>
            <button className="ctrl-btn" onClick={() => setActiveTab(activeTab === "chat" ? "video" : "chat")} title="Toggle chat">
              <FiMessageCircle />
            </button>
            <button className="ctrl-btn danger" onClick={handleEndCall} title="End call">
              <FiPhoneOff />
            </button>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <div className="chat-panel" style={{ width: appointment.consultationType === "video" ? 320 : "100%", maxWidth: appointment.consultationType === "chat" ? 700 : 320, margin: appointment.consultationType === "chat" ? "0 auto" : 0 }}>
        <div className="chat-panel-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#fff", marginBottom: 2 }}>💬 {otherName}</p>
              <p style={{ fontSize: 11, color: "var(--text-light)" }}>{appointment.consultationType} consultation</p>
            </div>
            {appointment.consultationType === "chat" && (
              <button className="ctrl-btn danger" onClick={handleEndCall} style={{ width: 36, height: 36 }}>
                <FiPhoneOff size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-light)", fontSize: 13, marginTop: 40 }}>
              <p>Start the consultation by saying hello! 👋</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <div key={i} className={`chat-msg ${isMe ? "mine" : "theirs"}`}>
                {!isMe && <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, opacity: 0.7 }}>{msg.sender?.name}</p>}
                <p>{msg.content}</p>
                <p className="chat-msg-time">{msg.createdAt ? format(new Date(msg.createdAt), "hh:mm a") : "Now"}</p>
              </div>
            );
          })}
          {typing && (
            <div className="chat-msg theirs" style={{ display: "inline-flex", gap: 4 }}>
              <span style={{ animation: "pulse 1s infinite", animationDelay: "0s" }}>●</span>
              <span style={{ animation: "pulse 1s infinite", animationDelay: "0.2s" }}>●</span>
              <span style={{ animation: "pulse 1s infinite", animationDelay: "0.4s" }}>●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input className="chat-input" value={input} onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message..." />
          <button className="btn btn-primary btn-icon" onClick={sendMessage} disabled={!input.trim()}>
            <FiSend size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

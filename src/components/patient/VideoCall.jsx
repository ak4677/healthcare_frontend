import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

// Install:  npm install socket.io-client
// The socket connects to your Express server (port 5000)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   roomId          – from appointment.room_id
//   consultationType – 'video' | 'chat'
//   patientName     – shown in header
//   doctorName      – shown in header
//   onClose         – callback to unmount this component
// ─────────────────────────────────────────────────────────────────────────────
export default function VideoCall({ roomId, consultationType, patientName, doctorName, onClose }) {
    const isDoctor = localStorage.getItem("role") === "Doctor";
    const myName = isDoctor ? `Dr. ${doctorName}` : patientName;
    const remoteName = isDoctor ? patientName : `Dr. ${doctorName}`;

    // ── Refs ──
    const socketRef = useRef(null);
    const pcRef = useRef(null);          // RTCPeerConnection
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // ── State ──
    const [connected, setConnected] = useState(false);   // peer WebRTC connected
    const [socketReady, setSocketReady] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(consultationType === "video");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState(consultationType === "video" ? "video" : "chat");

    const chatEndRef = useRef(null);

    // ── Scroll chat to bottom ──
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // ── Cleanup on unmount ──
    const cleanup = useCallback(() => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        pcRef.current?.close();
        socketRef.current?.disconnect();
    }, []);

    useEffect(() => { return cleanup; }, [cleanup]);

    // ── Create RTCPeerConnection ──
    const createPC = useCallback((socket) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socket.emit("ice-candidate", { roomId, candidate });
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "connected") setConnected(true);
            if (["disconnected", "failed", "closed"].includes(pc.connectionState)) setConnected(false);
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Add local tracks
        localStreamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current);
        });

        pcRef.current = pc;
        return pc;
    }, [roomId]);

    // ── Main setup: media → socket → signaling ──
    useEffect(() => {
        if (!roomId) return;

        let pc;

        const setup = async () => {
            // 1. Get media (only camera/mic needed for video; audio-only for chat mode)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: consultationType === "video",
                    audio: true
                });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            } catch (err) {
                setError("Could not access camera/microphone. Please allow permissions.");
                return;
            }

            // 2. Connect socket
            const socket = io(SOCKET_URL, { transports: ["websocket"] });
            socketRef.current = socket;

            socket.on("connect", () => {
                setSocketReady(true);
                socket.emit("join-room", {
                    roomId,
                    role: isDoctor ? "doctor" : "patient"
                });
            });

            // 3. When the other peer joins — the first joiner creates the offer
            socket.on("peer-joined", async () => {
                pc = createPC(socket);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("offer", { roomId, offer });
            });

            // 4. Receiving an offer — create answer
            socket.on("offer", async ({ offer }) => {
                if (!pcRef.current) pc = createPC(socket);
                else pc = pcRef.current;
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("answer", { roomId, answer });
            });

            // 5. Receiving an answer
            socket.on("answer", async ({ answer }) => {
                await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
            });

            // 6. ICE candidates
            socket.on("ice-candidate", async ({ candidate }) => {
                try {
                    await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) { /* ignore */ }
            });

            // 7. Remote peer ended the call
            socket.on("call-ended", () => {
                setCallEnded(true);
                setConnected(false);
            });

            socket.on("peer-left", () => {
                setConnected(false);
            });

            // 8. Chat messages relayed via socket
            socket.on("chat-message", ({ from, text, timestamp }) => {
                setChatMessages(prev => [...prev, { from, text, timestamp, mine: false }]);
            });
        };

        setup();
        // eslint-disable-next-line
    }, [roomId]);

    // ── End call ──
    const endCall = () => {
        socketRef.current?.emit("call-ended", { roomId });
        cleanup();
        setCallEnded(true);
        onClose?.();
    };

    // ── Toggle mic ──
    const toggleMic = () => {
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setMicOn(p => !p);
    };

    // ── Toggle camera ──
    const toggleCam = () => {
        localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setCamOn(p => !p);
    };

    // ── Send chat message ──
    const sendMessage = () => {
        const text = chatInput.trim();
        if (!text || !socketRef.current) return;
        const timestamp = new Date().toISOString();
        socketRef.current.emit("chat-message", { roomId, from: myName, text, timestamp });
        setChatMessages(prev => [...prev, { from: myName, text, timestamp, mine: true }]);
        setChatInput("");
    };

    if (callEnded) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-10 text-center shadow-2xl">
                    <p className="text-3xl mb-3">📵</p>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Call Ended</h3>
                    <p className="text-sm text-slate-500 mb-6">Your consultation has ended.</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-semibold text-sm hover:bg-slate-900"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    <div>
                        <p className="text-white text-sm font-semibold">{remoteName}</p>
                        <p className="text-slate-400 text-xs">
                            {connected ? "Connected" : "Waiting for other party…"}
                        </p>
                    </div>
                </div>

                {/* Tab switch: video ↔ chat */}
                {consultationType !== "chat" && (
                    <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                        {["video", "chat"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all
                                    ${activeTab === tab ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                            >
                                {tab === "video" ? "📹 Video" : "💬 Chat"}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-900/40 text-red-300 text-sm px-5 py-3 border-b border-red-800">
                    ⚠️ {error}
                </div>
            )}

            {/* ── Body ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video pane */}
                {activeTab === "video" && (
                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
                        {/* Remote video */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {!connected && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl mb-3">
                                    {remoteName[0]}
                                </div>
                                <p className="text-slate-300 text-sm font-medium">{remoteName}</p>
                                <p className="text-slate-500 text-xs mt-1 animate-pulse">Waiting…</p>
                            </div>
                        )}
                        {/* Local pip */}
                        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg bg-slate-800">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            {!camOn && (
                                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-xl">🚫</div>
                            )}
                            <p className="absolute bottom-1 left-1 text-white text-[10px] font-semibold drop-shadow">You</p>
                        </div>
                    </div>
                )}

                {/* Chat pane */}
                {activeTab === "chat" && (
                    <div className="flex-1 flex flex-col bg-slate-900">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.length === 0 && (
                                <p className="text-center text-slate-500 text-xs py-8">
                                    Messages are end-to-end via this session only.
                                </p>
                            )}
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm
                                        ${msg.mine
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-slate-700 text-slate-100 rounded-bl-sm"}`}>
                                        {!msg.mine && (
                                            <p className="text-xs font-semibold mb-1 text-blue-300">{msg.from}</p>
                                        )}
                                        {msg.text}
                                        <p className={`text-[10px] mt-1 ${msg.mine ? "text-blue-200" : "text-slate-400"}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-3 border-t border-slate-800 flex gap-2">
                            <input
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message…"
                                className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!chatInput.trim()}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Controls ── */}
            <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
                <ControlBtn
                    active={micOn}
                    activeIcon="🎙️"
                    inactiveIcon="🔇"
                    activeLabel="Mute"
                    inactiveLabel="Unmute"
                    onClick={toggleMic}
                    color="slate"
                />

                {consultationType === "video" && (
                    <ControlBtn
                        active={camOn}
                        activeIcon="📹"
                        inactiveIcon="📷"
                        activeLabel="Stop Cam"
                        inactiveLabel="Start Cam"
                        onClick={toggleCam}
                        color="slate"
                    />
                )}

                <button
                    onClick={endCall}
                    className="flex flex-col items-center gap-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all"
                >
                    <span className="text-xl">📵</span>
                    <span className="text-[10px] font-semibold">End Call</span>
                </button>
            </div>
        </div>
    );
}

const ControlBtn = ({ active, activeIcon, inactiveIcon, activeLabel, inactiveLabel, onClick, color }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all
            ${active
                ? `bg-${color}-700 hover:bg-${color}-600 text-white`
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"}`}
    >
        <span className="text-xl">{active ? activeIcon : inactiveIcon}</span>
        <span className="text-[10px] font-semibold">{active ? activeLabel : inactiveLabel}</span>
    </button>
);
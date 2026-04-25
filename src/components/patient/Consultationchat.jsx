/**
 * ConsultationChat.jsx
 * =====================
 * Doctor ↔ Patient real-time consultation chat with prescription panel.
 *
 * Usage in Patides.jsx (patient dashboard) and DoctorDashboard:
 *   <ConsultationChat patientId={patient._id} />
 *
 * Needs in DataFetch context:
 *   fetchConsultation, sendMessage, uploadPrescription
 *
 * Socket.io events used:
 *   emit: join-consultation, send-message, typing, stop-typing
 *   on:   receive-message, user-typing, user-stop-typing
 */

import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import PatientContext from '../../context/info/PatientContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const API        = import.meta.env.VITE_BACKEND || 'http://localhost:5000';

// ── Auth helpers ──────────────────────────────────────────────────────────────
const getToken    = () => localStorage.getItem('token');
const getRole     = () => localStorage.getItem('role');   // 'Doctor' | 'Patient'
const isDoctor    = () => getRole() === 'Doctor';

// ── Fetch wrapper ─────────────────────────────────────────────────────────────
const authFetch = (url, opts = {}) =>
    fetch(`${API}${url}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', 'auth-token': getToken(), ...(opts.headers || {}) },
    });

// ─────────────────────────────────────────────────────────────────────────────
export default function Consultationchat({ patientId }) {
    // ── State ────────────────────────────────────────────────────────────────
    const [thread,        setThread]       = useState(null);
    const [messages,      setMessages]     = useState([]);
    const [input,         setInput]        = useState('');
    const [isTyping,      setIsTyping]     = useState(false);
    const [remoteTyping,  setRemoteTyping] = useState(false);
    const [loading,       setLoading]      = useState(true);
    const [activeTab,     setActiveTab]    = useState('chat');   // 'chat' | 'prescription'

    // Prescription state
    const [rxText,        setRxText]       = useState('');
    const [rxFile,        setRxFile]       = useState(null);
    const [rxLoading,     setRxLoading]    = useState(false);
    const [prescriptions, setPrescriptions]= useState([]);

    // ── Refs ─────────────────────────────────────────────────────────────────
    const socketRef   = useRef(null);
    const messagesEnd = useRef(null);
    const typingTimer = useRef(null);

    const myName = localStorage.getItem('username') || (isDoctor() ? 'Doctor' : 'Patient');
    const myId   = patientId;
    console.log(typeof patientId)
    // ── Load thread ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!patientId) return;
        const targetId = isDoctor() ? patientId : myId;
        // const targetId=patientId
        loadThread(targetId);
        // eslint-disable-next-line
    }, [patientId]);

    const loadThread = async (pid) => {
        setLoading(true);
        try {
            const res  = await authFetch(`/api/consultation/${pid}`);
            const data = await res.json();
            if (res.ok) {
                setThread(data);
                setMessages(data.messages || []);
                setPrescriptions(data.prescriptions || []);
            } else {
                console.error('[ConsultationChat] load failed:', data.error);
            }
        } catch (e) {
            console.error('[ConsultationChat] network error:', e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Socket.io setup ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!thread?._id) return;

        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            // Register identity so server can route notifications
            socket.emit('register', { userId: myId });
            // Join the consultation room
            socket.emit('join-consultation', { consultationRoomId: thread.room_id });
        });

        socket.on('receive-message', (msg) => {
            setMessages(prev => [...prev, { ...msg, mine: false }]);
        });

        socket.on('user-typing',      () => setRemoteTyping(true));
        socket.on('user-stop-typing', () => setRemoteTyping(false));

        return () => {
            socket.disconnect();
        };
    }, [thread?._id]);

    // ── Auto-scroll ──────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, remoteTyping]);

    // ── Send message ─────────────────────────────────────────────────────────
    const handleSend = async () => {
        const text = input.trim();
        if (!text || !thread) return;

        const msg = {
            senderId:   myId,
            senderName: myName,
            senderRole: getRole()?.toLowerCase(),
            text,
            timestamp:  new Date().toISOString(),
            mine:       true,
        };

        // Optimistic UI update
        setMessages(prev => [...prev, msg]);
        setInput('');
        clearTyping();

        // Emit via socket
        socketRef.current?.emit('send-message', {
            consultationRoomId: thread.room_id,
            message: { ...msg, mine: false },   // receiver sees mine: false
        });

        // Persist to MongoDB
        try {
            await authFetch(`/api/consultation/${thread._id}/message`, {
                method: 'POST',
                body:   JSON.stringify({ text, senderName: myName }),
            });
        } catch (e) { /* non-critical — already in socket */ }
    };

    // ── Typing indicator ─────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
            socketRef.current?.emit('typing', { consultationRoomId: thread?.room_id, name: myName });
        }
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(clearTyping, 1500);
    };

    const clearTyping = () => {
        setIsTyping(false);
        socketRef.current?.emit('stop-typing', { consultationRoomId: thread?.room_id });
    };

    // ── Upload prescription (doctor only) ────────────────────────────────────
    const handlePrescriptionSubmit = async (e) => {
        e.preventDefault();
        if (!rxText.trim() && !rxFile) return;
        setRxLoading(true);
        try {
            const formData = new FormData();
            if (rxText.trim()) formData.append('text', rxText.trim());
            if (rxFile)        formData.append('image', rxFile);
            formData.append('doctorName', myName);

            const res = await fetch(`${API}/api/consultation/${thread._id}/prescription`, {
                method:  'POST',
                headers: { 'auth-token': getToken() },
                body:    formData,
            });
            const data = await res.json();
            if (res.ok) {
                setPrescriptions(prev => [...prev, data.prescription]);
                setRxText('');
                setRxFile(null);
            } else {
                alert(data.error || 'Failed to save prescription');
            }
        } catch (err) {
            alert('Network error: ' + err.message);
        } finally {
            setRxLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
            Loading consultation…
        </div>
    );

    if (!thread) return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
            {isDoctor() ? 'Start a consultation by selecting a patient.' : 'No consultation thread yet.'}
        </div>
    );

    const remoteUser = isDoctor()
        ? thread.patient_id?.name || 'Patient'
        : thread.doctor_id?.name  ? `Dr. ${thread.doctor_id.name}` : 'Doctor';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {remoteUser[0]}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">{remoteUser}</p>
                        <p className="text-xs text-slate-400">
                            {remoteTyping ? <span className="text-blue-500 animate-pulse">typing…</span> : 'Consultation Chat'}
                        </p>
                    </div>
                </div>

                {/* Tab switcher — only doctor sees Prescription tab */}
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                    <TabBtn active={activeTab === 'chat'}         onClick={() => setActiveTab('chat')}>         💬 Chat</TabBtn>
                    {isDoctor() && (
                        <TabBtn active={activeTab === 'prescription'} onClick={() => setActiveTab('prescription')}> 📋 Prescriptions</TabBtn>
                    )}
                    {!isDoctor() && prescriptions.length > 0 && (
                        <TabBtn active={activeTab === 'prescription'} onClick={() => setActiveTab('prescription')}> 📋 Prescriptions ({prescriptions.length})</TabBtn>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                CHAT TAB
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'chat' && (
                <>
                    {/* Messages */}
                    <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                <span className="text-4xl mb-2">💬</span>
                                <p>No messages yet. Start the conversation.</p>
                            </div>
                        )}

                        {messages.map((msg, i) => {
                            const isMine = msg.mine || msg.senderId === myId;
                            const time   = new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                            return (
                                <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm
                                        ${isMine
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                                        }`}>
                                        {!isMine && (
                                            <p className={`text-xs font-bold mb-1 ${msg.senderRole === 'doctor' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                {msg.senderName}
                                            </p>
                                        )}
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{time}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing indicator */}
                        {remoteTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                                    <div className="flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEnd} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                        <input
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder={`Message ${remoteUser}…`}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-slate-400 transition"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
                        >
                            Send
                        </button>
                    </div>
                </>
            )}

            {/* ════════════════════════════════════════════════════════════════
                PRESCRIPTION TAB
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'prescription' && (
                <div className="p-5 space-y-5">

                    {/* Doctor: issue new prescription */}
                    {isDoctor() && (
                        <form onSubmit={handlePrescriptionSubmit} className="space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Issue New Prescription</p>

                            <textarea
                                value={rxText}
                                onChange={e => setRxText(e.target.value)}
                                rows={5}
                                placeholder={`Prescription for ${thread.patient_id?.name || 'Patient'}…

Example:
Tab. Amoxicillin 500mg — 3 times daily for 5 days
Tab. Paracetamol 650mg — as needed for fever
Drink plenty of fluids. Review after 5 days.`}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none placeholder-slate-300 font-mono"
                            />

                            <div className="flex items-center gap-3">
                                <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-teal-300 rounded-xl p-3 cursor-pointer text-center transition">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={e => setRxFile(e.target.files[0])}
                                    />
                                    {rxFile ? (
                                        <p className="text-xs text-teal-600 font-semibold">✓ {rxFile.name}</p>
                                    ) : (
                                        <p className="text-xs text-slate-400">
                                            📎 Upload prescription image / PDF (optional)
                                        </p>
                                    )}
                                </label>

                                <button
                                    type="submit"
                                    disabled={rxLoading || (!rxText.trim() && !rxFile)}
                                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all active:scale-95"
                                >
                                    {rxLoading ? 'Saving…' : '📋 Issue Prescription'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Prescription list — visible to both */}
                    <div>
                        {prescriptions.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm">
                                <span className="text-4xl block mb-2">📋</span>
                                {isDoctor() ? 'No prescriptions issued yet.' : 'No prescriptions from your doctor yet.'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {prescriptions.length} Prescription(s)
                                </p>
                                {[...prescriptions].reverse().map((rx, i) => (
                                    <PrescriptionCard key={i} rx={rx} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const TabBtn = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
            ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
    >
        {children}
    </button>
);

const PrescriptionCard = ({ rx }) => (
    <div className="rounded-xl border border-teal-100 bg-teal-50/30 p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
            <div>
                <p className="text-xs font-bold text-teal-700">Dr. {rx.issuedByName}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(rx.issuedAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}
                </p>
            </div>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">Rx</span>
        </div>

        {rx.text && (
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white rounded-lg p-3 border border-teal-100 leading-relaxed">
                {rx.text}
            </pre>
        )}

        {rx.image_url && (
            <div className="mt-3">
                {rx.image_url.endsWith('.pdf') ? (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${rx.image_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-teal-200 text-teal-700 rounded-lg text-sm font-semibold hover:bg-teal-50 transition"
                    >
                        📄 View Prescription PDF
                    </a>
                ) : (
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${rx.image_url}`}
                        alt="Prescription"
                        className="w-full max-w-sm rounded-xl border border-teal-100 shadow-sm mt-1"
                    />
                )}
            </div>
        )}
    </div>
);
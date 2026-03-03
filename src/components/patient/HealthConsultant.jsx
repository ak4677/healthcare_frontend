import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Builds full patient context string — passed to Ollama (local only)
// Includes ALL liver fields, ALL skin class probabilities, CVD data
// ─────────────────────────────────────────────────────────────────────────────
function buildPatientContext(patient) {
    const history = patient?.medical_history || [];

    const liverRecord = [...history].reverse().find(r => r.liverData?.ascites !== undefined);
    const liverFields = liverRecord?.liverData || null;

    const skinRecords = history.filter(r =>
        r.skinData?.images?.length > 0 || r.skinData?.predictions?.length > 0
    );
    const skinPreds = skinRecords
        .flatMap(r => r.skinData?.predictions || [])
        .filter(Boolean);

    const cvdRecord = [...history].reverse().find(r => r.cvdData?.age !== undefined);
    const cvdFields = cvdRecord?.cvdData || null;

    const riskLabel =
        patient?.prediction === 0 ? "Low"
        : patient?.prediction === 1 ? "Moderate"
        : patient?.prediction === 2 ? "High"
        : "Not yet assessed";

    let ctx = `PATIENT REPORT SUMMARY\n`;
    ctx    += `Patient name: ${patient?.name || "unknown"}\n\n`;

    // Liver panel
    if (liverFields) {
        ctx += `LIVER PANEL (date: ${liverRecord?.createdAt?.slice(0, 10) || "unknown"}):\n`;
        ctx += `  Ascites: ${liverFields.ascites ?? "N/A"}\n`;
        ctx += `  Hepatomegaly: ${liverFields.hepatome ?? "N/A"}\n`;
        ctx += `  Spiders: ${liverFields.spiders ?? "N/A"}\n`;
        ctx += `  Edema: ${liverFields.edema ?? "N/A"}\n`;
        ctx += `  Bilirubin: ${liverFields.bilirubin ?? "N/A"} mg/dL\n`;
        ctx += `  Cholesterol: ${liverFields.cholesterol ?? "N/A"} mg/dL\n`;
        ctx += `  Albumin: ${liverFields.albumin ?? "N/A"} g/dL\n`;
        ctx += `  Copper: ${liverFields.copper ?? "N/A"} µg/dL\n`;
        ctx += `  Alk Phos: ${liverFields.alk_phos ?? "N/A"} IU/L\n`;
        ctx += `  SGOT: ${liverFields.SGOT ?? "N/A"} U/L\n`;
        ctx += `  Triglycerides: ${liverFields.tryglicerides ?? "N/A"} mg/dL\n`;
        ctx += `  Platelets: ${liverFields.platelets ?? "N/A"}\n`;
        ctx += `  Prothrombin: ${liverFields.prothrombin ?? "N/A"} s\n`;
        ctx += `  AI Liver Cirrhosis Risk: ${riskLabel}\n\n`;
    } else {
        ctx += `LIVER PANEL: No data uploaded yet.\n\n`;
    }

    // Skin predictions — full class breakdown
    if (skinPreds.length > 0) {
        ctx += `SKIN CANCER ANALYSIS (${skinPreds.length} image(s) analysed):\n`;
        ctx += `  Classes: akiec=Actinic Keratosis, bcc=Basal Cell Carcinoma, `;
        ctx += `bkl=Benign Keratosis, df=Dermatofibroma, mel=Melanoma, `;
        ctx += `nv=Melanocytic Nevi, vasc=Vascular Lesion\n`;
        ctx += `  Malignant: akiec, bcc, mel  |  Benign: bkl, df, nv, vasc\n\n`;
        skinPreds.forEach((p, i) => {
            ctx += `  Image ${i + 1}:\n`;
            ctx += `    Binary result: ${p.binary_prediction} (${((p.binary_confidence || 0) * 100).toFixed(1)}% confidence)\n`;
            ctx += `    Top diagnosis: ${p.multi_class_description || p.multi_class_prediction} [${p.multi_class_prediction}] (${((p.multi_class_confidence || 0) * 100).toFixed(1)}%)\n`;
            if (p.all_class_probabilities && Object.keys(p.all_class_probabilities).length > 0) {
                ctx += `    All class probabilities:\n`;
                Object.entries(p.all_class_probabilities)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([cls, prob]) => {
                        ctx += `      ${cls}: ${(prob * 100).toFixed(1)}%\n`;
                    });
            }
        });
        ctx += "\n";
    } else {
        ctx += `SKIN ANALYSIS: No predictions available yet.\n\n`;
    }

    // CVD
    if (cvdFields) {
        ctx += `CARDIOVASCULAR DATA (date: ${cvdRecord?.createdAt?.slice(0, 10) || "unknown"}):\n`;
        ctx += `  Age: ${cvdFields.age ?? "N/A"} yrs\n`;
        ctx += `  Blood Pressure: ${cvdFields.bloodPressure ?? "N/A"} mmHg\n`;
        ctx += `  Cholesterol: ${cvdFields.cholesterol ?? "N/A"} mg/dL\n`;
        ctx += `  Heart Rate: ${cvdFields.heartRate ?? "N/A"} bpm\n`;
        ctx += `  Blood Sugar: ${cvdFields.bloodSugar ?? "N/A"} mg/dL\n\n`;
    } else {
        ctx += `CARDIOVASCULAR DATA: No data uploaded yet.\n\n`;
    }

    return ctx;
}

// Short, focused system prompt — reduces Ollama prompt_eval time on CPU
function buildSystemPrompt(patient) {
    return `You are Aria, a health information guide. You are NOT a doctor.

Rules:
- Explain test values and medical terms in simple language
- Reference the patient's specific numbers when they ask about their results
- Suggest questions the patient could ask their doctor
- NEVER diagnose or say "you have [disease]"
- NEVER recommend medication or treatments
- Keep replies to 4-6 sentences max
- End every reply with: "Please discuss this with your doctor for personal medical decisions."

${buildPatientContext(patient)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function HealthConsultant({ patient }) {
    const [isOpen,     setIsOpen]     = useState(false);
    const [messages,   setMessages]   = useState([]);
    const [input,      setInput]      = useState("");
    const [loading,    setLoading]    = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (isOpen && !hasGreeted) {
            setHasGreeted(true);
            const name    = patient?.name ? patient.name.split(" ")[0] : "there";
            const hasData = (patient?.medical_history?.length || 0) > 0;
            const greeting = hasData
                ? `Hi ${name}! 👋 I'm Aria, your health guide. I can see your medical reports are loaded. Ask me anything — what your values mean, what the skin scan classes are, or what questions to bring to your doctor.`
                : `Hi ${name}! 👋 I'm Aria, your health guide. No reports are uploaded yet. Once your lab results are available, I can explain them. For now, feel free to ask general health questions!`;
            setMessages([{ role: "assistant", content: greeting }]);
        }
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const newMessages = [...messages, { role: "user", content: text }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        // typing indicator
        setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

        try {
            const response = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token":   localStorage.getItem("token")
                },
                body: JSON.stringify({
                    systemPrompt: buildSystemPrompt(patient),
                    // plain { role, content } format — last 6 messages only (keeps context small)
                    messages: newMessages.slice(-6).map(m => ({
                        role:    m.role,
                        content: m.content
                    }))
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.ollamaDown) {
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        {
                            role:    "assistant",
                            content: `⚠️ Local AI (Ollama) is not available.\n\n${data.detail || data.error}\n\nTo fix:\n1. Open a terminal\n2. Run: ollama serve\n3. Run: ollama pull llama3.2\n\nThen refresh and try again.`,
                            error: true
                        }
                    ]);
                    return;
                }
                throw new Error(data.error || "Request failed");
            }

            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: data.reply, source: data.source }
            ]);

        } catch (err) {
            console.error("Aria error:", err);
            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    role:    "assistant",
                    content: "I'm having trouble connecting right now. Please check the server is running and try again.",
                    error: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // Suggested questions based on what data is available
    const history     = patient?.medical_history || [];
    const hasLiver    = [...history].reverse().some(r => r.liverData?.ascites !== undefined);
    const hasSkin     = history.some(r => r.skinData?.predictions?.length > 0);
    const hasCvd      = [...history].reverse().some(r => r.cvdData?.age !== undefined);

    const suggestions = [];
    if (hasLiver) suggestions.push("What does my bilirubin value mean?");
    if (hasLiver) suggestions.push("What is ascites in my liver report?");
    if (hasSkin)  suggestions.push("Explain all classes for my first skin image");
    if (hasCvd)   suggestions.push("What does my blood pressure reading indicate?");
    if (!hasLiver && !hasSkin && !hasCvd) {
        suggestions.push("What lifestyle habits support liver health?");
        suggestions.push("How can I prepare for my doctor visit?");
    }

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300
                    ${isOpen
                        ? "bg-slate-700 rotate-45"
                        : "bg-teal-600 hover:bg-teal-700 hover:scale-110"}`}
                aria-label="Toggle Aria health guide"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Unread dot */}
            {!isOpen && messages.length > 0 && (
                <span className="fixed bottom-[58px] right-5 z-50 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
            )}

            {/* Chat panel */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-3xl shadow-2xl border border-slate-100
                    flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
                    ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
                style={{ maxHeight: "min(620px, calc(100vh - 120px))" }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 flex items-center gap-3 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">Aria</p>
                        <p className="text-teal-100 text-xs">Health Information Guide</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wide bg-white/20 text-white px-2 py-1 rounded-full shrink-0">
                        Not a doctor
                    </span>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-start gap-2 shrink-0">
                    <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                        Aria provides health education only — not medical advice. Always consult your doctor for clinical decisions.
                    </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 mt-1 shrink-0">
                                    <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                            )}
                            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                                ${msg.role === "user"
                                    ? "bg-teal-600 text-white rounded-tr-sm"
                                    : msg.error
                                        ? "bg-red-50 text-red-700 border border-red-100 rounded-tl-sm"
                                        : "bg-slate-100 text-slate-800 rounded-tl-sm"}`}
                            >
                                {msg.streaming ? (
                                    <span className="flex gap-1 items-center py-1">
                                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </span>
                                ) : (
                                    <>
                                        {msg.content.split("\n").map((line, li, arr) => (
                                            <span key={li}>
                                                {line}
                                                {li < arr.length - 1 && <br />}
                                            </span>
                                        ))}
                                        {msg.role === "assistant" && msg.source && (
                                            <span className={`flex items-center gap-1 mt-2 text-[9px] font-semibold uppercase tracking-wide w-fit px-1.5 py-0.5 rounded-full
                                                ${msg.source === "local" || msg.source === "local-fallback"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-blue-100 text-blue-600"}`}>
                                                {msg.source === "local" || msg.source === "local-fallback"
                                                    ? "🔒 processed locally — your data stayed on this machine"
                                                    : "🌐 general answer — no personal data was sent online"}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested questions — shown only before first user message */}
                {messages.length <= 1 && !loading && (
                    <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
                        {suggestions.slice(0, 3).map((s, i) => (
                            <button
                                key={i}
                                onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                                className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-100 transition-colors text-left"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 shrink-0">
                    <div className="flex gap-2 items-end">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your reports…"
                            className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm
                                text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400
                                focus:border-transparent transition-all max-h-24 overflow-y-auto"
                            style={{ lineHeight: "1.5" }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="w-9 h-9 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed
                                flex items-center justify-center transition-all active:scale-95 shrink-0"
                        >
                            <svg className="w-4 h-4 text-white translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
                </div>
            </div>
        </>
    );
}
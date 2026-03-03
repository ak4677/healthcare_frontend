import React, { useEffect, useContext, useState } from 'react'
import { useParams } from 'react-router-dom';
import PatientContext from '../../context/info/PatientContext';
import HealthConsultant from './HealthConsultant';

export default function Patides() {
    const { id } = useParams();
    const fetching = useContext(PatientContext)
    const {
        fetchdata, patientdata, patient_madical_data, medical_data, prediction,
        // NEW — skin prediction functions from fixed DataFetch.jsx
        skin_predict, skin_predict_all, skinPredictions
    } = fetching

    const [patient, setpatient] = useState({});

    // NEW — which tab is active: 'liver' | 'skin' | 'cvd'
    const [activeTab, setActiveTab] = useState('liver');
    // NEW — which skin upload session is shown (index into skinRecords)
    const [activeSkinRecord, setActiveSkinRecord] = useState(0);
    // NEW — per-image/per-record loading flags  { key: bool }
    const [skinLoading, setSkinLoading] = useState({});

    // ─── YOUR ORIGINAL LOGIC — NOT CHANGED ───────────────────────────────────
    useEffect(() => {
        if (localStorage.getItem('role') === "Patient") {
            medical_data()
        } else {
            fetchdata()
        }
        // eslint-disable-next-line
    }, [id])

    useEffect(() => {
        if (localStorage.getItem('role') === "Patient" && patient_madical_data) {
            setpatient(patient_madical_data);
        } else if (patientdata.length > 0 && id) {
            const selected = patientdata.find(p => p._id === id)
            setpatient(selected || {})
        }
    }, [patient_madical_data, patientdata, id]);

    const handleclick = async () => {
        try {
            console.log(id)
            const latestHistory = patient?.medical_history && patient.medical_history.length > 0
                ? patient.medical_history[patient.medical_history.length - 1]
                : {};
            console.log(latestHistory)
            await prediction(id, latestHistory)
            await fetchdata()
        } catch (error) {
            console.error("Prediction error:", error);
            alert(error)
        }
    }

    // Helper to get latest medical data safely — ORIGINAL
    const latestData = patient?.medical_history?.[patient.medical_history.length - 1] || {};
    // ─── END ORIGINAL LOGIC ───────────────────────────────────────────────────

    // ─── NEW: derive data slices from medical_history ─────────────────────────
    const history = patient?.medical_history || [];

    // Most recent record that contains liver fields
    const liverRecord = [...history].reverse().find(r => r.liverData?.ascites !== undefined);
    const liverFields = liverRecord?.liverData || {};

    // All records that have at least one skin image
    const skinRecords = history.filter(r => r.skinData?.images?.length > 0 || r.skinData?.predictions?.length > 0);

    // Most recent record that contains cvd fields
    const cvdRecord = [...history].reverse().find(r => r.cvdData?.age !== undefined);
    const cvdFields = cvdRecord?.cvdData || {};

    const hasLiver = !!liverRecord;
    const hasSkin  = skinRecords.length > 0;
    const hasCvd   = !!cvdRecord;

    const isDoctor = localStorage.getItem('role') === 'Doctor';

    // Auto-switch to first tab with data whenever patient changes
    useEffect(() => {
        if (hasLiver) setActiveTab('liver');
        else if (hasSkin) setActiveTab('skin');
        else if (hasCvd) setActiveTab('cvd');
        setActiveSkinRecord(0);
    // eslint-disable-next-line
    }, [patient._id]);

    // NEW: run prediction for a single image
    const handleSkinPredict = async (recordId, imgIdx) => {
        const key = `${recordId}_${imgIdx}`;
        setSkinLoading(p => ({ ...p, [key]: true }));
        try {
            await skin_predict(recordId, imgIdx);
            await fetchdata();
        } catch (e) {
            alert('Skin prediction failed: ' + e.message);
        } finally {
            setSkinLoading(p => ({ ...p, [key]: false }));
        }
    };

    // NEW: run prediction for every image in a session
    const handleSkinPredictAll = async (recordId) => {
        const key = `all_${recordId}`;
        setSkinLoading(p => ({ ...p, [key]: true }));
        try {
            await skin_predict_all(recordId);
            await fetchdata();
        } catch (e) {
            alert('Skin prediction failed: ' + e.message);
        } finally {
            setSkinLoading(p => ({ ...p, [key]: false }));
        }
    };
    // ─── END NEW LOGIC ────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans text-slate-900">

            {/* ── Page Header — ORIGINAL, unchanged ── */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {patient?.name ? `${patient.name}'s Dashboard` : 'Patient Dashboard'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Patient ID: <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">{patient._id}</span>
                    </p>
                </div>

                {localStorage.getItem('role') === 'Doctor' && (
                    <button
                        onClick={handleclick}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Run Liver AI Prediction
                    </button>
                )}
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── LEFT COLUMN — ORIGINAL health score & doctor card, + new summary ── */}
                <div className="space-y-8">

                    {/* Health Score Card — ORIGINAL, unchanged */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <h2 className="text-lg font-bold text-slate-700 mb-6 self-start w-full border-b pb-2">Health Risk Analysis</h2>
                        <div className="relative w-64 h-64">
                            <svg className="rotate-[135deg] w-full h-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="2.5" strokeDasharray="75 100" strokeLinecap="round"></circle>
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-green-500 transition-all duration-1000 ease-out" strokeWidth="2.5"
                                    strokeDasharray={`${(patient?.risk_percentages?.[0] || 0) * 0.75} 100`} strokeLinecap="round"></circle>
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-yellow-400 transition-all duration-1000 ease-out" strokeWidth="2.5"
                                    strokeDasharray={`${(patient?.risk_percentages?.[1] || 0) * 0.75} 100`}
                                    strokeDashoffset={`-${(patient?.risk_percentages?.[0] || 0) * 0.75}`} strokeLinecap="round"></circle>
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-red-500 transition-all duration-1000 ease-out" strokeWidth="2.5"
                                    strokeDasharray={`${(patient?.risk_percentages?.[2] || 0) * 0.75} 100`}
                                    strokeDashoffset={`-${((patient?.risk_percentages?.[0] || 0) + (patient?.risk_percentages?.[1] || 0)) * 0.75}`} strokeLinecap="round"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-4">
                                <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Overall Status</span>
                                <span className={`text-3xl font-extrabold mt-1 
                                    ${patient?.prediction === 0 ? "text-green-500" :
                                        patient?.prediction === 1 ? "text-yellow-500" :
                                            patient?.prediction === 2 ? "text-red-500" : "text-slate-300"}`}>
                                    {patient?.prediction === 0 ? "SAFE" :
                                        patient?.prediction === 1 ? "WARNING" :
                                            patient?.prediction === 2 ? "DANGER" : "N/A"}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Safe</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Check</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Danger</div>
                        </div>
                    </div>

                    {/* Assigned Doctor Card — ORIGINAL, unchanged */}
                    {patient?.doctor && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Assigned Specialist</h2>
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">{patient.doctor.name}</h3>
                                    <div className="text-sm text-slate-500 mt-1 space-y-1">
                                        <p className="flex items-center gap-2">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            {patient.doctor.email}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                            {patient.doctor.number}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NEW — Data availability summary card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Uploaded Data</h2>
                        <div className="space-y-3">
                            <DataBadge label="Liver Records"
                                active={hasLiver}
                                detail={hasLiver ? new Date(liverRecord.createdAt).toLocaleDateString() : 'No data'} />
                            <DataBadge label="Skin Records"
                                active={hasSkin}
                                detail={hasSkin
                                    ? `${skinRecords.length} session(s) · ${skinRecords.reduce((a, r) => a + r.skinData.images.length, 0)} image(s)`
                                    : 'No data'} />
                            <DataBadge label="CVD Records"
                                active={hasCvd}
                                detail={hasCvd ? new Date(cvdRecord.createdAt).toLocaleDateString() : 'No data'} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN — NEW tabbed medical data panel ── */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                        {/* Tab bar */}
                        <div className="flex border-b border-slate-100">
                            {[
                                { key: 'liver', label: '🫀 Liver',  has: hasLiver  },
                                { key: 'skin',  label: '🔬 Skin',   has: hasSkin   },
                                { key: 'cvd',   label: '❤️ CVD',    has: hasCvd    },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 py-4 text-sm font-semibold transition-colors relative
                                        ${activeTab === tab.key
                                            ? 'text-blue-600 bg-blue-50/40'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {tab.label}
                                    {/* dot indicator when data exists */}
                                    {tab.has && (
                                        <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle
                                            ${activeTab === tab.key ? 'bg-blue-500' : 'bg-green-400'}`} />
                                    )}
                                    {/* active underline */}
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ═══════════ LIVER TAB ═══════════ */}
                        {activeTab === 'liver' && (
                            <>
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-bold text-slate-800">Liver Lab Reports</h2>
                                    <p className="text-sm text-slate-500">
                                        {hasLiver
                                            ? `Latest entry · ${new Date(liverRecord.createdAt).toLocaleString()}`
                                            : 'No liver data uploaded yet'}
                                    </p>
                                </div>
                                {hasLiver ? (
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {/* ORIGINAL MetricCard calls — data source updated to liverFields */}
                                        <MetricCard label="Ascites"       value={liverFields.ascites}      status="safe" />
                                        <MetricCard label="Hepatomegaly"  value={liverFields.hepatome}     status="safe" />
                                        <MetricCard label="Spiders"       value={liverFields.spiders}      status="safe" />
                                        <MetricCard label="Edema"         value={liverFields.edema}        status="safe" />
                                        <MetricCard label="Bilirubin"     value={liverFields.bilirubin}    status="risk" unit="mg/dL" />
                                        <MetricCard label="Cholesterol"   value={liverFields.cholesterol}  status="safe" unit="mg/dL" />
                                        <MetricCard label="Albumin"       value={liverFields.albumin}      status="safe" unit="g/dL" />
                                        <MetricCard label="Copper"        value={liverFields.copper}       status="risk" unit="µg/dL" />
                                        <MetricCard label="Alk Phos"      value={liverFields.alk_phos}     status="safe" unit="IU/L" />
                                        <MetricCard label="SGOT"          value={liverFields.SGOT}         status="safe" unit="U/L" />
                                        <MetricCard label="Triglycerides" value={liverFields.tryglicerides} status="safe" unit="mg/dL" />
                                        <MetricCard label="Platelets"     value={liverFields.platelets}    status="safe" />
                                        <MetricCard label="Prothrombin"   value={liverFields.prothrombin}  status="safe" unit="s" />
                                    </div>
                                ) : (
                                    <EmptyState icon="🫀" message="No liver data has been uploaded for this patient yet." />
                                )}
                            </>
                        )}

                        {/* ═══════════ SKIN TAB ═══════════ */}
                        {activeTab === 'skin' && (
                            <>
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Skin Cancer Detection</h2>
                                        <p className="text-sm text-slate-500">
                                            {hasSkin ? `${skinRecords.length} upload session(s)` : 'No skin images uploaded yet'}
                                        </p>
                                    </div>
                                </div>

                                {hasSkin ? (
                                    <div className="p-6 space-y-6">

                                        {/* Session selector — only shown when more than one upload session */}
                                        {skinRecords.length > 1 && (
                                            <div className="flex gap-2 flex-wrap">
                                                {skinRecords.map((rec, ri) => (
                                                    <button
                                                        key={rec._id}
                                                        onClick={() => setActiveSkinRecord(ri)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                                            ${activeSkinRecord === ri
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                    >
                                                        Session {ri + 1} · {new Date(rec.createdAt).toLocaleDateString()} · {rec.skinData.images.length} img
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Active session images */}
                                        {(() => {
                                            const rec        = skinRecords[activeSkinRecord] || skinRecords[0];
                                            const images     = rec?.skinData?.images     || [];
                                            const preds      = rec?.skinData?.predictions || [];
                                            const recordId   = rec?._id;
                                            // Use whichever array is longer as the source of truth for count
                                            const totalCount = Math.max(images.length, preds.length);

                                            return (
                                                <>
                                                    {/* Predict-all button for doctors */}
                                                    {isDoctor && totalCount > 0 && (
                                                        <div className="flex justify-end">
                                                            <button
                                                                disabled={!!skinLoading[`all_${recordId}`]}
                                                                onClick={() => handleSkinPredictAll(recordId)}
                                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                                                            >
                                                                {skinLoading[`all_${recordId}`]
                                                                    ? 'Running…'
                                                                    : `Predict All ${totalCount} Image(s)`}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* One card per image */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {Array.from({ length: totalCount }).map((_, imgIdx) => {
                                                            const loadKey  = `${recordId}_${imgIdx}`;
                                                            const result   = skinPredictions?.[loadKey] || preds[imgIdx];
                                                            const isMal    = result?.binary_prediction === 'Malignant';

                                                            // Primary source: result.image_path (stored in predictions, confirmed in DB)
                                                            // Fallback: images[imgIdx] (raw upload path, for unpredicted images)
                                                            const rawPath  = result?.image_path || images[imgIdx] || '';
                                                            const imgSrc   = rawPath
                                                                ? `http://localhost:5000/${rawPath.replace(/\\/g, '/')}`
                                                                : null;
                                                            const gradSrc  = result?.gradcam_image_url
                                                                ? `http://localhost:5000${result.gradcam_image_url.replace(/\\/g, '/')}`
                                                                : null;

                                                            return (
                                                                <div key={imgIdx} className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">

                                                                    {/* Card header */}
                                                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                                            Image {imgIdx + 1}
                                                                        </span>
                                                                        {result && (
                                                                            <span className={`text-xs font-bold px-2 py-1 rounded-full
                                                                                ${isMal ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                                {result.binary_prediction}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Images */}
                                                                    <div className="p-4 flex gap-3">
                                                                        <div className="flex-1">
                                                                            <p className="text-xs text-slate-400 mb-1 font-medium">Original</p>
                                                                            {imgSrc
                                                                                ? <img src={imgSrc} alt={`Skin ${imgIdx + 1}`}
                                                                                    className="w-full rounded-lg object-cover aspect-square bg-slate-100"
                                                                                    onError={e => { e.target.style.display = 'none'; }} />
                                                                                : <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">No image</div>
                                                                            }
                                                                        </div>
                                                                        {gradSrc && (
                                                                            <div className="flex-1">
                                                                                <p className="text-xs text-slate-400 mb-1 font-medium">AI Attention Map</p>
                                                                                <img src={gradSrc} alt="GradCAM"
                                                                                    className="w-full rounded-lg object-cover aspect-square bg-slate-100"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Result or predict button */}
                                                                    <div className="px-4 pb-4">
                                                                        {result ? (
                                                                            <div className="space-y-3">
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    <PredBadge label="Diagnosis"
                                                                                        value={result.multi_class_description || result.multi_class_prediction} />
                                                                                    <PredBadge label="Confidence"
                                                                                        value={`${((result.multi_class_confidence || 0) * 100).toFixed(1)}%`} />
                                                                                </div>

                                                                                {/* Probability bars */}
                                                                                {result.all_class_probabilities && (
                                                                                    <div className="space-y-1 pt-1">
                                                                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                                                                                            All Class Probabilities
                                                                                        </p>
                                                                                        {Object.entries(result.all_class_probabilities)
                                                                                            .sort((a, b) => b[1] - a[1])
                                                                                            .map(([cls, prob]) => (
                                                                                                <div key={cls} className="flex items-center gap-2">
                                                                                                    <span className="text-xs text-slate-500 w-10 shrink-0">{cls}</span>
                                                                                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                                                                                        <div
                                                                                                            className="h-1.5 rounded-full bg-purple-500 transition-all duration-700"
                                                                                                            style={{ width: `${(prob * 100).toFixed(1)}%` }}
                                                                                                        />
                                                                                                    </div>
                                                                                                    <span className="text-xs text-slate-400 w-10 text-right">
                                                                                                        {(prob * 100).toFixed(1)}%
                                                                                                    </span>
                                                                                                </div>
                                                                                            ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : isDoctor ? (
                                                                            <button
                                                                                disabled={!!skinLoading[loadKey]}
                                                                                onClick={() => handleSkinPredict(recordId, imgIdx)}
                                                                                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
                                                                            >
                                                                                {skinLoading[loadKey] ? 'Analyzing…' : 'Run AI Prediction'}
                                                                            </button>
                                                                        ) : (
                                                                            <p className="text-xs text-slate-400 text-center py-2">
                                                                                Awaiting doctor prediction
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <EmptyState icon="🔬" message="No skin images have been uploaded for this patient." />
                                )}
                            </>
                        )}

                        {/* ═══════════ CVD TAB ═══════════ */}
                        {activeTab === 'cvd' && (
                            <>
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-bold text-slate-800">Cardiovascular Data</h2>
                                    <p className="text-sm text-slate-500">
                                        {hasCvd
                                            ? `Latest entry · ${new Date(cvdRecord.createdAt).toLocaleString()}`
                                            : 'No CVD data uploaded yet'}
                                    </p>
                                </div>
                                {hasCvd ? (
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <MetricCard label="Age"            value={cvdFields.age}           status="safe" unit="yrs"   />
                                        <MetricCard label="Blood Pressure" value={cvdFields.bloodPressure} status="safe" unit="mmHg"  />
                                        <MetricCard label="Cholesterol"    value={cvdFields.cholesterol}   status="safe" unit="mg/dL" />
                                        <MetricCard label="Heart Rate"     value={cvdFields.heartRate}     status="safe" unit="bpm"   />
                                        <MetricCard label="Blood Sugar"    value={cvdFields.bloodSugar}    status="safe" unit="mg/dL" />
                                    </div>
                                ) : (
                                    <EmptyState icon="❤️" message="No cardiovascular data has been uploaded for this patient." />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── AI PREDICTION SECTION — ORIGINAL structure kept, skin button fixed ── */}
            <div className="max-w-7xl mx-auto mt-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-800">AI Disease Prediction Modules</h2>
                        <p className="text-sm text-slate-500">Model-based diagnostic assistance</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                        {/* SKIN — reads from real skinData predictions */}
                        <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Skin Cancer Detection</h3>
                            {(() => {
                                const latestSkinPred = skinRecords
                                    .flatMap(r => r.skinData?.predictions || [])
                                    .filter(Boolean)
                                    .at(-1);
                                return latestSkinPred ? (
                                    <>
                                        <p className="text-sm text-slate-600">
                                            Type: <span className="font-semibold">{latestSkinPred.multi_class_description || latestSkinPred.multi_class_prediction}</span>
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Malignancy: <span className={`font-semibold ${latestSkinPred.binary_prediction === 'Malignant' ? 'text-red-600' : 'text-green-600'}`}>
                                                {latestSkinPred.binary_prediction}
                                            </span>
                                        </p>
                                        {latestSkinPred.gradcam_image_url && (
                                            <img
                                                src={`http://localhost:5000${latestSkinPred.gradcam_image_url.replace(/\\/g, '/')}`}
                                                alt="GradCAM"
                                                className="mt-4 rounded-lg border w-full"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-400">No prediction available</p>
                                );
                            })()}
                            {isDoctor && hasSkin && (
                                <button
                                    disabled={!!skinLoading[`all_${skinRecords[0]?._id}`]}
                                    onClick={() => handleSkinPredictAll(skinRecords[skinRecords.length - 1]?._id)}
                                    className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-all"
                                >
                                    {skinLoading[`all_${skinRecords[skinRecords.length - 1]?._id}`]
                                        ? 'Running…'
                                        : 'Run Skin Cancer AI'}
                                </button>
                            )}
                        </div>

                        {/* LIVER — ORIGINAL */}
                        <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Liver Cirrhosis Risk</h3>
                            {patient?.prediction !== undefined && patient?.prediction !== null ? (
                                <p className="text-sm text-slate-600">
                                    Risk Level: <span className="font-semibold">
                                        {patient.prediction === 0 ? "Low" : patient.prediction === 1 ? "Moderate" : "High"}
                                    </span>
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400">No prediction available</p>
                            )}
                            {isDoctor && (
                                <button
                                    onClick={handleclick}
                                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                                >
                                    Run Liver AI
                                </button>
                            )}
                        </div>

                        {/* CVD — ORIGINAL structure, no prediction endpoint yet */}
                        <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Cardiovascular Disease Risk</h3>
                            {patient?.cvd_prediction ? (
                                <p className="text-sm text-slate-600">
                                    Risk Score: <span className="font-semibold">{patient.cvd_prediction}%</span>
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400">No prediction available</p>
                            )}
                            {isDoctor && (
                                <button
                                    onClick={() => prediction(id, { type: "cvd", data: latestData })}
                                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
                                >
                                    Run CVD AI
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>=

            {/* ── AI Health Consultant — visible to patients and doctors ── */}
            <HealthConsultant patient={patient} />
        </div>
    )
}

// ── ORIGINAL MetricCard — NOT changed ────────────────────────────────────────
const MetricCard = ({ label, value, status, unit = "" }) => {
    const isSafe = status === 'safe';
    return (
        <div className={`p-4 rounded-xl border ${isSafe ? 'border-slate-100 bg-white' : 'border-red-100 bg-red-50/30'}`}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-end gap-2 mt-1">
                <span className={`text-2xl font-bold ${isSafe ? 'text-slate-800' : 'text-red-600'}`}>
                    {value || "N/A"}
                </span>
                {unit && <span className="text-sm text-slate-400 mb-1">{unit}</span>}
            </div>
            <div className={`inline-flex items-center gap-1.5 mt-3 px-2 py-1 rounded text-xs font-medium
                ${isSafe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isSafe ? (
                    <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Normal</>
                ) : (
                    <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>High Risk</>
                )}
            </div>
        </div>
    );
};

// ── NEW small helpers ─────────────────────────────────────────────────────────
const PredBadge = ({ label, value }) => (
    <div className="bg-slate-50 rounded-lg p-2.5">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value || 'N/A'}</p>
    </div>
);

const EmptyState = ({ icon, message }) => (
    <div className="py-20 flex flex-col items-center text-center text-slate-400 px-8">
        <span className="text-5xl mb-4">{icon}</span>
        <p className="text-sm max-w-xs">{message}</p>
    </div>
);

const DataBadge = ({ label, active, detail }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-slate-200'}`} />
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <span className="text-xs text-slate-400 text-right max-w-[140px]">{detail}</span>
    </div>
);
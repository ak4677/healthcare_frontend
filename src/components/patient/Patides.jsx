import React, { useEffect, useContext, useState } from 'react'
import { useParams } from 'react-router-dom';
import PatientContext from '../../context/info/PatientContext';
import HealthConsultant from './HealthConsultant';
import AppointmentPanel from './AppointmentPanel';
import VideoCall from './VideoCall';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Consultationchat from './Consultationchat';

// ─────────────────────────────────────────────────────────────────────────────
// Role helpers
// ─────────────────────────────────────────────────────────────────────────────
const isDoctor  = () => localStorage.getItem('role') === 'Doctor';
const isPatient = () => localStorage.getItem('role') === 'Patient';

export default function Patides() {
    const { id } = useParams();
    const fetching = useContext(PatientContext);

    const {
        fetchdata, patientdata,
        patient_madical_data, medical_data,
        skin_predict, skin_predict_all, skinPredictions,
        predict_liver, predict_cvd, predict_basic,
    } = fetching;
    const [patient,          setPatient]         = useState({});
    const [activeCall,       setActiveCall]       = useState(null);
    const [activeSkinRecord, setActiveSkinRecord] = useState(0);
    const [skinLoading,      setSkinLoading]      = useState({});
    const [liverLoading,     setLiverLoading]     = useState(false);
    const [cvdLoading,       setCvdLoading]       = useState(false);
    const [basicLoading,     setBasicLoading]     = useState(false);

    // ── Load data ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isPatient()) medical_data();
        else             fetchdata();
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        if (isPatient() && patient_madical_data) {
            setPatient(patient_madical_data);
        } else if (patientdata?.length > 0 && id) {
            setPatient(patientdata.find(p => p._id === id) || {});
        }
    }, [patient_madical_data, patientdata, id]);

    // ── Derive data slices ────────────────────────────────────────────────────
    const history     = patient?.medical_history || [];
    const liverRecord = [...history].reverse().find(r => r.liverData?.bilirubin   !== undefined);
    const cvdRecord   = [...history].reverse().find(r => r.cvdData?.bloodPressure !== undefined);
    const basicRecord = [...history].reverse().find(r => r.basicHealthData?.WBC   !== undefined);
    const skinRecords = history.filter(r => r.skinData?.images?.length > 0 || r.skinData?.predictions?.length > 0);

    const liverFields = liverRecord?.liverData       || {};
    const cvdFields   = cvdRecord?.cvdData           || {};
    const basicFields = basicRecord?.basicHealthData  || {};

    const hasLiver = !!liverRecord;
    const hasCvd   = !!cvdRecord;
    const hasBasic = !!basicRecord;
    const hasSkin  = skinRecords.length > 0;
    console.log(patient)
    // ── Prediction handlers ───────────────────────────────────────────────────
    const refresh = () => isPatient() ? medical_data() : fetchdata();

    const handleLiverPredict = async () => {
        if (!liverRecord?._id) return;
        setLiverLoading(true);
        try { await predict_liver(liverRecord._id); await refresh(); }
        catch (e) { alert('Liver prediction failed: ' + e.message); }
        finally   { setLiverLoading(false); }
    };

    const handleCvdPredict = async () => {
        if (!cvdRecord?._id) return;
        setCvdLoading(true);
        try { await predict_cvd(cvdRecord._id); await refresh(); }
        catch (e) { alert('CVD prediction failed: ' + e.message); }
        finally   { setCvdLoading(false); }
    };

    const handleBasicPredict = async () => {
        if (!basicRecord?._id) return;
        setBasicLoading(true);
        try { await predict_basic(basicRecord._id); await refresh(); }
        catch (e) { alert('Basic health prediction failed: ' + e.message); }
        finally   { setBasicLoading(false); }
    };

    const handleSkinPredict = async (recordId, imgIdx) => {
        const key = `${recordId}_${imgIdx}`;
        setSkinLoading(p => ({ ...p, [key]: true }));
        try { await skin_predict(recordId, imgIdx); await refresh(); }
        catch (e) { alert('Skin prediction failed: ' + e.message); }
        finally   { setSkinLoading(p => ({ ...p, [key]: false })); }
    };

    const handleSkinPredictAll = async (recordId) => {
        const key = `all_${recordId}`;
        setSkinLoading(p => ({ ...p, [key]: true }));
        try { await skin_predict_all(recordId); await refresh(); }
        catch (e) { alert('Skin prediction failed: ' + e.message); }
        finally   { setSkinLoading(p => ({ ...p, [key]: false })); }
    };

    // ── PDF export ────────────────────────────────────────────────────────────
    const downloadReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Patient Medical Report", 14, 20);
        doc.setFontSize(11);
        doc.text(`Name: ${patient?.name || 'N/A'}`, 14, 30);
        doc.text(`ID: ${patient?.id || 'N/A'}`, 14, 37);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);
        let y = 58;

        if (hasLiver) {
            doc.setFontSize(13); doc.text("Liver Data", 14, y); y += 4;
            autoTable(doc, { startY: y + 2, head: [['Field', 'Value']], body: Object.entries(liverFields).filter(([, v]) => typeof v === 'string' || typeof v === 'number').map(([k, v]) => [k, v]) });
            y = doc.lastAutoTable.finalY + 10;
        }
        if (hasCvd) {
            doc.setFontSize(13); doc.text("CVD Data", 14, y); y += 4;
            autoTable(doc, { startY: y + 2, head: [['Field', 'Value']], body: Object.entries(cvdFields).filter(([, v]) => typeof v === 'string' || typeof v === 'number').map(([k, v]) => [k, v]) });
            y = doc.lastAutoTable.finalY + 10;
        }
        if (hasSkin) {
            doc.setFontSize(13); doc.text("Skin Cancer Predictions", 14, y);
            const rows = skinRecords.flatMap(r => (r.skinData?.predictions || []).map((p, i) => [
                `Image ${i + 1}`, p.binary_prediction || '—',
                p.multi_class_description || p.multi_class_prediction || '—',
                `${((p.multi_class_confidence || 0) * 100).toFixed(1)}%`
            ]));
            if (rows.length > 0) autoTable(doc, { startY: y + 4, head: [['Image', 'Malignancy', 'Diagnosis', 'Confidence']], body: rows });
        }
        doc.save(`${patient?.name || 'patient'}_report.pdf`);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans text-slate-900">

            {activeCall && (
                <VideoCall
                    roomId={activeCall.roomId}
                    consultationType={activeCall.consultationType}
                    patientName={patient?.name || 'Patient'}
                    doctorName={patient?.doctor?.name || 'Doctor'}
                    onClose={() => setActiveCall(null)}
                />
            )}

            {/* ════════════════════════════════════════════════════════════════
                TOP — Page header + PDF button
            ════════════════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {patient?.name ? `${patient.name}'s Dashboard` : 'Patient Dashboard'}
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        ID: <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded">{patient._id}</span>
                    </p>
                </div>
                <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow transition-all active:scale-95"
                >
                    ⬇ Download Report
                </button>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TOP BLOCK 1 — SCOREBOARD (Health overview + doctor + data summary)
            ════════════════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Health Risk Gauge */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                    <h2 className="text-base font-bold text-slate-700 mb-4 self-start w-full border-b pb-2">
                        Health Risk Overview
                    </h2>
                    <div className="relative w-44 h-44">
                        <svg className="rotate-[135deg] w-full h-full" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="2.5" strokeDasharray="75 100" strokeLinecap="round" />
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-green-500 transition-all duration-1000" strokeWidth="2.5" strokeDasharray={`${(patient?.risk_percentages?.[0] || 0) * 0.75} 100`} strokeLinecap="round" />
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-yellow-400 transition-all duration-1000" strokeWidth="2.5" strokeDasharray={`${(patient?.risk_percentages?.[1] || 0) * 0.75} 100`} strokeDashoffset={`-${(patient?.risk_percentages?.[0] || 0) * 0.75}`} strokeLinecap="round" />
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-red-500 transition-all duration-1000" strokeWidth="2.5" strokeDasharray={`${(patient?.risk_percentages?.[2] || 0) * 0.75} 100`} strokeDashoffset={`-${((patient?.risk_percentages?.[0] || 0) + (patient?.risk_percentages?.[1] || 0)) * 0.75}`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-4">
                            <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Status</span>
                            <span className={`text-2xl font-extrabold mt-1 ${patient?.prediction === 0 ? 'text-green-500' : patient?.prediction === 1 ? 'text-yellow-500' : patient?.prediction === 2 ? 'text-red-500' : 'text-slate-300'}`}>
                                {patient?.prediction === 0 ? 'SAFE' : patient?.prediction === 1 ? 'WARN' : patient?.prediction === 2 ? 'RISK' : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Safe</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Check</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Risk</span>
                    </div>

                    {/* Quick prediction results row */}
                    <div className="w-full mt-5 grid grid-cols-2 gap-2">
                        {hasLiver && liverFields.risk_label && (
                            <MiniResult label="Liver" value={liverFields.risk_label} pct={liverFields.risk_percentage} />
                        )}
                        {hasCvd && cvdFields.risk_label && (
                            <MiniResult label="CVD" value={cvdFields.risk_label} pct={cvdFields.risk_percentage} />
                        )}
                        {hasBasic && basicFields.risk_tier && (
                            <MiniResult label="Basic" value={basicFields.risk_tier} pct={basicFields.health_score} />
                        )}
                        {hasSkin && skinRecords.some(r => r.skinData?.predictions?.length > 0) && (
                            <MiniResult label="Skin" value={skinRecords[0]?.skinData?.predictions?.[0]?.binary_prediction || '—'} />
                        )}
                    </div>
                </div>

                {/* Assigned Doctor */}
                {patient?.doctor ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-base font-bold text-slate-700 mb-4 border-b pb-2">Assigned Specialist</h2>
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shrink-0">
                                {patient.doctor.name?.[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">{patient.doctor.name}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{patient.doctor.email}</p>
                                <p className="text-sm text-slate-500">{patient.doctor.number}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        No specialist assigned yet
                    </div>
                )}

                {/* Data summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-base font-bold text-slate-700 mb-4 border-b pb-2">Uploaded Data</h2>
                    <div className="space-y-3">
                        <DataBadge label="Skin Records"  active={hasSkin}  detail={hasSkin  ? `${skinRecords.length} session(s) · ${skinRecords.reduce((a, r) => a + (r.skinData?.images?.length || 0), 0)} image(s)` : 'Not uploaded'} />
                        <DataBadge label="Liver Records" active={hasLiver} detail={hasLiver ? new Date(liverRecord.createdAt).toLocaleDateString() : 'Not uploaded'} />
                        <DataBadge label="CVD Records"   active={hasCvd}   detail={hasCvd   ? new Date(cvdRecord.createdAt).toLocaleDateString()   : 'Not uploaded'} />
                        <DataBadge label="Basic Health"  active={hasBasic} detail={hasBasic  ? new Date(basicRecord.createdAt).toLocaleDateString() : 'Not uploaded'} />
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TOP BLOCK 2 — APPOINTMENTS
            ════════════════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto mb-8">
                <AppointmentPanel
                    onJoinCall={(roomId, type) => setActiveCall({ roomId, consultationType: type })}
                />
            </div>

            {/* ════════════════════════════════════════════════════════════════
                SECTION 1 — SKIN CANCER
            ════════════════════════════════════════════════════════════════ */}
            <Section
                title="🔬 Skin Cancer Detection"
                subtitle={hasSkin ? `${skinRecords.length} upload session(s) · EfficientNet-B0 + ViT Hybrid` : 'No skin images uploaded'}
                accentColor="purple"
            >
                {hasSkin ? (
                    <div className="p-6 space-y-6">
                        {skinRecords.length > 1 && (
                            <div className="flex gap-2 flex-wrap">
                                {skinRecords.map((rec, ri) => (
                                    <button key={rec._id} onClick={() => setActiveSkinRecord(ri)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSkinRecord === ri ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                        Session {ri + 1} · {new Date(rec.createdAt).toLocaleDateString()} · {rec.skinData?.images?.length || 0} img
                                    </button>
                                ))}
                            </div>
                        )}

                        {(() => {
                            const rec      = skinRecords[activeSkinRecord] || skinRecords[0];
                            const images   = rec?.skinData?.images      || [];
                            const preds    = rec?.skinData?.predictions || [];
                            const recordId = rec?._id;
                            const total    = Math.max(images.length, preds.length);

                            return (
                                <>
                                    {isDoctor() && total > 0 && (
                                        <div className="flex justify-end">
                                            <button
                                                disabled={!!skinLoading[`all_${recordId}`]}
                                                onClick={() => handleSkinPredictAll(recordId)}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                                            >
                                                {skinLoading[`all_${recordId}`] ? 'Analyzing…' : `Predict All ${total} Image(s)`}
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Array.from({ length: total }).map((_, imgIdx) => {
                                            const loadKey = `${recordId}_${imgIdx}`;
                                            const result  = skinPredictions?.[loadKey] || preds[imgIdx];
                                            const isMal   = result?.binary_prediction === 'Malignant';
                                            const rawPath = result?.image_path || images[imgIdx] || '';
                                            const imgSrc  = rawPath ? `${import.meta.env.VITE_BACKEND}/${rawPath.replace(/\\/g, '/')}` : null;
                                            const gradSrc = result?.gradcam_image_url ? `${import.meta.env.VITE_BACKEND}${result.gradcam_image_url}` : null;

                                            return (
                                                <div key={imgIdx} className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Image {imgIdx + 1}</span>
                                                        {result && (
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isMal ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                {result.binary_prediction}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="p-4 flex gap-3">
                                                        <div className="flex-1">
                                                            <p className="text-xs text-slate-400 mb-1 font-medium">Original</p>
                                                            {imgSrc
                                                                ? <img src={imgSrc} alt={`Skin ${imgIdx + 1}`} className="w-full rounded-lg object-cover aspect-square bg-slate-100" onError={e => { e.target.style.display = 'none'; }} />
                                                                : <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">No preview</div>
                                                            }
                                                        </div>
                                                        {gradSrc && (
                                                            <div className="flex-1">
                                                                <p className="text-xs text-slate-400 mb-1 font-medium">AI Attention Map</p>
                                                                <img src={gradSrc} alt="GradCAM" className="w-full rounded-lg object-cover aspect-square" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="px-4 pb-4">
                                                        {result ? (
                                                            <div className="space-y-3">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <PredBadge label="Diagnosis"   value={result.multi_class_description || result.multi_class_prediction} />
                                                                    <PredBadge label="Confidence"  value={`${((result.multi_class_confidence || 0) * 100).toFixed(1)}%`} />
                                                                </div>
                                                                {result.all_class_probabilities && (
                                                                    <div className="space-y-1 pt-1">
                                                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">All Class Probabilities</p>
                                                                        {Object.entries(result.all_class_probabilities).sort((a, b) => b[1] - a[1]).map(([cls, prob]) => (
                                                                            <div key={cls} className="flex items-center gap-2">
                                                                                <span className="text-xs text-slate-500 w-10 shrink-0">{cls}</span>
                                                                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                                                                    <div className="h-1.5 rounded-full bg-purple-500 transition-all duration-700" style={{ width: `${(prob * 100).toFixed(1)}%` }} />
                                                                                </div>
                                                                                <span className="text-xs text-slate-400 w-10 text-right">{(prob * 100).toFixed(1)}%</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : isDoctor() ? (
                                                            <button
                                                                disabled={!!skinLoading[loadKey]}
                                                                onClick={() => handleSkinPredict(recordId, imgIdx)}
                                                                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
                                                            >
                                                                {skinLoading[loadKey] ? 'Analyzing…' : 'Run AI Prediction'}
                                                            </button>
                                                        ) : (
                                                            <p className="text-xs text-slate-400 text-center py-2">Awaiting doctor prediction</p>
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
            </Section>

            {/* ════════════════════════════════════════════════════════════════
                SECTION 2 — LIVER CIRRHOSIS
            ════════════════════════════════════════════════════════════════ */}
            <Section
                title="🫀 Liver Cirrhosis Risk Assessment"
                subtitle={hasLiver ? `Latest: ${new Date(liverRecord.createdAt).toLocaleString()} · TabNet + Ensemble` : 'No liver data uploaded'}
                accentColor="blue"
                doctorAction={isDoctor() && hasLiver ? { label: liverLoading ? 'Running…' : 'Run Liver AI', onClick: handleLiverPredict, disabled: liverLoading } : null}
            >
                {hasLiver ? (
                    <div className="p-6 space-y-8">
                        <div>
                            <SectionSub>Lab Values</SectionSub>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
                                <MetricCard label="Bilirubin"     value={liverFields.bilirubin}     unit="mg/dL" />
                                <MetricCard label="Albumin"       value={liverFields.albumin}       unit="g/dL"  />
                                <MetricCard label="SGOT (AST)"    value={liverFields.SGOT}          unit="U/L"   />
                                <MetricCard label="ALT"           value={liverFields.ALT}           unit="U/L"   />
                                <MetricCard label="Alk Phos"      value={liverFields.alk_phos}      unit="IU/L"  />
                                <MetricCard label="Copper"        value={liverFields.copper}        unit="µg/dL" />
                                <MetricCard label="Platelets"     value={liverFields.platelets}     unit="×10³"  />
                                <MetricCard label="Prothrombin"   value={liverFields.prothrombin}   unit="s"     />
                                <MetricCard label="Triglycerides" value={liverFields.tryglicerides} unit="mg/dL" />
                                <MetricCard label="Cholesterol"   value={liverFields.cholesterol}   unit="mg/dL" />
                                <MetricCard label="Ascites"       value={liverFields.ascites}  />
                                <MetricCard label="Hepatomegaly"  value={liverFields.hepatome} />
                                <MetricCard label="Spiders"       value={liverFields.spiders}  />
                                <MetricCard label="Edema"         value={liverFields.edema}    />
                            </div>
                        </div>

                        {liverFields.prediction !== undefined ? (
                            <div>
                                <SectionSub>AI Prediction Results</SectionSub>
                                <div className="mt-3 space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <ResultBadge label="Decision"     value={liverFields.decision}        highlight={liverFields.decision === 'POSITIVE' ? 'red' : 'green'} />
                                        <ResultBadge label="Risk Tier"    value={liverFields.risk_label} />
                                        <ResultBadge label="Risk Score"   value={liverFields.risk_percentage != null ? `${liverFields.risk_percentage.toFixed(1)}%` : 'N/A'} />
                                        <ResultBadge label="Model"        value={liverFields.model_used} />
                                    </div>
                                    {liverFields.clinical_flags?.length > 0 && (
                                        <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-1">
                                            <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">⚠️ Critical Value Alerts</p>
                                            {liverFields.clinical_flags.map((f, i) => <p key={i} className="text-sm text-red-700">{f}</p>)}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {liverFields.gauge_chart     && <ChartCard title="Risk Gauge"          src={`data:image/png;base64,${liverFields.gauge_chart}`}     />}
                                        {liverFields.shap_bar_chart  && <ChartCard title="Feature Importance"  src={`data:image/png;base64,${liverFields.shap_bar_chart}`}  wide />}
                                        {liverFields.shap_waterfall  && <ChartCard title="SHAP Waterfall"      src={`data:image/png;base64,${liverFields.shap_waterfall}`}  wide />}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <PendingPrediction isDoctor={isDoctor()} />
                        )}
                    </div>
                ) : <EmptyState icon="🫀" message="No liver data uploaded for this patient." />}
            </Section>

            {/* ════════════════════════════════════════════════════════════════
                SECTION 3 — CVD
            ════════════════════════════════════════════════════════════════ */}
            <Section
                title="❤️ Cardiovascular Disease Risk"
                subtitle={hasCvd ? `Latest: ${new Date(cvdRecord.createdAt).toLocaleString()} · RF + Gradient Boosting` : 'No CVD data uploaded'}
                accentColor="rose"
                doctorAction={isDoctor() && hasCvd ? { label: cvdLoading ? 'Running…' : 'Run CVD AI', onClick: handleCvdPredict, disabled: cvdLoading, color: 'rose' } : null}
            >
                {hasCvd ? (
                    <div className="p-6 space-y-8">
                        <div>
                            <SectionSub>Clinical Vitals</SectionSub>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
                                <MetricCard label="Age"            value={cvdFields.age}           unit="yrs"   />
                                <MetricCard label="Sex"            value={cvdFields.sex === '0' || cvdFields.sex === 0 ? 'Female' : 'Male'} />
                                <MetricCard label="Blood Pressure" value={cvdFields.bloodPressure} unit="mmHg"  />
                                <MetricCard label="Cholesterol"    value={cvdFields.cholesterol}   unit="mg/dL" />
                                <MetricCard label="Heart Rate"     value={cvdFields.heartRate}     unit="bpm"   />
                                <MetricCard label="Blood Sugar"    value={cvdFields.bloodSugar}  />
                                <MetricCard label="Chest Pain"     value={cvdFields.cp}          />
                                <MetricCard label="Resting ECG"    value={cvdFields.restecg}     />
                                <MetricCard label="Exang"          value={cvdFields.exang}       />
                                <MetricCard label="ST Depression"  value={cvdFields.oldpeak}     />
                                <MetricCard label="ST Slope"       value={cvdFields.slope}       />
                                <MetricCard label="Major Vessels"  value={cvdFields.ca}          />
                            </div>
                        </div>

                        {cvdFields.prediction !== undefined ? (
                            <div>
                                <SectionSub>AI Prediction Results</SectionSub>
                                <div className="mt-3 space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <ResultBadge label="Risk Level"   value={cvdFields.risk_label}      highlight={cvdFields.risk_label === 'High' ? 'red' : cvdFields.risk_label === 'Moderate' ? 'yellow' : 'green'} />
                                        <ResultBadge label="Risk Score"   value={cvdFields.risk_percentage != null ? `${cvdFields.risk_percentage.toFixed(1)}%` : 'N/A'} />
                                        <ResultBadge label="Probability"  value={cvdFields.risk_probability != null ? `${(cvdFields.risk_probability * 100).toFixed(1)}%` : 'N/A'} />
                                    </div>
                                    {cvdFields.top3_risk_factors && Object.keys(cvdFields.top3_risk_factors).length > 0 && (
                                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Top Risk Factors</p>
                                            <div className="space-y-2">
                                                {Object.entries(cvdFields.top3_risk_factors).map(([feat, info]) => (
                                                    <div key={feat} className="flex items-center justify-between text-sm">
                                                        <span className="font-medium text-slate-700">{feat}</span>
                                                        <span className="text-xs text-slate-500">{info.value} — <span className={info.direction?.includes('increases') ? 'text-red-500' : 'text-green-500'}>{info.direction}</span></span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {cvdFields.gauge_chart    && <ChartCard title="Risk Gauge"         src={`data:image/png;base64,${cvdFields.gauge_chart}`}    />}
                                        {cvdFields.shap_bar_chart && <ChartCard title="Feature Importance" src={`data:image/png;base64,${cvdFields.shap_bar_chart}`} />}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <PendingPrediction isDoctor={isDoctor()} />
                        )}
                    </div>
                ) : <EmptyState icon="❤️" message="No cardiovascular data uploaded for this patient." />}
            </Section>

            {/* ════════════════════════════════════════════════════════════════
                SECTION 4 — BASIC HEALTH
            ════════════════════════════════════════════════════════════════ */}
            <Section
                title="🩺 Basic Health Assessment"
                subtitle={hasBasic ? `Latest: ${new Date(basicRecord.createdAt).toLocaleString()} · Mixture-of-Experts (7 models)` : 'No basic health data uploaded'}
                accentColor="teal"
                doctorAction={isDoctor() && hasBasic ? { label: basicLoading ? 'Running…' : 'Run Basic Health AI', onClick: handleBasicPredict, disabled: basicLoading, color: 'teal' } : null}
            >
                {hasBasic ? (
                    <div className="p-6 space-y-8">

                        {(basicFields.WBC || basicFields.HGB) && (
                            <div>
                                <SectionSub>Complete Blood Count (CBC)</SectionSub>
                                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mt-3">
                                    <MetricCard label="WBC"  value={basicFields.WBC}  unit="×10³/µL" />
                                    <MetricCard label="HGB"  value={basicFields.HGB}  unit="g/dL"    />
                                    <MetricCard label="HCT"  value={basicFields.HCT}  unit="%"       />
                                    <MetricCard label="PLT"  value={basicFields.PLT}  unit="×10³/µL" />
                                    <MetricCard label="RBC"  value={basicFields.RBC}  />
                                    <MetricCard label="MCV"  value={basicFields.MCV}  unit="fL"      />
                                    <MetricCard label="MCH"  value={basicFields.MCH}  unit="pg"      />
                                    <MetricCard label="MCHC" value={basicFields.MCHC} unit="g/dL"    />
                                    <MetricCard label="RDW"  value={basicFields.RDW}  unit="%"       />
                                    <MetricCard label="MPV"  value={basicFields.MPV}  unit="fL"      />
                                </div>
                            </div>
                        )}

                        {(basicFields.bp || basicFields.sc) && (
                            <div>
                                <SectionSub>Kidney Panel</SectionSub>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
                                    <MetricCard label="Blood Pressure"    value={basicFields.bp}   unit="mmHg"  />
                                    <MetricCard label="Serum Creatinine"  value={basicFields.sc}   unit="mg/dL" />
                                    <MetricCard label="Hemoglobin"        value={basicFields.hemo} unit="g/dL"  />
                                    <MetricCard label="Blood Urea"        value={basicFields.bu}   unit="mg/dL" />
                                    <MetricCard label="Blood Glucose Rnd" value={basicFields.bgr}  unit="mg/dL" />
                                    <MetricCard label="Sodium"            value={basicFields.sod}  unit="mEq/L" />
                                </div>
                            </div>
                        )}

                        {(basicFields.ph || basicFields.glucose_urine) && (
                            <div>
                                <SectionSub>Urinalysis</SectionSub>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
                                    <MetricCard label="pH"               value={basicFields.ph}               />
                                    <MetricCard label="Specific Gravity" value={basicFields.specific_gravity} />
                                    <MetricCard label="Glucose"          value={basicFields.glucose_urine}    />
                                    <MetricCard label="Protein"          value={basicFields.protein_urine}    />
                                    <MetricCard label="Blood"            value={basicFields.blood_urine}      />
                                    <MetricCard label="Leukocytes"       value={basicFields.leukocytes}       />
                                    <MetricCard label="Nitrite"          value={basicFields.nitrite}          />
                                    <MetricCard label="Urobilinogen"     value={basicFields.urobilinogen}     />
                                </div>
                            </div>
                        )}

                        {basicFields.health_score !== undefined ? (
                            <div>
                                <SectionSub>AI Prediction Results</SectionSub>
                                <div className="mt-3 space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <ResultBadge label="Health Score" value={`${basicFields.health_score?.toFixed(1) ?? 'N/A'} / 100`} highlight={basicFields.health_score >= 67 ? 'green' : basicFields.health_score >= 34 ? 'yellow' : 'red'} />
                                        <ResultBadge label="Risk Tier"    value={basicFields.risk_tier} />
                                        <ResultBadge label="ECG Result"   value={basicFields.ecg_result?.prediction || '—'} />
                                    </div>
                                    {basicFields.clinical_flags?.length > 0 && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-1">
                                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">⚠️ Clinical Alerts</p>
                                            {basicFields.clinical_flags.map((f, i) => <p key={i} className="text-sm text-amber-700">{f}</p>)}
                                        </div>
                                    )}
                                    {basicFields.expert_results && Object.keys(basicFields.expert_results).length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Expert Panel Results</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {Object.entries(basicFields.expert_results).map(([name, res]) => (
                                                    <div key={name} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{name}</p>
                                                        <p className="text-sm font-semibold text-slate-800 mt-1">{res.ensemble_prediction || res.tree_prediction || '—'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {basicFields.gauge_chart     && <ChartCard title="Health Score Gauge" src={`data:image/png;base64,${basicFields.gauge_chart}`}     />}
                                        {basicFields.breakdown_chart && <ChartCard title="Expert Breakdown"   src={`data:image/png;base64,${basicFields.breakdown_chart}`} wide />}
                                        {basicFields.radar_chart     && <ChartCard title="Per-Expert Radar"   src={`data:image/png;base64,${basicFields.radar_chart}`}     />}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <PendingPrediction isDoctor={isDoctor()} />
                        )}
                    </div>
                ) : <EmptyState icon="🩺" message="No basic health data uploaded for this patient yet." />}
            </Section>

            {/* ── AI Consultant ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mt-8">
                <HealthConsultant patient={patient} />
            </div>
            <Consultationchat patientId={patient._id}/>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT = {
    purple: { header: 'border-purple-200 bg-purple-50/40', btn: 'bg-purple-600 hover:bg-purple-700' },
    blue:   { header: 'border-blue-200   bg-blue-50/40',   btn: 'bg-blue-600   hover:bg-blue-700'   },
    rose:   { header: 'border-rose-200   bg-rose-50/40',   btn: 'bg-rose-600   hover:bg-rose-700'   },
    teal:   { header: 'border-teal-200   bg-teal-50/40',   btn: 'bg-teal-600   hover:bg-teal-700'   },
};

function Section({ title, subtitle, accentColor = 'blue', doctorAction, children }) {
    const ac = ACCENT[accentColor] || ACCENT.blue;
    return (
        <div className="max-w-7xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className={`p-6 border-b ${ac.header} flex flex-wrap items-center justify-between gap-3`}>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                </div>
                {doctorAction && (
                    <button
                        onClick={doctorAction.onClick}
                        disabled={doctorAction.disabled}
                        className={`px-5 py-2.5 ${ac.btn} disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 shadow-sm`}
                    >
                        {doctorAction.label}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

const SectionSub = ({ children }) => (
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{children}</p>
);

// ─────────────────────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, unit = '' }) => (
    <div className="p-4 rounded-xl border border-slate-100 bg-white">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-end gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-800">{value ?? 'N/A'}</span>
            {unit && <span className="text-sm text-slate-400 mb-1">{unit}</span>}
        </div>
    </div>
);

const ResultBadge = ({ label, value, highlight }) => {
    const colorMap = {
        red:    'bg-red-50    border-red-200    text-red-700',
        green:  'bg-green-50  border-green-200  text-green-700',
        yellow: 'bg-amber-50  border-amber-200  text-amber-700',
    };
    return (
        <div className={`p-4 rounded-xl border ${colorMap[highlight] || 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-xl font-bold mt-1">{value ?? 'N/A'}</p>
        </div>
    );
};

const ChartCard = ({ title, src, wide }) => (
    <div className={`rounded-xl border border-slate-100 bg-white p-3 ${wide ? 'md:col-span-2' : ''}`}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</p>
        <img src={src} alt={title} className="w-full rounded-lg" />
    </div>
);

const PredBadge = ({ label, value }) => (
    <div className="bg-slate-50 rounded-lg p-2.5">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value || 'N/A'}</p>
    </div>
);

const MiniResult = ({ label, value, pct }) => {
    const color = value === 'High' || value === 'Malignant' ? 'text-red-600' :
                  value === 'Moderate' ? 'text-amber-600' : 'text-green-600';
    return (
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-sm font-bold mt-0.5 ${color}`}>{value}</p>
            {pct != null && <p className="text-[10px] text-slate-400">{typeof pct === 'number' ? `${pct.toFixed(0)}%` : pct}</p>}
        </div>
    );
};

const EmptyState = ({ icon, message }) => (
    <div className="py-16 flex flex-col items-center text-center text-slate-400 px-8">
        <span className="text-5xl mb-4">{icon}</span>
        <p className="text-sm max-w-xs">{message}</p>
    </div>
);

const PendingPrediction = ({ isDoctor: doctor }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-slate-400 text-sm">
        {doctor ? 'Click the "Run AI" button above to generate the prediction.' : 'Awaiting doctor to run the AI prediction.'}
    </div>
);

const DataBadge = ({ label, active, detail }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-slate-200'}`} />
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <span className="text-xs text-slate-400 text-right max-w-[150px]">{detail}</span>
    </div>
);
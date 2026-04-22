import React, { useState, useContext } from 'react';
import PatientContext from '../../context/info/PatientContext';

function Labpatients({ patient }) {
  const p = patient?.patient_id || {};
  const patientRecords = patient?.patientData || [];

  const { upload_patient_data } = useContext(PatientContext);

  const [isLiverOpen, setIsLiverOpen] = useState(false);
  const [isSkinOpen,  setIsSkinOpen]  = useState(false);
  const [isCvdOpen,   setIsCvdOpen]   = useState(false);
  const [isBasicOpen, setIsBasicOpen] = useState(false);

  // ── What has been uploaded already ────────────────────────────────────────
  const hasLiver = patientRecords.some(r => r.liverData?.bilirubin);
  const hasSkin  = patientRecords.some(r => r.skinData?.images?.length > 0);
  const hasCvd   = patientRecords.some(r => r.cvdData?.bloodPressure);
  const hasBasic = patientRecords.some(r => r.basicHealthData?.WBC);

  const diseaseLabel = () => {
    const labels = [];
    if (hasLiver) labels.push('Liver');
    if (hasSkin)  labels.push('Skin');
    if (hasCvd)   labels.push('CVD');
    if (hasBasic) labels.push('Basic');
    return labels.length > 0 ? labels.join(', ') : 'General';
  };

  // ── LIVER ────────────────────────────────────────────────────────────────
  const [liverData, setLiverData] = useState({
    patient: p._id,
    liverData: {
      ascites: '', hepatome: '', spiders: '', edema: '',
      ALT: '', bilirubin: '', cholesterol: '', albumin: '', copper: '',
      alk_phos: '', SGOT: '', tryglicerides: '', platelets: '', prothrombin: ''
    }
  });

  const liverLabels = {
    ascites: 'Ascites (Y / N)',           hepatome: 'Hepatomegaly (Y / N)',
    spiders: 'Spider Angiomata (Y / N)',  edema: 'Edema (N / S / Y)',
    ALT: 'ALT (U/L)',                     bilirubin: 'Bilirubin (mg/dL)',
    cholesterol: 'Cholesterol (mg/dL)',   albumin: 'Albumin (g/dL)',
    copper: 'Copper (µg/day)',            alk_phos: 'Alk Phos (IU/L)',
    SGOT: 'SGOT / AST (U/L)',            tryglicerides: 'Triglycerides (mg/dL)',
    platelets: 'Platelets (×10³/µL)',    prothrombin: 'Prothrombin Time (sec)',
  };

  const handleLiverChange = (e) =>
    setLiverData(prev => ({ ...prev, liverData: { ...prev.liverData, [e.target.name]: e.target.value } }));

  const submitLiver = (e) => { e.preventDefault(); upload_patient_data(liverData); setIsLiverOpen(false); };

  // ── SKIN ─────────────────────────────────────────────────────────────────
  const [skinState, setSkinState] = useState({ patient: p._id, skinFiles: [] });

  const handleSkinUpload = (e) =>
    setSkinState({ patient: p._id, skinFiles: Array.from(e.target.files) });

  const submitSkin = (e) => {
    e.preventDefault();
    if (!skinState.skinFiles?.length) { alert('Please select at least one image.'); return; }
    upload_patient_data(skinState);
    setIsSkinOpen(false);
  };

  // ── CVD ──────────────────────────────────────────────────────────────────
  // Full UCI Heart Disease feature set — matches patientdata.js cvdData exactly
  const [cvdData, setCvdData] = useState({
    patient: p._id,
    cvdData: {
      age: '', sex: '', cp: '', bloodPressure: '', cholesterol: '',
      bloodSugar: '', restecg: '', heartRate: '', exang: '',
      oldpeak: '', slope: '', ca: ''
    }
  });

  const cvdLabels = {
    age: 'Age (years)',                         sex: 'Sex (0 = Female, 1 = Male)',
    cp: 'Chest Pain Type (0 – 3)',              bloodPressure: 'Resting Blood Pressure (mmHg)',
    cholesterol: 'Serum Cholesterol (mg/dL)',   bloodSugar: 'Fasting Blood Sugar > 120 mg/dL (0/1)',
    restecg: 'Resting ECG Result (0 / 1 / 2)', heartRate: 'Max Heart Rate Achieved (bpm)',
    exang: 'Exercise-Induced Angina (0 / 1)',   oldpeak: 'ST Depression (oldpeak)',
    slope: 'ST Slope (0 / 1 / 2)',              ca: 'Major Vessels by Fluoroscopy (0 – 4)',
  };

  const handleCvdChange = (e) =>
    setCvdData(prev => ({ ...prev, cvdData: { ...prev.cvdData, [e.target.name]: e.target.value } }));

  const submitCvd = (e) => { e.preventDefault(); upload_patient_data(cvdData); setIsCvdOpen(false); };

  // ── BASIC HEALTH ─────────────────────────────────────────────────────────
  // Mirrors basicHealthData fields in patientdata.js exactly
  const [basicData, setBasicData] = useState({
    patient: p._id,
    basicHealthData: {
      // CBC
      WBC: '', HGB: '', HCT: '', PLT: '', RBC: '',
      MCV: '', MCH: '', MCHC: '', RDW: '', MPV: '',
      // Kidney panel
      bp: '', sc: '', hemo: '', bu: '', bgr: '', sod: '',
      // Liver ILPD panel (basic — separate from cirrhosis model)
      total_bilirubin: '', albumin_basic: '', alk_phosphotase: '', total_proteins: '',
      // Urinalysis
      ph: '', specific_gravity: '', glucose_urine: '', protein_urine: '',
      blood_urine: '', leukocytes: '', nitrite: '', urobilinogen: '',
    }
  });

  const basicLabels = {
    // CBC
    WBC: 'WBC (×10³/µL)',            HGB: 'Hemoglobin (g/dL)',
    HCT: 'Hematocrit (%)',           PLT: 'Platelets (×10³/µL)',
    RBC: 'RBC Count',                MCV: 'MCV (fL)',
    MCH: 'MCH (pg)',                 MCHC: 'MCHC (g/dL)',
    RDW: 'RDW (%)',                  MPV: 'MPV (fL)',
    // Kidney
    bp: 'Blood Pressure',            sc: 'Serum Creatinine (mg/dL)',
    hemo: 'Hemoglobin — Kidney',     bu: 'Blood Urea (mg/dL)',
    bgr: 'Blood Glucose Random',     sod: 'Sodium (mEq/L)',
    // Liver ILPD
    total_bilirubin: 'Total Bilirubin',   albumin_basic: 'Albumin — ILPD Panel',
    alk_phosphotase: 'Alkaline Phosphotase', total_proteins: 'Total Proteins',
    // Urinalysis
    ph: 'pH',                               specific_gravity: 'Specific Gravity',
    glucose_urine: 'Glucose (Urine)',       protein_urine: 'Protein (Urine)',
    blood_urine: 'Blood (Urine)',           leukocytes: 'Leukocytes',
    nitrite: 'Nitrite',                     urobilinogen: 'Urobilinogen',
  };

  const handleBasicChange = (e) =>
    setBasicData(prev => ({
      ...prev,
      basicHealthData: { ...prev.basicHealthData, [e.target.name]: e.target.value }
    }));

  const submitBasic = (e) => { e.preventDefault(); upload_patient_data(basicData); setIsBasicOpen(false); };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="font-bold">{p.name}</div>
          <div className="text-xs text-gray-400">{p.email}</div>
        </td>

        <td className="px-6 py-4">{p.Number}</td>

        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1">
            {hasLiver && <Tag label="Liver"  color="blue"   />}
            {hasSkin  && <Tag label="Skin"   color="purple" />}
            {hasCvd   && <Tag label="CVD"    color="rose"   />}
            {hasBasic && <Tag label="Basic"  color="teal"   />}
            {!hasLiver && !hasSkin && !hasCvd && !hasBasic && (
              <span className="text-xs text-gray-400">None yet</span>
            )}
          </div>
        </td>

        <td className="px-6 py-4 text-right">
          <div className="flex gap-2 justify-end flex-wrap">
            <ActionBtn label="Liver"  color="blue"   onClick={() => setIsLiverOpen(true)} />
            <ActionBtn label="Skin"   color="purple" onClick={() => setIsSkinOpen(true)}  />
            <ActionBtn label="CVD"    color="rose"   onClick={() => setIsCvdOpen(true)}   />
            <ActionBtn label="Basic"  color="teal"   onClick={() => setIsBasicOpen(true)} />
          </div>
        </td>
      </tr>

      {/* ── LIVER MODAL ─────────────────────────────────────────────────── */}
      {isLiverOpen && (
        <Modal title="🫀 Liver Cirrhosis Data" onClose={() => setIsLiverOpen(false)} onSubmit={submitLiver}>
          {Object.keys(liverData.liverData).map(field => (
            <Field key={field} name={field} label={liverLabels[field] || field} onChange={handleLiverChange} />
          ))}
        </Modal>
      )}

      {/* ── SKIN MODAL ──────────────────────────────────────────────────── */}
      {isSkinOpen && (
        <Modal title="🔬 Skin Lesion Images" onClose={() => setIsSkinOpen(false)} onSubmit={submitSkin}>
          <div className="col-span-2 space-y-2">
            <p className="text-sm text-gray-500">Upload dermoscopic images (JPG / PNG). Multiple files allowed.</p>
            <input
              type="file" multiple accept="image/*"
              onChange={handleSkinUpload}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
            {skinState.skinFiles.length > 0 && (
              <p className="text-xs text-green-600 font-semibold">
                ✓ {skinState.skinFiles.length} image(s) selected
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ── CVD MODAL ───────────────────────────────────────────────────── */}
      {isCvdOpen && (
        <Modal title="❤️ Cardiovascular Disease Data" onClose={() => setIsCvdOpen(false)} onSubmit={submitCvd}>
          {Object.keys(cvdData.cvdData).map(field => (
            <Field key={field} name={field} label={cvdLabels[field] || field} onChange={handleCvdChange} />
          ))}
        </Modal>
      )}

      {/* ── BASIC HEALTH MODAL ──────────────────────────────────────────── */}
      {isBasicOpen && (
        <Modal
          title="🩺 Basic Health Assessment"
          onClose={() => setIsBasicOpen(false)}
          onSubmit={submitBasic}
          wide
        >
          {/* CBC */}
          <ModalGroup label="Complete Blood Count (CBC)" />
          {['WBC','HGB','HCT','PLT','RBC','MCV','MCH','MCHC','RDW','MPV'].map(f => (
            <Field key={f} name={f} label={basicLabels[f]} onChange={handleBasicChange} />
          ))}

          {/* Kidney */}
          <ModalGroup label="Kidney Panel" />
          {['bp','sc','hemo','bu','bgr','sod'].map(f => (
            <Field key={f} name={f} label={basicLabels[f]} onChange={handleBasicChange} />
          ))}

          {/* Liver ILPD */}
          <ModalGroup label="Liver Basic Panel (ILPD)" />
          {['total_bilirubin','albumin_basic','alk_phosphotase','total_proteins'].map(f => (
            <Field key={f} name={f} label={basicLabels[f]} onChange={handleBasicChange} />
          ))}

          {/* Urinalysis */}
          <ModalGroup label="Urinalysis" />
          {['ph','specific_gravity','glucose_urine','protein_urine','blood_urine','leukocytes','nitrite','urobilinogen'].map(f => (
            <Field key={f} name={f} label={basicLabels[f]} onChange={handleBasicChange} />
          ))}
        </Modal>
      )}
    </>
  );
}

// ─── Shared small components ─────────────────────────────────────────────────

const TAG_COLORS = {
  blue:   'bg-blue-100   text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  rose:   'bg-rose-100   text-rose-700',
  teal:   'bg-teal-100   text-teal-700',
};

const BTN_COLORS = {
  blue:   'bg-blue-600   hover:bg-blue-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  rose:   'bg-rose-600   hover:bg-rose-700',
  teal:   'bg-teal-600   hover:bg-teal-700',
};

const Tag = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TAG_COLORS[color] || TAG_COLORS.blue}`}>
    {label}
  </span>
);

const ActionBtn = ({ label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 ${BTN_COLORS[color] || BTN_COLORS.blue}`}
  >
    {label}
  </button>
);

const Field = ({ name, label, onChange }) => (
  <input
    name={name}
    placeholder={label}
    onChange={onChange}
    className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
  />
);

const ModalGroup = ({ label }) => (
  <div className="col-span-2 pt-2">
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1">
      {label}
    </p>
  </div>
);

const Modal = ({ title, children, onClose, onSubmit, wide = false }) => (
  <tr>
    <td colSpan={4} className="p-0">
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className={`bg-white p-8 rounded-3xl w-full overflow-y-auto max-h-[90vh] ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
          <h2 className="text-xl font-bold mb-6">{title}</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
            {children}
            <div className="col-span-2 flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </td>
  </tr>
);

export default Labpatients;
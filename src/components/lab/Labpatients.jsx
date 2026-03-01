import React, { useState, useContext } from 'react';
import PatientContext from '../../context/info/PatientContext';


function Labpatients({ patient }) {
  // patient_lab document: { patient_id: {...}, patientData: [...] }
  const p = patient?.patient_id || {};

  // patientData is the array of patientdata documents for this patient
  // (populated in the backend GET /lab_assistant/patients route)
  const patientRecords = patient?.patientData || [];

  const { upload_patient_data } = useContext(PatientContext);

  const [isLiverOpen, setIsLiverOpen] = useState(false);
  const [isSkinOpen,  setIsSkinOpen]  = useState(false);
  const [isCvdOpen,   setIsCvdOpen]   = useState(false);

  // ── Determine what has been uploaded already ───────────────────────────────
  // Used for the Disease column. Reads from actual uploaded records, not from
  // embedded patient fields (which no longer exist on patient.js).
  const hasLiver = patientRecords.some(r => r.liverData?.ascites);
  const hasSkin  = patientRecords.some(r => r.skinData?.images?.length > 0);
  const hasCvd   = patientRecords.some(r => r.cvdData?.age);

  const diseaseLabel = () => {
    const labels = [];
    if (hasLiver) labels.push('Liver');
    if (hasSkin)  labels.push('Skin');
    if (hasCvd)   labels.push('CVD');
    return labels.length > 0 ? labels.join(', ') : 'General';
  };

  // ── LIVER ──────────────────────────────────────────────────────────────────
  const [liverData, setLiverData] = useState({
    patient: p._id,
    liverData: {
      ascites: '', hepatome: '', spiders: '', edema: '',
      bilirubin: '', cholesterol: '', albumin: '', copper: '',
      alk_phos: '', SGOT: '', tryglicerides: '', platelets: '', prothrombin: ''
    }
  });

  const handleLiverChange = (e) => {
    setLiverData(prev => ({
      ...prev,
      liverData: { ...prev.liverData, [e.target.name]: e.target.value }
    }));
  };

  const submitLiver = (e) => {
    e.preventDefault();
    upload_patient_data(liverData);
    setIsLiverOpen(false);
  };

  // ── SKIN ───────────────────────────────────────────────────────────────────
  // Fix 1: initialise with skinFiles key (not skinData) so DataFetch always
  // finds formate.skinFiles regardless of whether the user has chosen files yet.
  const [skinState, setSkinState] = useState({
    patient: p._id,
    skinFiles: []       // ← consistent key used by DataFetch.upload_patient_data
  });

  const handleSkinUpload = (e) => {
    const files = Array.from(e.target.files);
    setSkinState({
      patient: p._id,
      skinFiles: files
    });
  };

  const submitSkin = (e) => {
    e.preventDefault();
    // Fix 3: guard — don't submit if no files chosen
    if (!skinState.skinFiles || skinState.skinFiles.length === 0) {
      alert('Please select at least one image before submitting.');
      return;
    }
    upload_patient_data(skinState);
    setIsSkinOpen(false);
  };

  // ── CVD ────────────────────────────────────────────────────────────────────
  const [cvdData, setCvdData] = useState({
    patient: p._id,
    cvdData: {
      age: '', bloodPressure: '', cholesterol: '', heartRate: '', bloodSugar: ''
    }
  });

  const handleCvdChange = (e) => {
    setCvdData(prev => ({
      ...prev,
      cvdData: { ...prev.cvdData, [e.target.name]: e.target.value }
    }));
  };

  const submitCvd = (e) => {
    e.preventDefault();
    upload_patient_data(cvdData);
    setIsCvdOpen(false);
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="font-bold">{p.name}</div>
          <div className="text-xs text-gray-400">{p.email}</div>
        </td>

        <td className="px-6 py-4">{p.Number}</td>

        {/* Fix 2: reads from uploaded patientdata records, not deleted patient fields */}
        <td className="px-6 py-4">{diseaseLabel()}</td>

        <td className="px-6 py-4 text-right flex gap-2 justify-end">
          <button onClick={() => setIsLiverOpen(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs">
            Liver
          </button>
          <button onClick={() => setIsSkinOpen(true)}
            className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs">
            Skin
          </button>
          <button onClick={() => setIsCvdOpen(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-xl text-xs">
            CVD
          </button>
        </td>
      </tr>

      {/* LIVER MODAL */}
      {isLiverOpen && (
        <Modal title="Liver Data" onClose={() => setIsLiverOpen(false)} onSubmit={submitLiver}>
          {Object.keys(liverData.liverData).map(field => (
            <input
              key={field}
              name={field}
              placeholder={field}
              onChange={handleLiverChange}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full"
              required
            />
          ))}
        </Modal>
      )}

      {/* SKIN MODAL */}
      {isSkinOpen && (
        <Modal title="Skin Images Upload" onClose={() => setIsSkinOpen(false)} onSubmit={submitSkin}>
          <div className="col-span-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleSkinUpload}
              className="w-full"
              required
            />
            {skinState.skinFiles.length > 0 && (
              <p className="text-xs text-green-600 mt-2">
                {skinState.skinFiles.length} image(s) selected
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* CVD MODAL */}
      {isCvdOpen && (
        <Modal title="CVD Data" onClose={() => setIsCvdOpen(false)} onSubmit={submitCvd}>
          {Object.keys(cvdData.cvdData).map(field => (
            <input
              key={field}
              name={field}
              placeholder={field}
              onChange={handleCvdChange}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full"
              required
            />
          ))}
        </Modal>
      )}
    </>
  );
}

const Modal = ({ title, children, onClose, onSubmit }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-3xl w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
        {children}
        <div className="col-span-2 flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-xl">
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl">
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default Labpatients;
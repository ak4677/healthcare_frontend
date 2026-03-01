import React, { useContext, useEffect, useState } from 'react';
import PatientContext from '../../context/info/PatientContext';
import { useNavigate } from 'react-router-dom';
import { X, UserRoundCog, User, ClipboardPlus } from 'lucide-react';

function AddAssignment(props) {
    const navigate = useNavigate();
    const [newass, setNewass] = useState({ Doctor: "", Patient: "" });
    const fetchingdata = useContext(PatientContext);
    const { createassignment, getdoctors, getpatients, Doctors, Patients } = fetchingdata;

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/Login');
        } else {
            getdoctors();
            getpatients();
        }
    }, []);

    const add = (e) => {
        e.preventDefault();
        if (newass.Doctor && newass.Patient) {
            createassignment(newass.Doctor, newass.Patient);
            setNewass({ Doctor: "", Patient: "" });
            props.onClose();
        } else {
            alert("Please select both a doctor and a patient.");
        }
    };

    const onChange = (e) => setNewass({ ...newass, [e.target.name]: e.target.value });

    if (!props.visible) return null;

    return (
        <div id='edit' className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4" onClick={(e) => e.target.id === "edit" && props.onClose()}>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-[#0284C7] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ClipboardPlus className="w-6 h-6" />
                        <h3 className="text-xl font-bold">New Assignment</h3>
                    </div>
                    <button onClick={props.onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                            <UserRoundCog className="w-4 h-4" /> Assigned Doctor
                        </label>
                        <select
                            name="Doctor"
                            value={newass.Doctor}
                            onChange={onChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#0284C7] focus:border-[#0284C7] block p-3 transition-all"
                            required
                        >
                            <option value="">Select a Doctor</option>
                            {Doctors.map((doc) => (
                                <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                            <User className="w-4 h-4" /> Select Patient
                        </label>
                        <select
                            name="Patient"
                            value={newass.Patient}
                            onChange={onChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#0284C7] focus:border-[#0284C7] block p-3 transition-all"
                            required
                        >
                            <option value="">Select a Patient</option>
                            {Patients.map((pati) => (
                                <option key={pati._id} value={pati._id}>{pati.name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        onClick={add}
                        className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-100 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Create Assignment
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddAssignment;
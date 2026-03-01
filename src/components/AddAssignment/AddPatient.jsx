import React, { useContext, useEffect, useState } from 'react';
import PatientContext from '../../context/info/PatientContext';
import { useNavigate } from 'react-router-dom';
import { X, Users, Mail, Phone, Calendar, Hash } from 'lucide-react';

function AddPatient(props) {
    const navigate = useNavigate();
    const [newPatient, setNewPatient] = useState({ name: "", email: "", number: "", age: "", sex: "" });
    const { createPatient } = useContext(PatientContext);

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/Login');
    }, []);

    const add = (e) => {
        e.preventDefault();
        if (newPatient.email && newPatient.number && newPatient.name && newPatient.age && newPatient.sex) {
            createPatient(newPatient.name, newPatient.email, newPatient.number, newPatient.age, newPatient.sex);
            setNewPatient({ name: "", email: "", number: "", age: "", sex: "" });
            props.onClose();
        } else {
            alert("Please complete all patient information fields.");
        }
    };

    const onChange = (e) => setNewPatient({ ...newPatient, [e.target.name]: e.target.value });

    if (!props.visible) return null;

    return (
        <div id='edit' className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4" onClick={(e) => e.target.id === "edit" && props.onClose()}>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Users /> New Patient Entry</h3>
                    <button onClick={props.onClose} className="hover:bg-emerald-500 p-1 rounded-full"><X /></button>
                </div>

                <form className="p-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <input type="text" name="name" value={newPatient.name} onChange={onChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Patient Full Name" required />
                        </div>
                        <div className="md:col-span-2">
                            <input type="email" name="email" value={newPatient.email} onChange={onChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Email Address" required />
                        </div>
                        <input type="tel" name="number" value={newPatient.number} onChange={onChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Phone Number" required />
                        <div className="flex gap-2">
                             <input type="number" name="age" value={newPatient.age} onChange={onChange} className="w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Age" required />
                             <select name="sex" value={newPatient.sex} onChange={onChange} className="w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required>
                                <option value="">Sex</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                             </select>
                        </div>
                    </div>

                    <button type="submit" onClick={add} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-100 mt-4">
                        Register Patient
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddPatient;
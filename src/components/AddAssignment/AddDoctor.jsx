import React, { useContext, useEffect, useState } from 'react';
import PatientContext from '../../context/info/PatientContext';
import { useNavigate } from 'react-router-dom';
import { X, UserRound, Mail, Phone, Plus } from 'lucide-react';

function AddDoctor(props) {
  const navigate = useNavigate();
  const [newDoc, setNewDoc] = useState({ name: "", email: "", number: "" });
  const creatingdoctor = useContext(PatientContext);
  const { createdoctor } = creatingdoctor;

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/Login');
  }, []);

  const add = (e) => {
    e.preventDefault();
    if (newDoc.email && newDoc.number && newDoc.name) {
      createdoctor(newDoc.name, newDoc.email, newDoc.number);
      setNewDoc({ name: "", email: "", number: "" });
      props.onClose();
    } else {
      alert("Please fill in all doctor details");
    }
  };

  const onChange = (e) => setNewDoc({ ...newDoc, [e.target.name]: e.target.value });

  if (!props.visible) return null;

  return (
    <div id='edit' className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4" onClick={(e) => e.target.id === "edit" && props.onClose()}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserRound className="text-[#0284C7]" /> Add New Doctor
            </h3>
            <button onClick={props.onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <form className="p-8 space-y-5">
          <div className="relative">
            <UserRound className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input type="text" name="name" value={newDoc.name} onChange={onChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Full Name" required />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input type="email" name="email" value={newDoc.email} onChange={onChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Email Address" required />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input type="tel" pattern="[0-9]{10}" name="number" value={newDoc.number} onChange={onChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Mobile Number" required />
          </div>

          <button type="submit" onClick={add} className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-100">
            Register Doctor
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddDoctor;
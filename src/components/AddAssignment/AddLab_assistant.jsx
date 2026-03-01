import React, { useContext, useEffect, useState } from 'react';
import PatientContext from '../../context/info/PatientContext';
import { useNavigate } from 'react-router-dom';
import { X, User, Mail, Phone, FlaskConical, Building2 } from 'lucide-react';

function AddLab_assistant(props) {
    const creatinglab_assitant = useContext(PatientContext);
    const { createlab_assistant } = creatinglab_assitant;
    const navigate = useNavigate();
    
    const [newassistant, setNewassistant] = useState({ 
        name: "", 
        email: "", 
        number: "", 
        lab_name: "" 
    });

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/Login');
        }
    }, [navigate]);

    const add = (e) => {
        e.preventDefault();
        if (newassistant.email && newassistant.number && newassistant.name && newassistant.lab_name) {
            createlab_assistant(
                newassistant.name, 
                newassistant.email, 
                newassistant.number, 
                newassistant.lab_name
            );
            setNewassistant({ name: "", email: "", number: "", lab_name: "" });
            props.onClose();
        } else {
            alert("Please fill in all lab assistant details");
        }
    };

    const onChange = (e) => {
        setNewassistant({ ...newassistant, [e.target.name]: e.target.value });
    };

    const handleClickOutside = (e) => {
        if (e.target.id === "edit") {
            props.onClose();
        }
    };

    if (!props.visible) return null;

    return (
        <div 
            id='edit' 
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 transition-all" 
            onClick={handleClickOutside}
        >
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="w-6 h-6" />
                        <h3 className="text-xl font-bold">New Lab Assistant</h3>
                    </div>
                    <button 
                        onClick={props.onClose} 
                        className="hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form className="p-8 space-y-5">
                    <div className="relative group">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input 
                            type="text" 
                            name="name" 
                            value={newassistant.name} 
                            onChange={onChange} 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
                            placeholder="Full Name" 
                            required 
                        />
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input 
                            type="email" 
                            name="email" 
                            value={newassistant.email} 
                            onChange={onChange} 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
                            placeholder="Email Address" 
                            required 
                        />
                    </div>

                    <div className="relative group">
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input 
                            type="tel" 
                            pattern="[0-9]{10}" 
                            name="number" 
                            value={newassistant.number} 
                            onChange={onChange} 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
                            placeholder="10-Digit Mobile Number" 
                            required 
                        />
                    </div>

                    <div className="relative group">
                        <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input 
                            type="text" 
                            name="lab_name" 
                            value={newassistant.lab_name} 
                            onChange={onChange} 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
                            placeholder="Laboratory Name" 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        onClick={add} 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-100 hover:shadow-purple-200 transform hover:-translate-y-0.5 mt-2"
                    >
                        Register Assistant
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddLab_assistant;
import React, { useContext, useEffect } from 'react';
import PatientContext from '../context/info/PatientContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';

export default function Info() {
  const navigate = useNavigate();
  const getinfo = useContext(PatientContext);
  const { logininfo, info } = getinfo;
  
  const userRole = localStorage.getItem('role') || 'User';

  useEffect(() => {
    if (localStorage.getItem('token')) {
      info();
    } else {
      navigate("/Login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-gray-50/50 p-4">
      <div className="bg-white shadow-xl shadow-blue-100/50 rounded-3xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-br from-[#0284C7] to-[#0369a1] p-8 text-center relative">
          <div className="absolute top-4 right-4">
             <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-white/30">
                Verified System
             </span>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-12 h-12 text-[#0284C7]" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 border-4 border-white w-6 h-6 rounded-full shadow-sm"></div>
            </div>
          </div>
          
          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">
            {logininfo.name || "Loading..."}
          </h2>
          <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 bg-black/10 rounded-full text-blue-100 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            {userRole}
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="text-gray-700 font-medium">{logininfo.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Number</p>
                <p className="text-gray-700 font-medium">{logininfo.Number || "Not Provided"}</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Subtle Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
           <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
             Smart Health Management System
           </p>
        </div>
      </div>
    </div>
  );
}
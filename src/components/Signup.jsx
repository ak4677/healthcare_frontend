import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import PatientContext from '../context/info/PatientContext';

export default function Signup() {
    const navigator = useNavigate()
    const fetching = useContext(PatientContext)
    const { info } = fetching;
    const currentRole = localStorage.getItem('role') || 'User';
    const displayRole = currentRole.charAt(0).toUpperCase() + currentRole.slice(1).replace('_', ' ');
    const [credential, setCredential] = useState({ email: "", password:  "", confirm_password: "" })
    const submit = async (e) => {
        e.preventDefault();
        try {
            if (credential.password === credential.confirm_password) {
                // console.log(localStorage.getItem('role'))
                const role=(localStorage.getItem('role') || '').toLowerCase();
                const response = await fetch(`http://localhost:5000/api/auth/${role}/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: credential.email, passward: credential.password }),
                });
                const data = await response.json();
                alert(data.message);

                navigator('/Login')
            }else{
                alert("confirm password not match with actual password")
            }

        } catch (error) {
            alert("wrong credential")
        }

    }

    const onChange = (e) => {
        setCredential({ ...credential, [e.target.name]: e.target.value })
    }
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative">
            
            {/* Background Decorative Blurs (Same as Login for consistency) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-3xl opacity-50"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-3xl opacity-50"></div>
            </div>

            {/* Main Card */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 m-4">
                
                {/* Header Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        {/* Plus/User Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Create {displayRole} Account</h2>
                    <p className="text-sm text-slate-500 mt-1">Join the Smart Health platform</p>
                </div>

                <form className="space-y-5" onSubmit={submit}>
                    
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Your Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all" 
                                placeholder="name@company.com" 
                                required 
                                value={credential.email} 
                                onChange={onChange} 
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input 
                                type="password" 
                                name="password" 
                                id="password" 
                                placeholder="••••••••" 
                                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all" 
                                required 
                                value={credential.password} 
                                onChange={onChange} 
                            />
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirm_password" className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {/* Checkmark Lock Icon for confirmation */}
                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M2.166 10.3c.622-2.619 2.15-4.793 4.228-6.19a.75.75 0 01.996.14l1.378 1.575a.75.75 0 01-.064 1.054 5.975 5.975 0 00-2.38 3.513.75.75 0 01-1.46-.292zM6.75 12a.75.75 0 01.75-.75h9a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75V12z" clipRule="evenodd" />
                                    <path d="M12.5 12h-5v-1.75a2.5 2.5 0 015 0V12z" />
                                </svg>
                            </div>
                            <input 
                                type="password" 
                                name="confirm_password" 
                                id="confirm_password" 
                                placeholder="••••••••" 
                                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all" 
                                required 
                                value={credential.confirm_password} 
                                onChange={onChange} 
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-3.5 text-center shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 mt-2"
                    >
                        Sign Up
                    </button>

                    {/* Back / Login Link */}
                    <div className="text-center pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                            Already have an account?{' '}
                            <button 
                                type="button"
                                onClick={() => navigator('/Login')} 
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Login here
                            </button>
                        </p>
                    </div>

                </form>
            </div>
        </div>


    )
}

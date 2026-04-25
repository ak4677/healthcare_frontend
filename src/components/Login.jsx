import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import PatientContext from '../context/info/PatientContext';
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";


export default function Login() {
    const navigator = useNavigate()
    const captchaRef = useRef(null);
    const fetching = useContext(PatientContext)
    const { info } = fetching;
    const currentRole = localStorage.getItem('role') || 'User';
    const displayRole = currentRole.charAt(0).toUpperCase() + currentRole.slice(1).replace('_', ' ');
    const [credential, setCredential] = useState({ email: "", password: "" })
    const navigation = () => {
        let x = localStorage.getItem('role').toLowerCase()
        if (x === 'doctor') {
            navigator("/Docdes");
        }
        else if (x === 'admin') {
            localStorage.setItem('fetch', 'assignments')
            navigator("/Admindes")
        }
        else if (x === 'patient') {
            navigator("/Patides")
        }
        else if (x === 'lab_assistant') {
            navigator("/Labentry")
        }
        else {
            console.log("error in login")
        }
    }
    const submit = async (e) => {
        e.preventDefault();
        try {
            const captchaToken = captchaRef.current.getValue();

            if (!captchaToken) {
                alert("Please verify captcha");
                return;
            }
            console.log(localStorage.getItem('role'))
            const response = await fetch(`${import.meta.env.VITE_BACKEND}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: credential.email, passward: credential.password, role: localStorage.getItem('role'), captchaToken }),
            });
            const data = await response.json();
            if (!response.ok) {
                captchaRef.current.reset();
                alert(data.message || "Login failed");
                return;
            }
            localStorage.setItem('token', data)

            navigation()

        } catch (error) {
            alert("wrong credential login")
        }

    }

    const onChange = (e) => {
        setCredential({ ...credential, [e.target.name]: e.target.value })
    }
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative">

            {/* Background Blur Effect (Optional) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-3xl opacity-50"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-3xl opacity-50"></div>
            </div>

            {/* Main Card */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 m-4">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        {/* Dynamic Icon based on generic login */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{displayRole} Login</h2>
                    <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your dashboard</p>
                </div>

                {/* Form Section */}
                <form className="space-y-6" onSubmit={submit}>

                    {/* ID / Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">ID / Email Address</label>
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
                                placeholder="Enter your ID or email"
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

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300" />
                            <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600">Remember me</label>
                        </div>
                        {/* eslint-disable-next-line */}
                        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot Password?</a>
                    </div>
                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_SITE_KEY}
                        ref={captchaRef}
                    />
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-3.5 text-center shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        Secure Login
                    </button>

                    {/* Back Link */}
                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigator("/")}
                            className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center w-full gap-2 transition-colors"
                        >
                            <span>←</span> Back to role selection
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center border-t border-slate-100 pt-6 mt-6">
                        <p className="text-xs text-slate-400">
                            Need help? Contact support@smarthealth.com
                        </p>
                        <div className="mt-2 text-sm font-medium text-slate-600">
                            Not Activated? <a href="/healthcare_frontend/Signup" className="text-blue-600 hover:underline">Sign-up here</a>
                            {localStorage.getItem('role').toLowerCase()=='admin'?<a href="/healthcare_frontend/AdminKey">Create Admin Account</a>:""}
                        </div>
                    </div>

                </form>
            </div>

            <div className="absolute bottom-4 text-slate-400 text-xs">
                © 2026 Smart Health Care Systems
            </div>
        </div>


    )
}

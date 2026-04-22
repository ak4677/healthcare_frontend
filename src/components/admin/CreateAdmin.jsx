import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateAdmin() {

    const navigate = useNavigate()

    const [form, setForm] = useState({
        email: "",
        passward: "",
        name: "",
        Number: ""
    })

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const submit = async (e) => {
        e.preventDefault()

        const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/auth/createadmin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })

        if (res.ok) {
            alert("Admin created successfully")
            navigate("/login")
        } else {
            alert("Error creating admin")
        }
    }

    return (

        <div className="flex justify-center items-center min-h-screen">

            <form onSubmit={submit} className="bg-white p-8 shadow rounded w-96">

                <h2 className="text-xl mb-4">Create Admin Account</h2>

                <input name="name" placeholder="Name" onChange={onChange} className="border p-2 w-full mb-3" />

                <input name="email" placeholder="Email" onChange={onChange} className="border p-2 w-full mb-3" />

                <input name="Number" placeholder="Phone Number" onChange={onChange} className="border p-2 w-full mb-3" />

                <input type="password" name="passward" placeholder="Password" onChange={onChange} className="border p-2 w-full mb-4" />

                <button className="bg-green-600 text-white w-full py-2">
                    Create Admin
                </button>

            </form>

        </div>
    )
}
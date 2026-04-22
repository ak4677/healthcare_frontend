import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const backend=import.meta.env.VITE_BACKEND;
export default function AdminKey() {

    const [key, setKey] = useState("")
    const navigate = useNavigate()

    const submit = async (e) => {
        e.preventDefault()

        const res = await fetch(`${backend}/api/auth/verify-admin-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key })
        })

        const data = await res.json()

        if (data.valid) {
            navigate("/CreateAdmin")
        } else {
            alert("Invalid key")
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <form onSubmit={submit} className="bg-white p-8 shadow rounded">
                <h2 className="text-xl mb-4">Enter Admin Creation Key</h2>

                <input
                    type="password"
                    placeholder="Enter Key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="border p-2 w-full mb-4"
                />

                <button className="bg-blue-600 text-white px-4 py-2 w-full">
                    Verify Key
                </button>

            </form>
        </div>
    )
}
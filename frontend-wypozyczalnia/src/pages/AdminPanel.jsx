import React from "react";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
    return (
        <div className="admin-panel py-5 h-100">
            <Navbar />
            <h1>Admin Panel</h1>
            <p>Welcome to the Admin Panel!</p>
        </div>
    );
}
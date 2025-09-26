// src/App.jsx
import { useState } from "react";
import FeedbackForm from "./components/FeedbackForm";
import AdminPanel from "./components/AdminPanel";
import "./index.css";


export default function App() {
    const [tab, setTab] = useState("form");
    return (
        <div className="container">
            <header>
                <h1>Feedback App</h1>
                <nav>
                    <button className={tab === "form" ? "active" : ""} onClick={() => setTab("form")}>
                        Submit Feedback
                    </button>
                    <button className={tab === "admin" ? "active" : ""} onClick={() => setTab("admin")}>
                        Admin Panel
                    </button>
                </nav>
            </header>


            <main>{tab === "form" ? <FeedbackForm /> : <AdminPanel />}</main>


            <footer>
                <small>Plain React • Vite • SQLite backend</small>
            </footer>
        </div>
    );
}

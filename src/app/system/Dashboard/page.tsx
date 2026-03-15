"use client";

import React from "react";

export default function Welcome() {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            fontFamily: "sans-serif"
        }}>
            <h1>Welcome to My Next.js App</h1>
            <p>This is a simple client-side component.</p>
            <button
                onClick={() => alert("Hello from the client!")}
                style={{
                    padding: "10px 20px",
                    marginTop: "10px",
                    cursor: "pointer"
                }}
            >
                Click Me
            </button>
        </div>
    );
}
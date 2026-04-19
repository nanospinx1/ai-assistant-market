"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, Lock, User, Building2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create account. Please try again.");
        setSuccess(false);
      } else {
        setSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 0.75rem 0.75rem 2.5rem",
    background: "var(--bg-dark)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  };

  const labelStyles: React.CSSProperties = {
    display: "block",
    color: "var(--text-secondary)",
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
    fontWeight: 500,
  };

  const iconStyles: React.CSSProperties = {
    position: "absolute" as const,
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--primary)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--border)";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-dark)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
              marginBottom: "1.5rem",
              boxShadow: "0 0 30px rgba(99,102,241,0.3)",
            }}
          >
            <Bot size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Join the AI Assistant Marketplace
          </p>
        </div>

        {/* Success toast */}
        {success && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "#86efac",
              fontSize: "0.9rem",
              fontWeight: 500,
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <CheckCircle size={18} />
            Account created! Signing you in...
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.125rem",
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                color: "#fca5a5",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Name field */}
          <div>
            <label style={labelStyles}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={18} style={iconStyles} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={inputStyles}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label style={labelStyles}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={iconStyles} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={inputStyles}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Company field */}
          <div>
            <label style={labelStyles}>Company (optional)</label>
            <div style={{ position: "relative" }}>
              <Building2 size={18} style={iconStyles} />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                style={inputStyles}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label style={labelStyles}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={iconStyles} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={inputStyles}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              background: loading
                ? "var(--primary-dark)"
                : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
              marginTop: "0.25rem",
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Footer links */}
        <div
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "var(--primary-light)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.85rem",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

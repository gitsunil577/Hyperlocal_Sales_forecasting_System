"use client";

import React, { useState, FormEvent, useMemo } from "react";
import "./login.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { loginClient } from "../../../lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = useMemo(() => {
    const n = searchParams.get("next");
    return n && n.startsWith("/") ? n : null;
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await loginClient(email, password);

      if (!res.ok) {
        setError("Invalid email or password.");
        return;
      }

      // Redirect based on role
      if (res.role === "admin") router.push("/admin");
      else router.push(next ?? "/dashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="animated-bg">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <span className="logo-icon-large">
            <Image src="/forecast.png" alt="SalesForecast Logo" width={80} height={80} />
          </span>

          <h1>SalesForecast</h1>
          <p>
            Predict your local sales trends with AI-powered analytics and data-driven insights
          </p>

          <div className="feature-icon">
            <div className="icon">🎯</div>
            <span>Accurate Predictions</span>
          </div>
          <div className="feature-icon">
            <div className="icon">📍</div>
            <span>Location-Based Insights</span>
          </div>
          <div className="feature-icon">
            <div className="icon">📈</div>
            <span>Real-Time Analytics</span>
          </div>

          <div style={{ marginTop: 18, fontSize: 12, opacity: 0.9 }}>
            <div><b>Frontend phase:</b> email containing “admin” logs in as Admin.</div>
            <div>Example: <i>admin@company.com</i></div>
          </div>
        </div>

        <div className="login-right">
          <h2>Welcome Back</h2>
          <p className="subtitle">Enter your credentials to access your dashboard</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "10px 12px",
                borderRadius: 12,
                fontSize: 14,
                marginBottom: 14,
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="forgot-password">
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <div className="divider">OR</div>

            <div className="signup-link">
              Don&apos;t have an account? <a href="/register">Sign up now</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/auth.service";
import { User } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const normalizeRole = (role: unknown): User["role"] =>
    String(role || "").toUpperCase() === "ADMIN" ? "ADMIN" : "CLUB";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await authService.login(email, password);
      const authUser: User = {
        id: data.id,
        email: data.email,
        clubName: data.clubName || data.email,
        name: data.name || "",
        role: normalizeRole(data.role),
        isActive: !!data.isActive,
        createdAt: new Date(),
      };
      localStorage.setItem("access_token", data.access_token);
      login(authUser);
      navigate(authUser.role === "ADMIN" ? "/admin/dashboard" : "/club/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", backgroundColor: "#6f1d2f" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/bg-insat.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(120,20,35,0.76), rgba(140,20,35,0.72), rgba(120,20,35,0.8))" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "760px", background: "rgba(255,255,255,0.95)", borderRadius: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", overflow: "hidden", textAlign: "left" }}>
        <div style={{ textAlign: "center", borderBottom: "1px solid #d7dce4", padding: "24px 24px 16px" }}>
          <h1 style={{ margin: 0, color: "#8a161b", fontSize: "54px", fontWeight: 800 }}>INSAT</h1>
          <p style={{ margin: "10px 0 0", color: "#475569", fontSize: "20px" }}>Institut National des Sciences Appliquées et de Technologie</p>
          <h2 style={{ margin: "20px 0 0", color: "#962127", fontSize: "42px", fontWeight: 700 }}>Gestion des Salles</h2>
          <p style={{ margin: "8px 0 0", color: "#475569", fontSize: "34px" }}>Connectez-vous pour accéder au système</p>
        </div>
        <div style={{ padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", color: "#334155", fontSize: "28px", fontWeight: 700, marginBottom: 8 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@insat.ucar.tn" required style={{ width: "100%", height: "56px", boxSizing: "border-box", border: "1px solid #c4ccd7", borderRadius: "10px", padding: "0 14px", fontSize: "30px", marginBottom: "16px" }} />
            <label style={{ display: "block", color: "#334155", fontSize: "28px", fontWeight: 700, marginBottom: 8 }}>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: "100%", height: "56px", boxSizing: "border-box", border: "1px solid #c4ccd7", borderRadius: "10px", padding: "0 14px", fontSize: "30px", marginBottom: "12px" }} />
            {error && <div style={{ padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", marginBottom: 12 }}><p style={{ margin: 0, fontSize: "18px", color: "#b91c1c" }}>{error}</p></div>}
            <button type="submit" style={{ width: "100%", height: "58px", background: "#8d151b", color: "#fff", border: "none", borderRadius: "10px", fontSize: "34px", fontWeight: 700, cursor: "pointer" }}>Se connecter</button>
          </form>
          <button onClick={() => navigate('/forgot-password')} style={{ marginTop: "12px", width: "100%", background: "transparent", border: "none", color: "#7c1d1d", fontSize: "18px", cursor: "pointer" }}>
            Mot de passe oublié ?
          </button>
          <div style={{ marginTop: 14, padding: "12px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px" }}>
            <p style={{ margin: 0, fontSize: "18px", color: "#a11426" }}><strong>Note :</strong> Pour obtenir un accès, veuillez contacter l'administration de l'INSAT.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

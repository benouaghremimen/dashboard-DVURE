import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '@/services/auth.service';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const [token, setToken] = useState(query.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!token.trim()) {
      setMessage('Token manquant.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token.trim(), newPassword);
      setMessage('Mot de passe réinitialisé. Vous pouvez vous connecter.');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setMessage('Le token est invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", backgroundColor: "#6f1d2f" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/bg-insat.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(120,20,35,0.76), rgba(140,20,35,0.72), rgba(120,20,35,0.8))" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "640px", background: "rgba(255,255,255,0.95)", borderRadius: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", overflow: "hidden", textAlign: "left" }}>
        <div style={{ textAlign: "center", borderBottom: "1px solid #d7dce4", padding: "24px 24px 16px" }}>
          <h1 style={{ margin: 0, color: "#8a161b", fontSize: "42px", fontWeight: 800 }}>INSAT</h1>
          <h2 style={{ margin: "16px 0 0", color: "#962127", fontSize: "32px", fontWeight: 700 }}>Réinitialiser le mot de passe</h2>
          <p style={{ margin: "8px 0 0", color: "#475569", fontSize: "18px" }}>Saisissez votre nouveau mot de passe.</p>
        </div>
        <div style={{ padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", color: "#334155", fontSize: "18px", fontWeight: 700, marginBottom: 8 }}>Nouveau mot de passe</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" required style={{ width: "100%", height: "48px", boxSizing: "border-box", border: "1px solid #c4ccd7", borderRadius: "10px", padding: "0 14px", fontSize: "18px", marginBottom: "12px" }} />
            <label style={{ display: "block", color: "#334155", fontSize: "18px", fontWeight: 700, marginBottom: 8 }}>Confirmer le mot de passe</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer le mot de passe" required style={{ width: "100%", height: "48px", boxSizing: "border-box", border: "1px solid #c4ccd7", borderRadius: "10px", padding: "0 14px", fontSize: "18px", marginBottom: "12px" }} />
            {message && <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: 12 }}><p style={{ margin: 0, fontSize: "16px", color: "#334155" }}>{message}</p></div>}
            <button type="submit" disabled={loading} style={{ width: "100%", height: "52px", background: "#8d151b", color: "#fff", border: "none", borderRadius: "10px", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>
              {loading ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
          </form>
          <button onClick={() => navigate('/login')} style={{ marginTop: "12px", width: "100%", background: "transparent", border: "none", color: "#7c1d1d", fontSize: "16px", cursor: "pointer" }}>
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

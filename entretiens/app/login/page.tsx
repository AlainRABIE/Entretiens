
"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // Log connexion (meilleure-effort)
      try {
        if (data?.user) {
          await supabase.from('connexions').insert({
            auth_id: data.user.id,
            email: email,
            event: 'login'
          });
        }
      } catch (_) {}
      window.location.href = "/home";
    }
    setLoading(false);
  };

  return (
    <div className="centered-container">
      <div className="modern-card">
        <h2>Connexion</h2>
        <form className="modern-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="password">Mot de passe</label>
          <input type="password" id="password" name="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          <button type="submit" className="modern-btn" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
        </form>
        <div className="modern-links" style={{ marginTop: '1.5rem' }}>
          <span style={{ color: '#b3b3b3' }}>Pas de compte ?</span>
          <a href="/register" className="modern-link">Inscription</a>
        </div>
      </div>
    </div>
  );
}

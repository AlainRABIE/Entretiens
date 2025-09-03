
"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Inscription réussie ! Vérifiez votre email pour valider votre compte.");
      // Log inscription (meilleure-effort)
      try {
        if (data?.user) {
          await supabase.from('connexions').insert({
            auth_id: data.user.id,
            email: email,
            event: 'signup'
          });
        }
      } catch (_) {}
    }
    setLoading(false);
  };

  return (
    <div className="centered-container">
      <div className="modern-card">
        <h2>Inscription</h2>
        <form className="modern-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="password">Mot de passe</label>
          <input type="password" id="password" name="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}
          <button type="submit" className="modern-btn" disabled={loading}>{loading ? "Inscription..." : "S'inscrire"}</button>
        </form>
        <div className="modern-links" style={{ marginTop: '1.5rem' }}>
          <span style={{ color: '#b3b3b3' }}>Déjà un compte ?</span>
          <a href="/login" className="modern-link">Connexion</a>
        </div>
      </div>
    </div>
  );
}

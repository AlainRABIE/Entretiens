"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Utilisateur = {
  id: number;
  created_at: string;
  nom: string;
  prenom: string;
  role: number;
  auth_id: string;
  email: string;
};

function Menubar({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(30,30,30,0.92)",
      color: "#ededed",
      padding: "1.2rem 2.2rem",
      borderRadius: 18,
      marginBottom: 40,
      boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontFamily: "Inter, Arial, Helvetica, sans-serif"
    }}>
      <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 1, color: "#fff" }}>Entretiens</div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ background: "#232526", padding: "7px 18px", borderRadius: 10, fontSize: 16, color: "#ededed", border: "1px solid #333" }}>{email}</span>
        <button onClick={onLogout} style={{ background: "linear-gradient(90deg,#e74c3c,#c0392b)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 22px", fontWeight: 600, cursor: "pointer", fontSize: 15, boxShadow: "0 2px 8px rgba(231,76,60,0.12)" }}>Déconnexion</button>
      </div>
    </nav>
  );
}


export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData.user?.email || null;
      setUserEmail(email);
      if (email) {
        // Récupérer le rôle de l'utilisateur connecté
        const { data: users, error } = await supabase
          .from('Utilisateur')
          .select('role')
          .eq('email', email)
          .single();
        if (users && users.role) {
          setUserRole(users.role);
          // Si admin, charger tous les utilisateurs
          if (users.role === 1) {
            const { data: allUsers } = await supabase
              .from('Utilisateur')
              .select('*');
            setUtilisateurs(allUsers || []);
          }
        }
      }
      setLoading(false);
    };
    fetchUserAndRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "none", display: "flex", flexDirection: "column" }}>
      <header style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5vw",
        height: 70,
        background: "rgba(30,30,30,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        boxShadow: "0 2px 16px rgba(31,38,135,0.08)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src="/window.svg" alt="Logo" style={{ width: 32, height: 32, filter: "drop-shadow(0 2px 8px #0006)" }} />
          <span style={{ color: "#ededed", fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>Alain RABIE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {userEmail && (
            <span style={{ background: "#232526", padding: "6px 16px", borderRadius: 8, fontSize: 15, color: "#ededed", border: "1px solid #333" }}>{userEmail}</span>
          )}
          <button onClick={handleLogout} style={{ background: "linear-gradient(90deg,#e74c3c,#c0392b)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, cursor: "pointer", fontSize: 15, boxShadow: "0 2px 8px rgba(231,76,60,0.12)" }}>Déconnexion</button>
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", minHeight: "100vh" }}>
        <div className="modern-card" style={{ maxWidth: userRole === 1 ? 900 : 480, width: "100%", margin: "0 auto", textAlign: "center", background: "rgba(30,30,30,0.92)", color: "#ededed", marginTop: 90 }}>
          <h1 style={{ fontSize: 32, marginBottom: 18, color: "#ededed", fontWeight: 700, letterSpacing: 0.5 }}>Bienvenue 👋</h1>
          <p style={{ color: "#b3b3b3", fontSize: 18, marginBottom: 32, lineHeight: 1.6 }}>
            Vous êtes connecté à l'application de gestion de rôles.<br />
            Gérez vos entretiens facilement et en toute sécurité.
          </p>
          <img src="/globe.svg" alt="Accueil" style={{ width: 110, marginBottom: 24, filter: "drop-shadow(0 2px 8px #0006)" }} />
          {loading && <div style={{ color: '#4f8cff', marginTop: 24 }}>Chargement...</div>}
          {userRole === 1 && !loading && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ color: '#38e8ff', marginBottom: 18, fontSize: 24 }}>Gestion des utilisateurs</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(20,20,20,0.95)', borderRadius: 10, overflow: 'hidden', fontSize: 15 }}>
                <thead>
                  <tr style={{ background: '#232526', color: '#ededed' }}>
                    <th style={{ padding: 10, borderBottom: '1px solid #444' }}>Nom</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #444' }}>Prénom</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #444' }}>Email</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #444' }}>Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {utilisateurs.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: 8 }}>{u.nom}</td>
                      <td style={{ padding: 8 }}>{u.prenom}</td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>{u.role === 1 ? 'Administrateur' : 'Utilisateur'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

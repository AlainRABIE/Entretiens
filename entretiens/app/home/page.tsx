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
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Utilisateur>>({});
  const [addForm, setAddForm] = useState<Partial<Utilisateur>>({ nom: '', prenom: '', email: '', role: 2 });
  const [crudLoading, setCrudLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData.user?.email || null;
      setUserEmail(email);
      if (email) {
        // Récupérer le rôle de l'utilisateur connecté
        const { data: users } = await supabase
          .from('Utilisateur')
          .select('role')
          .eq('email', email)
          .single();
        if (users && users.role) {
          setUserRole(users.role);
          // Si admin, charger tous les utilisateurs
          if (users.role === 1) {
            await fetchAllUsers();
          }
        }
      }
      setLoading(false);
    };
    fetchUserAndRole();
  }, []);

  const fetchAllUsers = async () => {
    const { data: allUsers } = await supabase
      .from('Utilisateur')
      .select('*');
    setUtilisateurs(allUsers || []);
  };

  const handleEdit = (u: Utilisateur) => {
    setEditId(u.id);
    setForm({ ...u });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setCrudLoading(true);
    await supabase.from('Utilisateur').update({
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      role: Number(form.role)
    }).eq('id', editId);
    setEditId(null);
    await fetchAllUsers();
    setCrudLoading(false);
  };

  const handleDelete = async (id: number) => {
    setCrudLoading(true);
    await supabase.from('Utilisateur').delete().eq('id', id);
    await fetchAllUsers();
    setCrudLoading(false);
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudLoading(true);
    await supabase.from('Utilisateur').insert({
      nom: addForm.nom,
      prenom: addForm.prenom,
      email: addForm.email,
      role: Number(addForm.role)
    });
    setAddForm({ nom: '', prenom: '', email: '', role: 2 });
    await fetchAllUsers();
    setCrudLoading(false);
  };

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
  <div className="modern-card" style={{ maxWidth: userRole === 1 ? 650 : 480, width: "100%", margin: "0 auto", textAlign: "center", background: "rgba(30,30,30,0.92)", color: "#ededed", marginTop: 90, padding: userRole === 1 ? '2rem 1.2rem' : undefined }}>
          <h1 style={{ fontSize: 32, marginBottom: 18, color: "#ededed", fontWeight: 700, letterSpacing: 0.5 }}>Bienvenue 👋</h1>
          <p style={{ color: "#b3b3b3", fontSize: 18, marginBottom: 32, lineHeight: 1.6 }}>
            Vous êtes connecté à l'application de gestion de rôles.<br />
            Gérez vos entretiens facilement et en toute sécurité.
          </p>
          <img src="/globe.svg" alt="Accueil" style={{ width: 110, marginBottom: 24, filter: "drop-shadow(0 2px 8px #0006)" }} />
          {loading && <div style={{ color: '#4f8cff', marginTop: 24 }}>Chargement...</div>}
          {userRole === 1 && !loading && (
            <div style={{ marginTop: 32 }}>
              <h2 style={{ color: '#38e8ff', marginBottom: 12, fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}>Gestion des utilisateurs</h2>
              <form onSubmit={handleAdd} style={{ display: 'flex', gap: 16, margin: '0 auto 24px auto', maxWidth: 650, background: 'rgba(36,36,36,0.7)', borderRadius: 10, padding: '18px 16px', alignItems: 'center', boxShadow: '0 2px 8px #0002', flexWrap: 'wrap', justifyContent: 'center' }}>
                <input name="nom" placeholder="Nom" value={addForm.nom} onChange={handleAddChange} required style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#232526', color: '#ededed', minWidth: 90, fontSize: 15, outline: 'none', marginBottom: 6 }} />
                <input name="prenom" placeholder="Prénom" value={addForm.prenom} onChange={handleAddChange} required style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#232526', color: '#ededed', minWidth: 90, fontSize: 15, outline: 'none', marginBottom: 6 }} />
                <input name="email" placeholder="Email" value={addForm.email} onChange={handleAddChange} required style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#232526', color: '#ededed', minWidth: 160, fontSize: 15, outline: 'none', marginBottom: 6 }} />
                <select name="role" value={addForm.role} onChange={handleAddChange} style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#232526', color: '#ededed', fontSize: 15, outline: 'none', marginBottom: 6 }}>
                  <option value={1}>Admin</option>
                  <option value={2}>User</option>
                </select>
                <button type="submit" className="modern-btn" style={{ minWidth: 70, fontSize: 15, padding: '0.7rem 0', borderRadius: 20, background: 'linear-gradient(90deg,#38e8ff,#4f8cff)', marginBottom: 6 }} disabled={crudLoading}>+</button>
              </form>
              <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: '0 2px 8px #0002', background: 'rgba(36,36,36,0.7)', maxWidth: 700, margin: '0 auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, background: 'none' }}>
                  <thead>
                    <tr style={{ color: '#ededed', borderBottom: '1px solid #333', background: 'none' }}>
                      <th style={{ padding: '14px 8px', fontWeight: 600, textAlign: 'left', fontSize: 15 }}>Nom</th>
                      <th style={{ padding: '14px 8px', fontWeight: 600, textAlign: 'left', fontSize: 15 }}>Prénom</th>
                      <th style={{ padding: '14px 8px', fontWeight: 600, textAlign: 'left', fontSize: 15 }}>Email</th>
                      <th style={{ padding: '14px 8px', fontWeight: 600, textAlign: 'left', fontSize: 15 }}>Rôle</th>
                      <th style={{ padding: '14px 8px', fontWeight: 600, textAlign: 'center', fontSize: 15 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilisateurs.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #232526', background: editId === u.id ? '#232526' : 'none', transition: 'background 0.2s', height: 54 }}>
                        {editId === u.id ? (
                          <>
                            <td style={{ padding: '10px 8px' }}><input name="nom" value={form.nom} onChange={handleEditChange} style={{ padding: '8px 10px', borderRadius: 7, border: 'none', background: '#232526', color: '#ededed', minWidth: 70, fontSize: 15, outline: 'none' }} /></td>
                            <td style={{ padding: '10px 8px' }}><input name="prenom" value={form.prenom} onChange={handleEditChange} style={{ padding: '8px 10px', borderRadius: 7, border: 'none', background: '#232526', color: '#ededed', minWidth: 70, fontSize: 15, outline: 'none' }} /></td>
                            <td style={{ padding: '10px 8px' }}><input name="email" value={form.email} onChange={handleEditChange} style={{ padding: '8px 10px', borderRadius: 7, border: 'none', background: '#232526', color: '#ededed', minWidth: 120, fontSize: 15, outline: 'none' }} /></td>
                            <td style={{ padding: '10px 8px' }}>
                              <select name="role" value={form.role} onChange={handleEditChange} style={{ padding: '8px 10px', borderRadius: 7, border: 'none', background: '#232526', color: '#ededed', fontSize: 15, outline: 'none' }}>
                                <option value={1}>Admin</option>
                                <option value={2}>User</option>
                              </select>
                            </td>
                            <td style={{ padding: '10px 8px', display: 'flex', gap: 10, justifyContent: 'center' }}>
                              <button onClick={handleEditSave} className="modern-btn" style={{ minWidth: 36, fontSize: 15, padding: '0.5rem 0', borderRadius: 20, background: 'linear-gradient(90deg,#38e8ff,#4f8cff)' }} disabled={crudLoading} title="Valider">✔️</button>
                              <button onClick={() => setEditId(null)} className="modern-btn" style={{ minWidth: 36, background: '#444', color: '#fff', fontSize: 15, padding: '0.5rem 0', borderRadius: 20 }} disabled={crudLoading} title="Annuler">✖️</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '10px 8px' }}>{u.nom}</td>
                            <td style={{ padding: '10px 8px' }}>{u.prenom}</td>
                            <td style={{ padding: '10px 8px' }}>{u.email}</td>
                            <td style={{ padding: '10px 8px' }}>{u.role === 1 ? 'Admin' : 'User'}</td>
                            <td style={{ padding: '10px 8px', display: 'flex', gap: 10, justifyContent: 'center' }}>
                              <button onClick={() => handleEdit(u)} className="modern-btn" style={{ minWidth: 36, fontSize: 15, borderRadius: 20, padding: '0.5rem 0', background: 'linear-gradient(90deg,#38e8ff,#4f8cff)' }} disabled={crudLoading} title="Éditer">✏️</button>
                              <button onClick={() => handleDelete(u.id)} className="modern-btn" style={{ minWidth: 36, background: '#e74c3c', color: '#fff', fontSize: 15, borderRadius: 20, padding: '0.5rem 0' }} disabled={crudLoading} title="Supprimer">🗑️</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

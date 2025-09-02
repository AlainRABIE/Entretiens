"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabaseClient";
const ChartComponent = dynamic(() => import("./ChartComponent"), { ssr: false });
const RolePieChart = dynamic(() => import("./RolePieChart"), { ssr: false });

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

type Utilisateur = {
  id: number;
  created_at: string;
  nom: string;
  prenom: string;
  role: number;
  auth_id: string;
  email: string;
  domaines?: string[];
  actif?: boolean;
};

const palettes = {
  light: {
    primary: "#7367f0",
    secondary: "#f5f6fa",
    accent: "#e3e6fc",
    success: "#28c76f",
    info: "#00cfe8",
    warning: "#ff9f43",
    danger: "#ea5455",
    light: "#f8f8f8",
    dark: "#4b4b5a",
    gray100: "#f4f6fb", // fond général plus doux
    gray200: "#e9ebf0", // blocs
    gray300: "#eaeaea",
    gray400: "#b9b9c3",
    gray500: "#7367f0",
    gray600: "#82868b",
    gray700: "#6e6b7b",
    gray800: "#4b4b5a",
    gray900: "#222f3e",
    white: "#fff",
    background: "#f4f6fb"
  },
  dark: {
    primary: "#181c23", // header très foncé
    secondary: "#22242a", // sidebar/cartes gris foncé
    background: "#181c23", // fond principal
    accent: "#3a4256", // hover doux
    success: "#22d3ee",
    info: "#818cf8",
    warning: "#facc15",
    danger: "#ef4444",
    light: "#23272b",
    dark: "#ededed",
    gray100: "#20232a", // fond général
    gray200: "#23272b", // blocs
    gray300: "#282c34",
    gray400: "#35363c",
    gray500: "#6b7280",
    gray600: "#a1a1aa",
    gray700: "#bfc7d5",
    gray800: "#e0e6f0",
    gray900: "#f8fafc",
    white: "#fff"
  }
};

const roles = [
  { value: 1, label: "Admin", color: palettes.light.primary },
  { value: 2, label: "User", color: palettes.light.success },
];

const sousDomaines = ["admin.monsite.com", "client.monsite.com"];

const Badge = ({ color, children, palette }: { color: string; children: any; palette: any }) => (
  <span style={{ background: color, color: palette.white, borderRadius: 8, padding: "2px 10px", fontSize: 13, fontWeight: 700, marginRight: 6 }}>{children}</span>
);


const adminSidebarLinks = [
  { label: "Home", icon: "🏠", href: "/home" },
  { label: "Utilisateurs", icon: "👤", href: "/Utilisateur" },
  { label: "Sous-domaines", icon: "🌐", href: "#" },
  { label: "Journal", icon: "📝", href: "#" },
];

const userSidebarLinks = [
  { label: "Accueil", icon: "🏠", href: "/home" },
  { label: "Mon Profil", icon: "👤", href: "/profile" },
  { label: "Mes Domaines", icon: "🌐", href: "#" },
];



const Sidebar = ({ onLogout, open, palette, role }: { onLogout: () => void; open: boolean; palette: any; role: number }) => {
  const links = role === 2 ? userSidebarLinks : adminSidebarLinks;
  return (
    <aside
      style={{
        width: open ? 220 : 0,
        background: palette.secondary,
        color: palette.dark,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: open ? "2px 0 16px #0002" : undefined,
        transition: "width 0.3s cubic-bezier(.4,2,.6,1)",
        overflow: "hidden",
        position: "fixed",
        top: 64,
        left: 0,
        zIndex: 100,
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
      }}
    >
      <div style={{ height: 32 }} />
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "0 10px" }}>
        {links.map(link => (
          <a
            key={link.label}
            href={link.href}
            style={{
              color: palette.dark,
              fontWeight: 600,
              textDecoration: "none",
              borderRadius: 10,
              padding: "10px 16px",
              margin: "2px 0",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 15,
              transition: "background 0.18s",
            }}
            onMouseOver={e => (e.currentTarget.style.background = palette.accent)}
            onMouseOut={e => (e.currentTarget.style.background = "")}
          >
            <span style={{ fontSize: 18 }}>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>
      <div style={{ flex: 0, height: 24 }} />
    </aside>
  );
};

export default function HomePage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [connexionsParMois, setConnexionsParMois] = useState<{ date: string; connexions: number; creations: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<Utilisateur | null>(null);
  const [filterRole, setFilterRole] = useState<number | null>(null);
  const [filterDomaine, setFilterDomaine] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Utilisateur>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>("light");
  const palette = palettes[theme];


  useEffect(() => {
    fetchAllUsers();
    fetchUserEmailAndRole();
    fetchConnexionsParMois();
  }, []);

  // Récupère l'email et le rôle de l'utilisateur connecté
  const fetchUserEmailAndRole = async () => {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data?.user?.email || "");
    if (data?.user?.email) {
      // On récupère le rôle depuis la table Utilisateur
      const { data: userData } = await supabase.from("Utilisateur").select("role").eq("email", data.user.email).single();
      setUserRole(userData?.role || null);
    }
  };

  // Récupère le nombre de connexions par mois depuis la table Connexion
  const fetchConnexionsParMois = async () => {
    // On suppose que la table Connexion existe avec created_at
    const { data, error } = await supabase
      .from("Connexion")
      .select("created_at")
      .gte("created_at", `${new Date().getFullYear()}-01-01`)
      .lte("created_at", `${new Date().getFullYear()}-12-31`);
    if (error) return;
    // Compte les connexions par mois
    const counts = Array(12).fill(0);
    (data || []).forEach((row: { created_at: string }) => {
      const d = new Date(row.created_at);
      counts[d.getMonth()]++;
    });
    // Compte les créations de comptes par mois (depuis Utilisateur)
    const creations = Array(12).fill(0);
    utilisateurs.forEach(u => {
      const d = new Date(u.created_at);
      if (d.getFullYear() === new Date().getFullYear()) creations[d.getMonth()]++;
    });
    setConnexionsParMois(
      MONTHS.map((m, i) => ({ date: m, connexions: counts[i], creations: creations[i] }))
    );
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("Utilisateur").select("*");
    setUtilisateurs(data || []);
    setLoading(false);
  };

  const fetchUserEmail = async () => {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data?.user?.email || "");
  };

  const handleEdit = (user: Utilisateur) => {
    setEditUser(user);
    setForm(user);
    setShowModal(true);
  };

  const handleSave = async () => {
    await supabase.from("Utilisateur").update(form).eq("id", editUser?.id);
    setActivityLog(log => [
      `Droits modifiés pour ${form.nom} ${form.prenom} (${form.email})`,
      ...log.slice(0, 19)
    ]);
    setShowModal(false);
    setEditUser(null);
    fetchAllUsers();
  };

  const handleDelete = async (id: number) => {
    await supabase.from("Utilisateur").delete().eq("id", id);
    setActivityLog(log => [
      `Utilisateur supprimé (id: ${id})`,
      ...log.slice(0, 19)
    ]);
    fetchAllUsers();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const filteredUsers = utilisateurs.filter(u =>
    (filterRole ? u.role === filterRole : true) &&
    (filterDomaine ? (u.domaines || []).includes(filterDomaine) : true)
  );

  // Affichage différent selon le rôle
  if (userRole === 2) {
    // Interface utilisateur simple
    return (
      <div style={{ minHeight: "100vh", background: palette.gray100, paddingTop: 64, color: theme === 'dark' ? palette.white : palette.dark }}>
        {/* Header */}
        <header style={{
          height: 64,
          background: palette.secondary,
          color: theme === 'dark' ? palette.white : palette.dark,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px 0 16px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          boxShadow: "0 2px 8px #0001"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                background: 'transparent',
                border: `2px solid ${theme === 'dark' ? '#fff' : '#222'}`,
                color: theme === 'dark' ? '#fff' : '#222',
                fontSize: 28,
                cursor: 'pointer',
                marginRight: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                width: 44,
                height: 44,
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                outline: 'none',
              }}
              aria-label="Ouvrir/fermer le menu"
              onMouseOver={e => {
                e.currentTarget.style.background = theme === 'dark' ? '#fff2' : '#2221';
                e.currentTarget.style.borderColor = theme === 'dark' ? '#fff' : '#222';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = theme === 'dark' ? '#fff' : '#222';
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1, color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>&#9776;</span>
            </button>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, color: theme === 'dark' ? '#fff' : palette.dark }}>Espace Utilisateur</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{
                background: palette.secondary,
                color: palette.primary,
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                marginRight: 8
              }}
              aria-label="Changer le mode clair/sombre"
            >
              {theme === "light" ? "🌞" : "🌙"}
            </button>
            <span style={{ fontWeight: 700, fontSize: 16, background: palette.secondary, borderRadius: 8, padding: "6px 16px", color: theme === 'dark' ? '#fff' : palette.dark }}>{userEmail}</span>
            <button
              onClick={handleLogout}
              style={{ background: palette.danger, color: palette.white, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >Déconnexion</button>
          </div>
        </header>
        {/* Sidebar utilisateur */}
        <Sidebar onLogout={handleLogout} open={sidebarOpen} palette={palette} role={2} />
        {/* Contenu utilisateur simple */}
        <main style={{
          flex: 1,
          padding: 32,
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
          marginLeft: sidebarOpen ? 220 : 0,
          marginTop: 8,
          transition: "margin-left 0.3s cubic-bezier(.4,2,.6,1)",
          background: palette.gray100,
          color: theme === 'dark' ? palette.white : palette.dark
        }}>
          <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 24 }}>Bienvenue sur votre espace utilisateur</h2>
          <div style={{ background: palette.secondary, borderRadius: 18, boxShadow: `0 2px 12px ${palette.gray200}`, padding: 32, marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Votre profil</div>
            <div><b>Email :</b> {userEmail}</div>
            {/* Ajoute ici d'autres infos utilisateur */}
          </div>
          <div style={{ background: palette.secondary, borderRadius: 18, boxShadow: `0 2px 12px ${palette.gray200}`, padding: 32 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Vos domaines autorisés</div>
            {/* Affichage des domaines */}
            {/* ... */}
          </div>
        </main>
      </div>
    );
  }

  // Sinon, interface admin classique
  return (
    <div style={{ minHeight: "100vh", background: palette.gray100, paddingTop: 64, color: theme === 'dark' ? palette.white : palette.dark }}>
      {/* Header */}
      <header style={{
        height: 64,
  background: palette.gray200,
        color: theme === 'dark' ? palette.white : palette.dark,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px 0 16px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
  boxShadow: theme === 'dark' ? '0 2px 16px #0004' : '0 2px 16px #b9b9c322',
  borderRadius: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'transparent',
              border: `2px solid ${theme === 'dark' ? '#fff' : '#222'}`,
              color: theme === 'dark' ? '#fff' : '#222',
              fontSize: 28,
              cursor: 'pointer',
              marginRight: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              width: 44,
              height: 44,
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              outline: 'none',
            }}
            aria-label="Ouvrir/fermer le menu"
            onMouseOver={e => {
              e.currentTarget.style.background = theme === 'dark' ? '#fff2' : '#2221';
              e.currentTarget.style.borderColor = theme === 'dark' ? '#fff' : '#222';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = theme === 'dark' ? '#fff' : '#222';
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1, color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>&#9776;</span>
          </button>
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, color: theme === 'dark' ? '#fff' : palette.dark }}>Dashboard Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Switch mode clair/sombre */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{
              background: palette.secondary,
              color: palette.primary,
              border: "none",
              borderRadius: 8,
              padding: "6px 16px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              marginRight: 8
            }}
            aria-label="Changer le mode clair/sombre"
          >
            {theme === "light" ? "🌞" : "🌙"}
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, background: palette.secondary, borderRadius: 8, padding: "6px 16px", color: theme === 'dark' ? '#fff' : palette.dark }}>{userEmail}</span>
          <button
            onClick={handleLogout}
            style={{ background: palette.danger, color: palette.white, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >Déconnexion</button>
        </div>
      </header>
      {/* Sidebar */}
  <Sidebar onLogout={handleLogout} open={sidebarOpen} palette={{...palette, primary: palette.secondary}} role={userRole || 1} />
      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: 32,
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
          marginLeft: sidebarOpen ? 220 : 0,
          marginTop: 8,
          transition: "margin-left 0.3s cubic-bezier(.4,2,.6,1)",
          background: palette.gray100,
          color: theme === 'dark' ? palette.white : palette.dark
        }}
      >
        <div style={{
          display: "flex",
          gap: 32,
          marginBottom: 32,
          flexWrap: "wrap",
          alignItems: "stretch",
          justifyContent: "space-between"
        }}>
          <div style={{ flex: 3, minWidth: 540, maxWidth: 1000 }}>
            <ChartComponent
              data={connexionsParMois}
              label="Connexions & Inscriptions"
              theme={theme}
            />
          </div>
          {/* Camembert répartition rôles */}
          <div style={{ flex: 1, minWidth: 260, maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "stretch", alignSelf: "stretch", height: "100%" }}>
            <div style={{
              background: palette.secondary,
              borderRadius: 18,
              boxShadow: `0 2px 12px ${palette.gray200}`,
              padding: 0,
              marginBottom: 28,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1
            }}>
              <RolePieChart
                adminCount={utilisateurs.filter(u => u.role === 1).length}
                userCount={utilisateurs.filter(u => u.role === 2).length}
                theme={theme}
              />
            </div>
            {/* Carte 'Total utilisateurs' supprimée car le nombre est déjà affiché au centre du camembert */}
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "center" }}>
          <select value={filterRole ?? ''} onChange={e => setFilterRole(e.target.value ? Number(e.target.value) : null)} style={{ padding: 8, borderRadius: 8, border: `1.5px solid ${palette.gray300}` }}>
            <option value="">Tous les rôles</option>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={filterDomaine ?? ''} onChange={e => setFilterDomaine(e.target.value || null)} style={{ padding: 8, borderRadius: 8, border: `1.5px solid ${palette.gray300}` }}>
            <option value="">Tous les sous-domaines</option>
            {sousDomaines.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Table utilisateurs */}
        <div style={{ background: palette.secondary, borderRadius: 18, boxShadow: `0 2px 12px ${palette.gray200}`, padding: 0, overflow: "hidden", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 16, color: theme === 'dark' ? palette.white : palette.dark }}>
            <thead style={{ background: palette.secondary }}>
              <tr>
                <th style={{ padding: 16, textAlign: "left", color: theme === 'dark' ? palette.white : palette.dark, fontWeight: 800, fontSize: 15 }}>Nom</th>
                <th style={{ padding: 16, textAlign: "left", color: theme === 'dark' ? palette.white : palette.dark, fontWeight: 800, fontSize: 15 }}>Prénom</th>
                <th style={{ padding: 16, textAlign: "left", color: theme === 'dark' ? palette.white : palette.dark, fontWeight: 800, fontSize: 15 }}>Email</th>
                <th style={{ padding: 16, textAlign: "left", color: theme === 'dark' ? palette.white : palette.dark, fontWeight: 800, fontSize: 15 }}>Rôle</th>
                <th style={{ padding: 16, textAlign: "left", color: theme === 'dark' ? palette.white : palette.dark, fontWeight: 800, fontSize: 15 }}>Sous-domaines</th>
                <th style={{ padding: 16, textAlign: "center", color: theme === 'dark' ? palette.white : palette.dark, fontWeight: 800, fontSize: 15 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u: Utilisateur, idx) => (
                <tr key={u.id} style={{ background: idx % 2 === 0 ? palette.secondary : palette.gray300, borderRadius: 12 }}>
                  <td style={{ padding: 14, color: theme === 'dark' ? palette.white : palette.dark }}>{u.nom}</td>
                  <td style={{ padding: 14, color: theme === 'dark' ? palette.white : palette.dark }}>{u.prenom}</td>
                  <td style={{ padding: 14, color: theme === 'dark' ? palette.white : palette.dark }}>{u.email}</td>
                  <td style={{ padding: 14 }}>
                    <Badge color={roles.find(r => r.value === u.role)?.color || palette.gray500} palette={palette}>
                      {roles.find(r => r.value === u.role)?.label || "?"}
                    </Badge>
                  </td>
                  <td style={{ padding: 14 }}>
                    {(u.domaines || []).map(d => <Badge key={d} color={palette.info} palette={palette}>{d}</Badge>)}
                  </td>
                  <td style={{ padding: 14, textAlign: "center" }}>
                    <button onClick={() => handleEdit(u)} style={{ background: palette.info, color: theme === 'dark' ? palette.white : palette.dark, border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, marginRight: 8, cursor: "pointer" }}>Éditer</button>
                    <button onClick={() => handleDelete(u.id)} style={{ background: palette.danger, color: theme === 'dark' ? palette.white : palette.dark, border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} style={{ color: palette.gray400, fontStyle: "italic", padding: 22, textAlign: "center", background: palette.secondary }}>Aucun utilisateur</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modale édition utilisateur */}
        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#0007", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: palette.white, borderRadius: 16, padding: 32, minWidth: 340, boxShadow: "0 8px 32px #0002", position: "relative" }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 18, color: palette.primary }}>Éditer les droits</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input value={form.nom || ''} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom" style={{ padding: 10, borderRadius: 8, border: `1.5px solid ${palette.gray300}` }} />
                <input value={form.prenom || ''} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Prénom" style={{ padding: 10, borderRadius: 8, border: `1.5px solid ${palette.gray300}` }} />
                <input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" style={{ padding: 10, borderRadius: 8, border: `1.5px solid ${palette.gray300}` }} />
                <select value={form.role || 2} onChange={e => setForm(f => ({ ...f, role: Number(e.target.value) }))} style={{ padding: 10, borderRadius: 8, border: `1.5px solid ${palette.gray300}` }}>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Sous-domaines autorisés :</div>
                  {sousDomaines.map(d => (
                    <label key={d} style={{ display: "block", marginBottom: 4 }}>
                      <input type="checkbox" checked={(form.domaines || []).includes(d)} onChange={e => setForm(f => ({ ...f, domaines: e.target.checked ? [...(f.domaines || []), d] : (f.domaines || []).filter(x => x !== d) }))} /> {d}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
                <button onClick={() => setShowModal(false)} style={{ background: palette.gray300, color: palette.gray700, border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>Annuler</button>
                <button onClick={handleSave} style={{ background: palette.primary, color: palette.white, border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>Enregistrer</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
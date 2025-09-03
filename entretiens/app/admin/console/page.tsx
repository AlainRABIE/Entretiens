"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import * as Shared from "../../components/SharedComponents";

type UtilisateurRecord = {
  id: number;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  role: number | null;
  created_at: string;
};

type AuthUserRow = {
  auth_id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function AdminConsolePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [inscriptions, setInscriptions] = useState<UtilisateurRecord[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUserRow[] | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const palette = useMemo(() => (Shared as any)?.palettes?.[theme] || {
    light: {
      primary: "#7367f0",
      secondary: "#f5f6fa",
      white: "#fff",
      dark: "#4b4b5a",
      background: "#f4f6fb",
      gray100: "#f4f6fb",
      gray300: "#eaeaea",
    },
    dark: {
      primary: "#181c23",
      secondary: "#22242a",
      white: "#fff",
      dark: "#f9fafb",
      background: "#181c23",
      gray100: "#1f2937",
      gray300: "#374151",
    },
  }[theme as 'light' | 'dark'], [theme]);

  // Fallback Header/Sidebar si les exports ne sont pas résolus
  const FallbackHeader = ({
    title,
    userEmail,
    theme,
    setTheme,
    palette,
    sidebarOpen,
    setSidebarOpen,
    onLogout
  }: any) => (
    <header style={{
      height: 64,
      background: palette.secondary,
      color: theme === 'dark' ? palette.white : palette.dark,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px 0 16px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, boxShadow: '0 2px 8px #0001'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => setSidebarOpen((o: boolean) => !o)} style={{ background: 'transparent', border: `2px solid ${theme === 'dark' ? '#fff' : '#222'}`, color: theme === 'dark' ? '#fff' : '#222', fontSize: 28, cursor: 'pointer', marginRight: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 44, height: 44 }}>
          <span style={{ fontSize: 28 }}>&#9776;</span>
        </button>
        <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ background: palette.secondary, color: palette.primary, border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginRight: 8 }}>{theme === 'light' ? '🌞' : '🌙'}</button>
        <span style={{ fontWeight: 700, fontSize: 16, background: palette.secondary, borderRadius: 8, padding: '6px 16px' }}>{userEmail}</span>
        <button onClick={onLogout} style={{ background: palette.danger || '#e5566c', color: palette.white, border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Déconnexion</button>
      </div>
    </header>
  );
  const FallbackSidebar = ({ onLogout, open, palette, role }: any) => {
    const defaultLinks = [
      { label: 'Home', icon: '🏠', href: '/home' },
      { label: 'Utilisateurs', icon: '👤', href: '/Utilisateur' },
      { label: 'Mon Profil', icon: '👤', href: '/profil' },
      { label: 'Domaine', icon: '🌐', href: '/sous-domaine' },
      { label: 'Console', icon: '🖥️', href: '/admin/console', adminOnly: true }
    ];
    const visibleLinks = defaultLinks.filter((l: any) => {
      if (l.adminOnly && role !== 1) return false;
      if (role === 2 && l.label === 'Utilisateurs') return false;
      return true;
    });
    return (
      <aside style={{ width: open ? 220 : 0, background: palette.secondary, color: palette.dark, minHeight: '100vh', display: 'flex', flexDirection: 'column', boxShadow: open ? '2px 0 16px #0002' : undefined, transition: 'width 0.3s cubic-bezier(.4,2,.6,1)', overflow: 'hidden', position: 'fixed', top: 64, left: 0, zIndex: 100, borderTopRightRadius: 18, borderBottomRightRadius: 18 }}>
        <div style={{ height: 32 }} />
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}>
          {visibleLinks.map((link: any) => (
            <a key={link.label} href={link.href} style={{ color: palette.dark, fontWeight: 600, textDecoration: 'none', borderRadius: 10, padding: '10px 16px', margin: '2px 0', display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
              <span style={{ fontSize: 18 }}>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '0 10px', marginBottom: 20 }}>
          <button onClick={onLogout} style={{ width: '100%', color: palette.white, backgroundColor: palette.danger || '#e5566c', fontWeight: 600, borderRadius: 10, padding: '10px 16px', border: 'none', cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </aside>
    );
  };

  const HeaderComp: any = (Shared as any)?.Header || FallbackHeader;
  const SidebarComp: any = (Shared as any)?.Sidebar || FallbackSidebar;
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
        return;
      }
      const { data: u } = await supabase
        .from("Utilisateur")
        .select("*")
        .eq("auth_id", data.user.id)
        .single();
      if (!u || u.role !== 1) {
        router.push("/home");
        return;
      }
      setUser(u);
      setUserEmail(u.email || "");

      // Charger les inscriptions
      const { data: insc, error: errIns } = await supabase
        .from("Utilisateur")
        .select("id, nom, prenom, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!errIns && insc) setInscriptions(insc as UtilisateurRecord[]);

      // Charger les infos d'auth Supabase via endpoint serveur (service role)
      try {
        const res = await fetch('/api/admin/activity', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Erreur API');
        setAuthUsers(json.users as AuthUserRow[]);
      } catch (e: any) {
        setAuthError(e?.message || 'Impossible de récupérer les activités');
        setAuthUsers(null);
      }

      setLoading(false);
    })();
  }, [router]);

  const handleLogout = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await supabase.from('connexions').insert({
          auth_id: data.user.id,
          email: userEmail || data.user.email,
          event: 'logout'
        });
      }
    } catch (_) {}
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.background, paddingTop: 64, color: theme === 'dark' ? palette.white : palette.dark }}>
      <HeaderComp
        title="Console d'administration"
        userEmail={userEmail}
        theme={theme}
        setTheme={setTheme}
        palette={palette}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <SidebarComp onLogout={handleLogout} open={sidebarOpen} palette={palette} role={user?.role} />

      <main style={{ marginLeft: sidebarOpen ? 220 : 0, transition: 'margin-left .3s', padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Activités</h1>

        <div style={{ display: 'grid', gap: 16 }}>
          {/* Inscriptions */}
          <section style={{ background: theme === 'dark' ? palette.secondary : palette.white, borderRadius: 12, padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Inscriptions ({inscriptions.length})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: `1px solid ${palette.gray300}` }}>
                    <th style={{ padding: '8px 6px' }}>ID</th>
                    <th style={{ padding: '8px 6px' }}>Nom</th>
                    <th style={{ padding: '8px 6px' }}>Prénom</th>
                    <th style={{ padding: '8px 6px' }}>Email</th>
                    <th style={{ padding: '8px 6px' }}>Rôle</th>
                    <th style={{ padding: '8px 6px' }}>Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptions.map(u => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${palette.gray300}` }}>
                      <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{u.id}</td>
                      <td style={{ padding: '8px 6px' }}>{u.nom || '-'}</td>
                      <td style={{ padding: '8px 6px' }}>{u.prenom || '-'}</td>
                      <td style={{ padding: '8px 6px' }}>{u.email || '-'}</td>
                      <td style={{ padding: '8px 6px' }}>{u.role === 1 ? 'Admin' : (u.role === 2 ? 'Standard' : 'Autre')}</td>
                      <td style={{ padding: '8px 6px' }}>{new Date(u.created_at).toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Connexions (via Supabase Auth admin API) */}
          <section style={{ background: theme === 'dark' ? palette.secondary : palette.white, borderRadius: 12, padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Connexions {authUsers ? `(${authUsers.length})` : ''}</h2>
            </div>
            {authError && (
              <div style={{ background: '#eab30822', border: '1px solid #eab30866', color: '#a16207', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                {authError}
              </div>
            )}
            {authUsers && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: `1px solid ${palette.gray300}` }}>
                      <th style={{ padding: '8px 6px' }}>Auth ID</th>
                      <th style={{ padding: '8px 6px' }}>Email</th>
                      <th style={{ padding: '8px 6px' }}>Inscription</th>
                      <th style={{ padding: '8px 6px' }}>Dernière connexion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authUsers.map(u => (
                      <tr key={u.auth_id} style={{ borderBottom: `1px solid ${palette.gray300}` }}>
                        <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{u.auth_id}</td>
                        <td style={{ padding: '8px 6px' }}>{u.email || '-'}</td>
                        <td style={{ padding: '8px 6px' }}>{new Date(u.created_at).toLocaleString('fr-FR')}</td>
                        <td style={{ padding: '8px 6px' }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('fr-FR') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

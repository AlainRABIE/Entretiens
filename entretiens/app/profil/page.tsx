"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import * as Shared from "../components/SharedComponents";

type UserProfile = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: number;
  actif: boolean;
  auth_id: string;
  sous_domaine?: string;
  created_at: string;
};

const ProfilPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
  });
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>("light");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const localPalettes = {
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
      gray100: "#f4f6fb",
      gray200: "#e9ebf0",
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
      primary: "#181c23",
      secondary: "#22242a",
      background: "#181c23",
      accent: "#3a4256",
      success: "#22d3ee",
      info: "#818cf8",
      warning: "#fbbf24",
      danger: "#f87171",
      light: "#374151",
      dark: "#f9fafb",
      gray100: "#1f2937",
      gray200: "#111827",
      gray300: "#374151",
      gray400: "#4b5563",
      gray500: "#6b7280",
      gray600: "#a1a1aa",
      gray700: "#bfc7d5",
      gray800: "#e0e6f0",
      gray900: "#f8fafc",
      white: "#fff"
    }
  } as const;
  const palette = (Shared as any)?.palettes?.[themeMode] || localPalettes[themeMode];
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
        <button onClick={onLogout} style={{ background: palette.danger, color: palette.white, border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Déconnexion</button>
      </div>
    </header>
  );
  const FallbackSidebar = ({ onLogout, open, palette }: any) => (
    <aside style={{ width: open ? 220 : 0, background: palette.secondary, color: palette.dark, minHeight: '100vh', display: 'flex', flexDirection: 'column', boxShadow: open ? '2px 0 16px #0002' : undefined, transition: 'width 0.3s cubic-bezier(.4,2,.6,1)', overflow: 'hidden', position: 'fixed', top: 64, left: 0, zIndex: 100, borderTopRightRadius: 18, borderBottomRightRadius: 18 }}>
      <div style={{ height: 32 }} />
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}>
        {[{ label: 'Home', icon: '🏠', href: '/home' }, { label: 'Utilisateurs', icon: '👤', href: '/Utilisateur' }, { label: 'Mon Profil', icon: '👤', href: '/profil' }].map((link) => (
          <a key={link.label} href={link.href} style={{ color: palette.dark, fontWeight: 600, textDecoration: 'none', borderRadius: 10, padding: '10px 16px', margin: '2px 0', display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <span style={{ fontSize: 18 }}>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>
      <div style={{ padding: '0 10px', marginBottom: 20 }}>
        <button onClick={onLogout} style={{ width: '100%', color: palette.white, backgroundColor: palette.danger, fontWeight: 600, borderRadius: 10, padding: '10px 16px', border: 'none', cursor: 'pointer' }}>Déconnexion</button>
      </div>
    </aside>
  );
  const HeaderComp: any = (Shared as any)?.Header || FallbackHeader;
  const SidebarComp: any = (Shared as any)?.Sidebar || FallbackSidebar;
  const router = useRouter();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        router.push('/login');
        return;
      }

      // Récupérer l'utilisateur par auth_id
      const { data: userData, error: userError } = await supabase
        .from('Utilisateur')
        .select('*')
        .eq('auth_id', authUser.user.id)
        .single();

      if (userError) {
        console.error('Erreur lors de la récupération du profil:', userError);
        console.error('Auth user ID:', authUser.user.id);
        console.error('Auth user email:', authUser.user.email);
        return;
      }

      if (!userData) {
        console.error('Aucun utilisateur trouvé avec auth_id:', authUser.user.id);
        console.error('Email de l\'utilisateur connecté:', authUser.user.email);
        return;
      }

  setUser(userData);
      setFormData({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        email: userData.email || "",
      });
  setUserEmail(userData.email || "");
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('Utilisateur')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await getCurrentUser();
      setEditing(false);
      alert('Profil mis à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  // Déconnexion locale (utilisée par Header/Sidebar)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 1: return "Administrateur";
      case 2: return "Utilisateur Standard";
      case 3: return "Invité";
      default: return "Non défini";
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.gray100
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: palette.white,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.gray100
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: palette.white,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Utilisateur non trouvé
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.gray100, paddingTop: 64, color: themeMode === 'dark' ? palette.white : palette.dark }}>
      {/* Header (menubar) */}
  <HeaderComp
        title="Mon Profil"
        userEmail={userEmail}
        theme={themeMode}
        setTheme={setThemeMode}
        palette={palette}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Sidebar */}
  <SidebarComp onLogout={handleLogout} open={sidebarOpen} palette={palette} />

      {/* Main content */}
      <main style={{
        maxWidth: 1000,
        margin: '16px auto',
        padding: '0 16px 40px',
        transition: 'margin-left 0.3s cubic-bezier(.4,2,.6,1)',
        marginLeft: sidebarOpen ? 220 : 0,
        color: themeMode === 'dark' ? palette.white : palette.dark
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 20px' }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Mon Profil</h1>
          <button
            onClick={() => router.push('/Utilisateur')}
            style={{
              padding: '10px 20px',
              backgroundColor: palette.info,
              color: palette.white,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Retour
          </button>
        </div>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'grid',
          gap: '20px'
        }}>
        {/* Informations principales */}
        <div style={{
          backgroundColor: palette.secondary,
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: themeMode === 'dark' ? palette.white : palette.dark,
              margin: 0,
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Informations personnelles
            </h2>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                padding: '8px 16px',
                backgroundColor: editing ? palette.gray400 : palette.primary,
                color: palette.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: themeMode === 'dark' ? palette.white : palette.dark,
                  fontWeight: '500'
                }}>
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${palette.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: themeMode === 'dark' ? palette.white : palette.dark,
                  fontWeight: '500'
                }}>
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${palette.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: themeMode === 'dark' ? palette.white : palette.dark,
                  fontWeight: '500'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${palette.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: palette.success,
                  color: palette.white,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  justifySelf: 'start'
                }}
              >
                Sauvegarder
              </button>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Nom:</span>
                <span style={{ color: themeMode === 'dark' ? palette.white : palette.dark }}>{user.nom}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Prénom:</span>
                <span style={{ color: themeMode === 'dark' ? palette.white : palette.dark }}>{user.prenom}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Email:</span>
                <span style={{ color: themeMode === 'dark' ? palette.white : palette.dark }}>{user.email}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Rôle:</span>
                <span style={{
                  color: themeMode === 'dark' ? palette.white : palette.dark,
                  padding: '4px 12px',
                  backgroundColor: palette.accent,
                  borderRadius: '20px',
                  fontSize: '14px',
                  justifySelf: 'start'
                }}>
                  {getRoleName(user.role)}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Statut:</span>
                <span style={{
                  color: user.actif ? palette.success : palette.danger,
                  fontWeight: '500'
                }}>
                  {user.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Informations de compte */}
        <div style={{
          backgroundColor: palette.secondary,
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            color: themeMode === 'dark' ? palette.white : palette.dark,
            margin: '0 0 20px 0',
            fontSize: '22px',
            fontWeight: '600'
          }}>
            Informations de compte
          </h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '10px',
              alignItems: 'center'
            }}>
              <span style={{ color: palette.gray600, fontWeight: '500' }}>ID Utilisateur:</span>
              <span style={{ color: themeMode === 'dark' ? palette.white : palette.dark, fontFamily: 'monospace' }}>{user.id}</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '10px',
              alignItems: 'center'
            }}>
              <span style={{ color: palette.gray600, fontWeight: '500' }}>Sous-domaine:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: themeMode === 'dark' ? palette.white : palette.dark }}>
                  {user.sous_domaine || 'Non assigné'}
                </span>
                {user.sous_domaine && (
                  <button
                    onClick={() => router.push('/sous-domaine')}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: palette.info,
                      color: palette.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Voir détails
                  </button>
                )}
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '10px',
              alignItems: 'center'
            }}>
              <span style={{ color: palette.gray600, fontWeight: '500' }}>Créé le:</span>
              <span style={{ color: themeMode === 'dark' ? palette.white : palette.dark }}>
                {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
        {/* end container */}
        </div>
      </main>
    </div>
  );
};

export default ProfilPage;

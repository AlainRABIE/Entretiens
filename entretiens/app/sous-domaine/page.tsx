"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import * as Shared from "../components/SharedComponents";

type UserData = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: number;
  sous_domaine?: string;
  actif?: boolean;
};

type AccessInfo = {
  domaine_principal: string;
  sous_domaine: string;
  url_complete: string;
  statut_acces: 'autorisé' | 'restreint' | 'bloqué';
  derniere_connexion?: string;
};

const SousDomaineePage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [theme, setTheme] = useState<'light' | 'dark'>("light");
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Fallback palettes locales si l'export partagé n'est pas disponible
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
  const palette = (Shared as any)?.palettes?.[theme] || localPalettes[theme];

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
  const FallbackSidebar = ({ onLogout, open, palette, role }: any) => {
    const defaultLinks = [
      { label: 'Home', icon: '🏠', href: '/home' },
      { label: 'Utilisateurs', icon: '👤', href: '/Utilisateur' },
      { label: 'Mon Profil', icon: '👤', href: '/profil' },
      { label: 'Domaine', icon: '🌐', href: '/sous-domaine' }
    ];
    const visibleLinks = role === 2 ? defaultLinks.filter(l => l.label !== 'Utilisateurs') : defaultLinks;
    return (
      <aside style={{ width: open ? 220 : 0, background: palette.secondary, color: palette.dark, minHeight: '100vh', display: 'flex', flexDirection: 'column', boxShadow: open ? '2px 0 16px #0002' : undefined, transition: 'width 0.3s cubic-bezier(.4,2,.6,1)', overflow: 'hidden', position: 'fixed', top: 64, left: 0, zIndex: 100, borderTopRightRadius: 18, borderBottomRightRadius: 18 }}>
        <div style={{ height: 32 }} />
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}>
          {visibleLinks.map((link) => (
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
  };
  const HeaderComp: any = (Shared as any)?.Header || FallbackHeader;
  const SidebarComp: any = (Shared as any)?.Sidebar || FallbackSidebar;

  useEffect(() => {
    getCurrentUserAndAccess();
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data?.user?.email || "");
  };

  const getCurrentUserAndAccess = async () => {
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
        return;
      }

      setUser(userData);

      // Simulation des informations d'accès au sous-domaine
      // Dans un vrai projet, ces données viendraient de votre base de données
  const domaine_principal = "carpediem.pro";
  const isAdmin = userData.role === 1;
  const sous_domaine = isAdmin ? "admin" : (userData.sous_domaine || "client");
      const isActive = userData.actif !== false; // indéfini/null => autorisé par défaut
  const statut_acces: AccessInfo["statut_acces"] = isAdmin
        ? 'autorisé'
        : (isActive ? 'autorisé' : 'bloqué');

      const mockAccessInfo: AccessInfo = {
        domaine_principal,
        sous_domaine,
        url_complete: `https://${sous_domaine}.${domaine_principal}`,
        statut_acces,
        derniere_connexion: new Date().toISOString()
      };

      setAccessInfo(mockAccessInfo);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'autorisé': return palette.success;
      case 'restreint': return palette.warning;
      case 'bloqué': return palette.danger;
      default: return palette.gray400;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'autorisé': return '✅';
      case 'restreint': return '⚠️';
      case 'bloqué': return '❌';
      default: return '❓';
    }
  };

  const getRoleName = (role?: number) => {
    switch (role) {
      case 1: return 'Administrateur';
      case 2: return 'Utilisateur Standard';
      case 3: return 'Invité';
      default: return 'Utilisateur';
    }
  };

  const simulateAccess = () => {
    if (accessInfo && accessInfo.statut_acces === 'autorisé') {
      alert(`Redirection vers ${accessInfo.url_complete}...`);
      // Dans un vrai projet, vous feriez une vraie redirection
      // window.location.href = `https://${accessInfo.url_complete}`;
    } else {
      alert('Accès non autorisé à ce sous-domaine');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Chargement des informations d'accès...
        </div>
      </div>
    );
  }

  if (!user || !accessInfo) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: theme === 'dark' ? palette.secondary : palette.light,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Informations d'accès non disponibles
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: palette.gray100, paddingTop: 64, color: theme === 'dark' ? palette.white : palette.dark }}>
      {/* Header */}
      <HeaderComp
        title="Accès Sous-domaine"
        userEmail={userEmail}
        theme={theme}
        setTheme={setTheme}
        palette={palette}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Sidebar */}
  <SidebarComp onLogout={handleLogout} open={sidebarOpen} palette={{ ...palette, primary: palette.secondary }} role={user?.role} />

      {/* Main content */}
      <main style={{
        marginLeft: sidebarOpen ? 220 : 0,
        transition: "margin-left 0.3s cubic-bezier(.4,2,.6,1)",
        padding: "30px",
        minHeight: "calc(100vh - 64px)"
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'grid',
          gap: '20px'
        }}>
          {/* Statut d'accès */}
          <div style={{
            backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '15px'
            }}>
              {getStatusIcon(accessInfo.statut_acces)}
            </div>
            <h2 style={{
              color: theme === 'dark' ? palette.white : palette.dark,
              margin: '0 0 10px 0',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Statut d'accès
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: getStatusColor(accessInfo.statut_acces),
              color: palette.white,
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {accessInfo.statut_acces}
            </div>
          </div>

          {/* Informations de domaine */}
          <div style={{
            backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: theme === 'dark' ? palette.white : palette.dark,
              margin: '0 0 20px 0',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Informations de domaine
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme === 'dark' ? palette.gray700 : palette.gray600, fontWeight: '500' }}>Domaine principal:</span>
                <span style={{
                  color: theme === 'dark' ? palette.white : palette.dark,
                  fontFamily: 'monospace',
                  backgroundColor: theme === 'dark' ? palette.gray300 : palette.gray100,
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {accessInfo.domaine_principal}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme === 'dark' ? palette.gray700 : palette.gray600, fontWeight: '500' }}>Votre sous-domaine:</span>
                <span style={{
                  color: palette.primary,
                  fontFamily: 'monospace',
                  backgroundColor: theme === 'dark' ? palette.gray300 : palette.accent,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {accessInfo.sous_domaine}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme === 'dark' ? palette.gray700 : palette.gray600, fontWeight: '500' }}>URL complète:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    color: theme === 'dark' ? palette.white : palette.dark,
                    fontFamily: 'monospace',
                    backgroundColor: theme === 'dark' ? palette.gray300 : palette.gray100,
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {accessInfo.url_complete}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(accessInfo.url_complete)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: theme === 'dark' ? palette.gray500 : palette.gray400,
                      color: palette.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Copier l'URL"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>

            {/* Actions et informations utilisateur */}
          <div style={{
            backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: theme === 'dark' ? palette.white : palette.dark,
              margin: '0 0 20px 0',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Informations utilisateur
            </h2>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme === 'dark' ? palette.gray700 : palette.gray600, fontWeight: '500' }}>Utilisateur:</span>
                <span style={{ color: theme === 'dark' ? palette.white : palette.dark }}>
                  {user.prenom} {user.nom}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme === 'dark' ? palette.gray700 : palette.gray600, fontWeight: '500' }}>Email:</span>
                <span style={{ color: theme === 'dark' ? palette.white : palette.dark }}>{user.email}</span>
              </div>
              {accessInfo.derniere_connexion && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <span style={{ color: theme === 'dark' ? palette.gray700 : palette.gray600, fontWeight: '500' }}>Dernière connexion:</span>
                  <span style={{ color: theme === 'dark' ? palette.white : palette.dark }}>
                    {new Date(accessInfo.derniere_connexion).toLocaleString('fr-FR')}
                  </span>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={simulateAccess}
                disabled={accessInfo.statut_acces !== 'autorisé'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: accessInfo.statut_acces === 'autorisé' ? palette.primary : palette.gray400,
                  color: palette.white,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: accessInfo.statut_acces === 'autorisé' ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: accessInfo.statut_acces === 'autorisé' ? 1 : 0.6
                }}
              >
                🚀 Accéder au sous-domaine
              </button>

              <button
                onClick={() => router.push('/client')}
                disabled={accessInfo.statut_acces !== 'autorisé'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: accessInfo.statut_acces === 'autorisé' ? palette.success : palette.gray400,
                  color: palette.white,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: accessInfo.statut_acces === 'autorisé' ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: accessInfo.statut_acces === 'autorisé' ? 1 : 0.6
                }}
              >
                🏢 Aller au portail client
              </button>

              <button
                onClick={() => alert('Fonctionnalité de test de connexion')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: palette.info,
                  color: palette.white,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                🔧 Tester la connexion
              </button>
            </div>
          </div>

          {/* Badge de rôle */}
          <div style={{
            backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{
                color: theme === 'dark' ? palette.white : palette.dark,
                margin: 0,
                fontSize: '18px',
                fontWeight: 600
              }}>
                Votre rôle
              </h3>
              <span style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: 999,
                backgroundColor: user.role === 1 ? palette.primary : palette.gray400,
                color: palette.white,
                fontWeight: 600,
                fontSize: 13
              }}>
                {getRoleName(user.role)}
              </span>
            </div>
          </div>

          {/* Section spécifique Administrateur */}
          {user.role === 1 && (
            <div style={{
              backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                color: theme === 'dark' ? palette.white : palette.dark,
                margin: '0 0 16px 0',
                fontSize: '22px',
                fontWeight: 600
              }}>
                Outils d'administration
              </h2>
              <p style={{ color: theme === 'dark' ? palette.gray700 : palette.gray600, marginTop: 0 }}>
                Accédez rapidement aux fonctionnalités de gestion liées à votre sous-domaine.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => router.push('/Utilisateur')} style={{
                  padding: '10px 16px',
                  backgroundColor: palette.info,
                  color: palette.white,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}>
                  👥 Gérer les utilisateurs
                </button>
                <button onClick={() => alert('Ouverture des paramètres du domaine (à implémenter)')} style={{
                  padding: '10px 16px',
                  backgroundColor: palette.warning,
                  color: palette.white,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}>
                  ⚙️ Paramètres du domaine
                </button>
                <button onClick={() => alert('Affichage des journaux (à implémenter)')} style={{
                  padding: '10px 16px',
                  backgroundColor: palette.dark,
                  color: palette.white,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}>
                  📝 Voir les journaux
                </button>
              </div>
            </div>
          )}

          {/* Section spécifique Utilisateur Standard */}
          {user.role === 2 && (
            <div style={{
              backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                color: theme === 'dark' ? palette.white : palette.dark,
                margin: '0 0 16px 0',
                fontSize: '22px',
                fontWeight: 600
              }}>
                Aide et support
              </h2>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <p style={{ margin: 0, color: theme === 'dark' ? palette.gray700 : palette.gray700 }}>
                    Si vous avez besoin d'accès supplémentaires ou d'un nouveau sous-domaine, contactez votre administrateur.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>📧</span>
                  <p style={{ margin: 0, color: theme === 'dark' ? palette.gray700 : palette.gray700 }}>
                    Support: <a href="mailto:support@carpediem.pro">support@carpediem.pro</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Restrictions et informations */}
          <div style={{
            backgroundColor: theme === 'dark' ? palette.secondary : palette.white,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: theme === 'dark' ? palette.white : palette.dark,
              margin: '0 0 20px 0',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Informations importantes
            </h2>
            <div style={{
              backgroundColor: theme === 'dark' ? palette.gray300 : palette.gray100,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${theme === 'dark' ? palette.gray400 : palette.gray300}`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>ℹ️</span>
                <div>
                    {user.role === 1 ? (
                      <>
                        <h3 style={{
                          color: theme === 'dark' ? palette.white : palette.dark,
                          margin: '0 0 10px 0',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          Accès administrateur
                        </h3>
                        <p style={{
                          color: theme === 'dark' ? palette.gray800 : palette.gray700,
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          Vous disposez d'un accès administrateur au domaine <strong>{accessInfo.domaine_principal}</strong>.
                          Vous pouvez gérer les sous-domaines, les utilisateurs et les paramètres du domaine.
                          Utilisez les outils d'administration ci-dessus pour accéder rapidement aux fonctionnalités clés.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 style={{
                          color: theme === 'dark' ? palette.white : palette.dark,
                          margin: '0 0 10px 0',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          Accès restreint
                        </h3>
                        <p style={{
                          color: theme === 'dark' ? palette.gray800 : palette.gray700,
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          Vous avez uniquement accès au sous-domaine <strong>{accessInfo.sous_domaine}.{accessInfo.domaine_principal}</strong>.
                          Cet accès est lié à votre compte utilisateur et vos permissions.
                          Pour toute demande de modification d'accès, veuillez contacter votre administrateur.
                        </p>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SousDomaineePage;
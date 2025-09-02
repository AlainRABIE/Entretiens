"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Header, Sidebar, palettes, useAuth } from "../components/SharedComponents";

type UserData = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: number;
  sous_domaine?: string;
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
  const { handleLogout } = useAuth();

  const palette = palettes[theme];

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
      const mockAccessInfo: AccessInfo = {
        domaine_principal: "https://www.carpediem.pro/",
        sous_domaine: userData.sous_domaine || "client",
        url_complete: `${userData.sous_domaine || "client"}.https://www.carpediem.pro/`,
        statut_acces: userData.actif ? 'autorisé' : 'bloqué',
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
          backgroundColor: palette.white,
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
          backgroundColor: palette.light,
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
      <Header 
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
      <Sidebar onLogout={handleLogout} open={sidebarOpen} palette={{...palette, primary: palette.secondary}} />
      
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
            backgroundColor: palette.white,
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
              color: palette.dark,
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
            backgroundColor: palette.white,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: palette.dark,
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
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Domaine principal:</span>
                <span style={{ 
                  color: palette.dark,
                  fontFamily: 'monospace',
                  backgroundColor: palette.gray100,
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
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Votre sous-domaine:</span>
                <span style={{ 
                  color: palette.primary,
                  fontFamily: 'monospace',
                  backgroundColor: palette.accent,
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
                <span style={{ color: palette.gray600, fontWeight: '500' }}>URL complète:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    color: palette.dark,
                    fontFamily: 'monospace',
                    backgroundColor: palette.gray100,
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {accessInfo.url_complete}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(accessInfo.url_complete)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: palette.gray400,
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
            backgroundColor: palette.white,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: palette.dark,
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
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Utilisateur:</span>
                <span style={{ color: palette.dark }}>
                  {user.prenom} {user.nom}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: palette.gray600, fontWeight: '500' }}>Email:</span>
                <span style={{ color: palette.dark }}>{user.email}</span>
              </div>
              {accessInfo.derniere_connexion && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <span style={{ color: palette.gray600, fontWeight: '500' }}>Dernière connexion:</span>
                  <span style={{ color: palette.dark }}>
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

          {/* Restrictions et informations */}
          <div style={{
            backgroundColor: palette.white,
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: palette.dark,
              margin: '0 0 20px 0',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Informations importantes
            </h2>
            <div style={{
              backgroundColor: palette.gray100,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${palette.gray300}`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>ℹ️</span>
                <div>
                  <h3 style={{
                    color: palette.dark,
                    margin: '0 0 10px 0',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    Accès restreint
                  </h3>
                  <p style={{
                    color: palette.gray700,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Vous avez uniquement accès au sous-domaine <strong>{accessInfo.sous_domaine}.{accessInfo.domaine_principal}</strong>. 
                    Cet accès est lié à votre compte utilisateur et vos permissions.
                    Pour toute demande de modification d'accès, veuillez contacter votre administrateur.
                  </p>
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

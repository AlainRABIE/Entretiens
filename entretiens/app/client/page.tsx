"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { palettes, Sidebar, Header, useUserRole } from "../components/SharedComponents";

const ClientPage = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>("light");
  
  const router = useRouter();
  const { userEmail, userRole, loading: roleLoading } = useUserRole();
  const palette = palettes[theme];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    // Vérifier l'authentification
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  if (loading || roleLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background
      }}>
        <div style={{
          backgroundColor: palette.white,
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: palette.gray100, 
      paddingTop: 64, 
      color: theme === 'dark' ? palette.white : palette.dark 
    }}>
      {/* Header */}
      <Header
        title="Espace Client"
        userEmail={userEmail}
        theme={theme}
        setTheme={setTheme}
        palette={palette}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogout}
        open={sidebarOpen}
        palette={palette}
        role={userRole || 2}
      />

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen ? 220 : 0,
        transition: "margin-left 0.3s cubic-bezier(.4,2,.6,1)",
        padding: "32px",
        minHeight: "calc(100vh - 64px)"
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            background: palette.white,
            borderRadius: 12,
            padding: 32,
            marginBottom: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }}>
            <h1 style={{ 
              marginTop: 0, 
              marginBottom: 16, 
              color: palette.dark,
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              Bienvenue dans votre espace client
            </h1>
            <p style={{ 
              color: palette.gray600,
              fontSize: '16px',
              lineHeight: 1.6
            }}>
              Vous êtes connecté en tant que <strong>{userEmail}</strong> avec le rôle <strong>{userRole === 2 ? 'Utilisateur Standard' : 'Administrateur'}</strong>
            </p>
          </div>

          {/* Cards informationnelles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: palette.white,
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: `3px solid ${palette.primary}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
              <h3 style={{ margin: '0 0 8px 0', color: palette.dark }}>Mon Profil</h3>
              <p style={{ color: palette.gray600, marginBottom: '16px' }}>
                Gérez vos informations personnelles
              </p>
              <a 
                href="/profil"
                style={{
                  display: 'inline-block',
                  background: palette.primary,
                  color: palette.white,
                  padding: '8px 16px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Voir mon profil
              </a>
            </div>

            <div style={{
              background: palette.white,
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: `3px solid ${palette.success}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
              <h3 style={{ margin: '0 0 8px 0', color: palette.dark }}>Mes Domaines</h3>
              <p style={{ color: palette.gray600, marginBottom: '16px' }}>
                Accédez à vos domaines et sous-domaines
              </p>
              <a 
                href="/sous-domaine"
                style={{
                  display: 'inline-block',
                  background: palette.success,
                  color: palette.white,
                  padding: '8px 16px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Voir mes domaines
              </a>
            </div>

            {userRole === 1 && (
              <div style={{
                background: palette.white,
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: `3px solid ${palette.warning}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <h3 style={{ margin: '0 0 8px 0', color: palette.dark }}>Gestion des Utilisateurs</h3>
                <p style={{ color: palette.gray600, marginBottom: '16px' }}>
                  Gérez les utilisateurs de la plateforme
                </p>
                <a 
                  href="/Utilisateur"
                  style={{
                    display: 'inline-block',
                    background: palette.warning,
                    color: palette.white,
                    padding: '8px 16px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Gérer les utilisateurs
                </a>
              </div>
            )}
          </div>

          {/* Informations sur la sidebar */}
          <div style={{
            background: palette.white,
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: 16, 
              color: palette.dark 
            }}>
              Navigation adaptative
            </h3>
            <p style={{ color: palette.gray600, lineHeight: 1.6 }}>
              La sidebar s'adapte automatiquement à votre rôle :
            </p>
            <ul style={{ color: palette.gray600, lineHeight: 1.8 }}>
              <li><strong>Administrateurs</strong> : Accès à la gestion des utilisateurs, sous-domaines, et toutes les fonctionnalités</li>
              <li><strong>Utilisateurs Standards</strong> : Accès au profil et aux domaines personnels</li>
            </ul>
            <div style={{
              background: palette.gray100,
              padding: '16px',
              borderRadius: 8,
              marginTop: '16px'
            }}>
              <strong style={{ color: palette.dark }}>Votre rôle actuel :</strong> 
              <span style={{ 
                color: userRole === 1 ? palette.primary : palette.success,
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {userRole === 1 ? '👑 Administrateur' : '👤 Utilisateur Standard'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPage;

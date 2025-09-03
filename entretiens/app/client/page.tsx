"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

const ClientDomainePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  const palettes = {
    client: {
      primary: "#2563eb",
      secondary: "#f1f5f9",
      accent: "#dbeafe",
      success: "#059669",
      info: "#0891b2",
      warning: "#d97706",
      danger: "#dc2626",
      light: "#f8fafc",
      dark: "#0f172a",
      gray100: "#f1f5f9",
      gray200: "#e2e8f0",
      gray300: "#cbd5e1",
      gray400: "#94a3b8",
      gray500: "#64748b",
      gray600: "#475569",
      gray700: "#334155",
      gray800: "#1e293b",
      gray900: "#0f172a",
      white: "#ffffff",
      background: "#f8fafc"
    }
  };

  const theme = palettes.client;

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        setHasAccess(false);
        setLoading(false);
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
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setUser(userData);
      
      // Vérifier l'accès au sous-domaine client
      // Dans un vrai projet, cette logique serait plus complexe
      const allowedSousdomaines = ['client', 'client.Carpe Diem IT.com'];
      const userHasClientAccess = userData.actif && 
        (userData.sous_domaine === 'client' || allowedSousdomaines.includes(userData.sous_domaine));
      
      setHasAccess(userHasClientAccess);
    } catch (error) {
      console.error('Erreur:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background
      }}>
        <div style={{
          padding: '30px',
          borderRadius: '12px',
          backgroundColor: theme.white,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${theme.gray300}`,
            borderTop: `4px solid ${theme.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <p style={{ color: theme.dark, margin: 0 }}>Vérification des accès...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '40px',
          borderRadius: '12px',
          backgroundColor: theme.white,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
          <h1 style={{
            color: theme.danger,
            margin: '0 0 15px 0',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Accès Refusé
          </h1>
          <p style={{
            color: theme.gray600,
            margin: '0 0 25px 0',
            lineHeight: '1.6'
          }}>
            Vous n'avez pas l'autorisation d'accéder au domaine client.Carpe Diem IT.com. 
            Veuillez contacter votre administrateur pour obtenir les permissions nécessaires.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/Utilisateur')}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.primary,
                color: theme.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Retour au tableau de bord
            </button>
            <button
              onClick={() => router.push('/sous-domaine')}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.gray400,
                color: theme.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Voir mes accès
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.background
    }}>
      {/* Header spécifique au domaine client */}
      <header style={{
        backgroundColor: theme.primary,
        color: theme.white,
        padding: '20px 0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '600'
            }}>
              🏢 Client Portal
            </h1>
            <span style={{
              backgroundColor: theme.success,
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              client.Carpe Diem IT.com
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px' }}>
              Bonjour, {user?.prenom} {user?.nom}
            </span>
            <button
              onClick={() => router.push('/Utilisateur')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: theme.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Message d'accueil */}
        <div style={{
          backgroundColor: theme.white,
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🎉</span>
            <div>
              <h2 style={{
                color: theme.dark,
                margin: '0 0 5px 0',
                fontSize: '22px',
                fontWeight: '600'
              }}>
                Bienvenue sur votre espace client !
              </h2>
              <p style={{
                color: theme.gray600,
                margin: 0
              }}>
                Vous accédez maintenant exclusivement au domaine client.
              </p>
            </div>
          </div>
          <div style={{
            backgroundColor: theme.accent,
            padding: '15px',
            borderRadius: '8px',
            border: `1px solid ${theme.primary}`
          }}>
            <p style={{
              color: theme.dark,
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <strong>Accès confirmé :</strong> Vous êtes connecté au sous-domaine client avec les permissions appropriées. 
              Cette interface est spécifiquement conçue pour les utilisateurs ayant accès au portail client.
            </p>
          </div>
        </div>

        {/* Sections du portail client */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Section Documents */}
          <div style={{
            backgroundColor: theme.white,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px' }}>📄</span>
              <h3 style={{
                color: theme.dark,
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Mes Documents
              </h3>
            </div>
            <p style={{
              color: theme.gray600,
              margin: '0 0 15px 0',
              fontSize: '14px'
            }}>
              Accédez à tous vos documents et fichiers partagés.
            </p>
            <button style={{
              width: '100%',
              padding: '10px',
              backgroundColor: theme.primary,
              color: theme.white,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Voir les documents
            </button>
          </div>

          {/* Section Factures */}
          <div style={{
            backgroundColor: theme.white,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px' }}>💰</span>
              <h3 style={{
                color: theme.dark,
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Facturation
              </h3>
            </div>
            <p style={{
              color: theme.gray600,
              margin: '0 0 15px 0',
              fontSize: '14px'
            }}>
              Consultez vos factures et historique de paiements.
            </p>
            <button style={{
              width: '100%',
              padding: '10px',
              backgroundColor: theme.success,
              color: theme.white,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Voir les factures
            </button>
          </div>

          {/* Section Support */}
          <div style={{
            backgroundColor: theme.white,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px' }}>🎧</span>
              <h3 style={{
                color: theme.dark,
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Support Client
              </h3>
            </div>
            <p style={{
              color: theme.gray600,
              margin: '0 0 15px 0',
              fontSize: '14px'
            }}>
              Besoin d'aide ? Contactez notre équipe support.
            </p>
            <button style={{
              width: '100%',
              padding: '10px',
              backgroundColor: theme.warning,
              color: theme.white,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Contacter le support
            </button>
          </div>
        </div>

        {/* Informations de connexion */}
        <div style={{
          backgroundColor: theme.white,
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            color: theme.dark,
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Informations de session
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <span style={{ color: theme.gray600, fontSize: '14px', fontWeight: '500' }}>Domaine actuel :</span>
              <div style={{
                color: theme.primary,
                fontWeight: '600',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}>
                client.Carpe Diem IT.com
              </div>
            </div>
            <div>
              <span style={{ color: theme.gray600, fontSize: '14px', fontWeight: '500' }}>Utilisateur :</span>
              <div style={{ color: theme.dark, fontWeight: '500', fontSize: '14px' }}>
                {user?.email}
              </div>
            </div>
            <div>
              <span style={{ color: theme.gray600, fontSize: '14px', fontWeight: '500' }}>Statut :</span>
              <div style={{
                color: theme.success,
                fontWeight: '600',
                fontSize: '14px'
              }}>
                ✅ Accès autorisé
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ClientDomainePage;

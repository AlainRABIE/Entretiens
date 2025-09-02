"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
    }
  };

  const theme = palettes.light;

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
        backgroundColor: theme.background
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: theme.white,
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
        backgroundColor: theme.background
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: theme.white,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          Utilisateur non trouvé
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: theme.white,
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          color: theme.dark,
          margin: 0,
          fontSize: '28px',
          fontWeight: '600'
        }}>
          Mon Profil
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => router.push('/Utilisateur')}
            style={{
              padding: '10px 20px',
              backgroundColor: theme.info,
              color: theme.white,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Retour
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: theme.danger,
              color: theme.white,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'grid',
        gap: '20px'
      }}>
        {/* Informations principales */}
        <div style={{
          backgroundColor: theme.white,
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
              color: theme.dark,
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
                backgroundColor: editing ? theme.gray400 : theme.primary,
                color: theme.white,
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
                  color: theme.dark,
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
                    border: `1px solid ${theme.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: theme.dark,
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
                    border: `1px solid ${theme.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: theme.dark,
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
                    border: `1px solid ${theme.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.success,
                  color: theme.white,
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
                <span style={{ color: theme.gray600, fontWeight: '500' }}>Nom:</span>
                <span style={{ color: theme.dark }}>{user.nom}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme.gray600, fontWeight: '500' }}>Prénom:</span>
                <span style={{ color: theme.dark }}>{user.prenom}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme.gray600, fontWeight: '500' }}>Email:</span>
                <span style={{ color: theme.dark }}>{user.email}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span style={{ color: theme.gray600, fontWeight: '500' }}>Rôle:</span>
                <span style={{
                  color: theme.dark,
                  padding: '4px 12px',
                  backgroundColor: theme.accent,
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
                <span style={{ color: theme.gray600, fontWeight: '500' }}>Statut:</span>
                <span style={{
                  color: user.actif ? theme.success : theme.danger,
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
          backgroundColor: theme.white,
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            color: theme.dark,
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
              <span style={{ color: theme.gray600, fontWeight: '500' }}>ID Utilisateur:</span>
              <span style={{ color: theme.dark, fontFamily: 'monospace' }}>{user.id}</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '10px',
              alignItems: 'center'
            }}>
              <span style={{ color: theme.gray600, fontWeight: '500' }}>Sous-domaine:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: theme.dark }}>
                  {user.sous_domaine || 'Non assigné'}
                </span>
                {user.sous_domaine && (
                  <button
                    onClick={() => router.push('/sous-domaine')}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: theme.info,
                      color: theme.white,
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
              <span style={{ color: theme.gray600, fontWeight: '500' }}>Créé le:</span>
              <span style={{ color: theme.dark }}>
                {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;

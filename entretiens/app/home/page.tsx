import React from 'react';

export default function HomePage() {
  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 32, textAlign: 'center' }}>
      <h1>Bienvenue sur l'application de gestion de rôles</h1>
      <p>Connectez-vous ou inscrivez-vous pour commencer.</p>
      <div style={{ marginTop: 32 }}>
        <a href="/login" style={{ marginRight: 16 }}>Connexion</a>
        <a href="/register">Inscription</a>
      </div>
    </div>
  );
}

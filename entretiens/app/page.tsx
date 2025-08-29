export default function HomePage() {
  return (
    <div className="centered-container">
      <div className="modern-card" style={{ textAlign: 'center' }}>
        <h1>Bienvenue 👋</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2.2rem', color: '#b3b3b3' }}>
          Application moderne de gestion de rôles.<br />
          Connectez-vous ou inscrivez-vous pour commencer !
        </p>
        <div className="modern-links">
          <a href="/login" className="modern-link">Connexion</a>
          <a href="/register" className="modern-link">Inscription</a>
        </div>
      </div>
    </div>
  );
}

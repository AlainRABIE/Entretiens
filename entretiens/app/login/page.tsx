export default function LoginPage() {
  return (
    <div className="centered-container">
      <div className="modern-card">
        <h2>Connexion</h2>
        <form className="modern-form">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required autoComplete="username" />
          <label htmlFor="password">Mot de passe</label>
          <input type="password" id="password" name="password" required autoComplete="current-password" />
          <button type="submit" className="modern-btn">Se connecter</button>
        </form>
        <div className="modern-links" style={{ marginTop: '1.5rem' }}>
          <span style={{ color: '#b3b3b3' }}>Pas de compte ?</span>
          <a href="/register" className="modern-link">Inscription</a>
        </div>
      </div>
    </div>
  );
}

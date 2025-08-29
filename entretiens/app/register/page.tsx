export default function RegisterPage() {
  return (
    <div className="centered-container">
      <div className="modern-card">
        <h2>Inscription</h2>
        <form className="modern-form">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required autoComplete="username" />
          <label htmlFor="password">Mot de passe</label>
          <input type="password" id="password" name="password" required autoComplete="new-password" />
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required autoComplete="new-password" />
          <button type="submit" className="modern-btn">S'inscrire</button>
        </form>
        <div className="modern-links" style={{ marginTop: '1.5rem' }}>
          <span style={{ color: '#b3b3b3' }}>Déjà un compte ?</span>
          <a href="/login" className="modern-link">Connexion</a>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      // Si login OK => redirection vers le portail
      navigate('/app', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Impossible de se connecter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-2">Connexion Ottomate</h1>
        <p className="text-sm text-slate-400 mb-6">
          Connecte-toi pour accéder à ton portail (leads, mailing, bots, etc.).
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/60 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed py-2.5 text-sm font-semibold"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-slate-400">
          <Link to="/reset-password" className="hover:text-emerald-400">
            Mot de passe oublié ?
          </Link>
          <Link to="/register" className="hover:text-emerald-400">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

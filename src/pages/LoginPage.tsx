import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { BorderBeam } from '@/components/magicui/border-beam';
import { DotPattern } from '@/components/magicui/dot-pattern';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/app');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <DotPattern className="absolute inset-0 opacity-15" />

      <div className="relative w-full max-w-md">
        <Card className="bg-card-bg border-border relative overflow-hidden">
          <BorderBeam size={150} duration={12} />
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-text-primary">Connexion</CardTitle>
            <CardDescription className="text-text-secondary">
              Connectez-vous à votre compte Ottomate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-secondary">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-text-secondary">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border text-text-primary"
                />
              </div>
              <ShimmerButton
                type="submit"
                className="w-full py-2.5 text-sm font-semibold"
                onClick={handleSubmit}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </ShimmerButton>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <Link
                to="/reset-password"
                className="block text-text-secondary hover:text-primary transition-colors"
              >
                Mot de passe oublié ?
              </Link>
              <p className="text-text-muted">
                Pas de compte ?{' '}
                <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                  S'inscrire
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { DotPattern } from '@/components/magicui/dot-pattern';

const requestSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('type=recovery')) {
      setHasToken(true);
    }
  }, []);

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const handleRequestReset = async (data: RequestForm) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la demande';
      toast({ variant: 'destructive', title: 'Erreur', description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (data: ResetForm) => {
    setLoading(true);
    try {
      await updatePassword(data.password);
      toast({
        title: 'Mot de passe mis à jour',
        description: 'Vous pouvez maintenant vous connecter.',
      });
      navigate('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      toast({ variant: 'destructive', title: 'Erreur', description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <DotPattern className="absolute inset-0 opacity-15" />

      <div className="relative w-full max-w-md">
        <Card className="bg-card-bg border-border">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-text-primary">
              {hasToken ? 'Nouveau mot de passe' : 'Réinitialiser le mot de passe'}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              {hasToken
                ? 'Choisissez un nouveau mot de passe'
                : 'Entrez votre email pour recevoir un lien de réinitialisation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasToken ? (
              <form onSubmit={resetForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-text-secondary">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...resetForm.register('password')}
                    className="bg-background border-border text-text-primary"
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-xs text-danger">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-text-secondary">
                    Confirmer
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...resetForm.register('confirmPassword')}
                    className="bg-background border-border text-text-primary"
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-danger">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <ShimmerButton type="submit" className="w-full py-2.5 text-sm font-semibold">
                  {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </ShimmerButton>
              </form>
            ) : (
              <form
                onSubmit={requestForm.handleSubmit(handleRequestReset)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    {...requestForm.register('email')}
                    className="bg-background border-border text-text-primary"
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-xs text-danger">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <ShimmerButton type="submit" className="w-full py-2.5 text-sm font-semibold">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </ShimmerButton>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-text-muted">
              <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                Retour à la connexion
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { BorderBeam } from '@/components/magicui/border-beam';
import { DotPattern } from '@/components/magicui/dot-pattern';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast({
        title: 'Compte créé !',
        description: 'Vérifiez votre email pour confirmer votre compte.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
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
            <CardTitle className="text-2xl text-text-primary">Créer un compte</CardTitle>
            <CardDescription className="text-text-secondary">
              Commencez à automatiser votre prospection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-text-secondary">Nom complet</Label>
                <Input
                  id="fullName"
                  placeholder="Jean Dupont"
                  {...register('fullName')}
                  className="bg-background border-border text-text-primary"
                />
                {errors.fullName && (
                  <p className="text-xs text-danger">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-secondary">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  {...register('email')}
                  className="bg-background border-border text-text-primary"
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-text-secondary">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="bg-background border-border text-text-primary"
                />
                {errors.password && (
                  <p className="text-xs text-danger">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-text-secondary">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="bg-background border-border text-text-primary"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
                )}
              </div>
              <ShimmerButton
                type="submit"
                className="w-full py-2.5 text-sm font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </ShimmerButton>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

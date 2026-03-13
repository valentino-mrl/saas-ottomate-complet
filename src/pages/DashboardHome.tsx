import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MagicCard } from '@/components/magicui/magic-card';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { BlurFade } from '@/components/magicui/blur-fade';

const stats = [
  {
    label: 'Leads ce mois',
    value: 342,
    delta: '+12%',
    icon: UserGroupIcon,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Emails envoyés',
    value: 1250,
    delta: '+8%',
    icon: EnvelopeIcon,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Appels IA',
    value: 89,
    delta: '+24%',
    icon: PhoneIcon,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Campagnes actives',
    value: 5,
    delta: '+2',
    icon: MegaphoneIcon,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
];

const quickActions = [
  {
    label: 'Générer des Leads',
    icon: UserGroupIcon,
    to: '/app/leads',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    label: 'Créer un Template',
    icon: EnvelopeIcon,
    to: '/app/mail-templates',
    color: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    label: 'Config Voice Bot',
    icon: PhoneIcon,
    to: '/app/voice-bot',
    color: 'from-violet-500/20 to-violet-600/5',
  },
  {
    label: 'Config Réceptionniste',
    icon: UserIcon,
    to: '/app/receptionist',
    color: 'from-pink-500/20 to-pink-600/5',
  },
  {
    label: 'Voir Analytics',
    icon: ChartBarIcon,
    to: '/app/analytics',
    color: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    label: 'Lancer Campagne',
    icon: MegaphoneIcon,
    to: '/app/campaigns',
    color: 'from-orange-500/20 to-orange-600/5',
  },
  {
    label: 'Gérer Billing',
    icon: CreditCardIcon,
    to: '/app/billing',
    color: 'from-yellow-500/20 to-yellow-600/5',
  },
];

const gettingStartedSteps = [
  'Créer votre compte',
  'Configurer votre Voice Bot',
  'Générer vos premiers leads',
  'Créer un template email',
  'Lancer votre première campagne',
];

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Utilisateur';
  const completedSteps = 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <SparklesText text={`Bonjour, ${firstName} 👋`} />
            </h1>
            <p className="text-text-secondary mt-1">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary w-fit">
            Plan {profile?.plan || 'Free'}
          </Badge>
        </div>
      </BlurFade>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <BlurFade key={stat.label} delay={0.1 + i * 0.05}>
            <MagicCard className="bg-card-bg border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-success">{stat.delta}</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                <NumberTicker value={stat.value} />
              </div>
              <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
            </MagicCard>
          </BlurFade>
        ))}
      </div>

      {/* Quick Actions */}
      <BlurFade delay={0.3}>
        <div>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">Actions rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to}>
                <MagicCard className="bg-card-bg border border-border rounded-xl p-5 h-full hover:border-primary/30 transition-colors cursor-pointer">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}
                  >
                    <action.icon className="w-5 h-5 text-text-primary" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">{action.label}</p>
                </MagicCard>
              </Link>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* Getting Started */}
      <BlurFade delay={0.4}>
        <Card className="bg-card-bg border-border">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
              Démarrage rapide
            </h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Progression</span>
                <span className="text-text-secondary">
                  {completedSteps}/{gettingStartedSteps.length}
                </span>
              </div>
              <Progress
                value={(completedSteps / gettingStartedSteps.length) * 100}
                className="h-2"
              />
            </div>
            <ul className="space-y-3">
              {gettingStartedSteps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      i < completedSteps
                        ? 'bg-success text-white'
                        : 'bg-border text-text-muted'
                    }`}
                  >
                    {i < completedSteps ? '✓' : i + 1}
                  </div>
                  <span
                    className={
                      i < completedSteps
                        ? 'text-text-secondary line-through'
                        : 'text-text-primary'
                    }
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}

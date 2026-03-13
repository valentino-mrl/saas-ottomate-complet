import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  UserIcon,
  CpuChipIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { MagicCard } from '@/components/magicui/magic-card';
import { BorderBeam } from '@/components/magicui/border-beam';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { BlurFade } from '@/components/magicui/blur-fade';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { Meteors } from '@/components/magicui/meteors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const features = [
  {
    icon: UserGroupIcon,
    title: 'Génération de Leads',
    description: 'Trouvez des prospects qualifiés par secteur et localisation grâce à notre IA.',
  },
  {
    icon: EnvelopeIcon,
    title: 'Email Automation',
    description: "Créez et lancez des campagnes email personnalisées à grande échelle.",
  },
  {
    icon: PhoneIcon,
    title: 'Voice Bot IA',
    description: "Automatisez vos appels sortants avec un agent vocal intelligent.",
  },
  {
    icon: UserIcon,
    title: 'Réceptionniste IA',
    description: 'Un assistant vocal qui gère vos appels entrants et prend des rendez-vous.',
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics Avancés',
    description: 'Suivez vos KPIs en temps réel et optimisez vos campagnes.',
  },
  {
    icon: CpuChipIcon,
    title: 'Intégration N8N',
    description: 'Connectez vos workflows et automatisez vos processus métier.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '149',
    features: [
      '100 leads / mois',
      '500 emails / mois',
      '50 appels / mois',
      'Templates email',
      'Support email',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '349',
    features: [
      '1 000 leads / mois',
      'Emails illimités',
      '500 appels / mois',
      'Analytics avancés',
      'Voice Bot IA',
      'Support prioritaire',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '749',
    features: [
      'Leads illimités',
      'Emails illimités',
      'Appels illimités',
      'Support dédié',
      'Onboarding personnalisé',
      'API access',
    ],
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-lg font-bold gradient-text">Ottomate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                Se connecter
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary-hover">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <DotPattern className="absolute inset-0 opacity-20" />
        <Meteors number={15} className="opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlurFade delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge variant="outline" className="border-primary/30 px-4 py-1.5 text-sm">
                <AnimatedShinyText className="text-primary">
                  🚀 Nouveau : Voice Bot IA
                </AnimatedShinyText>
              </Badge>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <AnimatedGradientText>
                Automatisez votre prospection commerciale
              </AnimatedGradientText>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
              Générez des leads, lancez des campagnes email et des appels automatisés
              grâce à l'intelligence artificielle. Tout-en-un.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <ShimmerButton className="px-8 py-3 text-base font-semibold">
                  Démarrer gratuitement
                </ShimmerButton>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="px-8 py-3 text-base border-border hover:bg-white/5"
                >
                  Voir la démo
                </Button>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Une plateforme complète pour automatiser votre prospection commerciale de A à Z.
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <BlurFade key={feature.title} delay={0.1 + i * 0.1}>
                <MagicCard className="p-6 h-full bg-card-bg border border-border rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {feature.description}
                  </p>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 relative">
        <GridPattern className="absolute inset-0 opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <BlurFade delay={0.1}>
              <div className="p-8">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  <NumberTicker value={10000} />+
                </div>
                <p className="text-text-secondary">Leads générés</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.2}>
              <div className="p-8">
                <div className="text-4xl sm:text-5xl font-bold text-accent mb-2">
                  <NumberTicker value={98} />%
                </div>
                <p className="text-text-secondary">Taux de délivrabilité</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.3}>
              <div className="p-8">
                <div className="text-4xl sm:text-5xl font-bold text-success mb-2">
                  <NumberTicker value={5} />x
                </div>
                <p className="text-text-secondary">ROI moyen</p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Tarifs simples et transparents
              </h2>
              <p className="text-text-secondary text-lg">
                Choisissez le plan adapté à vos besoins.
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <BlurFade key={plan.name} delay={0.1 + i * 0.1}>
                <div
                  className={`relative rounded-xl p-8 ${
                    plan.highlighted
                      ? 'bg-card-bg border-2 border-primary'
                      : 'bg-card-bg border border-border'
                  }`}
                >
                  {plan.highlighted && <BorderBeam size={200} duration={12} />}
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
                      Recommandé
                    </Badge>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-text-muted">/mois</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckIcon className="w-4 h-4 text-success flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    {plan.highlighted ? (
                      <ShimmerButton className="w-full py-2.5 text-sm font-semibold">
                        Passer au {plan.name}
                      </ShimmerButton>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-border hover:bg-white/5"
                      >
                        Choisir {plan.name}
                      </Button>
                    )}
                  </Link>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-xs">O</span>
              </div>
              <span className="font-semibold gradient-text">Ottomate</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <Link to="/login" className="hover:text-text-primary transition-colors">
                Connexion
              </Link>
              <Link to="/register" className="hover:text-text-primary transition-colors">
                Inscription
              </Link>
            </div>
            <p className="text-sm text-text-muted">
              © 2024 Ottomate. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

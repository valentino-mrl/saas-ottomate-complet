import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { voiceBotApi, voiceBotPhoneApi, type VoiceBotConfigInput } from '@/lib/apiClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { BlurFade } from '@/components/magicui/blur-fade';
import { PhoneIcon } from '@heroicons/react/24/outline';

const DAYS = [
  { key: 1, label: 'Lun' },
  { key: 2, label: 'Mar' },
  { key: 3, label: 'Mer' },
  { key: 4, label: 'Jeu' },
  { key: 5, label: 'Ven' },
  { key: 6, label: 'Sam' },
  { key: 0, label: 'Dim' },
];

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'es', label: 'Espagnol' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'pt', label: 'Portugais' },
];

const defaultConfig: VoiceBotConfigInput = {
  enabled: false,
  agentId: '',
  agentPhoneNumberId: '',
  defaultTestNumber: '',
  firstMessage: '',
  script: '',
  language: 'fr',
  schedule: {
    enabled: false,
    timezone: 'Europe/Paris',
    start_time: '09:00',
    end_time: '18:00',
    days_of_week: [1, 2, 3, 4, 5],
  },
  maxCallsPerDay: 50,
};

export default function VoiceBotConfigPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const clientId = user?.id || '';

  const [config, setConfig] = useState<VoiceBotConfigInput>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testingCall, setTestingCall] = useState(false);
  const [buyingPhone, setBuyingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    loadConfig();
  }, [clientId]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await voiceBotApi.getConfig(clientId);
      if (data) {
        setConfig({
          ...defaultConfig,
          ...data,
          schedule: { ...defaultConfig.schedule, ...(data.schedule || {}) },
        });
      }
    } catch {
      // Config may not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.agentId || !config.script || !config.firstMessage) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Agent ID, premier message et script sont obligatoires.',
      });
      return;
    }
    setSaving(true);
    try {
      await voiceBotApi.saveConfig(clientId, config);
      toast({ title: 'Configuration sauvegardée' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      toast({ variant: 'destructive', title: 'Erreur', description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestCall = async () => {
    if (!testNumber) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Entrez un numéro de test.' });
      return;
    }
    setTestingCall(true);
    try {
      const res = await fetch('/api/voice-bot/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: testNumber, agent_id: config.agentId }),
      });
      if (!res.ok) throw new Error('Échec du test');
      toast({ title: 'Appel test lancé', description: `Appel vers ${testNumber}` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'appel test";
      toast({ variant: 'destructive', title: 'Erreur', description: message });
    } finally {
      setTestingCall(false);
    }
  };

  const handleBuyPhone = async () => {
    setBuyingPhone(true);
    try {
      const result = await voiceBotPhoneApi.buy({ client_id: clientId, doPurchase: true });
      const num =
        result.twilioPhoneNumber || result.twilio_phone_number || result.twilio?.phoneNumber;
      if (num) {
        setPhoneNumber(num);
        toast({ title: 'Numéro acheté', description: num });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'achat";
      toast({ variant: 'destructive', title: 'Erreur', description: message });
    } finally {
      setBuyingPhone(false);
    }
  };

  const toggleDay = (day: number) => {
    const days = config.schedule.days_of_week;
    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    setConfig({
      ...config,
      schedule: { ...config.schedule, days_of_week: newDays },
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Voice Bot IA</h1>
            <p className="text-text-secondary mt-1">
              Configurez votre bot vocal pour les appels sortants
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
            />
            {config.enabled ? (
              <AnimatedShinyText className="text-success font-medium">
                🟢 Actif
              </AnimatedShinyText>
            ) : (
              <span className="text-text-muted text-sm">Désactivé</span>
            )}
          </div>
        </div>
      </BlurFade>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="bg-card-bg border border-border">
          <TabsTrigger value="config">Configuration IA</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="phone">Numéro de téléphone</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        {/* Configuration IA */}
        <TabsContent value="config" className="space-y-6">
          <BlurFade delay={0.1}>
            <Card className="bg-card-bg border-border">
              <CardHeader>
                <CardTitle className="text-text-primary">Paramètres de l'agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Agent ID (ElevenLabs)</Label>
                    <Input
                      value={config.agentId || ''}
                      onChange={(e) => setConfig({ ...config, agentId: e.target.value })}
                      placeholder="agent_..."
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Agent Phone Number ID</Label>
                    <Input
                      value={config.agentPhoneNumberId || ''}
                      onChange={(e) => setConfig({ ...config, agentPhoneNumberId: e.target.value })}
                      placeholder="phone_..."
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-text-secondary">Premier message</Label>
                  <Textarea
                    value={config.firstMessage || ''}
                    onChange={(e) => setConfig({ ...config, firstMessage: e.target.value })}
                    placeholder="Bonjour, je suis l'assistant vocal de..."
                    className="bg-background border-border text-text-primary min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-text-secondary">Script d'appel complet</Label>
                  <Textarea
                    value={config.script}
                    onChange={(e) => setConfig({ ...config, script: e.target.value })}
                    placeholder="Instructions détaillées pour l'agent vocal..."
                    className="bg-background border-border text-text-primary min-h-[200px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Langue</Label>
                    <Select
                      value={config.language}
                      onValueChange={(language) => setConfig({ ...config, language })}
                    >
                      <SelectTrigger className="bg-background border-border text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card-bg border-border">
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Numéro de test par défaut</Label>
                    <Input
                      value={config.defaultTestNumber || ''}
                      onChange={(e) => setConfig({ ...config, defaultTestNumber: e.target.value })}
                      placeholder="+33612345678"
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </TabsContent>

        {/* Planning */}
        <TabsContent value="planning" className="space-y-6">
          <BlurFade delay={0.1}>
            <Card className="bg-card-bg border-border">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-3">
                  Plages horaires
                  <Switch
                    checked={config.schedule.enabled}
                    onCheckedChange={(enabled) =>
                      setConfig({
                        ...config,
                        schedule: { ...config.schedule, enabled },
                      })
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-text-secondary">Fuseau horaire</Label>
                  <Select
                    value={config.schedule.timezone}
                    onValueChange={(timezone) =>
                      setConfig({
                        ...config,
                        schedule: { ...config.schedule, timezone },
                      })
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card-bg border-border">
                      {['Europe/Paris', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'].map(
                        (tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Heure début</Label>
                    <Input
                      type="time"
                      value={config.schedule.start_time}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          schedule: { ...config.schedule, start_time: e.target.value },
                        })
                      }
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Heure fin</Label>
                    <Input
                      type="time"
                      value={config.schedule.end_time}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          schedule: { ...config.schedule, end_time: e.target.value },
                        })
                      }
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-text-secondary">Jours de la semaine</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.key}
                        onClick={() => toggleDay(day.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.schedule.days_of_week.includes(day.key)
                            ? 'bg-primary text-white'
                            : 'bg-background border border-border text-text-secondary hover:bg-white/5'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-text-secondary">Appels max par jour</Label>
                  <Input
                    type="number"
                    value={config.maxCallsPerDay}
                    onChange={(e) =>
                      setConfig({ ...config, maxCallsPerDay: parseInt(e.target.value) || 0 })
                    }
                    className="bg-background border-border text-text-primary w-32"
                  />
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </TabsContent>

        {/* Phone */}
        <TabsContent value="phone" className="space-y-6">
          <BlurFade delay={0.1}>
            <Card className="bg-card-bg border-border">
              <CardHeader>
                <CardTitle className="text-text-primary">Numéro Twilio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {phoneNumber ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                    <PhoneIcon className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-text-primary font-medium">{phoneNumber}</p>
                      <p className="text-text-secondary text-sm">Numéro actif</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-secondary">Aucun numéro acheté pour ce compte.</p>
                )}

                <Separator className="bg-border" />

                <div>
                  <p className="text-sm text-text-secondary mb-4">
                    Achetez un numéro de téléphone Twilio pour votre Voice Bot.
                  </p>
                  <Button
                    onClick={handleBuyPhone}
                    disabled={buyingPhone}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    {buyingPhone ? 'Achat en cours...' : 'Acheter un numéro'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </TabsContent>

        {/* Test */}
        <TabsContent value="test" className="space-y-6">
          <BlurFade delay={0.1}>
            <Card className="bg-card-bg border-border">
              <CardHeader>
                <CardTitle className="text-text-primary">Appel test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    placeholder="+33612345678"
                    className="bg-background border-border text-text-primary flex-1"
                  />
                  <Button
                    onClick={handleTestCall}
                    disabled={testingCall || !config.agentId}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    {testingCall ? 'Appel...' : 'Lancer un appel test'}
                  </Button>
                </div>
                {!config.agentId && (
                  <p className="text-xs text-warning">
                    Configurez d'abord un Agent ID dans l'onglet Configuration.
                  </p>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        </TabsContent>
      </Tabs>

      {/* Save */}
      <div className="flex justify-end">
        <ShimmerButton
          onClick={handleSave}
          className="px-8 py-2.5 text-sm font-semibold"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </ShimmerButton>
      </div>
    </div>
  );
}

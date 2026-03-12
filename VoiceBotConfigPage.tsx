// src/features/voice-bot/VoiceBotConfigPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voiceBotApi, voiceBotPhoneApi, type VoiceBotConfigInput } from '../../lib/apiClient';
import {
  CheckIcon,
  PhoneIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient';

const ELEVENLABS_AGENT_URL =
  'https://elevenlabs.io/app/talk-to?agent_id=agent_';

type UiVoiceBotConfig = VoiceBotConfigInput & {
  enabled: boolean;
  agentId: string;
  agentPhoneNumberId: string;
  defaultTestNumber: string;
  firstMessage: string;

  // Optionnels (si ton backend les renvoie)
  twilioPhoneNumber?: string;
  twilioPhoneSid?: string;
};

type ValidationErrors = {
  agentId?: string;
  agentPhoneNumberId?: string;
  script?: string;
  firstMessage?: string;
};

const daysOfWeek = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

function VoiceBotConfigPage() {
  const queryClient = useQueryClient();

  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 🔐 récup user supabase
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;

        if (error) {
          console.warn('Erreur getUser supabase:', error.message);
          setClientId(null);
        } else if (data?.user) {
          setClientId(data.user.id);
        } else {
          setClientId(null);
        }
      } catch (err) {
        console.error('Erreur inattendue getUser supabase:', err);
        if (!cancelled) setClientId(null);
      } finally {
        if (!cancelled) setIsLoadingUser(false);
      }
    };

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🧱 valeurs par défaut (si pas encore de config côté DB)
  const [config, setConfig] = useState<UiVoiceBotConfig>({
    enabled: true,

    // ⚠️ IMPORTANT : nouveaux users voient ça VIDE
    agentId: '',
    agentPhoneNumberId: '',
    defaultTestNumber: '',
    firstMessage: '',

    // script rempli par GET backend si existant
    script: '',
    language: 'fr',
    schedule: {
      enabled: true,
      timezone: 'Europe/Paris',
      start_time: '09:00',
      end_time: '18:00',
      days_of_week: [1, 2, 3, 4, 5],
    },
    maxCallsPerDay: 100,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [testNumber, setTestNumber] = useState('');
  const [lastTestResult, setLastTestResult] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  // ✅ NEW: achat numéro
  const [searchCriteria] = useState<string>('');
  const [lastBuyResult, setLastBuyResult] = useState<string | null>(null);

  // 🔄 GET /api/voice-bot/config?client_id=...
  const {
    data: savedConfig,
    isLoading: isLoadingConfig,
  } = useQuery<VoiceBotConfigInput>({
    queryKey: ['voice-bot-config', clientId],
    enabled: !!clientId && !isLoadingUser,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      if (!clientId) throw new Error('clientId manquant');
      return voiceBotApi.getConfig(clientId);
    },
  });

  // injection DB → state UI
  useEffect(() => {
    if (!savedConfig) return;

    setConfig((prev) => ({
      ...prev,
      ...savedConfig,
      enabled: (savedConfig as any).enabled ?? prev.enabled ?? true,
      agentId:
        (savedConfig as any).agentId ??
        (savedConfig as any).agent_id ??
        prev.agentId,
      agentPhoneNumberId:
        (savedConfig as any).agentPhoneNumberId ??
        (savedConfig as any).agent_phone_number_id ??
        prev.agentPhoneNumberId,
      defaultTestNumber:
        (savedConfig as any).defaultTestNumber ??
        (savedConfig as any).default_test_number ??
        prev.defaultTestNumber,
      firstMessage:
        (savedConfig as any).firstMessage ??
        (savedConfig as any).first_message ??
        prev.firstMessage,

      // optionnels
      twilioPhoneNumber:
        (savedConfig as any).twilioPhoneNumber ??
        (savedConfig as any).twilio_phone_number ??
        prev.twilioPhoneNumber,
      twilioPhoneSid:
        (savedConfig as any).twilioPhoneSid ??
        (savedConfig as any).twilio_phone_sid ??
        prev.twilioPhoneSid,
    }));
  }, [savedConfig]);

  // numéro test auto depuis DB si présent
  useEffect(() => {
    if (!testNumber && config.defaultTestNumber) {
      setTestNumber(config.defaultTestNumber);
    }
  }, [config.defaultTestNumber, testNumber]);

  // 💾 save config → POST /api/voice-bot/config
  const saveMutation = useMutation({
    mutationFn: async (configData: UiVoiceBotConfig) => {
      if (!clientId) throw new Error('Impossible de sauvegarder : clientId manquant');
      return voiceBotApi.saveConfig(clientId, configData as VoiceBotConfigInput);
    },
    onSuccess: () => {
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ['voice-bot-config', clientId] });
      }
      alert('Configuration du bot vocal sauvegardée ✅');
    },
    onError: (error: any) => {
      console.error(error);
      alert("Erreur lors de la sauvegarde de la configuration du bot vocal.");
    },
  });

  // 📞 appel test → /api/voice-bot/test-call
  const testCallMutation = useMutation({
    mutationFn: async (payload: { toNumber: string }) => {
      const res = await fetch('/api/voice-bot/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          client_id: clientId ?? undefined,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${txt}`);
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      setLastTestResult(
        data?.call_id
          ? `Appel test déclenché (call_id: ${data.call_id})`
          : 'Appel test déclenché ✔'
      );
    },
    onError: (error: any) => {
      console.error(error);
      const msg =
        (error as any)?.message ||
        "Erreur lors de l'appel test vers ElevenLabs (voir console).";
      setLastTestResult(msg);
    },
  });

  // ✅ NEW: acheter un numéro +334 (Twilio) + import ElevenLabs + assign agent + save DB
  // const buyPhoneMutation = useMutation({
  //   mutationFn: async () => {
  //     const res = await fetch('/api/voice-bot/phone/buy', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         client_id: clientId ?? undefined,
  //         doPurchase: true,
  //         // optionnel
  //         searchCriteria: (searchCriteria || '').trim() || undefined,
  //       }),
  //     });

  //     if (!res.ok) {
  //       const txt = await res.text().catch(() => '');
  //       throw new Error(`HTTP ${res.status} ${txt}`);
  //     }
  //     return res.json();
  //   },
  //   onSuccess: (data: any) => {
  //     // data contient normalement: agentPhoneNumberId, twilio, etc.
  //     const phoneId =
  //       data?.agentPhoneNumberId ||
  //       data?.agent_phone_number_id ||
  //       data?.agent_phone_number_id ||
  //       '';

  //     const twPhone =
  //       data?.twilio?.phoneNumber ||
  //       data?.twilioPhoneNumber ||
  //       data?.twilio_phone_number ||
  //       '';

  //     if (phoneId) {
  //       setConfig((prev) => ({
  //         ...prev,
  //         agentPhoneNumberId: phoneId,
  //         twilioPhoneNumber: twPhone || prev.twilioPhoneNumber,
  //         twilioPhoneSid: data?.twilio?.sid || data?.twilioPhoneSid || data?.twilio_phone_sid || prev.twilioPhoneSid,
  //       }));
  //     }

  //     setLastBuyResult(
  //       `✅ Numéro acheté et lié. ${
  //         twPhone ? `Twilio: ${twPhone} — ` : ''
  //       }ElevenLabs phone_id: ${phoneId || '(non renvoyé)'}`
  //     );

  //     if (clientId) {
  //       queryClient.invalidateQueries({ queryKey: ['voice-bot-config', clientId] });
  //     }
  //   },
  //   onError: (err: any) => {
  //     console.error(err);
  //     setLastBuyResult(err?.message || 'Erreur lors de l’achat du numéro (voir console).');
  //   },
  // });
const buyPhoneMutation = useMutation({
  mutationFn: async () => {
    if (!clientId) throw new Error('clientId manquant');

    return voiceBotPhoneApi.buy({
      client_id: clientId,
      doPurchase: true,
      searchCriteria: (searchCriteria || '').trim() || undefined,
    });
  },
  onSuccess: (data: any) => {
    const phoneId =
      data?.agentPhoneNumberId ||
      data?.agent_phone_number_id ||
      '';

    const twPhone =
      data?.twilio?.phoneNumber ||
      data?.twilioPhoneNumber ||
      data?.twilio_phone_number ||
      '';

    const twSid =
      data?.twilio?.sid ||
      data?.twilioPhoneSid ||
      data?.twilio_phone_sid ||
      '';

    if (phoneId) {
      setConfig((prev) => ({
        ...prev,
        agentPhoneNumberId: phoneId,
        twilioPhoneNumber: twPhone || prev.twilioPhoneNumber,
        twilioPhoneSid: twSid || prev.twilioPhoneSid,
      }));
    }

    setLastBuyResult(
      `✅ Numéro acheté et lié. ${twPhone ? `Twilio: ${twPhone} — ` : ''}ElevenLabs phone_id: ${
        phoneId || '(non renvoyé)'
      }`
    );

    if (clientId) {
      queryClient.invalidateQueries({ queryKey: ['voice-bot-config', clientId] });
    }
  },
  onError: (err: any) => {
    console.error(err);
    setLastBuyResult(err?.message || 'Erreur lors de l’achat du numéro (voir console).');
  },
});

  const handleOpenElevenLabsAgent = () => {
    window.open(ELEVENLABS_AGENT_URL, '_blank', 'noopener,noreferrer');
  };

  // validation UI
  const validateForSave = (): boolean => {
    const next: ValidationErrors = {};

    if (!config.agentId.trim()) {
      next.agentId = 'Agent ID ElevenLabs obligatoire (agent_id).';
    }
    if (!config.agentPhoneNumberId.trim()) {
      next.agentPhoneNumberId =
        'ID du numéro ElevenLabs obligatoire (agent_phone_number_id).';
    }
    if (!config.script.trim()) {
      next.script = "Script d'appel (prompt / instructions) obligatoire.";
    }
    if (!config.firstMessage.trim()) {
      next.firstMessage = 'Premier message (first_message) obligatoire.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validateForSave()) return;
    if (!clientId) {
      alert('Aucun utilisateur connecté : impossible de sauvegarder la configuration.');
      return;
    }
    saveMutation.mutate(config);
  };

  const handleToggleDay = (value: number) => {
    const exists = config.schedule.days_of_week.includes(value);
    const days = exists
      ? config.schedule.days_of_week.filter((d) => d !== value)
      : [...config.schedule.days_of_week, value];
    setConfig({
      ...config,
      schedule: { ...config.schedule, days_of_week: days },
    });
  };

  // preview payload ElevenLabs
  const elevenLabsPayload = useMemo(
    () => ({
      agent_id: config.agentId,
      agent_phone_number_id: config.agentPhoneNumberId,
      to_number: testNumber || config.defaultTestNumber || '+33...',
      conversation_initiation_client_data: {
        conversation_config_override: {
          agent: {
            first_message:
              config.firstMessage || 'Bonjour, est-ce que vous m’entendez bien ?',
            language: config.language,
            prompt: {
              prompt: config.script,
            },
          },
        },
      },
    }),
    [
      config.agentId,
      config.agentPhoneNumberId,
      config.firstMessage,
      config.language,
      config.script,
      config.defaultTestNumber,
      testNumber,
    ]
  );

  const isSaving = saveMutation.isPending;
  const isTesting = testCallMutation.isPending;
  const isBuyingPhone = buyPhoneMutation.isPending;

  const isDisabledGlobal = !clientId || isLoadingUser;

  const showLoader = (isLoadingUser || (isLoadingConfig && !!clientId));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Bot vocal commercial (ElevenLabs)
        </h1>
        <p className="text-gray-600 text-sm">
          Cette page contrôle la configuration utilisée pour ton agent d’appel ElevenLabs
          (1 agent par client Supabase, cloné automatiquement depuis l’agent admin).
        </p>

        {clientId && (
          <div className="inline-flex items-center gap-2 text-xs text-gray-700 mt-1">
            <span className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
              Client ID&nbsp;:
              <span className="font-mono ml-1">{clientId}</span>
            </span>
            {config.twilioPhoneNumber && (
              <span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                Twilio&nbsp;:
                <span className="font-mono ml-1">{config.twilioPhoneNumber}</span>
              </span>
            )}
          </div>
        )}

        {!clientId && !isLoadingUser && (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            Aucun utilisateur Supabase connecté. Connecte-toi pour configurer le bot
            vocal.
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleOpenElevenLabsAgent}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <PhoneIcon className="h-4 w-4" />
            Ouvrir l’agent ElevenLabs admin
          </button>
        </div>
      </div>

      {/* BLOC CONFIG PRINCIPAL */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {showLoader ? (
          <div className="text-center py-8 text-gray-500">
            Chargement de la configuration du bot vocal...
          </div>
        ) : (
          <>
            {/* ✅ NEW: Achat numéro Twilio */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-emerald-900">
                    Numéro d’appel
                  </h3>
                  <p className="text-[12px] text-emerald-800 mt-1">
                    Clique pour acheter un numéro français en <span className="font-mono">+334</span>
                  </p>

                   <div className="mt-3">
                     
                   </div>
                </div>

                <div className="flex flex-col items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => buyPhoneMutation.mutate()}
                    disabled={isDisabledGlobal || isBuyingPhone}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuyingPhone && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    Acheter un numéro Twilio (+334)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (clientId) queryClient.invalidateQueries({ queryKey: ['voice-bot-config', clientId] });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Recharger la config
                  </button>
                </div>
              </div>

              {lastBuyResult && (
                <div className="mt-3 text-xs text-emerald-900">
                  <span className="font-semibold">Résultat :</span> {lastBuyResult}
                </div>
              )}
            </div>

            {/* Ligne statut & IDs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Bot vocal activé
                  </span>
                </label>
                <span className="text-xs text-gray-500">
                  Si désactivé, ton backend peut ignorer cette config.
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Agent ID ElevenLabs (
                    <code className="font-mono text-[10px]">agent_id</code>)
                  </label>
                  <input
                    type="text"
                    value={config.agentId}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, agentId: e.target.value }))
                    }
                    className="mt-1 w-full md:w-72 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="agent_xxx..."
                  />
                  {errors.agentId && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                      {errors.agentId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Phone number ID ElevenLabs (
                    <code className="font-mono text-[10px]">
                      agent_phone_number_id
                    </code>
                    )
                  </label>
                  <input
                    type="text"
                    value={config.agentPhoneNumberId}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        agentPhoneNumberId: e.target.value,
                      }))
                    }
                    className="mt-1 w-full md:w-72 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="phnum_xxx..."
                  />
                  {errors.agentPhoneNumberId && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                      {errors.agentPhoneNumberId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* GRID : gauche = agent, droite = test + JSON */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SCRIPT & FIRST MESSAGE */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Premier message vocal (
                    <code className="font-mono text-[11px]">first_message</code>)
                  </label>
                  <input
                    type="text"
                    value={config.firstMessage}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, firstMessage: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex : Bonjour, est-ce que vous m’entendez bien ?"
                  />
                  {errors.firstMessage && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                      {errors.firstMessage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions / Script d’appel
                  </label>
                  <textarea
                    value={config.script}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, script: e.target.value }))
                    }
                    rows={10}
                    placeholder="Colle ici le prompt / instructions de ton agent ElevenLabs…"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.script && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                      {errors.script}
                    </p>
                  )}
                </div>
              </div>

              {/* TEST CALL + JSON PAYLOAD */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Appel test en direct
                  </h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Numéro pour l&apos;appel test (
                    <code className="font-mono text-[11px]">to_number</code>)
                  </label>
                  <input
                    type="tel"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="+336XXXXXXXX"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Format E.164 (ex : +33612345678).
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        testCallMutation.mutate({
                          toNumber: (testNumber || config.defaultTestNumber || '').trim(),
                        })
                      }
                      disabled={
                        isDisabledGlobal ||
                        !(
                          (testNumber || config.defaultTestNumber) &&
                          config.agentId &&
                          config.agentPhoneNumberId
                        ) ||
                        isTesting
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTesting && (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      )}
                      Lancer un appel test
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          defaultTestNumber: testNumber,
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Définir comme numéro test par défaut
                    </button>
                  </div>

                  {lastTestResult && (
                    <p className="mt-2 text-xs text-gray-700">
                      <span className="font-semibold">Résultat :</span> {lastTestResult}
                    </p>
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Payload JSON ElevenLabs (prévisualisation)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowJson((prev) => !prev)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {showJson ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                  {showJson ? (
                    <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-black text-[11px] text-emerald-100 p-3">
                      {JSON.stringify(elevenLabsPayload, null, 2)}
                    </pre>
                  ) : (
                    <p className="mt-1 text-[11px] text-gray-500">
                      C’est ce que ton backend envoie à{' '}
                      <code className="font-mono">
                        /v1/convai/twilio/outbound-call
                      </code>
                      .
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* LANGUE + MAX CALLS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langue principale de l’appel
                </label>
                <select
                  value={config.language}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, language: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="es">Espagnol</option>
                  <option value="de">Allemand</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre max d&apos;appels par jour
                </label>
                <input
                  type="number"
                  value={config.maxCallsPerDay}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxCallsPerDay: Number(e.target.value),
                    }))
                  }
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* PLAGES HORAIRES */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Plages horaires d&apos;appel
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.schedule.enabled}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, enabled: e.target.checked },
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Activer le scheduling</span>
                </label>
              </div>

              {config.schedule.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuseau horaire
                      </label>
                      <select
                        value={config.schedule.timezone}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              timezone: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Europe/Paris">Europe / Paris</option>
                        <option value="Europe/London">Europe / London</option>
                        <option value="America/New_York">US / Eastern</option>
                        <option value="America/Chicago">US / Central</option>
                        <option value="America/Denver">US / Mountain</option>
                        <option value="America/Los_Angeles">US / Pacific</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de début
                      </label>
                      <input
                        type="time"
                        value={config.schedule.start_time}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              start_time: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de fin
                      </label>
                      <input
                        type="time"
                        value={config.schedule.end_time}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              end_time: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jours d&apos;appel autorisés
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => {
                        const checked =
                          config.schedule.days_of_week.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => handleToggleDay(day.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              checked
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* FOOTER SAVE */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={isSaving || isDisabledGlobal}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                )}
                <CheckIcon className="w-5 h-5" />
                {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder la configuration'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VoiceBotConfigPage;

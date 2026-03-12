import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  receptionistApi,
  type ReceptionistConfigInput,
  type DayKey,
} from '../../lib/apiClient';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';

const ADMIN_RECEPTIONIST_AGENT_URL =
  'https://elevenlabs.io/app/talk-to?agent_id=agent_6101k6e24fkfeeersdv68g55vbst';

const daysOfWeek: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

type UiReceptionistConfig = ReceptionistConfigInput & {
  enabled: boolean;
  agentId: string;
  agentPhoneNumberId: string;
  defaultTestNumber: string;
  firstMessage: string;
  language: string;
  script?: string;
  twilioPhoneNumber?: string | null;
  twilioPhoneSid?: string | null;
};

type ValidationErrors = {
  agentId?: string;
  firstMessage?: string;
  calendar_id?: string;
};

function ReceptionistConfigPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const googleCalendarStatus = searchParams.get('google_calendar');

  // 🔑 clientId = id Supabase de l'utilisateur connecté
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Loader pour l'achat de numéro
  const [isBuyingNumber, setIsBuyingNumber] = useState(false);

  // 🔐 Récupérer l'utilisateur Supabase connecté et son id
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;

        if (error) {
          console.warn('[receptionist] Erreur getUser supabase:', error.message);
          setClientId(null);
        } else if (data?.user) {
          setClientId(data.user.id);
        } else {
          setClientId(null);
        }
      } catch (err) {
        console.error('[receptionist] Erreur inattendue getUser supabase:', err);
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

  // ✅ State UI avec valeurs par défaut
  const [config, setConfig] = useState<UiReceptionistConfig>({
    enabled: true,
    agentId: '',
    agentPhoneNumberId: '',
    defaultTestNumber: '',
    firstMessage: '',
    language: 'fr',
    script: '',

    calendar_id: '',
    opening_hours: {
      monday: { open: '09:00', close: '17:00', enabled: true },
      tuesday: { open: '09:00', close: '17:00', enabled: true },
      wednesday: { open: '09:00', close: '17:00', enabled: true },
      thursday: { open: '09:00', close: '17:00', enabled: true },
      friday: { open: '09:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '17:00', enabled: false },
      sunday: { open: '09:00', close: '17:00', enabled: false },
    },
    allowed_booking_slots: [30, 60],
    max_people_per_booking: 1,
    twilioPhoneNumber: null,
    twilioPhoneSid: null,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // 🔄 Récupération de la config DB via backend (lié au user côté serveur)
  const {
    data: savedConfig,
    isLoading: isLoadingConfig,
  } = useQuery<ReceptionistConfigInput>({
    queryKey: ['receptionist-config', clientId],
    enabled: !!clientId && !isLoadingUser,
    queryFn: () => receptionistApi.getConfig(clientId!),
  });

  // 🔁 Injection de la config DB dans le state UI
  useEffect(() => {
    if (!savedConfig) return;

    setConfig((prev) => ({
      ...prev,
      ...savedConfig,
      enabled: (savedConfig as any).enabled ?? prev.enabled ?? true,
      agentId:
        (savedConfig as any).agentId ??
        (savedConfig as any).agent_id ??
        prev.agentId ??
        '',
      agentPhoneNumberId:
        (savedConfig as any).agentPhoneNumberId ??
        (savedConfig as any).agent_phone_number_id ??
        prev.agentPhoneNumberId ??
        '',
      defaultTestNumber:
        (savedConfig as any).defaultTestNumber ??
        (savedConfig as any).default_test_number ??
        prev.defaultTestNumber ??
        '',
      firstMessage:
        (savedConfig as any).firstMessage ??
        (savedConfig as any).first_message ??
        prev.firstMessage ??
        '',
      script:
        (savedConfig as any).script ??
        (savedConfig as any).instructions ??
        prev.script ??
        '',
      language: (savedConfig as any).language ?? prev.language ?? 'fr',
      calendar_id: savedConfig.calendar_id ?? prev.calendar_id ?? '',
      opening_hours: savedConfig.opening_hours || prev.opening_hours,
      allowed_booking_slots:
        savedConfig.allowed_booking_slots || prev.allowed_booking_slots,
      max_people_per_booking:
        savedConfig.max_people_per_booking ?? prev.max_people_per_booking,
      twilioPhoneNumber:
        (savedConfig as any).twilioPhoneNumber ??
        (savedConfig as any).twilio_phone_number ??
        prev.twilioPhoneNumber ??
        null,
      twilioPhoneSid:
        (savedConfig as any).twilioPhoneSid ??
        (savedConfig as any).twilio_phone_sid ??
        prev.twilioPhoneSid ??
        null,
    }));
  }, [savedConfig]);

  // 💾 Sauvegarde dans ta DB (Supabase) via backend
  const saveMutation = useMutation({
    mutationFn: (configData: UiReceptionistConfig) => {
      if (!clientId) {
        throw new Error('Impossible de sauvegarder : aucun clientId défini');
      }
      return receptionistApi.saveConfig(clientId, configData as ReceptionistConfigInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionist-config', clientId] });
      alert('Configuration réceptionniste sauvegardée ✅');
    },
    onError: (error: any) => {
      console.error(error);
      alert("Erreur lors de la sauvegarde de la configuration réceptionniste.");
    },
  });

  const isSaving = saveMutation.isPending;
  const isDisabledGlobal = !clientId || isLoadingUser;

  // ✅ Validation minimale avant sauvegarde
  const validateForSave = (): boolean => {
    const next: ValidationErrors = {};

    if (!config.agentId.trim()) {
      next.agentId = 'Agent ID ElevenLabs obligatoire (agent_id).';
    }
    if (!config.firstMessage.trim()) {
      next.firstMessage = 'Premier message (first_message) obligatoire.';
    }
    if (!config.calendar_id.trim()) {
      next.calendar_id = 'Google Calendar ID obligatoire.';
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

  const handleOpenAdminAgent = () => {
    window.open(ADMIN_RECEPTIONIST_AGENT_URL, '_blank', 'noopener,noreferrer');
  };

  const handleGoogleCalendarConnect = () => {
    if (!clientId) {
      alert('Connecte-toi avant de connecter Google Calendar.');
      return;
    }
    const base = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${base}/api/receptionist/google/connect?client_id=${encodeURIComponent(
      clientId
    )}`;
  };

  const handleBuyPhoneNumber = async () => {
    if (!clientId) {
      alert('Connecte-toi avant d’acheter un numéro.');
      return;
    }

    const confirm = window.confirm(
      "Confirmer l'achat d’un nouveau numéro Twilio et sa connexion à ElevenLabs pour cet agent ?"
    );
    if (!confirm) return;

    try {
      setIsBuyingNumber(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const base = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${base}/api/receptionist/phone/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}), // on se base sur le JWT pour retrouver le client
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('[receptionist] handleBuyPhoneNumber error:', res.status, text);
        alert(
          "Erreur lors de l'achat / liaison du numéro. Vérifie les logs backend pour le détail."
        );
        return;
      }

      const newConfig = await res.json();
      console.log('[receptionist] handleBuyPhoneNumber → newConfig:', newConfig);

      setConfig((prev) => ({
        ...prev,
        ...newConfig,
        enabled: (newConfig as any).enabled ?? prev.enabled ?? true,
        agentId:
          (newConfig as any).agentId ??
          (newConfig as any).agent_id ??
          prev.agentId ??
          '',
        agentPhoneNumberId:
          (newConfig as any).agentPhoneNumberId ??
          (newConfig as any).agent_phone_number_id ??
          prev.agentPhoneNumberId ??
          '',
        twilioPhoneNumber:
          (newConfig as any).twilioPhoneNumber ??
          (newConfig as any).twilio_phone_number ??
          prev.twilioPhoneNumber ??
          null,
        twilioPhoneSid:
          (newConfig as any).twilioPhoneSid ??
          (newConfig as any).twilio_phone_sid ??
          prev.twilioPhoneSid ??
          null,
        calendar_id: (newConfig as any).calendar_id ?? prev.calendar_id ?? '',
        opening_hours:
          (newConfig as any).opening_hours || prev.opening_hours,
        allowed_booking_slots:
          (newConfig as any).allowed_booking_slots ||
          prev.allowed_booking_slots,
        max_people_per_booking:
          (newConfig as any).max_people_per_booking ??
          prev.max_people_per_booking,
        firstMessage:
          (newConfig as any).firstMessage ??
          (newConfig as any).first_message ??
          prev.firstMessage ??
          '',
        script:
          (newConfig as any).script ??
          (newConfig as any).instructions ??
          prev.script ??
          '',
      }));

      alert('Numéro Twilio acheté et connecté à ElevenLabs ✅');
    } catch (err) {
      console.error('[receptionist] handleBuyPhoneNumber unexpected error:', err);
      alert("Erreur inattendue lors de l'achat du numéro.");
    } finally {
      setIsBuyingNumber(false);
    }
  };

  const updateDayHours = (
    day: DayKey,
    field: 'open' | 'close' | 'enabled',
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const toggleSlot = (slot: number) => {
    setConfig((prev) => {
      const slots = prev.allowed_booking_slots.includes(slot)
        ? prev.allowed_booking_slots.filter((s) => s !== slot)
        : [...prev.allowed_booking_slots, slot];

      return { ...prev, allowed_booking_slots: slots };
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Réceptionniste téléphonique (ElevenLabs)
        </h1>
        <p className="text-gray-600 text-sm">
          Configure ici ton agent réceptionniste (prise de rendez-vous) : agent ElevenLabs,
          Google Calendar utilisé, horaires d&apos;ouverture, script d’appel et paramètres de réservation.
        </p>

        {clientId && (
          <div className="inline-flex items-center gap-2 text-xs text-gray-700 mt-1">
            <span className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
              User / Client ID&nbsp;:
              <span className="font-mono ml-1">{clientId}</span>
            </span>
          </div>
        )}

        {!clientId && !isLoadingUser && (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            Aucun utilisateur Supabase connecté. Connecte-toi pour sauvegarder ta
            configuration réceptionniste.
          </div>
        )}

        {googleCalendarStatus === 'connected' && (
          <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            Google Calendar connecté avec succès. Le calendrier principal a été
            enregistré pour ce compte.
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleOpenAdminAgent}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <PhoneIcon className="h-4 w-4" />
            Ouvrir l’agent admin ElevenLabs
          </button>

          <button
            type="button"
            onClick={handleGoogleCalendarConnect}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Connecter Google Calendar
          </button>
        </div>
      </div>

      {/* BLOC CONFIG PRINCIPAL */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {isLoadingConfig && clientId ? (
          <div className="text-center py-8 text-gray-500">
            Chargement de la configuration réceptionniste...
          </div>
        ) : (
          <>
            {/* Ligne statut & IDs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
              <div className="flex flex-col gap-2">
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
                      Réceptionniste activé
                    </span>
                  </label>
                  <span className="text-xs text-gray-500">
                    Si désactivé, ton backend peut ignorer cet agent pour les appels entrants.
                  </span>
                </div>

                {config.twilioPhoneNumber && (
                  <p className="text-xs text-gray-600">
                    Numéro Twilio associé :{' '}
                    <span className="font-mono">{config.twilioPhoneNumber}</span>
                  </p>
                )}
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

                <div className="space-y-1">
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
                    <p className="mt-1 text-[10px] text-gray-500">
                      Récupéré automatiquement lors de l’achat de numéro ou via l’UI ElevenLabs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleBuyPhoneNumber}
                    disabled={isBuyingNumber || isDisabledGlobal}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuyingNumber ? 'Achat en cours...' : 'Acheter un numéro Twilio + connecter à ElevenLabs'}
                  </button>
                </div>
              </div>
            </div>

            {/* Google Calendar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Calendar ID
              </label>
              <input
                type="text"
                value={config.calendar_id}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, calendar_id: e.target.value }))
                }
                placeholder="Ex: primary ou adresse mail du calendrier"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.calendar_id && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                  {errors.calendar_id}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Après connexion Google, le calendrier principal (&quot;primary&quot;) est
                enregistré automatiquement. Tu peux le modifier manuellement si besoin.
              </p>
            </div>

            {/* Premier message + langue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
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
                  placeholder="Ex : Bonjour, vous êtes bien avec la réception Ottomate..."
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
                  Langue principale de l’appel (
                  <code className="font-mono text-[11px]">agent.language</code>)
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
            </div>

            {/* Instructions / Script d’appel */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instructions / Script d’appel
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Ce script est envoyé à l’agent ElevenLabs pour guider son comportement
                (personnalité, outils, logique métier...).
              </p>
              <textarea
                value={config.script || ''}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, script: e.target.value }))
                }
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono whitespace-pre-wrap focus:ring-2 focus:ring-blue-500"
                placeholder="Colle ici le prompt / script complet de ton agent réceptionniste..."
              />
            </div>

            {/* Horaires d’ouverture */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Horaires d&apos;ouverture
              </h3>
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-28">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.opening_hours[day]?.enabled || false}
                          onChange={(e) =>
                            updateDayHours(day, 'enabled', e.target.checked)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </span>
                      </label>
                    </div>
                    {config.opening_hours[day]?.enabled && (
                      <>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            Ouverture
                          </label>
                          <input
                            type="time"
                            value={config.opening_hours[day]?.open || '09:00'}
                            onChange={(e) =>
                              updateDayHours(day, 'open', e.target.value)
                            }
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            Fermeture
                          </label>
                          <input
                            type="time"
                            value={config.opening_hours[day]?.close || '17:00'}
                            onChange={(e) =>
                              updateDayHours(day, 'close', e.target.value)
                            }
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Paramètres de réservation */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Paramètres de réservation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durées de créneau autorisées (minutes)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[15, 30, 45, 60, 90, 120].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.allowed_booking_slots.includes(slot)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {slot} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre max de personnes par réservation
                  </label>
                  <input
                    type="number"
                    value={config.max_people_per_booking}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        max_people_per_booking: Number(e.target.value),
                      }))
                    }
                    min={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER SAVE */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={isSaving || isDisabledGlobal}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon className="w-5 h-5" />
                {isSaving
                  ? 'Sauvegarde en cours...'
                  : 'Sauvegarder la configuration'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReceptionistConfigPage;

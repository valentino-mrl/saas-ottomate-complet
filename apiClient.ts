// Central API client for backend Express server
// All requests automatically include Supabase JWT Bearer token

import axios, { AxiosError } from 'axios';
import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not configured');
}

/**
 * Get the current Supabase access token
 */
async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Make an authenticated request to the backend API
 */
async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: unknown,
  options?: { headers?: Record<string, string> }
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('No authentication token available. Please sign in.');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options?.headers,
  };

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
    });

    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'An error occurred';
      throw new Error(`API Error: ${axiosError.response?.status} - ${message}`);
    }
    throw error;
  }
}

// ===================================================================
// Auth
// ===================================================================

export const authApi = {
  me: () => apiRequest<{ user: unknown }>('GET', '/api/secure/me'),
};

// ===================================================================
// Leads
// ===================================================================

export const leadsApi = {
  search: (params: { category: string; location: string; limit?: number }) =>
    apiRequest<{ leads: unknown[]; count?: number }>(
      'POST',
      '/n8n/webhook/prospects',
      params
    ),
};

// ===================================================================
// Mailing Templates
// ===================================================================

// export interface MailingTemplateInput {
//   name: string;
//   subject: string;
//   body: string;
//   variables?: string[];
// }

// export const mailingApi = {
//   getTemplates: () =>
//     apiRequest<MailingTemplateInput[]>('GET', '/api/mailing/templates'),
//   createTemplate: (template: MailingTemplateInput) =>
//     apiRequest<MailingTemplateInput>('POST', '/api/mailing/templates', template),
// };



// export type InstantlyEmailTemplate = {
//   id: string;
//   name: string;
//   subject: string | null;
//   body: string;
//   organization?: string;
// };

// export type InstantlyTemplateInput = {
//   name: string;
//   subject?: string | null;
//   body: string;
// };

// async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
//   const res = await fetch(url, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(options?.headers || {}),
//     },
//   });

//   const text = await res.text().catch(() => '');

//   if (!res.ok) {
//     throw new Error(text || `HTTP ${res.status}`);
//   }

//   // si réponse vide (DELETE etc.)
//   if (!text) return {} as T;

//   try {
//     return JSON.parse(text) as T;
//   } catch {
//     // si jamais backend renvoie du texte
//     return text as unknown as T;
//   }
// }

// // helper: Instantly peut renvoyer [] ou { data: [] }
// function unwrapList<T>(payload: any): T[] {
//   if (Array.isArray(payload)) return payload as T[];
//   if (payload && Array.isArray(payload.data)) return payload.data as T[];
//   return [];
// }

// export const instantlyTemplatesApi = {
//   getTemplates: async (id: string) => {
//     const payload = await apiFetch<any>(`/api/instantly/clients/${id}/templates`);
//     return unwrapList<InstantlyEmailTemplate>(payload);
//   },

//   createTemplate: (id: string, input: InstantlyTemplateInput) =>
//     apiFetch<InstantlyEmailTemplate>(`/api/instantly/clients/${id}/templates`, {
//       method: 'POST',
//       body: JSON.stringify(input),
//     }),

//   updateTemplate: (id: string, templateId: string, input: InstantlyTemplateInput) =>
//     apiFetch<InstantlyEmailTemplate>(`/api/instantly/clients/${id}/templates/${templateId}`, {
//       method: 'PATCH',
//       body: JSON.stringify(input),
//     }),

//   deleteTemplate: (id: string, templateId: string) =>
//     apiFetch<{ ok: boolean }>(`/api/instantly/clients/${id}/templates/${templateId}`, {
//       method: 'DELETE',
//     }),
// };

// // ✅ Compat: certains écrans importent encore mailingApi.
// // On le garde pour éviter de casser le front.
// // IMPORTANT : il faut passer un id client dans les fonctions.
// export const mailingApi = {
//   getTemplates: (id: string) => instantlyTemplatesApi.getTemplates(id),
//   createTemplate: (id: string, input: InstantlyTemplateInput) =>
//     instantlyTemplatesApi.createTemplate(id, input),
//   updateTemplate: (id: string, templateId: string, input: InstantlyTemplateInput) =>
//     instantlyTemplatesApi.updateTemplate(id, templateId, input),
//   deleteTemplate: (id: string, templateId: string) =>
//     instantlyTemplatesApi.deleteTemplate(id, templateId),
// };


// export type EmailTemplate = {
//   id: string;
//   user_id: string;
//   instantly_template_id: string;
//   name: string;
//   subject: string | null;
//   body: string;
// };

// export const emailTemplatesApi = {
//   list: (userId: string) =>
//     apiFetch<EmailTemplate[]>(`/api/mailing/email-templates/${userId}`),

//   create: (payload: {
//     user_id: string;
//     name: string;
//     subject?: string | null;
//     body: string;
//   }) =>
//     apiFetch<EmailTemplate>(`/api/mailing/email-templates`, {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     }),

//   update: (
//     id: string,
//     payload: { name: string; subject?: string | null; body: string }
//   ) =>
//     apiFetch<EmailTemplate>(`/api/mailing/email-templates/${id}`, {
//       method: 'PATCH',
//       body: JSON.stringify(payload),
//     }),

//   remove: (id: string) =>
//     apiFetch<{ ok: boolean }>(`/api/mailing/email-templates/${id}`, {
//       method: 'DELETE',
//     }),
// };



// ===================================================================
// Mailing / Instantly Templates + Email Templates + Campaigns
// (NOTE: utilise apiRequest() => VITE_API_BASE_URL + Bearer token)
// ===================================================================

export type InstantlyEmailTemplate = {
  id: string;
  name: string;
  subject: string | null;
  body: string;
  organization?: string;
};

export type InstantlyTemplateInput = {
  name: string;
  subject?: string | null;
  body: string;
};

export type EmailTemplate = {
  id: string;
  user_id: string;
  instantly_template_id: string;
  name: string;
  subject: string | null;
  body: string;
};

// export type LaunchCampaignInput = {
//   templateId: string; // Instantly template id
//   segmentId?: string;
//   schedule: {
//     start_date: string;
//     end_date?: string;
//     daily_cap?: number;
//     timezone?: string;
//   };
// };

export type LaunchCampaignInput = {
  templateId: string; // Instantly template id
  emails: string[];   // ✅ ton backend attend emails[]
  schedule?: {
    start_date?: string; // ✅ optionnel
    end_date?: string;
    daily_cap?: number;
    timezone?: string;
  };
  clientId?: string;
};


// helper: sécure pour éviter "map is not a function"
function ensureArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val && Array.isArray(val.data)) return val.data as T[];
  if (val && Array.isArray(val.items)) return val.items as T[];
  if (val && Array.isArray(val.templates)) return val.templates as T[];
  return [];
}

/* ------------------------------------------------------------------ */
/* Instantly templates (proxy backend)                                 */
/* ------------------------------------------------------------------ */

export const instantlyTemplatesApi = {
  getTemplates: async (id: string): Promise<InstantlyEmailTemplate[]> => {
    const payload = await apiRequest<any>('GET', `/api/instantly/clients/${id}/templates`);
    return ensureArray<InstantlyEmailTemplate>(payload);
  },

  createTemplate: (id: string, input: InstantlyTemplateInput) =>
    apiRequest<InstantlyEmailTemplate>('POST', `/api/instantly/clients/${id}/templates`, input),

  updateTemplate: (id: string, templateId: string, input: InstantlyTemplateInput) =>
    apiRequest<InstantlyEmailTemplate>(
      'PATCH',
      `/api/instantly/clients/${id}/templates/${templateId}`,
      input
    ),

  deleteTemplate: (id: string, templateId: string) =>
    apiRequest<{ ok: boolean }>(
      'DELETE',
      `/api/instantly/clients/${id}/templates/${templateId}`
    ),
};

// Compat (si certains écrans importent encore mailingApi)
export const mailingApi = {
  getTemplates: (id: string) => instantlyTemplatesApi.getTemplates(id),
  createTemplate: (id: string, input: InstantlyTemplateInput) =>
    instantlyTemplatesApi.createTemplate(id, input),
  updateTemplate: (id: string, templateId: string, input: InstantlyTemplateInput) =>
    instantlyTemplatesApi.updateTemplate(id, templateId, input),
  deleteTemplate: (id: string, templateId: string) =>
    instantlyTemplatesApi.deleteTemplate(id, templateId),
};

/* ------------------------------------------------------------------ */
/* Email templates (stockés dans Supabase via backend)                 */
/* ------------------------------------------------------------------ */

export const emailTemplatesApi = {
  list: async (userId: string): Promise<EmailTemplate[]> => {
    const payload = await apiRequest<any>('GET', `/api/mailing/email-templates/${userId}`);
    return ensureArray<EmailTemplate>(payload);
  },

  create: (payload: { user_id: string; name: string; subject?: string | null; body: string }) =>
    apiRequest<EmailTemplate>('POST', `/api/mailing/email-templates`, payload),

  update: (id: string, payload: { name: string; subject?: string | null; body: string }) =>
    apiRequest<EmailTemplate>('PATCH', `/api/mailing/email-templates/${id}`, payload),

  remove: (id: string) =>
    apiRequest<{ ok: boolean }>('DELETE', `/api/mailing/email-templates/${id}`),
};

/* ------------------------------------------------------------------ */
/* Campaigns                                                          */
/* ------------------------------------------------------------------ */

export const campaignsApi = {
  launch: (payload: LaunchCampaignInput) =>
    apiRequest<{ ok: boolean; campaign_id?: string }>(
      'POST',
      `/api/mailing/campaigns/launch`,
      payload
    ),
};





// ===================================================================
// Voice Bot Config
// ===================================================================

export interface VoiceBotConfigInput {
  // flags
  enabled?: boolean;

  // Champs ElevenLabs / front
  agentId?: string;
  agentPhoneNumberId?: string;
  defaultTestNumber?: string;
  firstMessage?: string;

  // Contenu d’appel
  script: string;
  language: string;

  // Plages horaires
  schedule: {
    enabled: boolean;
    timezone: string;
    start_time: string;
    end_time: string;
    days_of_week: number[];
  };

  maxCallsPerDay: number;

  // clé de liaison côté backend
  client_id?: string;
}

export const voiceBotApi = {
  // GET /api/voice-bot/config?client_id=...
  getConfig: (clientId: string) =>
    apiRequest<VoiceBotConfigInput>(
      'GET',
      `/api/voice-bot/config?client_id=${encodeURIComponent(clientId)}`
    ),

  // POST /api/voice-bot/config  { client_id, ...config }
  saveConfig: (clientId: string, config: VoiceBotConfigInput) =>
    apiRequest<VoiceBotConfigInput>('POST', '/api/voice-bot/config', {
      ...config,
      client_id: clientId,
    }),
};


// ===================================================================
// Voice Bot - Phone / Twilio
// ===================================================================

export interface BuyVoiceBotPhoneInput {
  client_id?: string;
  doPurchase?: boolean;
  searchCriteria?: string;
}

export interface BuyVoiceBotPhoneResponse {
  agentPhoneNumberId?: string;
  agent_phone_number_id?: string;
  twilio?: { sid?: string; phoneNumber?: string };
  twilioPhoneNumber?: string;
  twilio_phone_number?: string;
  twilioPhoneSid?: string;
  twilio_phone_sid?: string;
}

export const voiceBotPhoneApi = {
  buy: (payload: BuyVoiceBotPhoneInput) =>
    apiRequest<BuyVoiceBotPhoneResponse>('POST', '/api/voice-bot/phone/buy', payload),
};

// ===================================================================
// Receptionist Config
// ===================================================================


// Receptionist Config
export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ReceptionistOpeningHours {
  open: string;   // "09:00"
  close: string;  // "17:00"
  enabled: boolean;
}

export interface ReceptionistConfigInput {
  // Champs ElevenLabs (optionnels dans le type, mais gérés côté UI)
  enabled?: boolean;
  agentId?: string;
  agentPhoneNumberId?: string;
  defaultTestNumber?: string;
  firstMessage?: string;
  language?: string;

  // Calendar & réservation
  calendar_id: string;
  opening_hours: Record<DayKey, ReceptionistOpeningHours>;
  allowed_booking_slots: number[];
  max_people_per_booking: number;

  // pour le backend
  client_id?: string;
}

export const receptionistApi = {
  // ⬇️ GET /api/receptionist/config?client_id=...
  getConfig: (clientId: string) =>
    apiRequest<ReceptionistConfigInput>(
      'GET',
      `/api/receptionist/config?client_id=${encodeURIComponent(clientId)}`
    ),

  // ⬇️ POST /api/receptionist/config  { client_id, ...config }
  saveConfig: (clientId: string, config: ReceptionistConfigInput) =>
    apiRequest<ReceptionistConfigInput>(
      'POST',
      '/api/receptionist/config',
      {
        ...config,
        client_id: clientId,
      }
    ),
};

// ===================================================================
// Analytics
// ===================================================================

export interface AnalyticsOverview {
  leads?: { generated: number; consumed: number };
  emails?: { sent: number; opened: number; clicked: number };
  calls?: { sales_bot: number; receptionist: number };
  campaigns?: {
    active: number;
    total_conversions: number;
    avg_open_rate: number;
    avg_click_rate: number;
  };
}

export const analyticsApi = {
  getOverview: () =>
    apiRequest<AnalyticsOverview>('GET', '/api/analytics/overview'),
};

// ===================================================================
// Billing  (=> corrige l'erreur BillingPage.tsx)
// ===================================================================

export interface CreateCheckoutSessionInput {
  priceId: string;
  mode?: 'subscription' | 'payment';
}

export const billingApi = {
  createCheckoutSession: (params: CreateCheckoutSessionInput) =>
    apiRequest<{ url: string }>(
      'POST',
      '/api/billing/create-checkout-session',
      params
    ),
};

// ===================================================================
// Mailing Campaigns
// ===================================================================

// export interface LaunchCampaignInput {
//   templateId: string;
//   segmentId?: string;
//   schedule: {
//     start_date: string;
//     end_date?: string;
//     daily_cap?: number;
//     timezone: string;
//   };
// }

// export const campaignsApi = {
//   launch: (params: LaunchCampaignInput) =>
//     apiRequest<{ campaign_id: string; success: boolean }>(
//       'POST',
//       '/api/mailing/campaigns/launch',
//       params
//     ),
// };

// ===================================================================
// Admin / Clients - N8N Config
// ===================================================================

export interface ClientConfigInput {
  leads_workflow_id?: string;
  voice_bot_workflow_id?: string;
  receptionist_workflow_id?: string;
  mailing_campaigns_workflow_id?: string;
  analytics_workflow_id?: string;
}

// Résumé minimal pour l’admin, mappé sur les colonnes
// id, email, full_name, (éventuellement plan/company plus tard)
export interface AdminClientSummary {
  id: string;
  email?: string | null;
  name?: string | null; // full_name côté DB
  company_name?: string | null;
  plan?: string | null;
}

export const adminApi = {
  // Liste des clients (profils) pour le panneau admin
  listClients: () =>
    apiRequest<AdminClientSummary[]>('GET', '/api/admin/clients'),

  // Config des workflows pour un client donné
  getClientConfig: (userId: string) =>
    apiRequest<ClientConfigInput>('GET', `/api/admin/client-config/${userId}`),

  // Mise à jour de la config workflows pour ce client
  updateClientConfig: (userId: string, config: ClientConfigInput) =>
    apiRequest<ClientConfigInput>(
      'PUT',
      `/api/admin/client-config/${userId}`,
      config
    ),
};

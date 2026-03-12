// n8n API client for interacting with n8n workflows

import axios from 'axios';
import { supabase } from './supabaseClient';

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL as string;
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY as string;

interface N8nRequestOptions {
  workflowId?: string;
  endpoint?: string;
  data?: Record<string, unknown>;
}

/**
 * Get the current user's session token for n8n authentication
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Make a request to n8n API
 */
async function n8nRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options: N8nRequestOptions
): Promise<T> {
  const token = await getAuthToken();
  
  if (!N8N_BASE_URL) {
    throw new Error('N8N_BASE_URL is not configured');
  }

  const url = options.workflowId
    ? `${N8N_BASE_URL}/webhook/${options.workflowId}`
    : options.endpoint
    ? `${N8N_BASE_URL}${options.endpoint}`
    : `${N8N_BASE_URL}/webhook`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Use API key if provided, otherwise use JWT token
  if (N8N_API_KEY) {
    headers['X-N8N-API-KEY'] = N8N_API_KEY;
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios({
      method,
      url,
      headers,
      data: options.data,
    });

    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `N8N API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}

/**
 * Generate leads via n8n workflow
 */
export async function generateLeads(params: {
  workflowId: string;
  category?: string;
  city?: string;
  region?: string;
  country?: string;
  limit?: number;
}) {
  return n8nRequest<{ leads: unknown[]; count: number }>('POST', {
    workflowId: params.workflowId,
    data: {
      category: params.category,
      city: params.city,
      region: params.region,
      country: params.country,
      limit: params.limit || 100,
    },
  });
}

/**
 * Send voice bot configuration to n8n
 */
export async function syncVoiceBotConfig(params: {
  workflowId: string;
  config: {
    script: string;
    language: string;
    call_schedule: unknown;
    max_calls_per_day: number;
  };
}) {
  return n8nRequest<{ success: boolean }>('POST', {
    workflowId: params.workflowId,
    data: {
      action: 'update_config',
      config: params.config,
    },
  });
}

/**
 * Send receptionist configuration to n8n
 */
export async function syncReceptionistConfig(params: {
  workflowId: string;
  config: {
    opening_hours: unknown;
    google_calendar_id: string;
    allowed_booking_slots: number[];
    max_people_per_booking: number;
  };
}) {
  return n8nRequest<{ success: boolean }>('POST', {
    workflowId: params.workflowId,
    data: {
      action: 'update_config',
      config: params.config,
    },
  });
}

/**
 * Launch a mailing campaign via n8n
 */
export async function launchCampaign(params: {
  workflowId: string;
  campaign: {
    template_id: string;
    lead_segment: unknown;
    schedule: unknown;
  };
}) {
  return n8nRequest<{ campaign_id: string; success: boolean }>('POST', {
    workflowId: params.workflowId,
    data: {
      action: 'launch_campaign',
      campaign: params.campaign,
    },
  });
}

/**
 * Get analytics data from n8n webhook
 */
export async function getAnalytics(params: {
  workflowId?: string;
  period?: string;
}) {
  return n8nRequest<unknown>('GET', {
    workflowId: params.workflowId,
    endpoint: params.workflowId ? undefined : '/analytics',
    data: params.period ? { period: params.period } : undefined,
  });
}




/**
 * Generate an HTML email template via Claude AI through n8n
 */
export async function generateEmailTemplate(params: {
  workflowId: string;
  company_name: string;
  industry: string;
  tone: string;
  goal: string;
  language: string;
  user_id: string;
}) {
  return n8nRequest<{
    success: boolean;
    template: {
      html_template: string;
      template_name: string;
      subject: string;
      metadata: Record<string, string>;
    };
    error?: string;
  }>('POST', {
    workflowId: params.workflowId,
    data: {
      company_name: params.company_name,
      industry: params.industry,
      tone: params.tone,
      goal: params.goal,
      language: params.language,
      user_id: params.user_id,
    },
  });
}

/*

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type ClientConfigInput } from '../../lib/apiClient';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ChatQwen from './ChatQwen';

// Note: Backend should provide GET /api/admin/clients to list all clients
// For now, this is a placeholder that expects client IDs to be entered manually
export default function AdminN8nPage() {
  const queryClient = useQueryClient();
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientIdInput, setClientIdInput] = useState('');
  const [editForm, setEditForm] = useState<ClientConfigInput>({
    leads_workflow_id: '',
    voice_bot_workflow_id: '',
    receptionist_workflow_id: '',
    mailing_campaigns_workflow_id: '',
    analytics_workflow_id: '',
  });

  // Note: Backend should implement GET /api/admin/clients to list all clients
  // For now, we'll use a manual input approach
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin-client-config', selectedClientId],
    queryFn: () => {
      if (!selectedClientId) throw new Error('No client ID selected');
      return adminApi.getClientConfig(selectedClientId);
    },
    enabled: !!selectedClientId,
  });

  useEffect(() => {
    if (config) {
      setEditForm({
        leads_workflow_id: config.leads_workflow_id || '',
        voice_bot_workflow_id: config.voice_bot_workflow_id || '',
        receptionist_workflow_id: config.receptionist_workflow_id || '',
        mailing_campaigns_workflow_id: config.mailing_campaigns_workflow_id || '',
        analytics_workflow_id: config.analytics_workflow_id || '',
      });
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: ({ clientId, config: configData }: { clientId: string; config: ClientConfigInput }) =>
      adminApi.updateClientConfig(clientId, configData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-client-config'] });
      setEditingClientId(null);
      alert('Configuration updated successfully!');
    },
  });

  const startEdit = () => {
    if (!selectedClientId) {
      alert('Please enter a client ID first');
      return;
    }
    setEditingClientId(selectedClientId);
  };

  const cancelEdit = () => {
    setEditingClientId(null);
    if (config) {
      setEditForm({
        leads_workflow_id: config.leads_workflow_id || '',
        voice_bot_workflow_id: config.voice_bot_workflow_id || '',
        receptionist_workflow_id: config.receptionist_workflow_id || '',
        mailing_campaigns_workflow_id: config.mailing_campaigns_workflow_id || '',
        analytics_workflow_id: config.analytics_workflow_id || '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel - N8N Workflow Management</h1>
          <p className="text-gray-600 mt-2">
            Link each client with their corresponding n8n workflow IDs.
          </p>
        </div>

        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Client</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="Enter client user ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (clientIdInput.trim()) {
                  setSelectedClientId(clientIdInput.trim());
                  setEditingClientId(null);
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Load Config
            </button>
          </div>
        </div>

        
        {selectedClientId && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Client: {selectedClientId}
                </h2>
                {!editingClientId && (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Loading configuration...</div>
            ) : (
              <div className="p-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Workflow Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Workflow ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editingClientId ? (
                      <>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Leads
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.leads_workflow_id || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, leads_workflow_id: e.target.value })
                              }
                              placeholder="Workflow ID"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Voice Bot
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.voice_bot_workflow_id || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, voice_bot_workflow_id: e.target.value })
                              }
                              placeholder="Workflow ID"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Receptionist
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.receptionist_workflow_id || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, receptionist_workflow_id: e.target.value })
                              }
                              placeholder="Workflow ID"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Mailing Campaigns
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.mailing_campaigns_workflow_id || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, mailing_campaigns_workflow_id: e.target.value })
                              }
                              placeholder="Workflow ID"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Analytics
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editForm.analytics_workflow_id || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, analytics_workflow_id: e.target.value })
                              }
                              placeholder="Workflow ID"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  saveMutation.mutate({
                                    clientId: selectedClientId,
                                    config: editForm,
                                  })
                                }
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                              >
                                <CheckIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Leads
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config?.leads_workflow_id || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Voice Bot
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config?.voice_bot_workflow_id || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Receptionist
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config?.receptionist_workflow_id || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Mailing Campaigns
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config?.mailing_campaigns_workflow_id || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Analytics
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config?.analytics_workflow_id || '-'}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        
        <ChatQwen />
      </div>
    </div>
  );
}
*/
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type ClientConfigInput } from '../../lib/apiClient';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ChatQwen from './ChatQwen';

type AdminClient = {
  id: string;
  email?: string | null;
  name?: string | null;          // correspond à full_name dans profiles
  company_name?: string | null;  // gardé pour compat mais non renvoyé par l’API actuelle
  plan?: string | null;          // idem
};

export default function AdminN8nPage() {
  const queryClient = useQueryClient();

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [editForm, setEditForm] = useState<ClientConfigInput>({
    leads_workflow_id: '',
    voice_bot_workflow_id: '',
    receptionist_workflow_id: '',
    mailing_campaigns_workflow_id: '',
    analytics_workflow_id: '',
  });

  // Liste de tous les clients (profiles)
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
  } = useQuery<AdminClient[]>({
    queryKey: ['admin-clients'],
    queryFn: adminApi.listClients,
  });

  // Config n8n du client sélectionné (colonne sur profiles)
  const {
    data: config,
    isLoading: isLoadingConfig,
  } = useQuery<ClientConfigInput | null>({
    queryKey: ['admin-client-config', selectedClientId],
    queryFn: () => {
      if (!selectedClientId) throw new Error('No client ID selected');
      return adminApi.getClientConfig(selectedClientId);
    },
    enabled: !!selectedClientId,
  });

  // Quand on charge une config, on hydrate le formulaire d’édition
  useEffect(() => {
    if (config) {
      setEditForm({
        leads_workflow_id: config.leads_workflow_id || '',
        voice_bot_workflow_id: config.voice_bot_workflow_id || '',
        receptionist_workflow_id: config.receptionist_workflow_id || '',
        mailing_campaigns_workflow_id: config.mailing_campaigns_workflow_id || '',
        analytics_workflow_id: config.analytics_workflow_id || '',
      });
    } else {
      // Aucun config → on reset propre
      setEditForm({
        leads_workflow_id: '',
        voice_bot_workflow_id: '',
        receptionist_workflow_id: '',
        mailing_campaigns_workflow_id: '',
        analytics_workflow_id: '',
      });
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: ({ clientId, config: configData }: { clientId: string; config: ClientConfigInput }) =>
      adminApi.updateClientConfig(clientId, configData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-client-config', selectedClientId] });
      setEditingClientId(null);
      alert('Configuration updated successfully!');
    },
  });

  const startEdit = () => {
    if (!selectedClientId) {
      alert('Please select a client first');
      return;
    }
    setEditingClientId(selectedClientId);
  };

  const cancelEdit = () => {
    setEditingClientId(null);
    if (config) {
      setEditForm({
        leads_workflow_id: config.leads_workflow_id || '',
        voice_bot_workflow_id: config.voice_bot_workflow_id || '',
        receptionist_workflow_id: config.receptionist_workflow_id || '',
        mailing_campaigns_workflow_id: config.mailing_campaigns_workflow_id || '',
        analytics_workflow_id: config.analytics_workflow_id || '',
      });
    }
  };

  const filteredClients = useMemo(() => {
    const term = searchInput.toLowerCase().trim();
    if (!clients) return [];
    if (!term) return clients;

    return clients.filter((client) => {
      const haystack = [
        client.id,
        client.email,
        client.name,
        client.company_name,
        client.plan,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [clients, searchInput]);

  const handleSelectClient = (client: AdminClient) => {
    setSelectedClientId(client.id);
    setEditingClientId(null);
  };

  // Permet de charger une config en tapant directement un userId exact
  const manualLoadFromSearch = () => {
    if (!searchInput.trim()) return;
    setSelectedClientId(searchInput.trim());
    setEditingClientId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Panel - N8N Workflow Management
          </h1>
          <p className="text-gray-600 mt-2">
            Link each client (profile) with their dedicated n8n workflow IDs. Each client can have fully isolated workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des clients */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Clients</h2>

            {clientsError && (
              <div className="mb-4 text-sm text-red-600">
                Error loading clients list.
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email or ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={manualLoadFromSearch}
                className="mt-2 w-full px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
              >
                Load config by exact ID (manual)
              </button>
            </div>

            {isLoadingClients ? (
              <div className="text-gray-500 text-sm">Loading clients...</div>
            ) : (
              <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg divide-y max-h-96">
                {filteredClients.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No clients found.
                  </div>
                )}
                {filteredClients.map((client) => {
                  const label = client.name || client.email || client.id;
                  const isActive = client.id === selectedClientId;
                  return (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                        isActive ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">
                        {client.email && <span>{client.email} · </span>}
                        <span>{client.id}</span>
                        {client.plan && <span className="ml-1">· {client.plan}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Éditeur de configuration pour le client sélectionné */}
          <div className="lg:col-span-2">
            {selectedClientId ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Client: {selectedClientId}
                    </h2>
                    {!editingClientId && (
                      <button
                        onClick={startEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingConfig ? (
                  <div className="p-6 text-center text-gray-500">
                    Loading configuration...
                  </div>
                ) : (
                  <div className="p-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Workflow Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Workflow ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editingClientId ? (
                          <>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Leads
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.leads_workflow_id || ''}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      leads_workflow_id: e.target.value,
                                    })
                                  }
                                  placeholder="Workflow ID"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Voice Bot
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.voice_bot_workflow_id || ''}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      voice_bot_workflow_id: e.target.value,
                                    })
                                  }
                                  placeholder="Workflow ID"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Receptionist
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.receptionist_workflow_id || ''}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      receptionist_workflow_id: e.target.value,
                                    })
                                  }
                                  placeholder="Workflow ID"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Mailing Campaigns
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.mailing_campaigns_workflow_id || ''}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      mailing_campaigns_workflow_id: e.target.value,
                                    })
                                  }
                                  placeholder="Workflow ID"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Analytics
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={editForm.analytics_workflow_id || ''}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      analytics_workflow_id: e.target.value,
                                    })
                                  }
                                  placeholder="Workflow ID"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2} className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      saveMutation.mutate({
                                        clientId: selectedClientId,
                                        config: editForm,
                                      })
                                    }
                                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                                  >
                                    <CheckIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Leads
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {config?.leads_workflow_id || '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Voice Bot
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {config?.voice_bot_workflow_id || '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Receptionist
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {config?.receptionist_workflow_id || '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Mailing Campaigns
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {config?.mailing_campaigns_workflow_id || '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Analytics
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {config?.analytics_workflow_id || '-'}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-gray-500 text-sm">
                Select a client on the left to view and edit their n8n workflow IDs.
              </div>
            )}
          </div>
        </div>

        {/* Chat Qwen Section */}
        <div className="mt-8">
          <ChatQwen />
        </div>
      </div>
    </div>
  );
}

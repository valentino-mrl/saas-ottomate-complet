// // import { useState } from 'react';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { mailingApi, campaignsApi, type LaunchCampaignInput } from '../../lib/apiClient';
// // import { PlusIcon } from '@heroicons/react/24/outline';

// // export default function MailingCampaignsPage() {
// //   const queryClient = useQueryClient();
// //   const [isCreating, setIsCreating] = useState(false);
// //   const [formData, setFormData] = useState({
// //     templateId: '',
// //     segmentId: '',
// //     start_date: '',
// //     end_date: '',
// //     daily_cap: 100,
// //     timezone: 'America/New_York',
// //   });

// //   const { data: templates } = useQuery({
// //     queryKey: ['mailing-templates'],
// //     queryFn: () => mailingApi.getTemplates(),
// //   });

// //   const launchMutation = useMutation({
// //     mutationFn: (params: LaunchCampaignInput) => campaignsApi.launch(params),
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['campaigns'] });
// //       setIsCreating(false);
// //       setFormData({
// //         templateId: '',
// //         segmentId: '',
// //         start_date: '',
// //         end_date: '',
// //         daily_cap: 100,
// //         timezone: 'America/New_York',
// //       });
// //       alert('Campaign launched successfully!');
// //     },
// //   });

// //   const handleLaunch = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!formData.templateId || !formData.start_date) {
// //       alert('Template and start date are required');
// //       return;
// //     }

// //     launchMutation.mutate({
// //       templateId: formData.templateId,
// //       segmentId: formData.segmentId || undefined,
// //       schedule: {
// //         start_date: formData.start_date,
// //         end_date: formData.end_date || undefined,
// //         daily_cap: formData.daily_cap,
// //         timezone: formData.timezone,
// //       },
// //     });
// //   };

// //   return (
// //     <div>
// //       <div className="mb-8 flex items-center justify-between">
// //         <div>
// //           <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
// //           <p className="text-gray-600 mt-2">
// //             Launch and manage email campaigns based on your templates.
// //           </p>
// //         </div>
// //         <button
// //           onClick={() => setIsCreating(true)}
// //           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
// //         >
// //           <PlusIcon className="w-5 h-5" />
// //           New Campaign
// //         </button>
// //       </div>

// //       {/* Create Campaign Form */}
// //       {isCreating && (
// //         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
// //           <h2 className="text-xl font-semibold text-gray-900 mb-4">Launch New Campaign</h2>
// //           <form onSubmit={handleLaunch} className="space-y-4">
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Template <span className="text-red-500">*</span>
// //                 </label>
// //                 <select
// //                   value={formData.templateId}
// //                   onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                   required
// //                 >
// //                   <option value="">Select a template</option>
// //                   {templates?.map((template, idx) => (
// //                     <option key={idx} value={template.name}>
// //                       {template.name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Segment ID (optional)
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={formData.segmentId}
// //                   onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
// //                   placeholder="Segment identifier"
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Start Date <span className="text-red-500">*</span>
// //                 </label>
// //                 <input
// //                   type="datetime-local"
// //                   value={formData.start_date}
// //                   onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                   required
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
// //                 <input
// //                   type="datetime-local"
// //                   value={formData.end_date}
// //                   onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Daily Cap
// //                 </label>
// //                 <input
// //                   type="number"
// //                   value={formData.daily_cap}
// //                   onChange={(e) => setFormData({ ...formData, daily_cap: Number(e.target.value) })}
// //                   min="1"
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
// //               <select
// //                 value={formData.timezone}
// //                 onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
// //                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //               >
// //                 <option value="America/New_York">Eastern Time</option>
// //                 <option value="America/Chicago">Central Time</option>
// //                 <option value="America/Denver">Mountain Time</option>
// //                 <option value="America/Los_Angeles">Pacific Time</option>
// //                 <option value="Europe/London">London</option>
// //                 <option value="Europe/Paris">Paris</option>
// //               </select>
// //             </div>

// //             <div className="flex gap-2">
// //               <button
// //                 type="submit"
// //                 disabled={launchMutation.isPending}
// //                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
// //               >
// //                 {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
// //               </button>
// //               <button
// //                 type="button"
// //                 onClick={() => setIsCreating(false)}
// //                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}

// //       {/* Campaigns List - Note: Backend may need GET /api/mailing/campaigns endpoint */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Campaigns</h2>
// //         <div className="text-center py-8 text-gray-500">
// //           <p>Campaign list will appear here once backend implements GET /api/mailing/campaigns</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // import { useState } from 'react';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { useParams } from 'react-router-dom';
// // import {
// //   mailingApi,
// //   campaignsApi,
// //   type LaunchCampaignInput,
// //   type InstantlyEmailTemplate,
// // } from '../../lib/apiClient';
// // import { PlusIcon } from '@heroicons/react/24/outline';

// // export default function MailingCampaignsPage() {
// //   const queryClient = useQueryClient();

// //   // ✅ IMPORTANT : on récupère :id (même convention que /api/instantly/clients/:id/...)
// // const params = useParams();
// // const clientId = String(params.clientId || params.id || '');


// //   const [isCreating, setIsCreating] = useState(false);
// //   const [formData, setFormData] = useState({
// //     templateId: '',
// //     segmentId: '',
// //     start_date: '',
// //     end_date: '',
// //     daily_cap: 100,
// //     timezone: 'Europe/Paris',
// //   });

// //   const { data: templates, isLoading: templatesLoading, error: templatesError } = useQuery({
// //     queryKey: ['mailing-templates', clientId],
// //     enabled: !!clientId,
// //     queryFn: () => mailingApi.getTemplates(clientId),
// //   });

// //   const launchMutation = useMutation({
// //     mutationFn: (params: LaunchCampaignInput) => campaignsApi.launch(params),
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['campaigns', clientId] });
// //       setIsCreating(false);
// //       setFormData({
// //         templateId: '',
// //         segmentId: '',
// //         start_date: '',
// //         end_date: '',
// //         daily_cap: 100,
// //         timezone: 'Europe/Paris',
// //       });
// //       alert('Campaign launched successfully!');
// //     },
// //   });

// //   const handleLaunch = (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!clientId) {
// //       alert('Missing client id in URL');
// //       return;
// //     }

// //     if (!formData.templateId || !formData.start_date) {
// //       alert('Template and start date are required');
// //       return;
// //     }

// //     // ⚠️ Si ton backend a besoin du clientId pour lancer une campagne,
// //     // ajoute-le dans LaunchCampaignInput côté apiClient/campaignsApi.
// //     // Ici je garde ta signature actuelle.
// //     launchMutation.mutate({
// //       templateId: formData.templateId, // ✅ ID du template Instantly
// //       segmentId: formData.segmentId || undefined,
// //       schedule: {
// //         start_date: formData.start_date,
// //         end_date: formData.end_date || undefined,
// //         daily_cap: formData.daily_cap,
// //         timezone: formData.timezone,
// //       },
// //     });
// //   };

// //   return (
// //     <div>
// //       <div className="mb-8 flex items-center justify-between">
// //         <div>
// //           <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
// //           <p className="text-gray-600 mt-2">Launch and manage email campaigns based on your templates.</p>

// //           {!clientId && (
// //             <p className="mt-2 text-sm text-red-600">
// //               id manquant dans l’URL. Route attendue : /clients/:id/...
// //             </p>
// //           )}
// //         </div>

// //         <button
// //           onClick={() => setIsCreating(true)}
// //           disabled={!clientId}
// //           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
// //         >
// //           <PlusIcon className="w-5 h-5" />
// //           New Campaign
// //         </button>
// //       </div>

// //       {templatesError ? (
// //         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
// //           {(templatesError as Error).message}
// //         </div>
// //       ) : null}

// //       {/* Create Campaign Form */}
// //       {isCreating && (
// //         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
// //           <h2 className="text-xl font-semibold text-gray-900 mb-4">Launch New Campaign</h2>

// //           <form onSubmit={handleLaunch} className="space-y-4">
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Template <span className="text-red-500">*</span>
// //                 </label>

// //                 <select
// //                   value={formData.templateId}
// //                   onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                   required
// //                   disabled={templatesLoading}
// //                 >
// //                   <option value="">
// //                     {templatesLoading ? 'Loading templates...' : 'Select a template'}
// //                   </option>

// //                   {templates?.map((template: InstantlyEmailTemplate, idx: number) => (
// //                     <option key={template.id || idx} value={template.id}>
// //                       {template.name}
// //                     </option>
// //                   ))}
// //                 </select>

// //                 {templates && templates.length === 0 && !templatesLoading ? (
// //                   <p className="mt-2 text-xs text-gray-500">
// //                     Aucun template trouvé pour ce client (Instantly).
// //                   </p>
// //                 ) : null}
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Segment ID (optional)
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={formData.segmentId}
// //                   onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
// //                   placeholder="Segment identifier"
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Start Date <span className="text-red-500">*</span>
// //                 </label>
// //                 <input
// //                   type="datetime-local"
// //                   value={formData.start_date}
// //                   onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                   required
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
// //                 <input
// //                   type="datetime-local"
// //                   value={formData.end_date}
// //                   onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Daily Cap</label>
// //                 <input
// //                   type="number"
// //                   value={formData.daily_cap}
// //                   onChange={(e) => setFormData({ ...formData, daily_cap: Number(e.target.value) })}
// //                   min={1}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
// //               <select
// //                 value={formData.timezone}
// //                 onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
// //                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //               >
// //                 <option value="Europe/Paris">Paris</option>
// //                 <option value="Europe/London">London</option>
// //                 <option value="America/New_York">Eastern Time</option>
// //                 <option value="America/Chicago">Central Time</option>
// //                 <option value="America/Denver">Mountain Time</option>
// //                 <option value="America/Los_Angeles">Pacific Time</option>
// //               </select>
// //             </div>

// //             <div className="flex gap-2">
// //               <button
// //                 type="submit"
// //                 disabled={launchMutation.isPending}
// //                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
// //               >
// //                 {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
// //               </button>

// //               <button
// //                 type="button"
// //                 onClick={() => setIsCreating(false)}
// //                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}

// //       {/* Campaigns List - Note: Backend may need GET /api/... endpoint */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Campaigns</h2>
// //         <div className="text-center py-8 text-gray-500">
// //           <p>Campaign list will appear here once backend implements GET /api/.../campaigns</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // // src/features/mailing/MailingCampaignsPage.tsx
// // import React, { useMemo, useState } from 'react';
// // import { useQuery, useMutation } from '@tanstack/react-query';
// // import { PlusIcon } from '@heroicons/react/24/outline';
// // import { useAuth } from '../../contexts/AuthContext';
// // import {
// //   mailingApi,
// //   campaignsApi,
// //   type InstantlyEmailTemplate,
// //   type LaunchCampaignInput,
// // } from '../../lib/apiClient';

// // function parseEmails(input: string): string[] {
// //   return input
// //     .split(/[\n,; ]+/g)
// //     .map((s) => s.trim())
// //     .filter(Boolean)
// //     .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
// // }

// // export default function MailingCampaignsPage() {
// //   const { user } = useAuth();
// //   const clientId = user?.id || '';

// //   const [isCreating, setIsCreating] = useState(false);
// //   const [templateId, setTemplateId] = useState('');
// //   const [emailsRaw, setEmailsRaw] = useState('');
// //   const [dailyCap, setDailyCap] = useState(100);
// //   const [timezone, setTimezone] = useState('Europe/Paris');

// //   const emails = useMemo(() => parseEmails(emailsRaw), [emailsRaw]);

// //   const {
// //     data: templates,
// //     isLoading: templatesLoading,
// //     error: templatesError,
// //   } = useQuery({
// //     queryKey: ['instantly-templates', clientId],
// //     enabled: !!clientId,
// //     queryFn: () => mailingApi.getTemplates(clientId),
// //   });

// //   const launchMutation = useMutation({
// //     mutationFn: (payload: LaunchCampaignInput) => campaignsApi.launch(payload),
// //     onSuccess: (data) => {
// //       alert(`Campaign launched ✅ ${data?.campaign_id ? `(#${data.campaign_id})` : ''}`);
// //       setIsCreating(false);
// //       setTemplateId('');
// //       setEmailsRaw('');
// //       setDailyCap(100);
// //       setTimezone('Europe/Paris');
// //     },
// //     onError: (err) => {
// //       alert((err as Error).message);
// //     },
// //   });

// //   const handleLaunch = (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!templateId) return alert('Choisis un template');
// //     if (emails.length === 0) return alert('Ajoute au moins 1 email valide');

// //     launchMutation.mutate({
// //   templateId: formData.templateId,     // string
// //   emails: emailsArray,                 // string[]
// //   schedule: {
// //     daily_cap: formData.daily_cap,
// //     timezone: formData.timezone,
// //   },
// // });

// //   };

// //   return (
// //     <div>
// //       <div className="mb-8 flex items-center justify-between">
// //         <div>
// //           <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
// //           <p className="text-gray-600 mt-2">
// //             Lance une campagne Instantly à partir d’un template + une liste d’emails.
// //           </p>
// //           {!clientId ? (
// //             <p className="mt-2 text-sm text-red-600">Utilisateur non connecté.</p>
// //           ) : null}
// //         </div>

// //         <button
// //           onClick={() => setIsCreating(true)}
// //           disabled={!clientId}
// //           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
// //         >
// //           <PlusIcon className="w-5 h-5" />
// //           New Campaign
// //         </button>
// //       </div>

// //       {templatesError ? (
// //         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
// //           {(templatesError as Error).message}
// //         </div>
// //       ) : null}

// //       {isCreating && (
// //         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
// //           <h2 className="text-xl font-semibold text-gray-900 mb-4">Launch New Campaign</h2>

// //           <form onSubmit={handleLaunch} className="space-y-4">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 Template <span className="text-red-500">*</span>
// //               </label>

// //               <select
// //                 value={templateId}
// //                 onChange={(e) => setTemplateId(e.target.value)}
// //                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 required
// //                 disabled={templatesLoading}
// //               >
// //                 <option value="">
// //                   {templatesLoading ? 'Loading templates...' : 'Select a template'}
// //                 </option>

// //                 {(templates || []).map((t: InstantlyEmailTemplate) => (
// //                   <option key={t.id} value={t.id}>
// //                     {t.name}
// //                   </option>
// //                 ))}
// //               </select>

// //               {!templatesLoading && (templates || []).length === 0 ? (
// //                 <p className="mt-2 text-xs text-gray-500">
// //                   Aucun template trouvé. Crée d’abord un template dans “Mailing Templates”.
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 Emails (1 par ligne ou séparés par virgule) <span className="text-red-500">*</span>
// //               </label>
// //               <textarea
// //                 value={emailsRaw}
// //                 onChange={(e) => setEmailsRaw(e.target.value)}
// //                 rows={8}
// //                 placeholder={`john@acme.com\npaul@acme.com`}
// //                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
// //               />
// //               <p className="mt-1 text-xs text-gray-500">
// //                 Emails valides détectés : <strong>{emails.length}</strong>
// //               </p>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Daily cap</label>
// //                 <input
// //                   type="number"
// //                   min={1}
// //                   value={dailyCap}
// //                   onChange={(e) => setDailyCap(Number(e.target.value))}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
// //                 <select
// //                   value={timezone}
// //                   onChange={(e) => setTimezone(e.target.value)}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                 >
// //                   <option value="Europe/Paris">Paris</option>
// //                   <option value="Europe/London">London</option>
// //                   <option value="America/New_York">Eastern Time</option>
// //                   <option value="America/Chicago">Central Time</option>
// //                   <option value="America/Denver">Mountain Time</option>
// //                   <option value="America/Los_Angeles">Pacific Time</option>
// //                 </select>
// //               </div>
// //             </div>

// //             <div className="flex gap-2">
// //               <button
// //                 type="submit"
// //                 disabled={launchMutation.isPending}
// //                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
// //               >
// //                 {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
// //               </button>

// //               <button
// //                 type="button"
// //                 onClick={() => setIsCreating(false)}
// //                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}

// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Campaigns</h2>
// //         <div className="text-center py-8 text-gray-500">
// //           (Optionnel) On affichera la liste des campagnes quand tu veux un endpoint GET.
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import { useMemo, useState } from 'react';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { PlusIcon } from '@heroicons/react/24/outline';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   mailingApi,
//   campaignsApi,
//   type InstantlyEmailTemplate,
//   type LaunchCampaignInput,
// } from '../../lib/apiClient';

// function parseEmails(raw: string): string[] {
//   return raw
//     .split(/[\n,; \t]+/g)
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// function isValidEmail(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// export default function MailingCampaignsPage() {
//   const { user } = useAuth();

//   // ✅ on prend l'id du user connecté comme "id client"
//   // (tu es connecté en tant que client => c'est TON id)
//   const clientId = user?.id || '';

//   const [isCreating, setIsCreating] = useState(false);

//   const [formData, setFormData] = useState({
//     templateId: '',
//     emailsRaw: '',
//     daily_cap: 100,
//     timezone: 'Europe/Paris',
//   });

//   const {
//     data: templates,
//     isLoading: templatesLoading,
//     error: templatesError,
//   } = useQuery({
//     queryKey: ['instantly-templates', clientId],
//     enabled: !!clientId,
//     queryFn: () => mailingApi.getTemplates(clientId),
//   });

//   const emailsParsed = useMemo(() => {
//     const arr = parseEmails(formData.emailsRaw);
//     const valid = arr.filter(isValidEmail);
//     // dédoublonne
//     return Array.from(new Set(valid));
//   }, [formData.emailsRaw]);

//   const invalidEmails = useMemo(() => {
//     const arr = parseEmails(formData.emailsRaw);
//     return arr.filter((e) => e && !isValidEmail(e));
//   }, [formData.emailsRaw]);

//   const launchMutation = useMutation({
//     mutationFn: (payload: LaunchCampaignInput) => campaignsApi.launch(payload),
//     onSuccess: (res) => {
//       setIsCreating(false);
//       setFormData({
//         templateId: '',
//         emailsRaw: '',
//         daily_cap: 100,
//         timezone: 'Europe/Paris',
//       });

//       alert(
//         res?.campaign_id
//           ? `Campaign launched! ID: ${res.campaign_id}`
//           : 'Campaign launched!'
//       );
//     },
//     onError: (err) => {
//       alert((err as Error).message);
//     },
//   });

//   const handleLaunch = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!clientId) {
//       alert('Not authenticated');
//       return;
//     }

//     if (!formData.templateId) {
//       alert('Template is required');
//       return;
//     }

//     if (emailsParsed.length === 0) {
//       alert('You must provide at least 1 valid email');
//       return;
//     }

//     launchMutation.mutate({
//       templateId: formData.templateId,
//       emails: emailsParsed,
//       schedule: {
//         daily_cap: formData.daily_cap,
//         timezone: formData.timezone,
//       },
//     });
//   };

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
//           <p className="text-gray-600 mt-2">
//             Lance une campagne Instantly en sélectionnant un template + une liste d’emails.
//           </p>
//           {!clientId && (
//             <p className="mt-2 text-sm text-red-600">
//               Tu n’es pas connecté (clientId introuvable).
//             </p>
//           )}
//         </div>

//         <button
//           onClick={() => setIsCreating(true)}
//           disabled={!clientId}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//         >
//           <PlusIcon className="w-5 h-5" />
//           New Campaign
//         </button>
//       </div>

//       {templatesError ? (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {(templatesError as Error).message}
//         </div>
//       ) : null}

//       {/* Create Campaign Form */}
//       {isCreating && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Launch New Campaign</h2>

//           <form onSubmit={handleLaunch} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* TEMPLATE */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Template <span className="text-red-500">*</span>
//                 </label>

//                 <select
//                   value={formData.templateId}
//                   onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                   disabled={templatesLoading}
//                 >
//                   <option value="">
//                     {templatesLoading ? 'Loading templates...' : 'Select a template'}
//                   </option>

//                   {(templates || []).map((t: InstantlyEmailTemplate) => (
//                     <option key={t.id} value={t.id}>
//                       {t.name}
//                     </option>
//                   ))}
//                 </select>

//                 {templates && templates.length === 0 && !templatesLoading ? (
//                   <p className="mt-2 text-xs text-gray-500">
//                     Aucun template Instantly trouvé.
//                   </p>
//                 ) : null}
//               </div>

//               {/* DAILY CAP */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Daily Cap
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.daily_cap}
//                   onChange={(e) => setFormData({ ...formData, daily_cap: Number(e.target.value) })}
//                   min={1}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//                 <p className="mt-1 text-xs text-gray-500">
//                   Limite quotidienne côté campagne Instantly.
//                 </p>
//               </div>
//             </div>

//             {/* TIMEZONE */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Timezone
//               </label>
//               <select
//                 value={formData.timezone}
//                 onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Europe/Paris">Europe/Paris</option>
//                 <option value="Europe/London">Europe/London</option>
//                 <option value="America/New_York">America/New_York</option>
//                 <option value="America/Chicago">America/Chicago</option>
//                 <option value="America/Denver">America/Denver</option>
//                 <option value="America/Los_Angeles">America/Los_Angeles</option>
//               </select>
//             </div>

//             {/* EMAIL LIST */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Emails <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={formData.emailsRaw}
//                 onChange={(e) => setFormData({ ...formData, emailsRaw: e.target.value })}
//                 rows={8}
//                 placeholder={`Colle tes emails ici (1 par ligne, ou séparés par virgules)\nex:\nhello@site.com\ncontact@site.com`}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                 required
//               />

//               <div className="mt-2 flex flex-wrap gap-2 text-xs">
//                 <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
//                   Valid: {emailsParsed.length}
//                 </span>
//                 {invalidEmails.length > 0 ? (
//                   <span className="px-2 py-1 rounded bg-red-100 text-red-700">
//                     Invalid: {invalidEmails.length}
//                   </span>
//                 ) : null}
//               </div>

//               {invalidEmails.length > 0 ? (
//                 <div className="mt-2 text-xs text-red-700">
//                   Exemples invalides: {invalidEmails.slice(0, 5).join(', ')}
//                   {invalidEmails.length > 5 ? '…' : ''}
//                 </div>
//               ) : null}
//             </div>

//             <div className="flex gap-2">
//               <button
//                 type="submit"
//                 disabled={launchMutation.isPending}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setIsCreating(false)}
//                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Campaign list placeholder */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Campaigns</h2>
//         <div className="text-center py-8 text-gray-500">
//           <p>On ajoutera la liste des campagnes quand tu voudras.</p>
//         </div>
//       </div>
//     </div>
//   );
// }



// // src/features/mailing/MailingCampaignsPage.tsx
// import { useMemo, useState } from 'react';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { PlusIcon } from '@heroicons/react/24/outline';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   mailingApi,
//   campaignsApi,
//   type InstantlyEmailTemplate,
//   type LaunchCampaignInput,
// } from '../../lib/apiClient';

// function parseEmails(raw: string): string[] {
//   return raw
//     .split(/[\n,; \t]+/g)
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// function isValidEmail(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// export default function MailingCampaignsPage() {
//   const { user } = useAuth();
//   const clientId = user?.id || '';

//   const [isCreating, setIsCreating] = useState(false);

//   const [formData, setFormData] = useState({
//     templateId: '',
//     emailsRaw: '',
//     daily_cap: 100,
//     timezone: 'Europe/Belgrade', // ✅ Instantly accepte ça (France)
//   });

//   const emailsParsed = useMemo(() => {
//     const arr = parseEmails(formData.emailsRaw);
//     const valid = arr.filter(isValidEmail);
//     return Array.from(new Set(valid)); // dédoublonne
//   }, [formData.emailsRaw]);

//   const invalidEmails = useMemo(() => {
//     const arr = parseEmails(formData.emailsRaw);
//     return arr.filter((e) => e && !isValidEmail(e));
//   }, [formData.emailsRaw]);

//   const {
//     data: templates,
//     isLoading: templatesLoading,
//     error: templatesError,
//   } = useQuery({
//     queryKey: ['instantly-templates', clientId],
//     enabled: !!clientId,

//     // ✅ STOP “actualisation” inutile
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//     refetchOnMount: false,
//     retry: false,
//     staleTime: 1000 * 60 * 10, // 10 min
//     gcTime: 1000 * 60 * 30,    // 30 min

//     queryFn: () => mailingApi.getTemplates(clientId),
//   });

//   const launchMutation = useMutation({
//     mutationFn: (payload: LaunchCampaignInput) => campaignsApi.launch(payload),
//     onSuccess: (res) => {
//       // ✅ pas d’invalidateQueries => pas de “refresh” visuel inutile
//       setIsCreating(false);
//       setFormData({
//         templateId: '',
//         emailsRaw: '',
//         daily_cap: 100,
//         timezone: 'Europe/Belgrade',
//       });

//       alert(
//         res?.campaign_id
//           ? `Campaign launched! ID: ${res.campaign_id}`
//           : 'Campaign launched!'
//       );
//     },
//     onError: (err) => {
//       alert((err as Error).message);
//     },
//   });

//   const handleLaunch = (e: React.FormEvent) => {
//     e.preventDefault(); // ✅ empêche toute “reload”

//     if (!clientId) return alert('Not authenticated');
//     if (!formData.templateId) return alert('Template is required');
//     if (emailsParsed.length === 0) return alert('You must provide at least 1 valid email');

//     launchMutation.mutate({
//       templateId: formData.templateId,
//       emails: emailsParsed,
//       schedule: {
//         daily_cap: formData.daily_cap,
//         timezone: formData.timezone, // ✅ Europe/Belgrade
//       },
//     });
//   };

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
//           <p className="text-gray-600 mt-2">
//             Lance une campagne Instantly en sélectionnant un template + une liste d’emails.
//           </p>
//           {!clientId ? (
//             <p className="mt-2 text-sm text-red-600">Tu n’es pas connecté (clientId introuvable).</p>
//           ) : null}
//         </div>

//         <button
//           type="button" // ✅ important
//           onClick={() => setIsCreating(true)}
//           disabled={!clientId}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//         >
//           <PlusIcon className="w-5 h-5" />
//           New Campaign
//         </button>
//       </div>

//       {templatesError ? (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {(templatesError as Error).message}
//         </div>
//       ) : null}

//       {isCreating && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Launch New Campaign</h2>

//           <form onSubmit={handleLaunch} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Template <span className="text-red-500">*</span>
//                 </label>

//                 <select
//                   value={formData.templateId}
//                   onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                   disabled={templatesLoading}
//                 >
//                   <option value="">
//                     {templatesLoading ? 'Loading templates...' : 'Select a template'}
//                   </option>

//                   {(templates || []).map((t: InstantlyEmailTemplate) => (
//                     <option key={t.id} value={t.id}>
//                       {t.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Daily Cap</label>
//                 <input
//                   type="number"
//                   value={formData.daily_cap}
//                   onChange={(e) => setFormData({ ...formData, daily_cap: Number(e.target.value) })}
//                   min={1}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
//               <select
//                 value={formData.timezone}
//                 onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 {/* ✅ France */}
//                 <option value="Europe/Belgrade">Europe/Belgrade (France)</option>

//                 {/* autres (si tu veux) */}
//                 <option value="Europe/London">Europe/London</option>
//                 <option value="America/New_York">America/New_York</option>
//                 <option value="America/Chicago">America/Chicago</option>
//                 <option value="America/Denver">America/Denver</option>
//                 <option value="America/Los_Angeles">America/Los_Angeles</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Emails <span className="text-red-500">*</span>
//               </label>

//               <textarea
//                 value={formData.emailsRaw}
//                 onChange={(e) => setFormData({ ...formData, emailsRaw: e.target.value })}
//                 rows={8}
//                 placeholder={`1 email par ligne ou séparés par virgule\nex:\nhello@site.com\ncontact@site.com`}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                 required
//               />

//               <div className="mt-2 flex flex-wrap gap-2 text-xs">
//                 <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
//                   Valid: {emailsParsed.length}
//                 </span>
//                 {invalidEmails.length > 0 ? (
//                   <span className="px-2 py-1 rounded bg-red-100 text-red-700">
//                     Invalid: {invalidEmails.length}
//                   </span>
//                 ) : null}
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 type="submit"
//                 disabled={launchMutation.isPending}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
//               </button>

//               <button
//                 type="button" // ✅ important
//                 onClick={() => setIsCreating(true)}
//                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Campaigns</h2>
//         <div className="text-center py-8 text-gray-500">
//           <p>(Optionnel) On affichera la liste des campagnes quand tu voudras.</p>
//         </div>
//       </div>
//     </div>
//   );
// }












// // src/features/mailing/MailingCampaignsPage.tsx
// import { useMemo, useState } from 'react';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { PlusIcon } from '@heroicons/react/24/outline';
// import { useSearchParams } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   mailingApi,
//   campaignsApi,
//   type InstantlyEmailTemplate,
//   type LaunchCampaignInput,
// } from '../../lib/apiClient';

// function parseEmails(raw: string): string[] {
//   return raw
//     .split(/[\n,; \t]+/g)
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// function isValidEmail(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// export default function MailingCampaignsPage() {
//   const { user } = useAuth();

//   // ✅ clientId venant de l'URL: ?clientId=uuid
//   const [searchParams] = useSearchParams();
//   const clientIdFromUrl = searchParams.get('clientId') || '';

//   // ✅ on garde aussi le user id si besoin, mais la source "officielle" ici = URL
//   const clientId = clientIdFromUrl || user?.id || '';

//   const [isCreating, setIsCreating] = useState(false);

//   const [formData, setFormData] = useState({
//     templateId: '',
//     emailsRaw: '',
//     daily_cap: 100,
//     timezone: 'Europe/Belgrade',
//   });

//   const emailsParsed = useMemo(() => {
//     const arr = parseEmails(formData.emailsRaw);
//     const valid = arr.filter(isValidEmail);
//     return Array.from(new Set(valid));
//   }, [formData.emailsRaw]);

//   const invalidEmails = useMemo(() => {
//     const arr = parseEmails(formData.emailsRaw);
//     return arr.filter((e) => e && !isValidEmail(e));
//   }, [formData.emailsRaw]);

//   const {
//     data: templates,
//     isLoading: templatesLoading,
//     error: templatesError,
//   } = useQuery({
//     queryKey: ['instantly-templates', clientId],
//     enabled: !!clientId,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//     refetchOnMount: false,
//     retry: false,
//     staleTime: 1000 * 60 * 10,
//     gcTime: 1000 * 60 * 30,
//     queryFn: () => mailingApi.getTemplates(clientId),
//   });

//   const launchMutation = useMutation({
//     mutationFn: (payload: LaunchCampaignInput) => campaignsApi.launch(payload),
//     onSuccess: (res) => {
//       setIsCreating(false);
//       setFormData({
//         templateId: '',
//         emailsRaw: '',
//         daily_cap: 100,
//         timezone: 'Europe/Belgrade',
//       });

//       alert(res?.campaign_id ? `Campaign launched! ID: ${res.campaign_id}` : 'Campaign launched!');
//     },
//     onError: (err) => {
//       alert((err as Error).message);
//     },
//   });

//   const handleLaunch = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!clientId) return alert('Not authenticated (clientId missing)');
//     if (!formData.templateId) return alert('Template is required');
//     if (emailsParsed.length === 0) return alert('You must provide at least 1 valid email');

//     // ✅ envoi clientId dans le body (doit exister dans LaunchCampaignInput côté types)
//     launchMutation.mutate({
//       templateId: formData.templateId,
//       emails: emailsParsed,
//       schedule: {
//         daily_cap: formData.daily_cap,
//         timezone: formData.timezone,
//       },
//       clientId,
//     } as LaunchCampaignInput);
//   };

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
//           <p className="text-gray-600 mt-2">
//             Lance une campagne Instantly en sélectionnant un template + une liste d’emails.
//           </p>

//           {!clientId ? (
//             <p className="mt-2 text-sm text-red-600">
//               Tu n’es pas connecté (clientId introuvable).
//             </p>
//           ) : null}

//           {/* ✅ debug visuel (tu peux enlever après) */}
//           {clientIdFromUrl ? (
//             <p className="mt-1 text-xs text-gray-500">
//               clientId (URL): <span className="font-mono">{clientIdFromUrl}</span>
//             </p>
//           ) : (
//             <p className="mt-1 text-xs text-gray-500">
//               clientId (fallback user.id): <span className="font-mono">{user?.id || 'none'}</span>
//             </p>
//           )}
//         </div>

//         <button
//           type="button"
//           onClick={() => setIsCreating(true)}
//           disabled={!clientId}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//         >
//           <PlusIcon className="w-5 h-5" />
//           New Campaign
//         </button>
//       </div>

//       {templatesError ? (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {(templatesError as Error).message}
//         </div>
//       ) : null}

//       {isCreating && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Launch New Campaign</h2>

//           <form onSubmit={handleLaunch} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Template <span className="text-red-500">*</span>
//                 </label>

//                 <select
//                   value={formData.templateId}
//                   onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                   disabled={templatesLoading}
//                 >
//                   <option value="">
//                     {templatesLoading ? 'Loading templates...' : 'Select a template'}
//                   </option>

//                   {(templates || []).map((t: InstantlyEmailTemplate) => (
//                     <option key={t.id} value={t.id}>
//                       {t.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Daily Cap</label>
//                 <input
//                   type="number"
//                   value={formData.daily_cap}
//                   onChange={(e) => setFormData({ ...formData, daily_cap: Number(e.target.value) })}
//                   min={1}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
//               <select
//                 value={formData.timezone}
//                 onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Europe/Belgrade">Europe/Belgrade (France)</option>
//                 <option value="Europe/London">Europe/London</option>
//                 <option value="America/New_York">America/New_York</option>
//                 <option value="America/Chicago">America/Chicago</option>
//                 <option value="America/Denver">America/Denver</option>
//                 <option value="America/Los_Angeles">America/Los_Angeles</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Emails <span className="text-red-500">*</span>
//               </label>

//               <textarea
//                 value={formData.emailsRaw}
//                 onChange={(e) => setFormData({ ...formData, emailsRaw: e.target.value })}
//                 rows={8}
//                 placeholder={`1 email par ligne ou séparés par virgule\nex:\nhello@site.com\ncontact@site.com`}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                 required
//               />

//               <div className="mt-2 flex flex-wrap gap-2 text-xs">
//                 <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
//                   Valid: {emailsParsed.length}
//                 </span>
//                 {invalidEmails.length > 0 ? (
//                   <span className="px-2 py-1 rounded bg-red-100 text-red-700">
//                     Invalid: {invalidEmails.length}
//                   </span>
//                 ) : null}
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 type="submit"
//                 disabled={launchMutation.isPending}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setIsCreating(false)}
//                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Campaigns</h2>
//         <div className="text-center py-8 text-gray-500">
//           <p>(Optionnel) On affichera la liste des campagnes quand tu voudras.</p>
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useMemo, useState } from 'react';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { PlusIcon } from '@heroicons/react/24/outline';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   mailingApi,
//   campaignsApi,
//   type InstantlyEmailTemplate,
//   type LaunchCampaignInput,
// } from '../../lib/apiClient';

// import LeadListSelectorPanel from './components/LeadListSelectorPanel';

// function parseEmails(raw: string): string[] {
//   return raw
//     .split(/[\n,; \t]+/g)
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// function isValidEmail(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function uniq(arr: string[]) {
//   return Array.from(new Set(arr));
// }

// export default function MailingCampaignsPage() {
//   const { user } = useAuth();
//   const clientId = user?.id || '';

//   const [isCreating, setIsCreating] = useState(false);

//   const [formData, setFormData] = useState({
//     templateId: '',
//     emailsRaw: '',
//     daily_cap: 100,
//     timezone: 'Europe/Belgrade',
//   });

//   // emails venant d’une liste Supabase (sélecteur)
//   const [selectedListEmails, setSelectedListEmails] = useState<string[]>([]);

//   // -> emails finaux envoyés = textarea + liste (uniq + valid only)
//   const emailsParsed = useMemo(() => {
//     const typed = parseEmails(formData.emailsRaw).map((e) => e.trim().toLowerCase());
//     const list = (selectedListEmails || []).map((e) => e.trim().toLowerCase());
//     const merged = uniq([...typed, ...list]).filter(Boolean);
//     const valid = merged.filter(isValidEmail);
//     return valid;
//   }, [formData.emailsRaw, selectedListEmails]);

//   const invalidEmails = useMemo(() => {
//     const typed = parseEmails(formData.emailsRaw).map((e) => e.trim().toLowerCase());
//     const merged = uniq([...typed, ...(selectedListEmails || [])]).filter(Boolean);
//     return merged.filter((e) => e && !isValidEmail(e));
//   }, [formData.emailsRaw, selectedListEmails]);

//   const {
//     data: templates,
//     isLoading: templatesLoading,
//     error: templatesError,
//   } = useQuery({
//     queryKey: ['instantly-templates', clientId],
//     enabled: !!clientId,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//     refetchOnMount: false,
//     retry: false,
//     staleTime: 1000 * 60 * 10,
//     gcTime: 1000 * 60 * 30,
//     queryFn: () => mailingApi.getTemplates(clientId),
//   });

//   const launchMutation = useMutation({
//     mutationFn: (payload: LaunchCampaignInput) => campaignsApi.launch(payload),
//     onSuccess: (res) => {
//       setIsCreating(false);
//       setFormData({
//         templateId: '',
//         emailsRaw: '',
//         daily_cap: 100,
//         timezone: 'Europe/Belgrade',
//       });
//       setSelectedListEmails([]);

//       alert(res?.campaign_id ? `Campaign launched! ID: ${res.campaign_id}` : 'Campaign launched!');
//     },
//     onError: (err) => {
//       alert((err as Error).message);
//     },
//   });

//   const handleLaunch = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!clientId) return alert('Not authenticated');
//     if (!formData.templateId) return alert('Template is required');
//     if (emailsParsed.length === 0) return alert('You must provide at least 1 valid email');

//     launchMutation.mutate({
//       templateId: formData.templateId,
//       emails: emailsParsed,
//       schedule: {
//         daily_cap: formData.daily_cap,
//         timezone: formData.timezone,
//       },
//       // ✅ tu envoies clientId AU BACKEND (ton backend l’attend)
//       // Si ton type TS ne l’a pas, alors il faut l’envoyer via header dans apiRequest.
//       // Ici je ne l’ajoute pas dans le body si ton type LaunchCampaignInput ne l’accepte pas.
//     } as LaunchCampaignInput);
//   };

//   // Option: bouton pour injecter la liste dans le textarea (si tu veux visualiser/edit)
//   const injectListIntoTextarea = () => {
//     const typed = parseEmails(formData.emailsRaw).map((e) => e.trim().toLowerCase());
//     const merged = uniq([...typed, ...selectedListEmails]).filter(Boolean);
//     setFormData((s) => ({ ...s, emailsRaw: merged.join('\n') }));
//   };

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
//           <p className="text-gray-600 mt-2">
//             Lance une campagne Instantly en sélectionnant un template + une liste d’emails.
//           </p>
//           {!clientId ? (
//             <p className="mt-2 text-sm text-red-600">Tu n’es pas connecté (clientId introuvable).</p>
//           ) : null}
//         </div>

//         <button
//           type="button"
//           onClick={() => setIsCreating(true)}
//           disabled={!clientId}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//         >
//           <PlusIcon className="w-5 h-5" />
//           New Campaign
//         </button>
//       </div>

//       {templatesError ? (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {(templatesError as Error).message}
//         </div>
//       ) : null}

//       {isCreating && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Launch New Campaign</h2>

//           <form onSubmit={handleLaunch} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Template <span className="text-red-500">*</span>
//                 </label>

//                 <select
//                   value={formData.templateId}
//                   onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                   disabled={templatesLoading}
//                 >
//                   <option value="">
//                     {templatesLoading ? 'Loading templates...' : 'Select a template'}
//                   </option>

//                   {(templates || []).map((t: InstantlyEmailTemplate) => (
//                     <option key={t.id} value={t.id}>
//                       {t.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Daily Cap</label>
//                 <input
//                   type="number"
//                   value={formData.daily_cap}
//                   onChange={(e) => setFormData({ ...formData, daily_cap: Number(e.target.value) })}
//                   min={1}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
//               <select
//                 value={formData.timezone}
//                 onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Europe/Belgrade">Europe/Belgrade (France)</option>
//                 <option value="Europe/London">Europe/London</option>
//                 <option value="America/New_York">America/New_York</option>
//                 <option value="America/Chicago">America/Chicago</option>
//                 <option value="America/Denver">America/Denver</option>
//                 <option value="America/Los_Angeles">America/Los_Angeles</option>
//               </select>
//             </div>

//             {/* ✅ SELECTEUR LISTES SUPABASE + PANEL EMAILS JUSTE EN DESSOUS */}
//             <LeadListSelectorPanel
//               clientId={clientId}
//               onEmailsChange={(emails) => {
//                 setSelectedListEmails(emails || []);
//               }}
//             />

//             {/* optionnel: injecter la liste dans le textarea */}
//             {selectedListEmails.length > 0 ? (
//               <button
//                 type="button"
//                 onClick={injectListIntoTextarea}
//                 className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
//               >
//                 Ajouter les emails de la liste dans le champ texte
//               </button>
//             ) : null}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Emails <span className="text-red-500">*</span>
//               </label>

//               <textarea
//                 value={formData.emailsRaw}
//                 onChange={(e) => setFormData({ ...formData, emailsRaw: e.target.value })}
//                 rows={8}
//                 placeholder={`1 email par ligne ou séparés par virgule\nex:\nhello@site.com\ncontact@site.com`}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                 required={emailsParsed.length === 0}
//               />

//               <div className="mt-2 flex flex-wrap gap-2 text-xs">
//                 <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
//                   Valid (final): {emailsParsed.length}
//                 </span>

//                 {invalidEmails.length > 0 ? (
//                   <span className="px-2 py-1 rounded bg-red-100 text-red-700">
//                     Invalid: {invalidEmails.length}
//                   </span>
//                 ) : null}

//                 {selectedListEmails.length > 0 ? (
//                   <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">
//                     From list: {selectedListEmails.length}
//                   </span>
//                 ) : null}
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 type="submit"
//                 disabled={launchMutation.isPending}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setIsCreating(false)}
//                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Campaigns</h2>
//         <div className="text-center py-8 text-gray-500">
//           <p>(Optionnel) On affichera la liste des campagnes quand tu voudras.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import {
  mailingApi,
  campaignsApi,
  type InstantlyEmailTemplate,
  type LaunchCampaignInput,
} from '../../lib/apiClient';

import LeadListSelectorPanel from './components/LeadListSelectorPanel';

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,; \t]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export default function MailingCampaignsPage() {
  const { user } = useAuth();
  const clientId = user?.id || '';

  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    templateId: '',
    emailsRaw: '',
    daily_cap: 100,
    timezone: 'Europe/Paris',
  });

  const [selectedListEmails, setSelectedListEmails] = useState<string[]>([]);

  const handleEmailsChange = useCallback((emails: string[]) => {
    setSelectedListEmails(emails || []);
  }, []);

  const emailsParsed = useMemo(() => {
    const typed = parseEmails(formData.emailsRaw).map((e) => e.trim().toLowerCase());
    const list = (selectedListEmails || []).map((e) => e.trim().toLowerCase());
    const merged = uniq([...typed, ...list]).filter(Boolean);
    return merged.filter(isValidEmail);
  }, [formData.emailsRaw, selectedListEmails]);

  const invalidEmails = useMemo(() => {
    const typed = parseEmails(formData.emailsRaw).map((e) => e.trim().toLowerCase());
    const list = (selectedListEmails || []).map((e) => e.trim().toLowerCase());
    const merged = uniq([...typed, ...list]).filter(Boolean);
    return merged.filter((e) => e && !isValidEmail(e));
  }, [formData.emailsRaw, selectedListEmails]);

  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery({
    queryKey: ['instantly-templates', clientId],
    enabled: !!clientId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    queryFn: () => mailingApi.getTemplates(clientId),
  });

  const launchMutation = useMutation({
    mutationFn: (payload: LaunchCampaignInput) => campaignsApi.launch(payload),
    onSuccess: (res) => {
      setIsCreating(false);
      setFormData({
        templateId: '',
        emailsRaw: '',
        daily_cap: 100,
        timezone: 'Europe/Paris',
      });
      setSelectedListEmails([]);

      alert(res?.campaign_id ? `Campaign launched! ID: ${res.campaign_id}` : 'Campaign launched!');
    },
    onError: (err) => {
      alert((err as Error).message);
    },
  });

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) return alert('Not authenticated');
    if (!formData.templateId) return alert('Template is required');
    if (emailsParsed.length === 0) return alert('You must provide at least 1 valid email');

    launchMutation.mutate({
      templateId: formData.templateId,
      emails: emailsParsed,
      schedule: {
        daily_cap: formData.daily_cap,
        timezone: formData.timezone,
      },
    } as LaunchCampaignInput);
  };

  const injectListIntoTextarea = () => {
    const typed = parseEmails(formData.emailsRaw).map((e) => e.trim().toLowerCase());
    const merged = uniq([...typed, ...selectedListEmails]).filter(Boolean);
    setFormData((s) => ({ ...s, emailsRaw: merged.join('\n') }));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mailing Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Lance une campagne Instantly en sélectionnant un template + une liste d’emails.
          </p>
          {!clientId ? (
            <p className="mt-2 text-sm text-red-600">Tu n’es pas connecté (clientId introuvable).</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          disabled={!clientId}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          New Campaign
        </button>
      </div>

      {templatesError ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(templatesError as Error).message}
        </div>
      ) : null}

      {isCreating && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Launch New Campaign</h2>

          <form onSubmit={handleLaunch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Template <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={templatesLoading}
                >
                  <option value="">
                    {templatesLoading ? 'Loading templates...' : 'Select a template'}
                  </option>

                  {(templates || []).map((t: InstantlyEmailTemplate) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Daily Cap</label>
                <input
                  type="number"
                  value={formData.daily_cap}
                  onChange={(e) => setFormData({ ...formData, daily_cap: Number(e.target.value) })}
                  min={1}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/Paris">Europe/Paris (France)</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
              </select>
            </div>

            <LeadListSelectorPanel
              clientId={clientId}
              onEmailsChange={handleEmailsChange}
            />

            {selectedListEmails.length > 0 ? (
              <button
                type="button"
                onClick={injectListIntoTextarea}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
              >
                Ajouter les emails de la liste dans le champ texte
              </button>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Emails <span className="text-red-500">*</span>
              </label>

              <textarea
                value={formData.emailsRaw}
                onChange={(e) => setFormData({ ...formData, emailsRaw: e.target.value })}
                rows={8}
                placeholder={`1 email par ligne ou séparés par virgule\nex:\nhello@site.com\ncontact@site.com`}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                required={emailsParsed.length === 0}
              />

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-gray-100 px-2 py-1 text-gray-700">
                  Valid (final): {emailsParsed.length}
                </span>

                {invalidEmails.length > 0 ? (
                  <span className="rounded bg-red-100 px-2 py-1 text-red-700">
                    Invalid: {invalidEmails.length}
                  </span>
                ) : null}

                {selectedListEmails.length > 0 ? (
                  <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                    From list: {selectedListEmails.length}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={launchMutation.isPending}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {launchMutation.isPending ? 'Launching...' : 'Launch Campaign'}
              </button>

              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Campaigns</h2>
        <div className="py-8 text-center text-gray-500">
          <p>(Optionnel) On affichera la liste des campagnes quand tu voudras.</p>
        </div>
      </div>
    </div>
  );
}
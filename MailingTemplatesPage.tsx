// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { mailingApi, type MailingTemplateInput } from '../../lib/apiClient';
// import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// type ActiveStep = 'form' | 'template';

// export default function MailingTemplatesPage() {
//   const queryClient = useQueryClient();
//   const [isCreating, setIsCreating] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [activeStep, setActiveStep] = useState<ActiveStep>('form');
//   const [formCompleted, setFormCompleted] = useState(false);

//   // URL du formulaire embarqué (ex: n8n form)
//   const [embeddedFormUrl, setEmbeddedFormUrl] = useState(
//     'https://api.ottomate.ovh/n8n/form/4309ee58-eb4a-4768-9a4c-557c891e1746'
//   );

//   const [formData, setFormData] = useState({
//     name: '',
//     subject: '',
//     body: '',
//     variables: '',
//   });

//   const { data: templates, isLoading } = useQuery({
//     queryKey: ['mailing-templates'],
//     queryFn: () => mailingApi.getTemplates(),
//   });

//   const createMutation = useMutation({
//     mutationFn: (template: MailingTemplateInput) => mailingApi.createTemplate(template),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['mailing-templates'] });
//       resetCreationState();
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ ...updates }: MailingTemplateInput) => {
//       // Note: Backend may need PUT /api/mailing/templates/:id for updates
//       // For now, using POST (backend should handle upsert logic)
//       return mailingApi.createTemplate(updates);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['mailing-templates'] });
//       resetCreationState();
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (_id: string) => {
//       // Note: Backend may need DELETE /api/mailing/templates/:id
//       // For now, this is a placeholder - you may need to add this endpoint
//       throw new Error('Delete endpoint not yet implemented in backend');
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['mailing-templates'] });
//     },
//   });

//   const resetCreationState = () => {
//     setIsCreating(false);
//     setEditingId(null);
//     setActiveStep('form');
//     setFormCompleted(false);
//     setFormData({ name: '', subject: '', body: '', variables: '' });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const variables = formData.variables
//       .split(',')
//       .map((v) => v.trim())
//       .filter(Boolean);

//     const templateData: MailingTemplateInput = {
//       name: formData.name,
//       subject: formData.subject,
//       body: formData.body,
//       variables: variables.length > 0 ? variables : undefined,
//     };

//     if (editingId) {
//       updateMutation.mutate(templateData);
//     } else {
//       createMutation.mutate(templateData);
//     }
//   };

//   const startEdit = (template: MailingTemplateInput & { id?: string }) => {
//     if (!template.id) return;
//     setEditingId(template.id);
//     setIsCreating(true);
//     setFormData({
//       name: template.name,
//       subject: template.subject,
//       body: template.body,
//       variables: template.variables?.join(', ') || '',
//     });
//     // En édition, on considère que le "formulaire" est déjà fait → accès direct à l’onglet template
//     setFormCompleted(true);
//     setActiveStep('template');
//   };

//   const handleNewTemplate = () => {
//     setIsCreating(true);
//     setEditingId(null);
//     setFormData({ name: '', subject: '', body: '', variables: '' });
//     setActiveStep('form');
//     setFormCompleted(false);
//   };

//   const canAccessTemplateStep = formCompleted || !!editingId;

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Mailing Templates</h1>
//           <p className="text-gray-600 mt-2">
//             Crée des templates email structurés à partir d&apos;un formulaire, avec aperçu HTML en direct.
//           </p>
//         </div>
//         <button
//           onClick={handleNewTemplate}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//         >
//           <PlusIcon className="w-5 h-5" />
//           New Template
//         </button>
//       </div>

//       {/* Create/Edit Wizard */}
//       {isCreating && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-900">
//               {editingId ? 'Edit Template' : 'Create New Template'}
//             </h2>
//             <button
//               type="button"
//               onClick={resetCreationState}
//               className="text-sm text-gray-500 hover:text-gray-700"
//             >
//               Fermer
//             </button>
//           </div>

//           {/* Onglets étapes */}
//           <div className="border-b border-gray-200 mb-4 flex gap-2">
//             <button
//               type="button"
//               onClick={() => setActiveStep('form')}
//               className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
//                 activeStep === 'form'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               1. Formulaire prospect
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 if (canAccessTemplateStep) setActiveStep('template');
//               }}
//               disabled={!canAccessTemplateStep}
//               className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
//                 activeStep === 'template'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } ${!canAccessTemplateStep ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               2. Modèle email
//             </button>
//           </div>

//           {/* Étape 1 : Formulaire embarqué */}
//           {activeStep === 'form' && (
//             <div className="space-y-4">
//               <p className="text-sm text-gray-600">
//                 Étape 1 : le client remplit un formulaire (n8n, Typeform, autre). Tu peux embarquer ce formulaire
//                 directement ici via une URL d&apos;embed.
//               </p>

//               <div className="flex flex-col gap-3">
//                 <div className="flex flex-col md:flex-row gap-2">
//                   <input
//                     type="url"
//                     value={embeddedFormUrl}
//                     onChange={(e) => setEmbeddedFormUrl(e.target.value)}
//                     placeholder="https://... (URL du formulaire à embarquer)"
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       // rien de spécial, l'iframe utilise directement embeddedFormUrl
//                     }}
//                     className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100"
//                   >
//                     Actualiser
//                   </button>
//                 </div>

//                 <div className="rounded-xl border border-dashed border-gray-300 overflow-hidden bg-slate-950">
//                   {embeddedFormUrl ? (
//                     <iframe
//                       title="Formulaire embarqué"
//                       src={embeddedFormUrl}
//                       className="w-full h-[520px] border-0 bg-white"
//                       sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
//                       referrerPolicy="strict-origin-when-cross-origin"
//                     />
//                   ) : (
//                     <div className="h-[220px] flex items-center justify-center text-sm text-gray-500">
//                       Renseigne une URL de formulaire à embarquer pour commencer.
//                     </div>
//                   )}
//                 </div>

//                 <p className="text-xs text-gray-500">
//                   ⚠️ Si l’iframe reste vide avec une erreur &ldquo;X-Frame-Options / frame-ancestors&rdquo;, il faudra
//                   servir le formulaire via un proxy même origine (par ex. <code className="font-mono">/embed/form/:id</code>).
//                 </p>

//                 <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
//                   <p className="text-xs text-gray-500">
//                     Une fois le formulaire rempli, confirme pour passer à la configuration du template.
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setFormCompleted(true);
//                       setActiveStep('template');
//                     }}
//                     className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700"
//                   >
//                     J&apos;ai rempli le formulaire → Continuer
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Étape 2 : Template + aperçu */}
//           {activeStep === 'template' && (
//             <div className="mt-2">
//               <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Colonne gauche : formulaire template */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Template Name
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Subject Line
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.subject}
//                       onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email Body (use {'{{variable_name}}'} for variables)
//                     </label>
//                     <textarea
//                       value={formData.body}
//                       onChange={(e) => setFormData({ ...formData, body: e.target.value })}
//                       rows={10}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">
//                       Tu peux insérer des variables comme{' '}
//                       <code className="font-mono">{'{{first_name}}'}</code>,{' '}
//                       <code className="font-mono">{'{{company_name}}'}</code>,{' '}
//                       <code className="font-mono">{'{{sector}}'}</code>… Elles seront remplies lors de l&apos;envoi.
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Variables (comma-separated, e.g., company_name, first_name)
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.variables}
//                       onChange={(e) =>
//                         setFormData({ ...formData, variables: e.target.value })
//                       }
//                       placeholder="company_name, first_name, last_name"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>

//                   <div className="flex gap-2 pt-2">
//                     <button
//                       type="submit"
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//                     >
//                       {editingId ? 'Update' : 'Create'} Template
//                     </button>
//                     <button
//                       type="button"
//                       onClick={resetCreationState}
//                       className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>

//                 {/* Colonne droite : aperçu HTML */}
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-sm font-semibold text-gray-800">
//                       Aperçu HTML du mail
//                     </h3>
//                     <span className="text-xs text-gray-500">
//                       Rendu dans un iframe sandboxé (proche rendu réel).
//                     </span>
//                   </div>
//                   <div className="border border-gray-200 rounded-lg overflow-hidden bg-slate-900/80">
//                     <iframe
//                       title="Email preview"
//                       sandbox="allow-same-origin"
//                       className="w-full h-[520px] bg-white"
//                       srcDoc={
//                         formData.body && formData.body.trim().length > 0
//                           ? formData.body
//                           : '<html><body style="font-family:system-ui;padding:24px;color:#4b5563;"><h2>Aperçu du template</h2><p>Le rendu HTML de ton email apparaîtra ici dès que tu remplis le champ &laquo; Email Body &raquo;.</p></body></html>'
//                       }
//                     />
//                   </div>
//                 </div>
//               </form>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Templates List */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Templates</h2>
//         {isLoading ? (
//           <div className="text-center py-8 text-gray-500">Loading templates...</div>
//         ) : templates && templates.length > 0 ? (
//           <div className="space-y-4">
//             {templates.map((template, idx) => (
//               <div
//                 key={idx}
//                 className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-gray-900">{template.name}</h3>
//                     <p className="text-sm text-gray-600 mt-1">
//                       <strong>Subject:</strong> {template.subject}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-2 line-clamp-2">
//                       {template.body}
//                     </p>
//                     <div className="mt-2 flex flex-wrap gap-2">
//                       {template.variables?.map((variable) => (
//                         <span
//                           key={variable}
//                           className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
//                         >
//                           {'{{' + variable + '}}'}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex gap-2 ml-4">
//                     <button
//                       onClick={() =>
//                         startEdit(template as MailingTemplateInput & { id: string })
//                       }
//                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                     >
//                       <PencilIcon className="w-5 h-5" />
//                     </button>
//                     <button
//                       onClick={() => {
//                         if (
//                           confirm('Are you sure you want to delete this template?')
//                         ) {
//                           deleteMutation.mutate(
//                             (template as { id?: string }).id || ''
//                           );
//                         }
//                       }}
//                       className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                     >
//                       <TrashIcon className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             No templates yet. Create your first template to get started.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// src/features/mailing/MailingTemplatesPage.tsx
// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import { useParams, useSearchParams } from 'react-router-dom';
// import {
//   instantlyTemplatesApi,
//   type InstantlyEmailTemplate,
//   type InstantlyTemplateInput,
// } from '../../lib/apiClient';

// type ActiveStep = 'form' | 'template';

// export default function MailingTemplatesPage() {
//   const queryClient = useQueryClient();

//   // ✅ On supporte:
//   // - routes sans params : /app/mail-templates?clientId=xxx (injecté par AppLayout)
//   // - routes avec params : /app/clients/:id/mail-templates (si tu changes plus tard)
//   const params = useParams();
//   const [searchParams] = useSearchParams();

//   const clientId = String(
//     params.clientId ||
//       params.id ||
//       searchParams.get('clientId') ||
//       searchParams.get('id') ||
//       ''
//   );

//   const [isCreating, setIsCreating] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [activeStep, setActiveStep] = useState<ActiveStep>('form');
//   const [formCompleted, setFormCompleted] = useState(false);

//   const [embeddedFormUrl, setEmbeddedFormUrl] = useState(
//     'https://api.ottomate.ovh/n8n/form/4309ee58-eb4a-4768-9a4c-557c891e1746'
//   );

//   const [formData, setFormData] = useState({
//     name: '',
//     subject: '',
//     body: '',
//     variables: '',
//   });

//   const { data: templates, isLoading, error } = useQuery({
//     queryKey: ['instantly-templates', clientId],
//     enabled: !!clientId,
//     queryFn: () => instantlyTemplatesApi.getTemplates(clientId),
//   });

//   const createMutation = useMutation({
//     mutationFn: (input: InstantlyTemplateInput) =>
//       instantlyTemplatesApi.createTemplate(clientId, input),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['instantly-templates', clientId] });
//       resetCreationState();
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: (input: InstantlyTemplateInput) => {
//       if (!editingId) throw new Error('Missing template id');
//       return instantlyTemplatesApi.updateTemplate(clientId, editingId, input);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['instantly-templates', clientId] });
//       resetCreationState();
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (templateId: string) =>
//       instantlyTemplatesApi.deleteTemplate(clientId, templateId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['instantly-templates', clientId] });
//     },
//   });

//   const resetCreationState = () => {
//     setIsCreating(false);
//     setEditingId(null);
//     setActiveStep('form');
//     setFormCompleted(false);
//     setFormData({ name: '', subject: '', body: '', variables: '' });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!clientId) {
//       alert('clientId manquant (URL attendue: /app/mail-templates?clientId=xxx)');
//       return;
//     }

//     const input: InstantlyTemplateInput = {
//       name: formData.name,
//       subject: formData.subject || null,
//       body: formData.body,
//     };

//     if (editingId) updateMutation.mutate(input);
//     else createMutation.mutate(input);
//   };

//   const startEdit = (t: InstantlyEmailTemplate) => {
//     setEditingId(t.id);
//     setIsCreating(true);
//     setFormData({
//       name: t.name,
//       subject: t.subject ?? '',
//       body: t.body,
//       variables: '',
//     });
//     setFormCompleted(true);
//     setActiveStep('template');
//   };

//   const handleNewTemplate = () => {
//     setIsCreating(true);
//     setEditingId(null);
//     setFormData({ name: '', subject: '', body: '', variables: '' });
//     setActiveStep('form');
//     setFormCompleted(false);
//   };

//   const canAccessTemplateStep = formCompleted || !!editingId;

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Mailing Templates (Instantly)</h1>
//           <p className="text-gray-600 mt-2">
//             Crée / modifie des templates Instantly via ton backend (proxy API key).
//           </p>

//           {!clientId && (
//             <p className="mt-2 text-sm text-red-600">
//               clientId manquant. Ouvre la page via le menu (qui ajoute{' '}
//               <code className="font-mono">?clientId=...</code>) ou utilise{' '}
//               <code className="font-mono">/app/mail-templates?clientId=xxx</code>.
//             </p>
//           )}
//         </div>

//         <button
//           onClick={handleNewTemplate}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//           disabled={!clientId}
//         >
//           <PlusIcon className="w-5 h-5" />
//           New Template
//         </button>
//       </div>

//       {error ? (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {(error as Error).message}
//         </div>
//       ) : null}

//       {/* Create/Edit Wizard */}
//       {isCreating && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-900">
//               {editingId ? 'Edit Template' : 'Create New Template'}
//             </h2>
//             <button
//               type="button"
//               onClick={resetCreationState}
//               className="text-sm text-gray-500 hover:text-gray-700"
//             >
//               Fermer
//             </button>
//           </div>

//           <div className="border-b border-gray-200 mb-4 flex gap-2">
//             <button
//               type="button"
//               onClick={() => setActiveStep('form')}
//               className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
//                 activeStep === 'form'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               1. Formulaire prospect
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 if (canAccessTemplateStep) setActiveStep('template');
//               }}
//               disabled={!canAccessTemplateStep}
//               className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
//                 activeStep === 'template'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } ${!canAccessTemplateStep ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               2. Modèle email
//             </button>
//           </div>

//           {activeStep === 'form' && (
//             <div className="space-y-4">
//               <p className="text-sm text-gray-600">
//                 Étape 1 : le client remplit un formulaire (n8n, Typeform, autre).
//               </p>

//               <div className="flex flex-col gap-3">
//                 <div className="flex flex-col md:flex-row gap-2">
//                   <input
//                     type="url"
//                     value={embeddedFormUrl}
//                     onChange={(e) => setEmbeddedFormUrl(e.target.value)}
//                     placeholder="https://... (URL du formulaire à embarquer)"
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {}}
//                     className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100"
//                   >
//                     Actualiser
//                   </button>
//                 </div>

//                 <div className="rounded-xl border border-dashed border-gray-300 overflow-hidden bg-slate-950">
//                   {embeddedFormUrl ? (
//                     <iframe
//                       title="Formulaire embarqué"
//                       src={embeddedFormUrl}
//                       className="w-full h-[520px] border-0 bg-white"
//                       sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
//                       referrerPolicy="strict-origin-when-cross-origin"
//                     />
//                   ) : (
//                     <div className="h-[220px] flex items-center justify-center text-sm text-gray-500">
//                       Renseigne une URL de formulaire à embarquer pour commencer.
//                     </div>
//                   )}
//                 </div>

//                 <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
//                   <p className="text-xs text-gray-500">
//                     Une fois le formulaire rempli, confirme pour passer au template.
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setFormCompleted(true);
//                       setActiveStep('template');
//                     }}
//                     className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700"
//                   >
//                     J&apos;ai rempli le formulaire → Continuer
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === 'template' && (
//             <div className="mt-2">
//               <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
//                     <input
//                       type="text"
//                       value={formData.subject}
//                       onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email Body (HTML ou texte)
//                     </label>
//                     <textarea
//                       value={formData.body}
//                       onChange={(e) => setFormData({ ...formData, body: e.target.value })}
//                       rows={10}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">
//                       Variables dans le body : <code className="font-mono">{'{{first_name}}'}</code>
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Variables (optionnel, pour toi)
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.variables}
//                       onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
//                       placeholder="company_name, first_name, last_name"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>

//                   <div className="flex gap-2 pt-2">
//                     <button
//                       type="submit"
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//                       disabled={
//                         !clientId || createMutation.isPending || updateMutation.isPending
//                       }
//                     >
//                       {editingId ? 'Update' : 'Create'} Template
//                     </button>
//                     <button
//                       type="button"
//                       onClick={resetCreationState}
//                       className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-sm font-semibold text-gray-800">Aperçu HTML du mail</h3>
//                     <span className="text-xs text-gray-500">Rendu iframe sandbox.</span>
//                   </div>
//                   <div className="border border-gray-200 rounded-lg overflow-hidden bg-slate-900/80">
//                     <iframe
//                       title="Email preview"
//                       sandbox="allow-same-origin"
//                       className="w-full h-[520px] bg-white"
//                       srcDoc={
//                         formData.body && formData.body.trim().length > 0
//                           ? formData.body
//                           : '<html><body style="font-family:system-ui;padding:24px;color:#4b5563;"><h2>Aperçu du template</h2><p>Le rendu HTML apparaîtra ici.</p></body></html>'
//                       }
//                     />
//                   </div>
//                 </div>
//               </form>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Templates List */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Templates</h2>

//         {isLoading ? (
//           <div className="text-center py-8 text-gray-500">Loading templates...</div>
//         ) : templates && templates.length > 0 ? (
//           <div className="space-y-4">
//             {templates.map((template) => (
//               <div
//                 key={template.id}
//                 className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-gray-900">{template.name}</h3>
//                     <p className="text-sm text-gray-600 mt-1">
//                       <strong>Subject:</strong> {template.subject || '(no subject)'}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.body}</p>
//                   </div>

//                   <div className="flex gap-2 ml-4">
//                     <button
//                       onClick={() => startEdit(template)}
//                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                     >
//                       <PencilIcon className="w-5 h-5" />
//                     </button>

//                     <button
//                       onClick={() => {
//                         if (confirm('Are you sure you want to delete this template?')) {
//                           deleteMutation.mutate(template.id);
//                         }
//                       }}
//                       className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                       disabled={deleteMutation.isPending}
//                     >
//                       <TrashIcon className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             No templates yet. Create your first template to get started.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// src/features/mailing/MailingTemplatesPage.tsx
//import { useMemo, useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// import { useAuth } from '../../contexts/AuthContext';
// import {
//   instantlyTemplatesApi,
//   type InstantlyEmailTemplate,
//   type InstantlyTemplateInput,
// } from '../../lib/apiClient';

// export default function MailingTemplatesPage() {
//   const queryClient = useQueryClient();
//   const { user } = useAuth();

//   // ✅ IMPORTANT : ton backend attend /clients/:id/...
//   // Comme ta route front est /app/mail-templates (sans params),
//   // on utilise l'id du user connecté.
//   const clientId = useMemo(() => String(user?.id || ''), [user?.id]);

//   const [isCreating, setIsCreating] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [formData, setFormData] = useState({
//     name: '',
//     subject: '',
//     body: '',
//   });

//   const {
//     data: templates,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ['instantly-templates', clientId],
//     enabled: !!clientId,
//     queryFn: () => instantlyTemplatesApi.getTemplates(clientId),
//   });

//   const createMutation = useMutation({
//     mutationFn: (input: InstantlyTemplateInput) =>
//       instantlyTemplatesApi.createTemplate(clientId, input),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['instantly-templates', clientId] });
//       resetState();
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: (input: InstantlyTemplateInput) => {
//       if (!editingId) throw new Error('Missing template id');
//       return instantlyTemplatesApi.updateTemplate(clientId, editingId, input);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['instantly-templates', clientId] });
//       resetState();
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (templateId: string) =>
//       instantlyTemplatesApi.deleteTemplate(clientId, templateId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['instantly-templates', clientId] });
//     },
//   });

//   const resetState = () => {
//     setIsCreating(false);
//     setEditingId(null);
//     setFormData({ name: '', subject: '', body: '' });
//   };

//   const handleNew = () => {
//     setEditingId(null);
//     setIsCreating(true);
//     setFormData({ name: '', subject: '', body: '' });
//   };

//   const startEdit = (t: InstantlyEmailTemplate) => {
//     setEditingId(t.id);
//     setIsCreating(true);
//     setFormData({
//       name: t.name,
//       subject: t.subject ?? '',
//       body: t.body,
//     });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const input: InstantlyTemplateInput = {
//       name: formData.name.trim(),
//       subject: formData.subject?.trim() ? formData.subject.trim() : null,
//       body: formData.body,
//     };

//     if (editingId) updateMutation.mutate(input);
//     else createMutation.mutate(input);
//   };

//   const busy =
//     createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Mailing Templates (Instantly)</h1>
//           <p className="text-gray-600 mt-2">Création / modification des templates Instantly.</p>

//           {!clientId ? (
//             <p className="mt-2 text-sm text-red-600">
//               User non chargé (clientId vide). Vérifie que AuthProvider remonte bien user.id.
//             </p>
//           ) : null}
//         </div>

//         <button
//           onClick={handleNew}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//           disabled={!clientId || busy}
//         >
//           <PlusIcon className="w-5 h-5" />
//           New Template
//         </button>
//       </div>

//       {error ? (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {(error as Error).message}
//         </div>
//       ) : null}

//       {/* Create/Edit */}
//       {isCreating && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-900">
//               {editingId ? 'Edit Template' : 'Create New Template'}
//             </h2>
//             <button
//               type="button"
//               onClick={resetState}
//               className="text-sm text-gray-500 hover:text-gray-700"
//               disabled={busy}
//             >
//               Fermer
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Left */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
//                 <input
//                   type="text"
//                   value={formData.subject}
//                   onChange={(e) => setFormData((s) => ({ ...s, subject: e.target.value }))}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Body (HTML ou texte)
//                 </label>
//                 <textarea
//                   value={formData.body}
//                   onChange={(e) => setFormData((s) => ({ ...s, body: e.target.value }))}
//                   rows={12}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                   required
//                 />
//                 <p className="mt-1 text-xs text-gray-500">
//                   Variables possibles dans le body (Instantly les garde comme texte) :{' '}
//                   <code className="font-mono">{'{{first_name}}'}</code>,{' '}
//                   <code className="font-mono">{'{{company}}'}</code>…
//                 </p>
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <button
//                   type="submit"
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//                   disabled={!clientId || busy}
//                 >
//                   {editingId ? 'Update' : 'Create'} Template
//                 </button>

//                 <button
//                   type="button"
//                   onClick={resetState}
//                   className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
//                   disabled={busy}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>

//             {/* Right */}
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-sm font-semibold text-gray-800">Aperçu HTML</h3>
//                 <span className="text-xs text-gray-500">iframe sandbox</span>
//               </div>

//               <div className="border border-gray-200 rounded-lg overflow-hidden bg-slate-900/80">
//                 <iframe
//                   title="Email preview"
//                   sandbox="allow-same-origin"
//                   className="w-full h-[560px] bg-white"
//                   srcDoc={
//                     formData.body && formData.body.trim().length > 0
//                       ? formData.body
//                       : '<html><body style="font-family:system-ui;padding:24px;color:#4b5563;"><h2>Aperçu du template</h2><p>Le rendu HTML apparaîtra ici.</p></body></html>'
//                   }
//                 />
//               </div>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* List */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Templates</h2>

//         {isLoading ? (
//           <div className="text-center py-8 text-gray-500">Loading templates...</div>
//         ) : templates && templates.length > 0 ? (
//           <div className="space-y-4">
//             {templates.map((t) => (
//               <div
//                 key={t.id}
//                 className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-gray-900">{t.name}</h3>
//                     <p className="text-sm text-gray-600 mt-1">
//                       <strong>Subject:</strong> {t.subject || '(no subject)'}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-2 line-clamp-2">{t.body}</p>
//                   </div>

//                   <div className="flex gap-2 ml-4">
//                     <button
//                       onClick={() => startEdit(t)}
//                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                       disabled={busy}
//                     >
//                       <PencilIcon className="w-5 h-5" />
//                     </button>

//                     <button
//                       onClick={() => {
//                         if (confirm('Are you sure you want to delete this template?')) {
//                           deleteMutation.mutate(t.id);
//                         }
//                       }}
//                       className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
//                       disabled={busy}
//                     >
//                       <TrashIcon className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             No templates yet. Create your first template to get started.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // src/features/mailing/MailingTemplatesPage.tsx
// import { useMemo, useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { emailTemplatesApi } from '../../lib/apiClient';
// import type { EmailTemplate } from '../../lib/apiClient';
// import { useAuth } from '../../contexts/AuthContext';

// function toArray<T>(payload: unknown): T[] {
//   if (Array.isArray(payload)) return payload as T[];

//   if (payload && typeof payload === 'object') {
//     const p: any = payload;

//     if (Array.isArray(p.data)) return p.data as T[];
//     if (Array.isArray(p.templates)) return p.templates as T[];
//     if (Array.isArray(p.items)) return p.items as T[];
//     if (Array.isArray(p.rows)) return p.rows as T[];
//   }

//   return [];
// }

// export default function MailingTemplatesPage() {
//   const qc = useQueryClient();
//   const { user } = useAuth();

//   const userId = user?.id ? String(user.id) : '';

//   const [editing, setEditing] = useState<EmailTemplate | null>(null);
//   const [form, setForm] = useState({
//     name: '',
//     subject: '',
//     body: '',
//   });

//   const {
//     data: templatesRaw,
//     isLoading,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ['email-templates', userId],
//     enabled: !!userId,
//     queryFn: () => emailTemplatesApi.list(userId),
//   });

//   const templates = useMemo(() => toArray<EmailTemplate>(templatesRaw), [templatesRaw]);

//   const create = useMutation({
//     mutationFn: () =>
//       emailTemplatesApi.create({
//         user_id: userId,
//         name: form.name.trim(),
//         subject: form.subject.trim() ? form.subject.trim() : null,
//         body: form.body,
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['email-templates', userId] });
//       setForm({ name: '', subject: '', body: '' });
//     },
//   });

//   const update = useMutation({
//     mutationFn: () => {
//       if (!editing) throw new Error('Missing template to update');
//       return emailTemplatesApi.update(editing.id, {
//         name: form.name.trim(),
//         subject: form.subject.trim() ? form.subject.trim() : null,
//         body: form.body,
//       });
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['email-templates', userId] });
//       setEditing(null);
//       setForm({ name: '', subject: '', body: '' });
//     },
//   });

//   const del = useMutation({
//     mutationFn: (id: string) => emailTemplatesApi.remove(id),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['email-templates', userId] });
//     },
//   });

//   const busy = create.isPending || update.isPending || del.isPending;

//   const startEdit = (t: EmailTemplate) => {
//     setEditing(t);
//     setForm({
//       name: t.name ?? '',
//       subject: t.subject ?? '',
//       body: t.body ?? '',
//     });
//   };

//   const resetForm = () => {
//     setEditing(null);
//     setForm({ name: '', subject: '', body: '' });
//   };

//   return (
//     <div>
//       <div className="mb-6 flex items-start justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
//           <p className="text-gray-600 mt-2">
//             Crée / modifie tes templates. (Supabase + Instantly côté backend)
//           </p>
//           {!userId ? (
//             <p className="mt-2 text-sm text-red-600">
//               Impossible de récupérer ton user id (non connecté).
//             </p>
//           ) : null}
//         </div>

//         <div className="flex gap-2">
//           <button
//             type="button"
//             onClick={() => refetch()}
//             className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
//             disabled={!userId || busy}
//           >
//             Refresh
//           </button>

//           <button
//             type="button"
//             onClick={resetForm}
//             className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
//             disabled={!userId || busy}
//           >
//             New
//           </button>
//         </div>
//       </div>

//       {error ? (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
//           {(error as Error).message}
//         </div>
//       ) : null}

//       {/* Form */}
//       <div className="bg-white border rounded-lg shadow-sm p-5 mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">
//             {editing ? `Edit: ${editing.name}` : 'Create a new template'}
//           </h2>

//           {editing ? (
//             <button
//               type="button"
//               onClick={resetForm}
//               className="text-sm text-gray-600 hover:text-gray-900"
//               disabled={busy}
//             >
//               Cancel edit
//             </button>
//           ) : null}
//         </div>

//         <div className="grid grid-cols-1 gap-3">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//             <input
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Template name"
//               disabled={!userId || busy}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
//             <input
//               value={form.subject}
//               onChange={(e) => setForm({ ...form, subject: e.target.value })}
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Subject (optional)"
//               disabled={!userId || busy}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
//             <textarea
//               value={form.body}
//               onChange={(e) => setForm({ ...form, body: e.target.value })}
//               rows={10}
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//               placeholder="HTML ou texte… ex: Hello {{first_name}}"
//               disabled={!userId || busy}
//             />
//           </div>

//           <div className="flex gap-2 pt-2">
//             <button
//               type="button"
//               onClick={() => (editing ? update.mutate() : create.mutate())}
//               className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
//               disabled={!userId || busy || !form.name.trim() || !form.body.trim()}
//             >
//               {editing
//                 ? update.isPending
//                   ? 'Updating...'
//                   : 'Update'
//                 : create.isPending
//                 ? 'Creating...'
//                 : 'Create'}
//             </button>

//             <button
//               type="button"
//               onClick={resetForm}
//               className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
//               disabled={!userId || busy}
//             >
//               Reset
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* List */}
//       <div className="bg-white border rounded-lg shadow-sm p-5">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Your templates</h2>
//           <span className="text-xs text-gray-500">
//             {userId ? `userId: ${userId}` : 'no user'}
//           </span>
//         </div>

//         {isLoading ? (
//           <div className="text-gray-500 py-6">Loading…</div>
//         ) : templates.length > 0 ? (
//           <div className="space-y-3">
//             {templates.map((t: EmailTemplate) => (
//               <div
//                 key={t.id}
//                 className="border rounded-lg p-4 flex items-start justify-between hover:shadow-sm transition-shadow"
//               >
//                 <div className="flex-1">
//                   <div className="font-semibold text-gray-900">{t.name}</div>
//                   <div className="text-sm text-gray-600 mt-1">
//                     <strong>Subject:</strong> {t.subject || '(no subject)'}
//                   </div>
//                   <div className="text-xs text-gray-500 mt-2">
//                     Instantly template id:{' '}
//                     <span className="font-mono">{t.instantly_template_id}</span>
//                   </div>
//                   <div className="text-sm text-gray-500 mt-2 line-clamp-2 whitespace-pre-wrap">
//                     {t.body}
//                   </div>
//                 </div>

//                 <div className="ml-4 flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => startEdit(t)}
//                     className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
//                     disabled={busy}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (confirm('Delete this template?')) del.mutate(t.id);
//                     }}
//                     className="px-3 py-2 rounded-lg border text-sm text-red-600 hover:bg-red-50"
//                     disabled={busy}
//                   >
//                     {del.isPending ? 'Deleting…' : 'Delete'}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-gray-500 py-6">No templates yet.</div>
//         )}
//       </div>

//       {/* Debug payload (décommente si besoin) */}
//       {/* <pre className="mt-6 text-xs bg-gray-100 p-3 rounded overflow-auto">
//         {JSON.stringify(templatesRaw, null, 2)}
//       </pre> */}
//     </div>
//   );
// }








// src/features/mailing/MailingTemplatesPage.tsx
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailTemplatesApi } from '../../lib/apiClient';
import type { EmailTemplate } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';
// Import en haut du fichier
import { generateEmailTemplate } from '../../lib/n8nClient';

function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const p: any = payload;
    if (Array.isArray(p.data)) return p.data as T[];
    if (Array.isArray(p.templates)) return p.templates as T[];
    if (Array.isArray(p.items)) return p.items as T[];
    if (Array.isArray(p.rows)) return p.rows as T[];
  }
  return [];
}

export default function MailingTemplatesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  // ✅ IMPORTANT: ton user doit exister
  const userId = user?.id ? String(user.id) : '';

  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [uiError, setUiError] = useState<string>('');

  const {
    data: templatesRaw,
    isLoading,
    error: listError,
    refetch,
  } = useQuery({
    queryKey: ['email-templates', userId],
    enabled: !!userId,
    queryFn: () => emailTemplatesApi.list(userId),
  });

  const templates = useMemo(() => toArray<EmailTemplate>(templatesRaw), [templatesRaw]);

  const create = useMutation({
    mutationFn: async () => {
      setUiError('');
      if (!userId) throw new Error('USER_ID_MISSING');
      const payload = {
        user_id: userId,
        name: form.name.trim(),
        subject: form.subject.trim() ? form.subject.trim() : null,
        body: form.body,
      };
      return emailTemplatesApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-templates', userId] });
      setForm({ name: '', subject: '', body: '' });
      alert('✅ Template créé');
    },
    onError: (e) => {
      console.error('CREATE_TEMPLATE_ERROR', e);
      setUiError((e as Error).message || 'CREATE_TEMPLATE_FAILED');
      alert(`❌ Create failed:\n${(e as Error).message}`);
    },
  });

  const update = useMutation({
    mutationFn: async () => {
      setUiError('');
      if (!editing) throw new Error('MISSING_TEMPLATE_TO_UPDATE');
      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim() ? form.subject.trim() : null,
        body: form.body,
      };
      return emailTemplatesApi.update(editing.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-templates', userId] });
      setEditing(null);
      setForm({ name: '', subject: '', body: '' });
      alert('✅ Template mis à jour');
    },
    onError: (e) => {
      console.error('UPDATE_TEMPLATE_ERROR', e);
      setUiError((e as Error).message || 'UPDATE_TEMPLATE_FAILED');
      alert(`❌ Update failed:\n${(e as Error).message}`);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      setUiError('');
      return emailTemplatesApi.remove(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-templates', userId] });
      alert('✅ Template supprimé');
    },
    onError: (e) => {
      console.error('DELETE_TEMPLATE_ERROR', e);
      setUiError((e as Error).message || 'DELETE_TEMPLATE_FAILED');
      alert(`❌ Delete failed:\n${(e as Error).message}`);
    },
  });

  const busy = create.isPending || update.isPending || del.isPending;
  const canSubmit = !!userId && form.name.trim().length > 0 && form.body.trim().length > 0;

  const startEdit = (t: EmailTemplate) => {
    setEditing(t);
    setForm({
      name: t.name ?? '',
      subject: t.subject ?? '',
      body: t.body ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', subject: '', body: '' });
    setUiError('');
  };


// Ajoute ces states en haut du composant, après les états existants :
const [aiForm, setAiForm] = useState({
  company_name: '',
  industry: '',
  tone: 'professionnel',
  goal: 'prospection',
  language: 'fr',
});
const [aiGenerating, setAiGenerating] = useState(false);
const [aiError, setAiError] = useState('');


// State — remplace N8N_WEBHOOK_URL (plus besoin)
const AI_WORKFLOW_ID = import.meta.env.VITE_N8N_TEMPLATE_WORKFLOW_ID as string;

// Fonction generateWithAI — remplace l'ancienne version
const generateWithAI = async () => {
  if (!userId) return;
  setAiGenerating(true);
  setAiError('');
  try {
    const data = await generateEmailTemplate({
      workflowId: AI_WORKFLOW_ID,
      ...aiForm,
      user_id: userId,
    });

    if (!data.success) throw new Error(data.error || 'Erreur inconnue');

    setForm({
      name: data.template.template_name,
      subject: data.template.subject,
      body: data.template.html_template,
    });

    qc.invalidateQueries({ queryKey: ['email-templates', userId] });
    alert('✅ Template généré ! Révisez et cliquez sur Create pour confirmer.');
  } catch (e) {
    setAiError((e as Error).message);
  } finally {
    setAiGenerating(false);
  }
};

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-2">
            Crée un template : on doit voir soit ✅ succès, soit ❌ erreur.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            userId utilisé: <span className="font-mono">{userId || '(missing)'}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            disabled={!userId || busy}
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            disabled={busy}
          >
            New
          </button>
        </div>
      </div>

      {/* erreurs LIST / UI */}
      {(listError || uiError) && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
          {uiError ? uiError : (listError as Error).message}
        </div>
      )}



{/* AI GENERATOR */}
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm p-5 mb-6">
  <div className="flex items-center gap-2 mb-4">
    <span className="text-2xl">🤖</span>
    <h2 className="text-lg font-semibold text-blue-900">Générer un template avec Claude AI</h2>
  </div>

  {aiError && (
    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      ❌ {aiError}
    </div>
  )}

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
      <input
        value={aiForm.company_name}
        onChange={(e) => setAiForm({ ...aiForm, company_name: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        placeholder="ex: Acme SAS"
        disabled={aiGenerating}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité *</label>
      <input
        value={aiForm.industry}
        onChange={(e) => setAiForm({ ...aiForm, industry: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        placeholder="ex: Logiciels SaaS B2B, Immobilier, Restauration..."
        disabled={aiGenerating}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Objectif du mail</label>
      <select
        value={aiForm.goal}
        onChange={(e) => setAiForm({ ...aiForm, goal: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        disabled={aiGenerating}
      >
        <option value="prospection">Prospection commerciale</option>
        <option value="relance">Relance prospect</option>
        <option value="onboarding">Onboarding client</option>
        <option value="newsletter">Newsletter</option>
        <option value="promotion">Offre promotionnelle</option>
        <option value="invitation">Invitation événement</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Ton</label>
      <select
        value={aiForm.tone}
        onChange={(e) => setAiForm({ ...aiForm, tone: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        disabled={aiGenerating}
      >
        <option value="professionnel">Professionnel</option>
        <option value="chaleureux">Chaleureux & humain</option>
        <option value="direct">Direct & percutant</option>
        <option value="premium">Premium & luxe</option>
        <option value="startup">Startup & moderne</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
      <select
        value={aiForm.language}
        onChange={(e) => setAiForm({ ...aiForm, language: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        disabled={aiGenerating}
      >
        <option value="fr">Français</option>
        <option value="en">Anglais</option>
      </select>
    </div>
  </div>

  <div className="mt-4">
    <button
      type="button"
      onClick={generateWithAI}
      disabled={!userId || !aiForm.company_name.trim() || !aiForm.industry.trim() || aiGenerating}
      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
    >
      {aiGenerating ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Génération en cours…
        </>
      ) : (
        <>✨ Générer avec Claude AI</>
      )}
    </button>
    <p className="text-xs text-gray-500 mt-2">
      Le HTML généré sera pré-rempli dans le formulaire ci-dessous pour révision avant sauvegarde.
    </p>
  </div>
</div>





      {/* FORM */}
      <div className="bg-white border rounded-lg shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editing ? `Edit: ${editing.name}` : 'Create a new template'}
          </h2>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-600 hover:text-gray-900"
              disabled={busy}
            >
              Cancel edit
            </button>
          )}
        </div>

        {!userId && (
          <div className="mb-3 text-sm text-red-600">
            ❌ userId introuvable → tu n’es pas correctement connecté ou ton AuthContext ne fournit pas user.id.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Template name"
              disabled={!userId || busy}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Subject (optional)"
              disabled={!userId || busy}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={10}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="HTML ou texte… ex: Hello {{first_name}}"
              disabled={!userId || busy}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => (editing ? update.mutate() : create.mutate())}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              disabled={!canSubmit || busy}
              title={!canSubmit ? 'Name + Body requis' : ''}
            >
              {editing
                ? update.isPending
                  ? 'Updating...'
                  : 'Update'
                : create.isPending
                ? 'Creating...'
                : 'Create'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
              disabled={busy}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your templates</h2>
          <span className="text-xs text-gray-500">{templates.length} item(s)</span>
        </div>

        {isLoading ? (
          <div className="text-gray-500 py-6">Loading…</div>
        ) : templates.length > 0 ? (
          <div className="space-y-3">
            {templates.map((t: EmailTemplate) => (
              <div
                key={t.id}
                className="border rounded-lg p-4 flex items-start justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>Subject:</strong> {t.subject || '(no subject)'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Instantly template id:{' '}
                    <span className="font-mono">{t.instantly_template_id}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 line-clamp-2 whitespace-pre-wrap">
                    {t.body}
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                    disabled={busy}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this template?')) del.mutate(t.id);
                    }}
                    className="px-3 py-2 rounded-lg border text-sm text-red-600 hover:bg-red-50"
                    disabled={busy}
                  >
                    {del.isPending ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 py-6">No templates yet.</div>
        )}
      </div>
    </div>
  );
}

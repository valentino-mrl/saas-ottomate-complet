{/*
import { useState } from 'react';
import { leadsApi } from '../../lib/apiClient';
import type { Lead } from '../../types';

const N8N_WEBHOOK = 'https://api.ottomate.ovh/n8n/webhook/prospects';

type ViewType = 'entreprise' | 'instagram' | 'linkedin';

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<ViewType>('entreprise');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: 'En attente…', type: '' });
  const [downloadData, setDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Entreprises form
  const [categorie, setCategorie] = useState('');
  const [departement, setDepartement] = useState('');
  const [maxCrawledPlacesPerSearch, setMaxCrawledPlacesPerSearch] = useState(50);

  // Instagram form
  const [igUsernames, setIgUsernames] = useState('');
  const [igStatus, setIgStatus] = useState({ text: 'En attente…', type: '' });
  const [igDownloadData, setIgDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // LinkedIn form
  const [liPersona, setLiPersona] = useState('');
  const [liLocation, setLiLocation] = useState('');
  const [liIndustry, setLiIndustry] = useState('');
  const [liKeywords, setLiKeywords] = useState('');
  const [liSeniority, setLiSeniority] = useState('');
  const [liCompanySize, setLiCompanySize] = useState('');
  const [liStatus, setLiStatus] = useState({ text: 'En attente…', type: '' });
  const [liDownloadData, setLiDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  const handleDownload = (data: { blobUrl: string; fileName: string } | null) => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = data.blobUrl;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(data.blobUrl);
    a.remove();
    setDownloadData(null);
    setIgDownloadData(null);
    setLiDownloadData(null);
  };

  const fetchToFile = async (url: URL, setStatusFn: (s: { text: string; type: string }) => void, setDownloadFn: (d: { blobUrl: string; fileName: string } | null) => void, nameFallback: string) => {
    setStatusFn({ text: 'Crawler en cours…', type: '' });
    setLoading(true);

    try {
      const resp = await fetch(url.toString(), { method: 'GET' });
      const ct = resp.headers.get('content-type') || '';

      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      const blob = await resp.blob();

      if (ct.includes('application/json')) {
        const txt = await blob.text();
        try {
          const j = JSON.parse(txt);
          if (j.message && /started/i.test(j.message)) {
            throw new Error('Le webhook est en mode immédiat. Mets-le en "Response Node" dans n8n.');
          }
        } catch (_) {}
        throw new Error('Le serveur a renvoyé du JSON : ' + txt);
      }

      const cd = resp.headers.get('content-disposition') || '';
      let name = (cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i) || [])[1];
      if (name) name = decodeURIComponent(name);
      if (!name) name = nameFallback;

      const blobUrl = URL.createObjectURL(blob);
      setDownloadFn({ blobUrl, fileName: name });
      setStatusFn({ text: '🎉 Extraction terminée — fichier prêt.', type: 'ok' });
    } catch (err) {
      setStatusFn({
        text: 'Erreur: ' + ((err as Error)?.message || String(err)),
        type: 'err',
      });
      setDownloadFn(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrepriseSearch = async () => {
    if (!categorie.trim()) {
      setStatus({ text: 'La catégorie est requise.', type: 'warn' });
      return;
    }

    setLoading(true);
    setStatus({ text: 'Recherche en cours…', type: '' });
    setLeads([]);

    try {
      // Use backend API for leads search
      const location = departement || 'France';
      const result = await leadsApi.search({
        category: categorie,
        location,
        limit: maxCrawledPlacesPerSearch,
      });

      if (result.leads && Array.isArray(result.leads)) {
        setLeads(result.leads as Lead[]);
        setStatus({ text: `🎉 ${result.count || result.leads.length} prospects trouvés.`, type: 'ok' });
      } else {
        setStatus({ text: 'Aucun prospect trouvé.', type: 'warn' });
      }
    } catch (err) {
      setStatus({
        text: 'Erreur: ' + ((err as Error)?.message || String(err)),
        type: 'err',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramSearch = async () => {
    if (!igUsernames.trim()) {
      setIgStatus({ text: 'Le champ "usernames" est requis.', type: 'warn' });
      return;
    }

    const url = new URL(N8N_WEBHOOK);
    url.searchParams.set('usernames', igUsernames);
    await fetchToFile(url, setIgStatus, setIgDownloadData, `instagram_${Date.now()}.csv`);
  };

  const handleLinkedInSearch = async () => {
    if (!liPersona.trim()) {
      setLiStatus({ text: 'Le champ "persona" est requis.', type: 'warn' });
      return;
    }

    const url = new URL(N8N_WEBHOOK);
    url.searchParams.set('linkedin_persona', liPersona);
    if (liLocation) url.searchParams.set('linkedin_location', liLocation);
    if (liIndustry) url.searchParams.set('linkedin_industry', liIndustry);
    if (liKeywords) url.searchParams.set('linkedin_keywords', liKeywords);
    if (liSeniority) url.searchParams.set('linkedin_seniority', liSeniority);
    if (liCompanySize) url.searchParams.set('linkedin_company_size', liCompanySize);

    await fetchToFile(url, setLiStatus, setLiDownloadData, `linkedin_${Date.now()}.csv`);
  };

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(ellipse at 80% 0%, rgba(8,145,178,.20), transparent 40%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
    }}>
      <div className="max-w-[1100px] mx-auto pt-12 px-6 pb-12">
        <div className="rounded-[20px] overflow-hidden border border-slate-700/50 backdrop-blur-xl" style={{
          background: 'rgba(15,23,42,.80)',
          boxShadow: '0 30px 80px rgba(0,0,0,.45)',
        }}>
          
          <div className="px-8 py-7 border-b border-slate-700/50" style={{
            background: 'linear-gradient(90deg, rgba(6,182,212,.10), rgba(16,185,129,.10), rgba(6,182,212,.10))',
          }}>
            <h1 className="text-[28px] font-extrabold tracking-wide m-0" style={{
              background: 'linear-gradient(90deg,#22d3ee,#34d399,#22d3ee)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              Générateur de prospects B2B
            </h1>
            <p className="mt-1.5 mb-0 text-slate-400">Extraction de contacts téléphone & email au format CSV</p>
          </div>

          <div className="p-8">
            
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveView('entreprise')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'entreprise'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'entreprise'
                    ? {
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }
                    : {}
                }
              >
                1) Entreprises
              </button>
              <button
                type="button"
                onClick={() => setActiveView('instagram')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'instagram'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'instagram'
                    ? {
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }
                    : {}
                }
              >
                2) Instagram
              </button>
              <button
                type="button"
                onClick={() => setActiveView('linkedin')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'linkedin'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'linkedin'
                    ? {
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }
                    : {}
                }
              >
                3) LinkedIn
              </button>
            </div>

           
            {activeView === 'entreprise' && (
              <div>
                <div className="mt-6 p-6 rounded-2xl border border-slate-700/50" style={{ background: 'rgba(2,6,23,.50)' }}>
                  <p className="mt-0 mb-0 text-slate-300">
                    Renseigne obligatoirement et uniquement la <strong className="text-white">catégorie</strong> pour lancer la recherche
                  </p>
                </div>

                <div className="mt-6 p-6 rounded-2xl border border-slate-700/50" style={{ background: 'rgba(2,6,23,.50)' }}>
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Contexte recherche</h2>

                  <label className="block mb-2 text-[13px] text-slate-300">
                    Catégorie / activité <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="categorie"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    placeholder="ex: boulangerie"
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">
                        Ville ou Département (optionnel)
                      </label>
                      <input
                        id="departement"
                        value={departement}
                        onChange={(e) => setDepartement(e.target.value)}
                        placeholder="ex: cannes ou Alpes-Maritimes"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block mb-2 text-[13px] text-slate-300">
                      Nombre de Numéro de téléphone voulu :
                    </label>
                    <input
                      type="number"
                      id="maxCrawledPlacesPerSearch"
                      min="20"
                      step="1"
                      value={maxCrawledPlacesPerSearch}
                      onChange={(e) => setMaxCrawledPlacesPerSearch(Number(e.target.value))}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                    />
                    <small className="text-slate-400 block mt-1.5">Limite d'établissements par recherche.</small>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    id="start"
                    onClick={handleEntrepriseSearch}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                    }}
                  >
                    {loading ? 'Recherche...' : 'Lancer Recherche'}
                  </button>
                  {downloadData && (
                    <button
                      type="button"
                      id="download"
                      onClick={() => handleDownload(downloadData)}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      }}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <div className={`mt-3 text-sm ${status.type === 'ok' ? 'text-emerald-400' : status.type === 'warn' ? 'text-amber-500' : status.type === 'err' ? 'text-red-500' : 'text-slate-400'}`}>
                  {status.text}
                </div>

                
                {leads.length > 0 && (
                  <div className="mt-6 p-6 rounded-2xl border border-slate-700/50" style={{ background: 'rgba(2,6,23,.50)' }}>
                    <h2 className="mt-0 mb-4 text-base text-slate-300">Résultats ({leads.length} prospects)</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3">Entreprise</th>
                            <th className="text-left py-2 px-3">Téléphone</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Localisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 px-3">{lead.company_name || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.phone || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.email || 'N/A'}</td>
                              <td className="py-2 px-3">{[lead.city, lead.region, lead.country].filter(Boolean).join(', ') || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

           
            {activeView === 'instagram' && (
              <div className="mt-8">
                <div className="p-6 rounded-2xl border border-slate-700/50" style={{ background: 'rgba(2,6,23,.50)' }}>
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper Instagram</h2>
                  <p className="text-slate-300 mb-4">
                    <strong>collez ci-dessous le nom brut sans @ du profil recherché</strong>
                  </p>
                  <input
                    id="ig-usernames"
                    value={igUsernames}
                    onChange={(e) => setIgUsernames(e.target.value)}
                    placeholder="ex: mileycyrus (ou plusieurs noms insta séparés par des virgules)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      id="ig-start"
                      onClick={handleInstagramSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {igDownloadData && (
                      <button
                        type="button"
                        id="ig-download"
                        onClick={() => handleDownload(igDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div className={`mt-3 text-sm ${igStatus.type === 'ok' ? 'text-emerald-400' : igStatus.type === 'warn' ? 'text-amber-500' : igStatus.type === 'err' ? 'text-red-500' : 'text-slate-400'}`}>
                    {igStatus.text}
                  </div>
                </div>
              </div>
            )}

            
            {activeView === 'linkedin' && (
              <div className="mt-8">
                <div className="p-6 rounded-2xl border border-slate-700/50" style={{ background: 'rgba(2,6,23,.50)' }}>
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper LinkedIn (persona)</h2>
                  <p className="text-slate-300 mb-4">
                    Renseigne un <strong className="text-white">persona</strong> (ex: "directeur marketing", "responsable RH") et, si besoin, des filtres.
                  </p>

                  <label className="block mb-2 text-[13px] text-slate-300">Persona (obligatoire)</label>
                  <input
                    id="li-persona"
                    value={liPersona}
                    onChange={(e) => setLiPersona(e.target.value)}
                    placeholder="ex: directeur marketing"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75 mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Location (optionnel)</label>
                      <input
                        id="li-location"
                        value={liLocation}
                        onChange={(e) => setLiLocation(e.target.value)}
                        placeholder="ex: Paris, France"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Industry (optionnel)</label>
                      <input
                        id="li-industry"
                        value={liIndustry}
                        onChange={(e) => setLiIndustry(e.target.value)}
                        placeholder="ex: Software"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Keywords (optionnel)</label>
                      <input
                        id="li-keywords"
                        value={liKeywords}
                        onChange={(e) => setLiKeywords(e.target.value)}
                        placeholder="ex: SaaS, CRM"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Seniority (optionnel)</label>
                      <input
                        id="li-seniority"
                        value={liSeniority}
                        onChange={(e) => setLiSeniority(e.target.value)}
                        placeholder="ex: Director, VP"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Company size (optionnel)</label>
                      <input
                        id="li-company-size"
                        value={liCompanySize}
                        onChange={(e) => setLiCompanySize(e.target.value)}
                        placeholder="ex: 11-50, 51-200"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      id="li-start"
                      onClick={handleLinkedInSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {liDownloadData && (
                      <button
                        type="button"
                        id="li-download"
                        onClick={() => handleDownload(liDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div className={`mt-3 text-sm ${liStatus.type === 'ok' ? 'text-emerald-400' : liStatus.type === 'warn' ? 'text-amber-500' : liStatus.type === 'err' ? 'text-red-500' : 'text-slate-400'}`}>
                    {liStatus.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}*/}



{/*
import { useState, useEffect } from 'react';
import { leadsApi } from '../../lib/apiClient';
import type { Lead } from '../../types';
import { supabase } from '../../lib/supabaseClient'; // ⬅️ IMPORTANT : adapte le chemin si besoin

const N8N_WEBHOOK = 'https://api.ottomate.ovh/n8n/webhook/prospects';

type ViewType = 'entreprise' | 'instagram' | 'linkedin';

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<ViewType>('entreprise');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: 'En attente…', type: '' });
  const [downloadData, setDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  // ID client Supabase (auth.uid)
  const [clientId, setClientId] = useState<string | null>(null);

  // Entreprises form
  const [categorie, setCategorie] = useState('');
  const [departement, setDepartement] = useState('');
  const [maxCrawledPlacesPerSearch, setMaxCrawledPlacesPerSearch] = useState(50);

  // Instagram form
  const [igUsernames, setIgUsernames] = useState('');
  const [igStatus, setIgStatus] = useState({ text: 'En attente…', type: '' });
  const [igDownloadData, setIgDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // LinkedIn form
  const [liPersona, setLiPersona] = useState('');
  const [liLocation, setLiLocation] = useState('');
  const [liIndustry, setLiIndustry] = useState('');
  const [liKeywords, setLiKeywords] = useState('');
  const [liSeniority, setLiSeniority] = useState('');
  const [liCompanySize, setLiCompanySize] = useState('');
  const [liStatus, setLiStatus] = useState({ text: 'En attente…', type: '' });
  const [liDownloadData, setLiDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // 🔐 Récupérer l'utilisateur Supabase connecté et son id
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!cancelled) {
          if (error) {
            console.warn('Erreur getUser supabase:', error.message);
            setClientId(null);
          } else if (data?.user) {
            setClientId(data.user.id); // <-- c'est cet id qu'on met dans l’URL n8n
          } else {
            setClientId(null);
          }
        }
      } catch (err) {
        console.error('Erreur inattendue getUser supabase:', err);
        if (!cancelled) setClientId(null);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = (data: { blobUrl: string; fileName: string } | null) => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = data.blobUrl;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(data.blobUrl);
    a.remove();
    setDownloadData(null);
    setIgDownloadData(null);
    setLiDownloadData(null);
  };

  const fetchToFile = async (
    url: URL,
    setStatusFn: (s: { text: string; type: string }) => void,
    setDownloadFn: (d: { blobUrl: string; fileName: string } | null) => void,
    nameFallback: string
  ) => {
    setStatusFn({ text: 'Crawler en cours…', type: '' });
    setLoading(true);

    try {
      const resp = await fetch(url.toString(), { method: 'GET' });
      const ct = resp.headers.get('content-type') || '';

      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      const blob = await resp.blob();

      if (ct.includes('application/json')) {
        const txt = await blob.text();
        try {
          const j = JSON.parse(txt);
          if (j.message && /started/i.test(j.message)) {
            throw new Error('Le webhook est en mode immédiat. Mets-le en "Response Node" dans n8n.');
          }
        } catch (_) {}
        throw new Error('Le serveur a renvoyé du JSON : ' + txt);
      }

      const cd = resp.headers.get('content-disposition') || '';
      let name = (cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i) || [])[1];
      if (name) name = decodeURIComponent(name);
      if (!name) name = nameFallback;

      const blobUrl = URL.createObjectURL(blob);
      setDownloadFn({ blobUrl, fileName: name });
      setStatusFn({ text: '🎉 Extraction terminée — fichier prêt.', type: 'ok' });
    } catch (err) {
      setStatusFn({
        text: 'Erreur: ' + ((err as Error)?.message || String(err)),
        type: 'err',
      });
      setDownloadFn(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrepriseSearch = async () => {
    if (!categorie.trim()) {
      setStatus({ text: 'La catégorie est requise.', type: 'warn' });
      return;
    }

    setLoading(true);
    setStatus({ text: 'Recherche en cours…', type: '' });
    setLeads([]);

    try {
      const location = departement || 'France';
      const result = await leadsApi.search({
        category: categorie,
        location,
        limit: maxCrawledPlacesPerSearch,
      });

      if (result.leads && Array.isArray(result.leads)) {
        setLeads(result.leads as Lead[]);
        setStatus({ text: `🎉 ${result.count || result.leads.length} prospects trouvés.`, type: 'ok' });
      } else {
        setStatus({ text: 'Aucun prospect trouvé.', type: 'warn' });
      }
    } catch (err) {
      setStatus({
        text: 'Erreur: ' + ((err as Error)?.message || String(err)),
        type: 'err',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramSearch = async () => {
    if (!igUsernames.trim()) {
      setIgStatus({ text: 'Le champ "usernames" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setIgStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    // 🔗 URL n8n avec /prospects/{clientId}
    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('usernames', igUsernames);

    await fetchToFile(url, setIgStatus, setIgDownloadData, `instagram_${Date.now()}.csv`);
  };

  const handleLinkedInSearch = async () => {
    if (!liPersona.trim()) {
      setLiStatus({ text: 'Le champ "persona" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setLiStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    // 🔗 URL n8n avec /prospects/{clientId}
    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('linkedin_persona', liPersona);
    if (liLocation) url.searchParams.set('linkedin_location', liLocation);
    if (liIndustry) url.searchParams.set('linkedin_industry', liIndustry);
    if (liKeywords) url.searchParams.set('linkedin_keywords', liKeywords);
    if (liSeniority) url.searchParams.set('linkedin_seniority', liSeniority);
    if (liCompanySize) url.searchParams.set('linkedin_company_size', liCompanySize);

    await fetchToFile(url, setLiStatus, setLiDownloadData, `linkedin_${Date.now()}.csv`);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 80% 0%, rgba(8,145,178,.20), transparent 40%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="max-w-[1100px] mx-auto pt-12 px-6 pb-12">
        <div
          className="rounded-[20px] overflow-hidden border border-slate-700/50 backdrop-blur-xl"
          style={{
            background: 'rgba(15,23,42,.80)',
            boxShadow: '0 30px 80px rgba(0,0,0,.45)',
          }}
        >
          
          <div
            className="px-8 py-7 border-b border-slate-700/50"
            style={{
              background: 'linear-gradient(90deg, rgba(6,182,212,.10), rgba(16,185,129,.10), rgba(6,182,212,.10))',
            }}
          >
            <h1
              className="text-[28px] font-extrabold tracking-wide m-0"
              style={{
                background: 'linear-gradient(90deg,#22d3ee,#34d399,#22d3ee)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Générateur de prospects B2B
            </h1>
            <p className="mt-1.5 mb-0 text-slate-400">
              Extraction de contacts téléphone & email au format CSV
            </p>
          </div>

          <div className="p-8">
            
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveView('entreprise')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'entreprise'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'entreprise'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                1) Entreprises
              </button>
              <button
                type="button"
                onClick={() => setActiveView('instagram')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'instagram'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'instagram'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                2) Instagram
              </button>
              <button
                type="button"
                onClick={() => setActiveView('linkedin')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'linkedin'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'linkedin'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                3) LinkedIn
              </button>
            </div>

            
            {activeView === 'entreprise' && (
              <div>
                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <p className="mt-0 mb-0 text-slate-300">
                    Renseigne obligatoirement et uniquement la{' '}
                    <strong className="text-white">catégorie</strong> pour lancer la recherche
                  </p>
                </div>

                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Contexte recherche</h2>

                  <label className="block mb-2 text-[13px] text-slate-300">
                    Catégorie / activité <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="categorie"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    placeholder="ex: boulangerie"
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">
                        Ville ou Département (optionnel)
                      </label>
                      <input
                        id="departement"
                        value={departement}
                        onChange={(e) => setDepartement(e.target.value)}
                        placeholder="ex: cannes ou Alpes-Maritimes"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block mb-2 text-[13px] text-slate-300">
                      Nombre de Numéro de téléphone voulu :
                    </label>
                    <input
                      type="number"
                      id="maxCrawledPlacesPerSearch"
                      min="20"
                      step="1"
                      value={maxCrawledPlacesPerSearch}
                      onChange={(e) =>
                        setMaxCrawledPlacesPerSearch(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                    />
                    <small className="text-slate-400 block mt-1.5">
                      Limite d&apos;établissements par recherche.
                    </small>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    id="start"
                    onClick={handleEntrepriseSearch}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                    }}
                  >
                    {loading ? 'Recherche...' : 'Lancer Recherche'}
                  </button>
                  {downloadData && (
                    <button
                      type="button"
                      id="download"
                      onClick={() => handleDownload(downloadData)}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      }}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <div
                  className={`mt-3 text-sm ${
                    status.type === 'ok'
                      ? 'text-emerald-400'
                      : status.type === 'warn'
                      ? 'text-amber-500'
                      : status.type === 'err'
                      ? 'text-red-500'
                      : 'text-slate-400'
                  }`}
                >
                  {status.text}
                </div>

                {leads.length > 0 && (
                  <div
                    className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                    style={{ background: 'rgba(2,6,23,.50)' }}
                  >
                    <h2 className="mt-0 mb-4 text-base text-slate-300">
                      Résultats ({leads.length} prospects)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3">Entreprise</th>
                            <th className="text-left py-2 px-3">Téléphone</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Localisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 px-3">{lead.company_name || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.phone || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.email || 'N/A'}</td>
                              <td className="py-2 px-3">
                                {[lead.city, lead.region, lead.country].filter(Boolean).join(', ') || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            
            {activeView === 'instagram' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper Instagram</h2>
                  <p className="text-slate-300 mb-4">
                    <strong>collez ci-dessous le nom brut sans @ du profil recherché</strong>
                  </p>
                  <input
                    id="ig-usernames"
                    value={igUsernames}
                    onChange={(e) => setIgUsernames(e.target.value)}
                    placeholder="ex: mileycyrus (ou plusieurs noms insta séparés par des virgules)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      id="ig-start"
                      onClick={handleInstagramSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {igDownloadData && (
                      <button
                        type="button"
                        id="ig-download"
                        onClick={() => handleDownload(igDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      igStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : igStatus.type === 'warn'
                        ? 'text-amber-500'
                        : igStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {igStatus.text}
                  </div>
                </div>
              </div>
            )}

            
            {activeView === 'linkedin' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper LinkedIn (persona)</h2>
                  <p className="text-slate-300 mb-4">
                    Renseigne un <strong className="text-white">persona</strong> (ex: "directeur marketing",
                    "responsable RH") et, si besoin, des filtres.
                  </p>

                  <label className="block mb-2 text-[13px] text-slate-300">Persona (obligatoire)</label>
                  <input
                    id="li-persona"
                    value={liPersona}
                    onChange={(e) => setLiPersona(e.target.value)}
                    placeholder="ex: directeur marketing"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75 mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Location (optionnel)</label>
                      <input
                        id="li-location"
                        value={liLocation}
                        onChange={(e) => setLiLocation(e.target.value)}
                        placeholder="ex: Paris, France"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Industry (optionnel)</label>
                      <input
                        id="li-industry"
                        value={liIndustry}
                        onChange={(e) => setLiIndustry(e.target.value)}
                        placeholder="ex: Software"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Keywords (optionnel)</label>
                      <input
                        id="li-keywords"
                        value={liKeywords}
                        onChange={(e) => setLiKeywords(e.target.value)}
                        placeholder="ex: SaaS, CRM"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Seniority (optionnel)</label>
                      <input
                        id="li-seniority"
                        value={liSeniority}
                        onChange={(e) => setLiSeniority(e.target.value)}
                        placeholder="ex: Director, VP"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Company size (optionnel)</label>
                      <input
                        id="li-company-size"
                        value={liCompanySize}
                        onChange={(e) => setLiCompanySize(e.target.value)}
                        placeholder="ex: 11-50, 51-200"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      id="li-start"
                      onClick={handleLinkedInSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {liDownloadData && (
                      <button
                        type="button"
                        id="li-download"
                        onClick={() => handleDownload(liDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      liStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : liStatus.type === 'warn'
                        ? 'text-amber-500'
                        : liStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {liStatus.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

*/}









/*import { useState, useEffect } from 'react';
// ⬇️ leadsApi supprimé car on n'utilise plus le backend Node ici
// import { leadsApi } from '../../lib/apiClient';
import type { Lead } from '../../types';
import { supabase } from '../../lib/supabaseClient'; // ⬅️ IMPORTANT : adapte le chemin si besoin

const N8N_WEBHOOK = 'https://api.ottomate.ovh/n8n/webhook/prospects';

type ViewType = 'entreprise' | 'instagram' | 'linkedin';

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<ViewType>('entreprise');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: 'En attente…', type: '' });
  const [downloadData, setDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  // ID client Supabase (auth.uid)
  const [clientId, setClientId] = useState<string | null>(null);

  // Entreprises form
  const [categorie, setCategorie] = useState('');
  const [departement, setDepartement] = useState('');
  const [maxCrawledPlacesPerSearch, setMaxCrawledPlacesPerSearch] = useState(50);

  // Instagram form
  const [igUsernames, setIgUsernames] = useState('');
  const [igStatus, setIgStatus] = useState({ text: 'En attente…', type: '' });
  const [igDownloadData, setIgDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // LinkedIn form
  const [liPersona, setLiPersona] = useState('');
  const [liLocation, setLiLocation] = useState('');
  const [liIndustry, setLiIndustry] = useState('');
  const [liKeywords, setLiKeywords] = useState('');
  const [liSeniority, setLiSeniority] = useState('');
  const [liCompanySize, setLiCompanySize] = useState('');
  const [liStatus, setLiStatus] = useState({ text: 'En attente…', type: '' });
  const [liDownloadData, setLiDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // 🔐 Récupérer l'utilisateur Supabase connecté et son id
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!cancelled) {
          if (error) {
            console.warn('Erreur getUser supabase:', error.message);
            setClientId(null);
          } else if (data?.user) {
            setClientId(data.user.id); // <-- c'est cet id qu'on met dans l’URL n8n
          } else {
            setClientId(null);
          }
        }
      } catch (err) {
        console.error('Erreur inattendue getUser supabase:', err);
        if (!cancelled) setClientId(null);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = (data: { blobUrl: string; fileName: string } | null) => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = data.blobUrl;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(data.blobUrl);
    a.remove();
    setDownloadData(null);
    setIgDownloadData(null);
    setLiDownloadData(null);
  };

  const fetchToFile = async (
    url: URL,
    setStatusFn: (s: { text: string; type: string }) => void,
    setDownloadFn: (d: { blobUrl: string; fileName: string } | null) => void,
    nameFallback: string
  ) => {
    setStatusFn({ text: 'Crawler en cours…', type: '' });
    setLoading(true);

    try {
      const resp = await fetch(url.toString(), { method: 'GET' });
      const ct = resp.headers.get('content-type') || '';

      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      const blob = await resp.blob();

      if (ct.includes('application/json')) {
        const txt = await blob.text();
        try {
          const j = JSON.parse(txt);
          if (j.message && /started/i.test(j.message)) {
            throw new Error('Le webhook est en mode immédiat. Mets-le en "Response Node" dans n8n.');
          }
        } catch (_) {}
        throw new Error('Le serveur a renvoyé du JSON : ' + txt);
      }

      const cd = resp.headers.get('content-disposition') || '';
      let name = (cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i) || [])[1];
      if (name) name = decodeURIComponent(name);
      if (!name) name = nameFallback;

      const blobUrl = URL.createObjectURL(blob);
      setDownloadFn({ blobUrl, fileName: name });
      setStatusFn({ text: '🎉 Extraction terminée — fichier prêt.', type: 'ok' });
    } catch (err) {
      setStatusFn({
        text: 'Erreur: ' + ((err as Error)?.message || String(err)),
        type: 'err',
      });
      setDownloadFn(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ICI : on envoie la REQUÊTE N8N exacte avec l’ID client
/*  const handleEntrepriseSearch = async () => {
    if (!categorie.trim()) {
      setStatus({ text: 'La catégorie est requise.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    // On reset les leads affichés (table) au cas où
    setLeads([]);

    // ⚙️ Construit l’URL :
    // https://api.ottomate.ovh/n8n/webhook/prospects/{clientId}?categorie=...&maxCrawledPlacesPerSearch=...&departement=...
    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('categorie', categorie.trim());
    url.searchParams.set('maxCrawledPlacesPerSearch', String(maxCrawledPlacesPerSearch));
    if (departement.trim()) {
      url.searchParams.set('departement', departement.trim());
    }

    // ⬇️ EXACTEMENT comme ton ancienne page HTML : on télécharge le CSV
    await fetchToFile(url, setStatus, setDownloadData, `entreprises_${Date.now()}.csv`);
  };*/
/*
const handleEntrepriseSearch = async () => {
  if (!categorie.trim()) {
    setStatus({ text: 'La catégorie est requise.', type: 'warn' });
    return;
  }

  if (!clientId) {
    setStatus({
      text: "Impossible de déterminer votre compte client (non connecté ?).",
      type: 'err',
    });
    return;
  }

  // On reset la table au cas où
  setLeads([]);

  // ⚙️ Construit l’URL :
  // https://api.ottomate.ovh/n8n/webhook/prospects/{clientId}?categorie=...&maxCrawledPlacesPerSearch=...&departement=...
  const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
  url.searchParams.set('categorie', categorie.trim());
  url.searchParams.set('maxCrawledPlacesPerSearch', String(maxCrawledPlacesPerSearch));
  if (departement.trim()) {
    url.searchParams.set('departement', departement.trim());
  }

  // ❌ surtout PAS de window.open ici
  // ✅ on passe par fetchToFile pour récupérer le CSV et remplir downloadData
  await fetchToFile(url, setStatus, setDownloadData, `entreprises_${Date.now()}.csv`);
};



  const handleInstagramSearch = async () => {
    if (!igUsernames.trim()) {
      setIgStatus({ text: 'Le champ "usernames" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setIgStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    // 🔗 URL n8n avec /prospects/{clientId}
    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('usernames', igUsernames);

    await fetchToFile(url, setIgStatus, setIgDownloadData, `instagram_${Date.now()}.csv`);
  };

  const handleLinkedInSearch = async () => {
    if (!liPersona.trim()) {
      setLiStatus({ text: 'Le champ "persona" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setLiStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    // 🔗 URL n8n avec /prospects/{clientId}
    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('linkedin_persona', liPersona);
    if (liLocation) url.searchParams.set('linkedin_location', liLocation);
    if (liIndustry) url.searchParams.set('linkedin_industry', liIndustry);
    if (liKeywords) url.searchParams.set('linkedin_keywords', liKeywords);
    if (liSeniority) url.searchParams.set('linkedin_seniority', liSeniority);
    if (liCompanySize) url.searchParams.set('linkedin_company_size', liCompanySize);

    await fetchToFile(url, setLiStatus, setLiDownloadData, `linkedin_${Date.now()}.csv`);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 80% 0%, rgba(8,145,178,.20), transparent 40%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="max-w-[1100px] mx-auto pt-12 px-6 pb-12">
        <div
          className="rounded-[20px] overflow-hidden border border-slate-700/50 backdrop-blur-xl"
          style={{
            background: 'rgba(15,23,42,.80)',
            boxShadow: '0 30px 80px rgba(0,0,0,.45)',
          }}
        >
          
          <div
            className="px-8 py-7 border-b border-slate-700/50"
            style={{
              background: 'linear-gradient(90deg, rgba(6,182,212,.10), rgba(16,185,129,.10), rgba(6,182,212,.10))',
            }}
          >
            <h1
              className="text-[28px] font-extrabold tracking-wide m-0"
              style={{
                background: 'linear-gradient(90deg,#22d3ee,#34d399,#22d3ee)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Générateur de prospects B2B
            </h1>
            <p className="mt-1.5 mb-0 text-slate-400">
              Extraction de contacts téléphone & email au format CSV
            </p>
          </div>

          <div className="p-8">
            
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveView('entreprise')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'entreprise'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'entreprise'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                1) Entreprises
              </button>
              <button
                type="button"
                onClick={() => setActiveView('instagram')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'instagram'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'instagram'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                2) Instagram
              </button>
              <button
                type="button"
                onClick={() => setActiveView('linkedin')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'linkedin'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'linkedin'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                3) LinkedIn
              </button>
            </div>

            
            {activeView === 'entreprise' && (
              <div>
                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <p className="mt-0 mb-0 text-slate-300">
                    Renseigne obligatoirement et uniquement la{' '}
                    <strong className="text-white">catégorie</strong> pour lancer la recherche
                  </p>
                </div>

                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Contexte recherche</h2>

                  <label className="block mb-2 text-[13px] text-slate-300">
                    Catégorie / activité <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="categorie"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    placeholder="ex: boulangerie"
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">
                        Ville ou Département (optionnel)
                      </label>
                      <input
                        id="departement"
                        value={departement}
                        onChange={(e) => setDepartement(e.target.value)}
                        placeholder="ex: cannes ou Alpes-Maritimes"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block mb-2 text-[13px] text-slate-300">
                      Nombre de Numéro de téléphone voulu :
                    </label>
                    <input
                      type="number"
                      id="maxCrawledPlacesPerSearch"
                      min="20"
                      step="1"
                      value={maxCrawledPlacesPerSearch}
                      onChange={(e) =>
                        setMaxCrawledPlacesPerSearch(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                    />
                    <small className="text-slate-400 block mt-1.5">
                      Limite d&apos;établissements par recherche.
                    </small>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    id="start"
                    onClick={handleEntrepriseSearch}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                    }}
                  >
                    {loading ? 'Recherche...' : 'Lancer Recherche'}
                  </button>
                  {downloadData && (
                    <button
                      type="button"
                      id="download"
                      onClick={() => handleDownload(downloadData)}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      }}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <div
                  className={`mt-3 text-sm ${
                    status.type === 'ok'
                      ? 'text-emerald-400'
                      : status.type === 'warn'
                      ? 'text-amber-500'
                      : status.type === 'err'
                      ? 'text-red-500'
                      : 'text-slate-400'
                  }`}
                >
                  {status.text}
                </div>

                {leads.length > 0 && (
                  <div
                    className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                    style={{ background: 'rgba(2,6,23,.50)' }}
                  >
                    <h2 className="mt-0 mb-4 text-base text-slate-300">
                      Résultats ({leads.length} prospects)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3">Entreprise</th>
                            <th className="text-left py-2 px-3">Téléphone</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Localisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 px-3">{lead.company_name || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.phone || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.email || 'N/A'}</td>
                              <td className="py-2 px-3">
                                {[lead.city, lead.region, lead.country].filter(Boolean).join(', ') || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            
            {activeView === 'instagram' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper Instagram</h2>
                  <p className="text-slate-300 mb-4">
                    <strong>collez ci-dessous le nom brut sans @ du profil recherché</strong>
                  </p>
                  <input
                    id="ig-usernames"
                    value={igUsernames}
                    onChange={(e) => setIgUsernames(e.target.value)}
                    placeholder="ex: mileycyrus (ou plusieurs noms insta séparés par des virgules)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      id="ig-start"
                      onClick={handleInstagramSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {igDownloadData && (
                      <button
                        type="button"
                        id="ig-download"
                        onClick={() => handleDownload(igDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      igStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : igStatus.type === 'warn'
                        ? 'text-amber-500'
                        : igStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {igStatus.text}
                  </div>
                </div>
              </div>
            )}

           
            {activeView === 'linkedin' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper LinkedIn (persona)</h2>
                  <p className="text-slate-300 mb-4">
                    Renseigne un <strong className="text-white">persona</strong> (ex: "directeur marketing",
                    "responsable RH") et, si besoin, des filtres.
                  </p>

                  <label className="block mb-2 text-[13px] text-slate-300">Persona (obligatoire)</label>
                  <input
                    id="li-persona"
                    value={liPersona}
                    onChange={(e) => setLiPersona(e.target.value)}
                    placeholder="ex: directeur marketing"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75 mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Location (optionnel)</label>
                      <input
                        id="li-location"
                        value={liLocation}
                        onChange={(e) => setLiLocation(e.target.value)}
                        placeholder="ex: Paris, France"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Industry (optionnel)</label>
                      <input
                        id="li-industry"
                        value={liIndustry}
                        onChange={(e) => setLiIndustry(e.target.value)}
                        placeholder="ex: Software"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Keywords (optionnel)</label>
                      <input
                        id="li-keywords"
                        value={liKeywords}
                        onChange={(e) => setLiKeywords(e.target.value)}
                        placeholder="ex: SaaS, CRM"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Seniority (optionnel)</label>
                      <input
                        id="li-seniority"
                        value={liSeniority}
                        onChange={(e) => setLiSeniority(e.target.value)}
                        placeholder="ex: Director, VP"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Company size (optionnel)</label>
                      <input
                        id="li-company-size"
                        value={liCompanySize}
                        onChange={(e) => setLiCompanySize(e.target.value)}
                        placeholder="ex: 11-50, 51-200"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      id="li-start"
                      onClick={handleLinkedInSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {liDownloadData && (
                      <button
                        type="button"
                        id="li-download"
                        onClick={() => handleDownload(liDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      liStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : liStatus.type === 'warn'
                        ? 'text-amber-500'
                        : liStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {liStatus.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}*/

















/*

import { useState, useEffect } from 'react';
// ⬇️ leadsApi supprimé car on n'utilise plus le backend Node ici
// import { leadsApi } from '../../lib/apiClient';
import type { Lead } from '../../types';
import { supabase } from '../../lib/supabaseClient'; // ⬅️ IMPORTANT : adapte le chemin si besoin

const N8N_WEBHOOK = 'https://api.ottomate.ovh/n8n/webhook/prospects';

type ViewType = 'entreprise' | 'instagram' | 'linkedin';

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<ViewType>('entreprise');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: 'En attente…', type: '' });
  const [downloadData, setDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  // ID client Supabase (auth.uid)
  const [clientId, setClientId] = useState<string | null>(null);

  // Entreprises form
  const [categorie, setCategorie] = useState('');
  const [departement, setDepartement] = useState('');
  const [maxCrawledPlacesPerSearch, setMaxCrawledPlacesPerSearch] = useState(50);

  // Instagram form
  const [igUsernames, setIgUsernames] = useState('');
  const [igStatus, setIgStatus] = useState({ text: 'En attente…', type: '' });
  const [igDownloadData, setIgDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // LinkedIn form
  const [liPersona, setLiPersona] = useState('');
  const [liLocation, setLiLocation] = useState('');
  const [liIndustry, setLiIndustry] = useState('');
  const [liKeywords, setLiKeywords] = useState('');
  const [liSeniority, setLiSeniority] = useState('');
  const [liCompanySize, setLiCompanySize] = useState('');
  const [liStatus, setLiStatus] = useState({ text: 'En attente…', type: '' });
  const [liDownloadData, setLiDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // 🔐 Récupérer l'utilisateur Supabase connecté et son id
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!cancelled) {
          if (error) {
            console.warn('Erreur getUser supabase:', error.message);
            setClientId(null);
          } else if (data?.user) {
            setClientId(data.user.id); // <-- c'est cet id qu'on met dans l’URL n8n
          } else {
            setClientId(null);
          }
        }
      } catch (err) {
        console.error('Erreur inattendue getUser supabase:', err);
        if (!cancelled) setClientId(null);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

/*  const handleDownload = (data: { blobUrl: string; fileName: string } | null) => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = data.blobUrl;
    a.download = data.fileName;
    a.target = '_self'; // force même onglet
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(data.blobUrl);
    a.remove();
    setDownloadData(null);
    setIgDownloadData(null);
    setLiDownloadData(null);
  };*/


/*
  const handleDownload = (data: { blobUrl: string; fileName: string } | null) => {
  if (!data) return;

  const a = document.createElement('a');
  a.href = data.blobUrl;
  a.download = data.fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
};


  const fetchToFile = async (
    url: URL,
    setStatusFn: (s: { text: string; type: string }) => void,
    setDownloadFn: (d: { blobUrl: string; fileName: string } | null) => void,
    nameFallback: string
  ) => {
    setStatusFn({ text: 'Crawler en cours…', type: '' });
    setLoading(true);

    try {
      const resp = await fetch(url.toString(), { method: 'GET' });
      const ct = resp.headers.get('content-type') || '';

      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      const blob = await resp.blob();

      if (ct.includes('application/json')) {
        const txt = await blob.text();
        try {
          const j = JSON.parse(txt);
          if (j.message && /started/i.test(j.message)) {
            throw new Error('Le webhook est en mode immédiat. Mets-le en "Response Node" dans n8n.');
          }
        } catch (_) {}
        throw new Error('Le serveur a renvoyé du JSON : ' + txt);
      }

      const cd = resp.headers.get('content-disposition') || '';
      let name = (cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i) || [])[1];
      if (name) name = decodeURIComponent(name);
      if (!name) name = nameFallback;

      const blobUrl = URL.createObjectURL(blob);
      setDownloadFn({ blobUrl, fileName: name });
      setStatusFn({ text: '🎉 Extraction terminée — fichier prêt.', type: 'ok' });
    } catch (err) {
      setStatusFn({
        text: 'Erreur: ' + ((err as Error)?.message || String(err)),
        type: 'err',
      });
      setDownloadFn(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Entreprises : on ne passe PLUS par fetchToFile → navigation directe comme l’ancienne page HTML
  const handleEntrepriseSearch = () => {
    if (!categorie.trim()) {
      setStatus({ text: 'La catégorie est requise.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    // On reset la table au cas où
    setLeads([]);

    // ⚙️ Construit l’URL :
    // https://api.ottomate.ovh/n8n/webhook/prospects/{clientId}?categorie=...&maxCrawledPlacesPerSearch=...&departement=...
    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('categorie', categorie.trim());
    url.searchParams.set('maxCrawledPlacesPerSearch', String(maxCrawledPlacesPerSearch));
    if (departement.trim()) {
      url.searchParams.set('departement', departement.trim());
    }

    // ⬇️ Navigation dans L’ONGLET COURANT (PAS de nouvel onglet, PAS de fetch)
    setStatus({ text: 'Téléchargement du fichier en cours…', type: '' });
    window.location.href = url.toString();
  };

  const handleInstagramSearch = async () => {
    if (!igUsernames.trim()) {
      setIgStatus({ text: 'Le champ "usernames" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setIgStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('usernames', igUsernames);

    await fetchToFile(url, setIgStatus, setIgDownloadData, `instagram_${Date.now()}.csv`);
  };

  const handleLinkedInSearch = async () => {
    if (!liPersona.trim()) {
      setLiStatus({ text: 'Le champ "persona" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setLiStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('linkedin_persona', liPersona);
    if (liLocation) url.searchParams.set('linkedin_location', liLocation);
    if (liIndustry) url.searchParams.set('linkedin_industry', liIndustry);
    if (liKeywords) url.searchParams.set('linkedin_keywords', liKeywords);
    if (liSeniority) url.searchParams.set('linkedin_seniority', liSeniority);
    if (liCompanySize) url.searchParams.set('linkedin_company_size', liCompanySize);

    await fetchToFile(url, setLiStatus, setLiDownloadData, `linkedin_${Date.now()}.csv`);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 80% 0%, rgba(8,145,178,.20), transparent 40%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="max-w-[1100px] mx-auto pt-12 px-6 pb-12">
        <div
          className="rounded-[20px] overflow-hidden border border-slate-700/50 backdrop-blur-xl"
          style={{
            background: 'rgba(15,23,42,.80)',
            boxShadow: '0 30px 80px rgba(0,0,0,.45)',
          }}
        >
          
          <div
            className="px-8 py-7 border-b border-slate-700/50"
            style={{
              background: 'linear-gradient(90deg, rgba(6,182,212,.10), rgba(16,185,129,.10), rgba(6,182,212,.10))',
            }}
          >
            <h1
              className="text-[28px] font-extrabold tracking-wide m-0"
              style={{
                background: 'linear-gradient(90deg,#22d3ee,#34d399,#22d3ee)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Générateur de prospects B2B
            </h1>
            <p className="mt-1.5 mb-0 text-slate-400">
              Extraction de contacts téléphone & email au format CSV
            </p>
          </div>

          <div className="p-8">
            
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveView('entreprise')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'entreprise'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'entreprise'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                1) Entreprises
              </button>
              <button
                type="button"
                onClick={() => setActiveView('instagram')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'instagram'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'instagram'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                2) Instagram
              </button>
              <button
                type="button"
                onClick={() => setActiveView('linkedin')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'linkedin'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'linkedin'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                3) LinkedIn
              </button>
            </div>

            
            {activeView === 'entreprise' && (
              <div>
                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <p className="mt-0 mb-0 text-slate-300">
                    Renseigne obligatoirement et uniquement la{' '}
                    <strong className="text-white">catégorie</strong> pour lancer la recherche
                  </p>
                </div>

                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Contexte recherche</h2>

                  <label className="block mb-2 text-[13px] text-slate-300">
                    Catégorie / activité <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="categorie"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    placeholder="ex: boulangerie"
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">
                        Ville ou Département (optionnel)
                      </label>
                      <input
                        id="departement"
                        value={departement}
                        onChange={(e) => setDepartement(e.target.value)}
                        placeholder="ex: cannes ou Alpes-Maritimes"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block mb-2 text-[13px] text-slate-300">
                      Nombre de Numéro de téléphone voulu :
                    </label>
                    <input
                      type="number"
                      id="maxCrawledPlacesPerSearch"
                      min="20"
                      step="1"
                      value={maxCrawledPlacesPerSearch}
                      onChange={(e) =>
                        setMaxCrawledPlacesPerSearch(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                    />
                    <small className="text-slate-400 block mt-1.5">
                      Limite d&apos;établissements par recherche.
                    </small>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    id="start"
                    onClick={handleEntrepriseSearch}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                    }}
                  >
                    {loading ? 'Recherche...' : 'Lancer Recherche'}
                  </button>
                  {downloadData && (
                    <button
                      type="button"
                      id="download"
                      onClick={() => handleDownload(downloadData)}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      }}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <div
                  className={`mt-3 text-sm ${
                    status.type === 'ok'
                      ? 'text-emerald-400'
                      : status.type === 'warn'
                      ? 'text-amber-500'
                      : status.type === 'err'
                      ? 'text-red-500'
                      : 'text-slate-400'
                  }`}
                >
                  {status.text}
                </div>

                {leads.length > 0 && (
                  <div
                    className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                    style={{ background: 'rgba(2,6,23,.50)' }}
                  >
                    <h2 className="mt-0 mb-4 text-base text-slate-300">
                      Résultats ({leads.length} prospects)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3">Entreprise</th>
                            <th className="text-left py-2 px-3">Téléphone</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Localisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 px-3">{lead.company_name || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.phone || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.email || 'N/A'}</td>
                              <td className="py-2 px-3">
                                {[lead.city, lead.region, lead.country].filter(Boolean).join(', ') || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            
            {activeView === 'instagram' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper Instagram</h2>
                  <p className="text-slate-300 mb-4">
                    <strong>collez ci-dessous le nom brut sans @ du profil recherché</strong>
                  </p>
                  <input
                    id="ig-usernames"
                    value={igUsernames}
                    onChange={(e) => setIgUsernames(e.target.value)}
                    placeholder="ex: mileycyrus (ou plusieurs noms insta séparés par des virgules)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      id="ig-start"
                      onClick={handleInstagramSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {igDownloadData && (
                      <button
                        type="button"
                        id="ig-download"
                        onClick={() => handleDownload(igDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      igStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : igStatus.type === 'warn'
                        ? 'text-amber-500'
                        : igStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {igStatus.text}
                  </div>
                </div>
              </div>
            )}

            
            {activeView === 'linkedin' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper LinkedIn (persona)</h2>
                  <p className="text-slate-300 mb-4">
                    Renseigne un <strong className="text-white">persona</strong> (ex: "directeur marketing",
                    "responsable RH") et, si besoin, des filtres.
                  </p>

                  <label className="block mb-2 text-[13px] text-slate-300">Persona (obligatoire)</label>
                  <input
                    id="li-persona"
                    value={liPersona}
                    onChange={(e) => setLiPersona(e.target.value)}
                    placeholder="ex: directeur marketing"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75 mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Location (optionnel)</label>
                      <input
                        id="li-location"
                        value={liLocation}
                        onChange={(e) => setLiLocation(e.target.value)}
                        placeholder="ex: Paris, France"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Industry (optionnel)</label>
                      <input
                        id="li-industry"
                        value={liIndustry}
                        onChange={(e) => setLiIndustry(e.target.value)}
                        placeholder="ex: Software"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Keywords (optionnel)</label>
                      <input
                        id="li-keywords"
                        value={liKeywords}
                        onChange={(e) => setLiKeywords(e.target.value)}
                        placeholder="ex: SaaS, CRM"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Seniority (optionnel)</label>
                      <input
                        id="li-seniority"
                        value={liSeniority}
                        onChange={(e) => setLiSeniority(e.target.value)}
                        placeholder="ex: Director, VP"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Company size (optionnel)</label>
                      <input
                        id="li-company-size"
                        value={liCompanySize}
                        onChange={(e) => setLiCompanySize(e.target.value)}
                        placeholder="ex: 11-50, 51-200"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      id="li-start"
                      onClick={handleLinkedInSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {liDownloadData && (
                      <button
                        type="button"
                        id="li-download"
                        onClick={() => handleDownload(liDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      liStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : liStatus.type === 'warn'
                        ? 'text-amber-500'
                        : liStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {liStatus.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


*/






/*
import { useState, useEffect } from 'react';
// ⬇️ leadsApi plus utilisé
// import { leadsApi } from '../../lib/apiClient';
import type { Lead } from '../../types';
import { supabase } from '../../lib/supabaseClient';

const N8N_WEBHOOK = 'https://api.ottomate.ovh/n8n/webhook/prospects';

type ViewType = 'entreprise' | 'instagram' | 'linkedin';

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<ViewType>('entreprise');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: 'En attente…', type: '' });

  const [downloadData, setDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  // ID client Supabase (auth.uid)
  const [clientId, setClientId] = useState<string | null>(null);

  // Entreprises form
  const [categorie, setCategorie] = useState('');
  const [departement, setDepartement] = useState('');
  const [maxCrawledPlacesPerSearch, setMaxCrawledPlacesPerSearch] = useState(50);

  // Instagram form
  const [igUsernames, setIgUsernames] = useState('');
  const [igStatus, setIgStatus] = useState({ text: 'En attente…', type: '' });
  const [igDownloadData, setIgDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // LinkedIn form
  const [liPersona, setLiPersona] = useState('');
  const [liLocation, setLiLocation] = useState('');
  const [liIndustry, setLiIndustry] = useState('');
  const [liKeywords, setLiKeywords] = useState('');
  const [liSeniority, setLiSeniority] = useState('');
  const [liCompanySize, setLiCompanySize] = useState('');
  const [liStatus, setLiStatus] = useState({ text: 'En attente…', type: '' });
  const [liDownloadData, setLiDownloadData] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // 🔐 Récupérer l'utilisateur Supabase connecté et son id
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!cancelled) {
          if (error) {
            console.warn('Erreur getUser supabase:', error.message);
            setClientId(null);
          } else if (data?.user) {
            setClientId(data.user.id);
          } else {
            setClientId(null);
          }
        }
      } catch (err) {
        console.error('Erreur inattendue getUser supabase:', err);
        if (!cancelled) setClientId(null);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // ⬇️ Bouton télécharger → re-télécharger autant qu'on veut
  const handleDownload = (data: { blobUrl: string; fileName: string } | null) => {
    if (!data) return;

    const a = document.createElement('a');
    a.href = data.blobUrl;
    a.download = data.fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // ❌ on NE reset PAS les states ici
    // ❌ pas de setDownloadData(null), pas de revokeObjectURL
  };

  const fetchToFile = async (
    url: URL,
    setStatusFn: (s: { text: string; type: string }) => void,
    setDownloadFn: (d: { blobUrl: string; fileName: string } | null) => void,
    nameFallback: string
  ) => {
    setStatusFn({ text: 'Crawler en cours…', type: '' });
    setLoading(true);

    try {
      const resp = await fetch(url.toString(), { method: 'GET' });
      const ct = resp.headers.get('content-type') || '';

      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      const blob = await resp.blob();

      if (ct.includes('application/json')) {
        const txt = await blob.text();
        try {
          const j = JSON.parse(txt);
          if (j.message && /started/i.test(j.message)) {
            throw new Error('Le webhook est en mode immédiat. Mets-le en "Response Node" dans n8n.');
          }
        } catch (_) {}
        throw new Error('Le serveur a renvoyé du JSON : ' + txt);
      }

      const cd = resp.headers.get('content-disposition') || '';
      let name = (cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i) || [])[1];
      if (name) name = decodeURIComponent(name);
      if (!name) name = nameFallback;

      const blobUrl = URL.createObjectURL(blob);
      setDownloadFn({ blobUrl, fileName: name });
      setStatusFn({ text: '🎉 Extraction terminée — fichier prêt.', type: 'ok' });
    } catch (err) {
      setStatusFn({
        text: 'Erreur: ' + ((err as Error)?.message || String(err)),
        type: 'err',
      });
      setDownloadFn(null);
    } finally {
      setLoading(false);
    }
  };

  // 🌍 ENTREPRISES → N8N + bouton Télécharger
  const handleEntrepriseSearch = async () => {
    if (!categorie.trim()) {
      setStatus({ text: 'La catégorie est requise.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    // Reset table
    setLeads([]);

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('categorie', categorie.trim());
    url.searchParams.set('maxCrawledPlacesPerSearch', String(maxCrawledPlacesPerSearch));
    if (departement.trim()) {
      url.searchParams.set('departement', departement.trim());
    }

    // ⬇️ ICI on utilise setDownloadData → plus d’erreur TS, et bouton OK
    await fetchToFile(url, setStatus, setDownloadData, `entreprises_${Date.now()}.csv`);
  };

  const handleInstagramSearch = async () => {
    if (!igUsernames.trim()) {
      setIgStatus({ text: 'Le champ "usernames" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setIgStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('usernames', igUsernames);

    await fetchToFile(url, setIgStatus, setIgDownloadData, `instagram_${Date.now()}.csv`);
  };

  const handleLinkedInSearch = async () => {
    if (!liPersona.trim()) {
      setLiStatus({ text: 'Le champ "persona" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setLiStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('linkedin_persona', liPersona);
    if (liLocation) url.searchParams.set('linkedin_location', liLocation);
    if (liIndustry) url.searchParams.set('linkedin_industry', liIndustry);
    if (liKeywords) url.searchParams.set('linkedin_keywords', liKeywords);
    if (liSeniority) url.searchParams.set('linkedin_seniority', liSeniority);
    if (liCompanySize) url.searchParams.set('linkedin_company_size', liCompanySize);

    await fetchToFile(url, setLiStatus, setLiDownloadData, `linkedin_${Date.now()}.csv`);
  };

  // 🔽 RENDER (inchangé sauf que le bouton Télécharger fonctionne)
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 80% 0%, rgba(8,145,178,.20), transparent 40%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="max-w-[1100px] mx-auto pt-12 px-6 pb-12">
        <div
          className="rounded-[20px] overflow-hidden border border-slate-700/50 backdrop-blur-xl"
          style={{
            background: 'rgba(15,23,42,.80)',
            boxShadow: '0 30px 80px rgba(0,0,0,.45)',
          }}
        >
          
          <div
            className="px-8 py-7 border-b border-slate-700/50"
            style={{
              background: 'linear-gradient(90deg, rgba(6,182,212,.10), rgba(16,185,129,.10), rgba(6,182,212,.10))',
            }}
          >
            <h1
              className="text-[28px] font-extrabold tracking-wide m-0"
              style={{
                background: 'linear-gradient(90deg,#22d3ee,#34d399,#22d3ee)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Générateur de prospects B2B
            </h1>
            <p className="mt-1.5 mb-0 text-slate-400">
              Extraction de contacts téléphone & email au format CSV
            </p>
          </div>

          <div className="p-8">
           
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveView('entreprise')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'entreprise'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'entreprise'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                1) Entreprises
              </button>
              <button
                type="button"
                onClick={() => setActiveView('instagram')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'instagram'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'instagram'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                2) Instagram
              </button>
              <button
                type="button"
                onClick={() => setActiveView('linkedin')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'linkedin'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'linkedin'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                3) LinkedIn
              </button>
            </div>

           
            {activeView === 'entreprise' && (
              <div>
                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <p className="mt-0 mb-0 text-slate-300">
                    Renseigne obligatoirement et uniquement la{' '}
                    <strong className="text-white">catégorie</strong> pour lancer la recherche
                  </p>
                </div>

                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Contexte recherche</h2>

                  <label className="block mb-2 text-[13px] text-slate-300">
                    Catégorie / activité <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="categorie"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    placeholder="ex: boulangerie"
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">
                        Ville ou Département (optionnel)
                      </label>
                      <input
                        id="departement"
                        value={departement}
                        onChange={(e) => setDepartement(e.target.value)}
                        placeholder="ex: cannes ou Alpes-Maritimes"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block mb-2 text-[13px] text-slate-300">
                      Nombre de Numéro de téléphone voulu :
                    </label>
                    <input
                      type="number"
                      id="maxCrawledPlacesPerSearch"
                      min="20"
                      step="1"
                      value={maxCrawledPlacesPerSearch}
                      onChange={(e) =>
                        setMaxCrawledPlacesPerSearch(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                    />
                    <small className="text-slate-400 block mt-1.5">
                      Limite d&apos;établissements par recherche.
                    </small>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    id="start"
                    onClick={handleEntrepriseSearch}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                    }}
                  >
                    {loading ? 'Recherche...' : 'Lancer Recherche'}
                  </button>
                  {downloadData && (
                    <button
                      type="button"
                      id="download"
                      onClick={() => handleDownload(downloadData)}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      }}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <div
                  className={`mt-3 text-sm ${
                    status.type === 'ok'
                      ? 'text-emerald-400'
                      : status.type === 'warn'
                      ? 'text-amber-500'
                      : status.type === 'err'
                      ? 'text-red-500'
                      : 'text-slate-400'
                  }`}
                >
                  {status.text}
                </div>

                {leads.length > 0 && (
                  <div
                    className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                    style={{ background: 'rgba(2,6,23,.50)' }}
                  >
                    <h2 className="mt-0 mb-4 text-base text-slate-300">
                      Résultats ({leads.length} prospects)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3">Entreprise</th>
                            <th className="text-left py-2 px-3">Téléphone</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Localisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 px-3">{lead.company_name || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.phone || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.email || 'N/A'}</td>
                              <td className="py-2 px-3">
                                {[lead.city, lead.region, lead.country].filter(Boolean).join(', ') || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

           
            {activeView === 'instagram' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper Instagram</h2>
                  <p className="text-slate-300 mb-4">
                    <strong>collez ci-dessous le nom brut sans @ du profil recherché</strong>
                  </p>
                  <input
                    id="ig-usernames"
                    value={igUsernames}
                    onChange={(e) => setIgUsernames(e.target.value)}
                    placeholder="ex: mileycyrus (ou plusieurs noms insta séparés par des virgules)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      id="ig-start"
                      onClick={handleInstagramSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {igDownloadData && (
                      <button
                        type="button"
                        id="ig-download"
                        onClick={() => handleDownload(igDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      igStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : igStatus.type === 'warn'
                        ? 'text-amber-500'
                        : igStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {igStatus.text}
                  </div>
                </div>
              </div>
            )}

            
            {activeView === 'linkedin' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper LinkedIn (persona)</h2>
                  <p className="text-slate-300 mb-4">
                    Renseigne un <strong className="text-white">persona</strong> (ex: "directeur marketing",
                    "responsable RH") et, si besoin, des filtres.
                  </p>

                  <label className="block mb-2 text-[13px] text-slate-300">Persona (obligatoire)</label>
                  <input
                    id="li-persona"
                    value={liPersona}
                    onChange={(e) => setLiPersona(e.target.value)}
                    placeholder="ex: directeur marketing"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75 mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Location (optionnel)</label>
                      <input
                        id="li-location"
                        value={liLocation}
                        onChange={(e) => setLiLocation(e.target.value)}
                        placeholder="ex: Paris, France"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Industry (optionnel)</label>
                      <input
                        id="li-industry"
                        value={liIndustry}
                        onChange={(e) => setLiIndustry(e.target.value)}
                        placeholder="ex: Software"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Keywords (optionnel)</label>
                      <input
                        id="li-keywords"
                        value={liKeywords}
                        onChange={(e) => setLiKeywords(e.target.value)}
                        placeholder="ex: SaaS, CRM"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Seniority (optionnel)</label>
                      <input
                        id="li-seniority"
                        value={liSeniority}
                        onChange={(e) => setLiSeniority(e.target.value)}
                        placeholder="ex: Director, VP"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Company size (optionnel)</label>
                      <input
                        id="li-company-size"
                        value={liCompanySize}
                        onChange={(e) => setLiCompanySize(e.target.value)}
                        placeholder="ex: 11-50, 51-200"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      id="li-start"
                      onClick={handleLinkedInSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {liDownloadData && (
                      <button
                        type="button"
                        id="li-download"
                        onClick={() => handleDownload(liDownloadData)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      liStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : liStatus.type === 'warn'
                        ? 'text-amber-500'
                        : liStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {liStatus.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
*/



import { useState, useEffect } from 'react';
import type { Lead } from '../../types';
import { supabase } from '../../lib/supabaseClient';

const N8N_WEBHOOK = 'https://api.ottomate.ovh/n8n/webhook/prospects';

type ViewType = 'entreprise' | 'instagram' | 'linkedin';

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<ViewType>('entreprise');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: 'En attente…', type: '' });

  const [leads, setLeads] = useState<Lead[]>([]);

  // ID client Supabase (auth.uid)
  const [clientId, setClientId] = useState<string | null>(null);

  // URL utilisées pour re-télécharger
  const [entrepriseUrl, setEntrepriseUrl] = useState<string | null>(null);
  const [igUrl, setIgUrl] = useState<string | null>(null);
  const [liUrl, setLiUrl] = useState<string | null>(null);

  // Entreprises form
  const [categorie, setCategorie] = useState('');
  const [departement, setDepartement] = useState('');
  const [maxCrawledPlacesPerSearch, setMaxCrawledPlacesPerSearch] = useState(50);

  // Instagram form
  const [igUsernames, setIgUsernames] = useState('');
  const [igStatus, setIgStatus] = useState({ text: 'En attente…', type: '' });

  // LinkedIn form
  const [liPersona, setLiPersona] = useState('');
  const [liLocation, setLiLocation] = useState('');
  const [liIndustry, setLiIndustry] = useState('');
  const [liKeywords, setLiKeywords] = useState('');
  const [liSeniority, setLiSeniority] = useState('');
  const [liCompanySize, setLiCompanySize] = useState('');
  const [liStatus, setLiStatus] = useState({ text: 'En attente…', type: '' });

  // 🔐 Récupérer l'utilisateur Supabase connecté et son id
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!cancelled) {
          if (error) {
            console.warn('Erreur getUser supabase:', error.message);
            setClientId(null);
          } else if (data?.user) {
            setClientId(data.user.id);
          } else {
            setClientId(null);
          }
        }
      } catch (err) {
        console.error('Erreur inattendue getUser supabase:', err);
        if (!cancelled) setClientId(null);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // 🔽 déclenche un download comme une page HTML (pas de fetch, pas de CORS)
  const triggerDownloadUrl = (url: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    // on nettoie plus tard, mais on s’en fout pour le download
    setTimeout(() => {
      iframe.remove();
    }, 60000);
  };

  // 🌍 ENTREPRISES → comme ton HTML : on appelle directement l’URL n8n
  const handleEntrepriseSearch = () => {
    if (!categorie.trim()) {
      setStatus({ text: 'La catégorie est requise.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    setLeads([]); // on laisse la table vide, comme tu es passé au CSV
    setLoading(true);

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('categorie', categorie.trim());
    url.searchParams.set('maxCrawledPlacesPerSearch', String(maxCrawledPlacesPerSearch));
    if (departement.trim()) {
      url.searchParams.set('departement', departement.trim());
    }

    const urlStr = url.toString();
    setEntrepriseUrl(urlStr);

    // ⬇️ EXACTEMENT l’équivalent de ton HTML : le navigateur va télécharger le CSV
    triggerDownloadUrl(urlStr);

    setLoading(false);
    setStatus({
      text: 'Extraction lancée. Si besoin, utilise le bouton "Télécharger" pour re-télécharger le fichier.',
      type: 'ok',
    });
  };

  const handleInstagramSearch = () => {
    if (!igUsernames.trim()) {
      setIgStatus({ text: 'Le champ "usernames" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setIgStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    setLoading(true);

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('usernames', igUsernames.trim());

    const urlStr = url.toString();
    setIgUrl(urlStr);
    triggerDownloadUrl(urlStr);

    setLoading(false);
    setIgStatus({
      text: 'Extraction lancée. Si besoin, utilise le bouton "Télécharger" pour re-télécharger le fichier.',
      type: 'ok',
    });
  };

  const handleLinkedInSearch = () => {
    if (!liPersona.trim()) {
      setLiStatus({ text: 'Le champ "persona" est requis.', type: 'warn' });
      return;
    }

    if (!clientId) {
      setLiStatus({
        text: "Impossible de déterminer votre compte client (non connecté ?).",
        type: 'err',
      });
      return;
    }

    setLoading(true);

    const url = new URL(`${N8N_WEBHOOK}/${clientId}`);
    url.searchParams.set('linkedin_persona', liPersona.trim());
    if (liLocation) url.searchParams.set('linkedin_location', liLocation.trim());
    if (liIndustry) url.searchParams.set('linkedin_industry', liIndustry.trim());
    if (liKeywords) url.searchParams.set('linkedin_keywords', liKeywords.trim());
    if (liSeniority) url.searchParams.set('linkedin_seniority', liSeniority.trim());
    if (liCompanySize) url.searchParams.set('linkedin_company_size', liCompanySize.trim());

    const urlStr = url.toString();
    setLiUrl(urlStr);
    triggerDownloadUrl(urlStr);

    setLoading(false);
    setLiStatus({
      text: 'Extraction lancée. Si besoin, utilise le bouton "Télécharger" pour re-télécharger le fichier.',
      type: 'ok',
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 80% 0%, rgba(8,145,178,.20), transparent 40%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="max-w-[1100px] mx-auto pt-12 px-6 pb-12">
        <div
          className="rounded-[20px] overflow-hidden border border-slate-700/50 backdrop-blur-xl"
          style={{
            background: 'rgba(15,23,42,.80)',
            boxShadow: '0 30px 80px rgba(0,0,0,.45)',
          }}
        >
          {/* Header */}
          <div
            className="px-8 py-7 border-b border-slate-700/50"
            style={{
              background: 'linear-gradient(90deg, rgba(6,182,212,.10), rgba(16,185,129,.10), rgba(6,182,212,.10))',
            }}
          >
            <h1
              className="text-[28px] font-extrabold tracking-wide m-0"
              style={{
                background: 'linear-gradient(90deg,#22d3ee,#34d399,#22d3ee)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Générateur de prospects B2B
            </h1>
            <p className="mt-1.5 mb-0 text-slate-400">
              Extraction de contacts téléphone & email au format CSV
            </p>
          </div>

          <div className="p-8">
            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveView('entreprise')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'entreprise'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'entreprise'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                1) Entreprises
              </button>
              <button
                type="button"
                onClick={() => setActiveView('instagram')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'instagram'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'instagram'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                2) Instagram
              </button>
              <button
                type="button"
                onClick={() => setActiveView('linkedin')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-4 rounded-[14px] font-bold text-base border transition-all ${
                  activeView === 'linkedin'
                    ? 'text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,.30)]'
                    : 'text-slate-300 border-slate-700/50 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  activeView === 'linkedin'
                    ? { backgroundImage: 'linear-gradient(90deg, #059669, #10b981)' }
                    : {}
                }
              >
                3) LinkedIn
              </button>
            </div>

            {/* View 1: Entreprises */}
            {activeView === 'entreprise' && (
              <div>
                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <p className="mt-0 mb-0 text-slate-300">
                    Renseigne obligatoirement et uniquement la{' '}
                    <strong className="text-white">catégorie</strong> pour lancer la recherche
                  </p>
                </div>

                <div
                  className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Contexte recherche</h2>

                  <label className="block mb-2 text-[13px] text-slate-300">
                    Catégorie / activité <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="categorie"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    placeholder="ex: boulangerie"
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">
                        Ville ou Département (optionnel)
                      </label>
                      <input
                        id="departement"
                        value={departement}
                        onChange={(e) => setDepartement(e.target.value)}
                        placeholder="ex: cannes ou Alpes-Maritimes"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block mb-2 text-[13px] text-slate-300">
                      Nombre de Numéro de téléphone voulu :
                    </label>
                    <input
                      type="number"
                      id="maxCrawledPlacesPerSearch"
                      min="20"
                      step="1"
                      value={maxCrawledPlacesPerSearch}
                      onChange={(e) =>
                        setMaxCrawledPlacesPerSearch(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                    />
                    <small className="text-slate-400 block mt-1.5">
                      Limite d&apos;établissements par recherche.
                    </small>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    id="start"
                    onClick={handleEntrepriseSearch}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                    }}
                  >
                    {loading ? 'Recherche...' : 'Lancer Recherche'}
                  </button>
                  {entrepriseUrl && (
                    <button
                      type="button"
                      id="download"
                      onClick={() => triggerDownloadUrl(entrepriseUrl)}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      }}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <div
                  className={`mt-3 text-sm ${
                    status.type === 'ok'
                      ? 'text-emerald-400'
                      : status.type === 'warn'
                      ? 'text-amber-500'
                      : status.type === 'err'
                      ? 'text-red-500'
                      : 'text-slate-400'
                  }`}
                >
                  {status.text}
                </div>

                {/* table laissée en place si un jour tu remets des leads côté Node */}
                {leads.length > 0 && (
                  <div
                    className="mt-6 p-6 rounded-2xl border border-slate-700/50"
                    style={{ background: 'rgba(2,6,23,.50)' }}
                  >
                    <h2 className="mt-0 mb-4 text-base text-slate-300">
                      Résultats ({leads.length} prospects)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3">Entreprise</th>
                            <th className="text-left py-2 px-3">Téléphone</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Localisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 px-3">{lead.company_name || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.phone || 'N/A'}</td>
                              <td className="py-2 px-3">{lead.email || 'N/A'}</td>
                              <td className="py-2 px-3">
                                {[lead.city, lead.region, lead.country].filter(Boolean).join(', ') || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View 2: Instagram */}
            {activeView === 'instagram' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper Instagram</h2>
                  <p className="text-slate-300 mb-4">
                    <strong>collez ci-dessous le nom brut sans @ du profil recherché</strong>
                  </p>
                  <input
                    id="ig-usernames"
                    value={igUsernames}
                    onChange={(e) => setIgUsernames(e.target.value)}
                    placeholder="ex: mileycyrus (ou plusieurs noms insta séparés par des virgules)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      id="ig-start"
                      onClick={handleInstagramSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {igUrl && (
                      <button
                        type="button"
                        id="ig-download"
                        onClick={() => triggerDownloadUrl(igUrl)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      igStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : igStatus.type === 'warn'
                        ? 'text-amber-500'
                        : igStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {igStatus.text}
                  </div>
                </div>
              </div>
            )}

            {/* View 3: LinkedIn */}
            {activeView === 'linkedin' && (
              <div className="mt-8">
                <div
                  className="p-6 rounded-2xl border border-slate-700/50"
                  style={{ background: 'rgba(2,6,23,.50)' }}
                >
                  <h2 className="mt-0 mb-3.5 text-base text-slate-300">Scraper LinkedIn (persona)</h2>
                  <p className="text-slate-300 mb-4">
                    Renseigne un <strong className="text-white">persona</strong> (ex: "directeur marketing",
                    "responsable RH") et, si besoin, des filtres.
                  </p>

                  <label className="block mb-2 text-[13px] text-slate-300">Persona (obligatoire)</label>
                  <input
                    id="li-persona"
                    value={liPersona}
                    onChange={(e) => setLiPersona(e.target.value)}
                    placeholder="ex: directeur marketing"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75 mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Location (optionnel)</label>
                      <input
                        id="li-location"
                        value={liLocation}
                        onChange={(e) => setLiLocation(e.target.value)}
                        placeholder="ex: Paris, France"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Industry (optionnel)</label>
                      <input
                        id="li-industry"
                        value={liIndustry}
                        onChange={(e) => setLiIndustry(e.target.value)}
                        placeholder="ex: Software"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Keywords (optionnel)</label>
                      <input
                        id="li-keywords"
                        value={liKeywords}
                        onChange={(e) => setLiKeywords(e.target.value)}
                        placeholder="ex: SaaS, CRM"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Seniority (optionnel)</label>
                      <input
                        id="li-seniority"
                        value={liSeniority}
                        onChange={(e) => setLiSeniority(e.target.value)}
                        placeholder="ex: Director, VP"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block mb-2 text-[13px] text-slate-300">Company size (optionnel)</label>
                      <input
                        id="li-company-size"
                        value={liCompanySize}
                        onChange={(e) => setLiCompanySize(e.target.value)}
                        placeholder="ex: 11-50, 51-200"
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/60 text-slate-100 outline-0 transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:shadow-[0_0_0_2px_rgba(16,185,129,.45)] focus:bg-slate-950/75"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      id="li-start"
                      onClick={handleLinkedInSearch}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(16,185,129,.30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_14px_36px_rgba(16,185,129,.36)]"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #059669, #10b981)',
                      }}
                    >
                      Lancer recherche
                    </button>
                    {liUrl && (
                      <button
                        type="button"
                        id="li-download"
                        onClick={() => triggerDownloadUrl(liUrl)}
                        className="px-6 py-3 rounded-xl text-white border-0 font-extrabold shadow-[0_12px_30px_rgba(6,182,212,.30)] transition-all hover:shadow-[0_14px_36px_rgba(6,182,212,.36)]"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                        }}
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                  <div
                    className={`mt-3 text-sm ${
                      liStatus.type === 'ok'
                        ? 'text-emerald-400'
                        : liStatus.type === 'warn'
                        ? 'text-amber-500'
                        : liStatus.type === 'err'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {liStatus.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type LeadRow = {
  id: string;
  client_id: string;
  name: string | null;
  email_1: string | null;
  created_at: string | null;
};

type VirtualLeadList = {
  key: string;
  name: string;
  created_at: string | null;
  emails: string[];
  count: number;
};

type Props = {
  clientId: string;
  onEmailsChange?: (emails: string[]) => void;
};

const TABLE_LEADS = 'leads';

function uniqLower(emails: string[]) {
  return Array.from(
    new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

/**
 * On crée une clé de "liste" à la volée.
 * Ici on groupe par:
 * - name
 * - created_at arrondi à la minute
 *
 * Pourquoi arrondi à la minute ?
 * Parce que si plusieurs leads d’un même import ont quelques millisecondes
 * d’écart, on évite de casser une même liste en 50 sous-listes.
 */
function makeBatchKey(name: string | null, createdAt: string | null) {
  const safeName = (name || 'Sans nom').trim() || 'Sans nom';

  if (!createdAt) {
    return `${safeName}__no_date`;
  }

  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) {
    return `${safeName}__invalid_date`;
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');

  return `${safeName}__${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function formatDate(createdAt: string | null) {
  if (!createdAt) return 'Date inconnue';

  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return 'Date invalide';

  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadListSelectorPanel({ clientId, onEmailsChange }: Props) {
  const [allLeads, setAllLeads] = useState<LeadRow[]>([]);
  const [selectedListKey, setSelectedListKey] = useState('');
  const [loadingLists, setLoadingLists] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientId) {
      setAllLeads([]);
      setSelectedListKey('');
      onEmailsChange?.([]);
      return;
    }

    let mounted = true;

    (async () => {
      setError('');
      setLoadingLists(true);
      setAllLeads([]);
      setSelectedListKey('');
      onEmailsChange?.([]);

      const { data, error } = await supabase
        .from(TABLE_LEADS)
        .select('id,client_id,name,email_1,created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error('[LeadListSelectorPanel] Erreur chargement leads:', error);
        setError(error.message || 'Erreur chargement des leads');
        setLoadingLists(false);
        return;
      }

      setAllLeads((data || []) as LeadRow[]);
      setLoadingLists(false);
    })();

    return () => {
      mounted = false;
    };
  }, [clientId, onEmailsChange]);

  const lists = useMemo<VirtualLeadList[]>(() => {
    const map = new Map<string, VirtualLeadList>();

    for (const row of allLeads) {
      const key = makeBatchKey(row.name, row.created_at);
      const safeName = (row.name || 'Sans nom').trim() || 'Sans nom';
      const email = (row.email_1 || '').trim().toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: safeName,
          created_at: row.created_at,
          emails: [],
          count: 0,
        });
      }

      const group = map.get(key)!;

      if (email) {
        group.emails.push(email);
      }

      group.count += 1;

      // on garde la date la plus récente du groupe pour l'affichage
      if (row.created_at && (!group.created_at || row.created_at > group.created_at)) {
        group.created_at = row.created_at;
      }
    }

    const result = Array.from(map.values()).map((group) => ({
      ...group,
      emails: uniqLower(group.emails),
    }));

    result.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

    return result;
  }, [allLeads]);

  const selectedList = useMemo(
    () => lists.find((l) => l.key === selectedListKey) || null,
    [lists, selectedListKey]
  );

  useEffect(() => {
    onEmailsChange?.(selectedList?.emails || []);
  }, [selectedList, onEmailsChange]);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Ajouter des leads depuis une liste
            </div>
            <div className="text-xs text-gray-500">
              Les listes sont reconstruites automatiquement depuis la table{' '}
              <code>leads</code>, groupées par <code>name</code> et{' '}
              <code>created_at</code>.
            </div>
          </div>
        </div>

        <div className="mt-3">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            value={selectedListKey}
            onChange={(e) => setSelectedListKey(e.target.value)}
            disabled={loadingLists || !clientId}
          >
            <option value="">
              {loadingLists ? 'Chargement des listes...' : '— Sélectionner une liste —'}
            </option>

            {lists.map((list) => (
              <option key={list.key} value={list.key}>
                {list.name} — {formatDate(list.created_at)} ({list.emails.length} emails)
              </option>
            ))}
          </select>

          {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

          {!clientId ? (
            <div className="mt-2 text-sm text-red-600">
              clientId introuvable.
            </div>
          ) : null}

          {!loadingLists && clientId && lists.length === 0 ? (
            <div className="mt-2 text-sm text-gray-500">
              Aucune liste trouvée pour ce client.
            </div>
          ) : null}
        </div>
      </div>

      {selectedList ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {selectedList.name}
              </div>
              <div className="text-xs text-gray-500">
                Créée le {formatDate(selectedList.created_at)}
              </div>
              <div className="text-xs text-gray-500">
                Emails trouvés : <span className="font-medium">{selectedList.emails.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-gray-100">
            {selectedList.emails.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                Aucun email dans cette liste.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {selectedList.emails.map((email) => (
                  <li key={email} className="p-3 font-mono text-sm text-gray-900">
                    {email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
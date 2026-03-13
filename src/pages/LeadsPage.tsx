import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leadsApi } from '@/lib/apiClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { BlurFade } from '@/components/magicui/blur-fade';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface Lead {
  name: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  score?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export default function LeadsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Search form state
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState<string>('25');
  const [loading, setLoading] = useState(false);

  // Results state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Table controls
  const [tableFilter, setTableFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // ---------- Derived ----------

  const filteredLeads = useMemo(() => {
    if (!tableFilter.trim()) return leads;
    const q = tableFilter.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q),
    );
  }, [leads, tableFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  const selectedLeads = useMemo(
    () => leads.filter((_, i) => selectedIds.has(i)),
    [leads, selectedIds],
  );

  const allVisibleSelected =
    paginatedLeads.length > 0 &&
    paginatedLeads.every((_, i) => {
      const globalIndex = (currentPage - 1) * pageSize + i;
      return selectedIds.has(globalIndex);
    });

  // ---------- Handlers ----------

  async function handleSearch() {
    if (!category.trim() || !location.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir la catégorie et la localisation.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setLeads([]);
    setSelectedIds(new Set());
    setCurrentPage(1);

    try {
      const res = await leadsApi.search({
        category: category.trim(),
        location: location.trim(),
        limit: Number(limit),
      });

      const data = (res.leads ?? []) as Lead[];
      setLeads(data);

      toast({
        title: 'Recherche terminée',
        description: `${data.length} lead(s) trouvé(s).`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast({
        title: 'Erreur lors de la recherche',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(globalIndex: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(globalIndex)) {
        next.delete(globalIndex);
      } else {
        next.add(globalIndex);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const startIndex = (currentPage - 1) * pageSize;

      if (allVisibleSelected) {
        paginatedLeads.forEach((_, i) => next.delete(startIndex + i));
      } else {
        paginatedLeads.forEach((_, i) => next.add(startIndex + i));
      }
      return next;
    });
  }

  function handleExportCsv() {
    if (selectedLeads.length === 0) {
      toast({
        title: 'Aucun lead sélectionné',
        description: 'Sélectionnez au moins un lead pour exporter.',
        variant: 'destructive',
      });
      return;
    }

    const header = 'Nom,Catégorie,Adresse,Téléphone,Email,Score';
    const rows = selectedLeads.map(
      (l) =>
        `"${l.name}","${l.category}","${l.address}","${l.phone}","${l.email}","${l.score ?? ''}"`,
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Export réussi', description: `${selectedLeads.length} lead(s) exporté(s).` });
  }

  function handleLaunchCampaign() {
    if (selectedLeads.length === 0) {
      toast({
        title: 'Aucun lead sélectionné',
        description: 'Sélectionnez au moins un lead pour lancer une campagne.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Campagne en préparation',
      description: `${selectedLeads.length} lead(s) ajouté(s) à la campagne.`,
    });
  }

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      {/* ---------- Search Panel ---------- */}
      <BlurFade delay={0.1}>
        <Card className="bg-card-bg border-border">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5" />
              Recherche de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-text-secondary">
                  Catégorie / Secteur
                </Label>
                <Input
                  id="category"
                  placeholder="ex. Restaurant, Plombier"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-background border-border text-text-primary placeholder:text-text-muted"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-text-secondary">
                  Localisation
                </Label>
                <Input
                  id="location"
                  placeholder="ex. Paris 75001"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-background border-border text-text-primary placeholder:text-text-muted"
                />
              </div>

              {/* Limit */}
              <div className="space-y-2">
                <Label className="text-text-secondary">Nombre de leads</Label>
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger className="bg-background border-border text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <div className="flex items-end">
                <ShimmerButton
                  className="w-full"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Recherche en cours...' : 'Générer les leads'}
                </ShimmerButton>
              </div>
            </div>

            {/* Loading skeleton rows */}
            {loading && (
              <div className="mt-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </BlurFade>

      {/* ---------- Results Table ---------- */}
      {leads.length > 0 && (
        <BlurFade delay={0.2}>
          <Card className="bg-card-bg border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-text-primary">
                Résultats ({filteredLeads.length} lead{filteredLeads.length > 1 ? 's' : ''})
              </CardTitle>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Table search filter */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-text-muted" />
                  <Input
                    placeholder="Filtrer les résultats..."
                    value={tableFilter}
                    onChange={(e) => {
                      setTableFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 bg-background border-border text-text-primary placeholder:text-text-muted w-full sm:w-64"
                  />
                </div>

                {/* Selected leads sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="border-border text-text-primary">
                      Sélection ({selectedIds.size})
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-card-bg border-border w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle className="text-text-primary">
                        Leads sélectionnés ({selectedLeads.length})
                      </SheetTitle>
                    </SheetHeader>

                    <div className="mt-4 flex flex-col h-[calc(100vh-10rem)]">
                      <ScrollArea className="flex-1 pr-3">
                        {selectedLeads.length === 0 ? (
                          <p className="text-text-muted text-sm py-8 text-center">
                            Aucun lead sélectionné.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {selectedLeads.map((lead, i) => (
                              <div key={i}>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                                  <p className="text-xs text-text-secondary">{lead.email}</p>
                                  <p className="text-xs text-text-muted">{lead.phone}</p>
                                </div>
                                {i < selectedLeads.length - 1 && <Separator className="mt-3" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="pt-4 space-y-2 border-t border-border mt-4">
                        <Button
                          variant="outline"
                          className="w-full border-border text-text-primary gap-2"
                          onClick={handleExportCsv}
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Exporter CSV
                        </Button>
                        <Button
                          className="w-full gap-2"
                          onClick={handleLaunchCampaign}
                        >
                          <RocketLaunchIcon className="w-4 h-4" />
                          Lancer Campagne
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>

            <CardContent>
              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allVisibleSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Tout sélectionner"
                        />
                      </TableHead>
                      <TableHead className="text-text-secondary">Nom entreprise</TableHead>
                      <TableHead className="text-text-secondary">Catégorie</TableHead>
                      <TableHead className="text-text-secondary hidden md:table-cell">Adresse</TableHead>
                      <TableHead className="text-text-secondary hidden lg:table-cell">Téléphone</TableHead>
                      <TableHead className="text-text-secondary hidden lg:table-cell">Email</TableHead>
                      <TableHead className="text-text-secondary text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeads.map((lead, i) => {
                      const globalIndex = (currentPage - 1) * pageSize + i;
                      const isSelected = selectedIds.has(globalIndex);

                      return (
                        <TableRow
                          key={globalIndex}
                          className={`border-border ${
                            isSelected ? 'bg-primary/5' : 'hover:bg-card-bg/60'
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(globalIndex)}
                              aria-label={`Sélectionner ${lead.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-text-primary">{lead.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{lead.category}</Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary hidden md:table-cell">
                            {lead.address}
                          </TableCell>
                          <TableCell className="text-text-secondary hidden lg:table-cell">
                            {lead.phone}
                          </TableCell>
                          <TableCell className="text-text-secondary hidden lg:table-cell">
                            {lead.email}
                          </TableCell>
                          <TableCell className="text-right">
                            {lead.score != null ? (
                              <Badge
                                variant="outline"
                                className={
                                  lead.score >= 80
                                    ? 'border-success text-success'
                                    : lead.score >= 50
                                      ? 'border-yellow-500 text-yellow-500'
                                      : 'border-text-muted text-text-muted'
                                }
                              >
                                {lead.score}
                              </Badge>
                            ) : (
                              <span className="text-text-muted">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {paginatedLeads.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-text-muted py-8">
                          Aucun résultat trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Label className="text-text-secondary text-sm">Lignes par page :</Label>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 bg-background border-border text-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-text-primary"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-text-secondary">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-text-primary"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      )}
    </div>
  );
}

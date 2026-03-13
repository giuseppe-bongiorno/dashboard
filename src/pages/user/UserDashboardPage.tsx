import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Grid,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Description,
  Message,
  People,
  Favorite,
  Refresh,
  Warning,
  CheckCircle,
  Info,
  TipsAndUpdates,
  EventBusy,
  TrendingUp,
  TrendingDown,
  MonitorHeart,
  Bloodtype,
  CalendarToday,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAppSelector, useDocumentTitle, useNotification } from '@/hooks';
import userDashboardService, {
  PressioneReading,
  GlicemiaReading,
  AISuggestion,
  EsenzioneItem,
  CertificatoItem,
  Parente,
  UserDashboardDocuments,
} from '@/services/user-dashboard.service';

// ── KPI Card Component ───────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

// ── Pressure Classification Color ────────────────────────────────

const getPressioneColor = (sistolica: number, diastolica: number): string => {
  if (sistolica >= 180 || diastolica >= 120) return '#d32f2f'; // Crisi
  if (sistolica >= 140 || diastolica >= 90) return '#f44336'; // Ipertensione II
  if (sistolica >= 130 || diastolica >= 80) return '#ff9800'; // Ipertensione I
  if (sistolica >= 120) return '#ffeb3b'; // Elevata
  if (sistolica < 90 || diastolica < 60) return '#2196f3'; // Ipotensione
  return '#4caf50'; // Normale
};

const getGlicemiaColor = (valore: number): string => {
  if (valore > 250 || valore < 54) return '#d32f2f'; // Critico
  if (valore > 126 || valore < 70) return '#ff9800'; // Attenzione
  return '#4caf50'; // Normale
};

// ── Deadline Item ────────────────────────────────────────────────

interface DeadlineItem {
  id: string;
  tipo: 'esenzione' | 'certificato';
  descrizione: string;
  dataScadenza: string;
  giorniRimasti: number;
}

const getDeadlineSeverity = (giorni: number): 'error' | 'warning' | 'info' | 'success' => {
  if (giorni < 0) return 'error';
  if (giorni <= 15) return 'warning';
  if (giorni <= 30) return 'info';
  return 'success';
};

// ── Main Component ───────────────────────────────────────────────

const UserDashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard - MyFamilyDoc');

  const { user } = useAppSelector((state) => state.auth);
  const { showError } = useNotification();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documenti, setDocumenti] = useState<UserDashboardDocuments | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [parenti, setParenti] = useState<Parente[]>([]);
  const [pressione, setPressione] = useState<PressioneReading[]>([]);
  const [glicemia, setGlicemia] = useState<GlicemiaReading[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);

  const userId = user?.id ? parseInt(user.id) : 0;

  // ── Data Loading ───────────────────────────────────────────────

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Parallel calls to all existing endpoints
      const [docRes, msgRes, parRes, presRes, glicRes, sugRes, esenRes, certRes] = await Promise.allSettled([
        userDashboardService.getDocumenti(),
        userDashboardService.getUnreadMessages(userId),
        userDashboardService.getParenti(userId),
        userDashboardService.getUltimePressione(7),
        userDashboardService.getUltimeGlicemia(7),
        userDashboardService.getSuggestions(),
        userDashboardService.getEsenzioni(userId),
        userDashboardService.getCertificati(userId),
      ]);

      // Documenti
      if (docRes.status === 'fulfilled' && docRes.value.success && docRes.value.data) {
        setDocumenti(docRes.value.data);
      }

      // Messaggi non letti
      if (msgRes.status === 'fulfilled' && msgRes.value.success && msgRes.value.data !== undefined) {
        setUnreadMessages(Number(msgRes.value.data) || 0);
      }

      // Parenti
      if (parRes.status === 'fulfilled' && parRes.value.success && parRes.value.data) {
        setParenti(Array.isArray(parRes.value.data) ? parRes.value.data : []);
      }

      // Pressione
      if (presRes.status === 'fulfilled' && presRes.value.success && presRes.value.data) {
        setPressione(Array.isArray(presRes.value.data) ? presRes.value.data : []);
      }

      // Glicemia
      if (glicRes.status === 'fulfilled' && glicRes.value.success && glicRes.value.data) {
        setGlicemia(Array.isArray(glicRes.value.data) ? glicRes.value.data : []);
      }

      // Suggerimenti AI
      if (sugRes.status === 'fulfilled' && sugRes.value.success && sugRes.value.data) {
        const sugData = sugRes.value.data as any;
        setSuggestions(sugData.suggestions || sugData || []);
      }

      // Scadenze (esenzioni + certificati)
      const deadlineItems: DeadlineItem[] = [];
      const now = new Date();

      if (esenRes.status === 'fulfilled' && esenRes.value.success && esenRes.value.data) {
        const esenzioni = Array.isArray(esenRes.value.data) ? esenRes.value.data : [];
        esenzioni.forEach((e: EsenzioneItem) => {
          if (e.dataScadenza) {
            const scadenza = new Date(e.dataScadenza);
            const giorni = Math.ceil((scadenza.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (giorni <= 60) {
              deadlineItems.push({
                id: `esen-${e.id}`,
                tipo: 'esenzione',
                descrizione: e.descrizione || e.codiceEsenzione || 'Esenzione',
                dataScadenza: e.dataScadenza,
                giorniRimasti: giorni,
              });
            }
          }
        });
      }

      if (certRes.status === 'fulfilled' && certRes.value.success && certRes.value.data) {
        const certificati = Array.isArray(certRes.value.data) ? certRes.value.data : [];
        certificati.forEach((c: CertificatoItem) => {
          if (c.dataScadenza) {
            const scadenza = new Date(c.dataScadenza);
            const giorni = Math.ceil((scadenza.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (giorni <= 60) {
              deadlineItems.push({
                id: `cert-${c.id}`,
                tipo: 'certificato',
                descrizione: c.descrizione || c.tipoCertificato || 'Certificato',
                dataScadenza: c.dataScadenza,
                giorniRimasti: giorni,
              });
            }
          }
        });
      }

      deadlineItems.sort((a, b) => a.giorniRimasti - b.giorniRimasti);
      setDeadlines(deadlineItems);
    } catch (error) {
      showError('Errore nel caricamento dei dati della dashboard');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const handleRefresh = () => fetchData(true);

  // ── Chart Data Formatting ──────────────────────────────────────

  const pressioneChartData = [...pressione].reverse().map((p, i) => ({
    name: p.dataOra
      ? new Date(p.dataOra).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
      : `#${i + 1}`,
    sistolica: p.sistolica,
    diastolica: p.diastolica,
    fc: p.frequenzaCardiaca || 0,
  }));

  const glicemiaChartData = [...glicemia].reverse().map((g, i) => ({
    name: g.dataOra
      ? new Date(g.dataOra).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
      : `#${i + 1}`,
    valore: g.valore,
  }));

  // ── Loading State ──────────────────────────────────────────────

  if (loading && !documenti) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Bentornato, {user?.firstName || user?.email || 'Utente'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ecco un riepilogo della tua salute
          </Typography>
        </Box>
        <Tooltip title="Aggiorna dati">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Documenti Totali"
            value={documenti?.totaleDocumenti?.toLocaleString() || '0'}
            icon={<Description />}
            color="primary.main"
            subtitle="Referti, ricette, certificati..."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Messaggi Non Letti"
            value={unreadMessages}
            icon={<Message />}
            color={unreadMessages > 0 ? 'error.main' : 'success.main'}
            subtitle={unreadMessages > 0 ? 'Hai messaggi da leggere' : 'Nessun nuovo messaggio'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Familiari"
            value={parenti.length}
            icon={<People />}
            color="info.main"
            subtitle="Persone nel tuo nucleo"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Scadenze"
            value={deadlines.filter((d) => d.giorniRimasti <= 30).length}
            icon={<EventBusy />}
            color={deadlines.some((d) => d.giorniRimasti < 0) ? 'error.main' : 'warning.main'}
            subtitle="Nei prossimi 30 giorni"
          />
        </Grid>
      </Grid>

      {/* Health Measurements Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pressione Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <MonitorHeart color="error" />
                <Typography variant="h6" fontWeight={600}>
                  Pressione Arteriosa
                </Typography>
              </Stack>
              {pressione.length > 0 && (
                <Chip
                  label={`${pressione[0].sistolica}/${pressione[0].diastolica}`}
                  size="small"
                  sx={{
                    bgcolor: getPressioneColor(pressione[0].sistolica, pressione[0].diastolica),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            {pressione.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography color="text.secondary">Nessuna misurazione registrata</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={pressioneChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[40, 200]} fontSize={12} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="sistolica" stroke="#f44336" strokeWidth={2} name="Sistolica" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="diastolica" stroke="#2196f3" strokeWidth={2} name="Diastolica" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="fc" stroke="#9c27b0" strokeWidth={1} strokeDasharray="4 4" name="FC" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Glicemia Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Bloodtype color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Glicemia
                </Typography>
              </Stack>
              {glicemia.length > 0 && (
                <Chip
                  label={`${glicemia[0].valore} mg/dL`}
                  size="small"
                  sx={{
                    bgcolor: getGlicemiaColor(glicemia[0].valore),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            {glicemia.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography color="text.secondary">Nessuna misurazione registrata</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={glicemiaChartData}>
                  <defs>
                    <linearGradient id="colorGlicemia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[40, 300]} fontSize={12} />
                  <ChartTooltip />
                  <Area
                    type="monotone"
                    dataKey="valore"
                    stroke="#ff9800"
                    fillOpacity={1}
                    fill="url(#colorGlicemia)"
                    strokeWidth={2}
                    name="Glicemia (mg/dL)"
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Suggestions & Deadlines Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* AI Suggestions */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <TipsAndUpdates color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Suggerimenti per Te
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {suggestions.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70%' }}>
                <Typography color="text.secondary">Nessun suggerimento disponibile</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {suggestions.map((s, index) => (
                  <Alert
                    key={index}
                    severity={
                      s.priority === 'high' ? 'warning' : s.priority === 'medium' ? 'info' : 'success'
                    }
                    icon={s.priority === 'high' ? <Warning /> : <Info />}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2">{s.description}</Typography>
                    {s.category && (
                      <Chip label={s.category} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                    )}
                  </Alert>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Deadlines */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Scadenze Imminenti
                </Typography>
              </Stack>
              {deadlines.length > 0 && (
                <Chip
                  label={deadlines.length}
                  color={deadlines.some((d) => d.giorniRimasti < 0) ? 'error' : 'warning'}
                  size="small"
                />
              )}
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {deadlines.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%' }}>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography color="text.secondary">Nessuna scadenza nei prossimi 60 giorni</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {deadlines.map((d) => (
                  <Alert key={d.id} severity={getDeadlineSeverity(d.giorniRimasti)} sx={{ py: 0.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {d.descrizione}
                        </Typography>
                        <Typography variant="caption">
                          {d.tipo === 'esenzione' ? 'Esenzione' : 'Certificato'} — Scadenza:{' '}
                          {new Date(d.dataScadenza).toLocaleDateString('it-IT')}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          d.giorniRimasti < 0
                            ? `Scaduta da ${Math.abs(d.giorniRimasti)}g`
                            : d.giorniRimasti === 0
                            ? 'Scade oggi!'
                            : `${d.giorniRimasti}g`
                        }
                        size="small"
                        color={getDeadlineSeverity(d.giorniRimasti)}
                      />
                    </Stack>
                  </Alert>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Document Summary */}
      {documenti && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Riepilogo Documenti
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {[
              { label: 'Referti', value: documenti.referti, color: 'primary' },
              { label: 'Ricette', value: documenti.ricette, color: 'secondary' },
              { label: 'Visite', value: documenti.visiteMediche, color: 'success' },
              { label: 'Certificati', value: documenti.certificati, color: 'info' },
              { label: 'Esenzioni', value: documenti.esenzioni, color: 'warning' },
              { label: 'Vaccini', value: documenti.vaccini, color: 'error' },
              { label: 'Scontrini', value: documenti.scontrini, color: 'secondary' },
              { label: 'Invalidità', value: documenti.invalidita, color: 'info' },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 6, sm: 3, md: 1.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={600} color={`${item.color}.main`}>
                    {item.value ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default UserDashboardPage;
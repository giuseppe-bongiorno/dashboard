import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Badge,
  Avatar,
  CircularProgress,
  Autocomplete,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Send,
  Delete,
  Refresh,
  Close,
  PriorityHigh,
  Inbox,
  Outbox,
  ArrowBack,
  DoneAll,
  Done,
  Search,
} from '@mui/icons-material';
import { useAppSelector, useNotification } from '@/hooks';
import messaggiService, {
  Messaggio,
  CreaMessaggioRequest,
  UserListDTO,
} from '@/services/messaggi.service';
import { format, isToday, isYesterday, isValid, isThisWeek } from 'date-fns';
import { it } from 'date-fns/locale';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** A thread = parent message + its replies, for the sidebar list */
interface ThreadSummary {
  parentMessage: Messaggio;
  lastMessage: Messaggio;
  replyCount: number;
  hasUnread: boolean;
  unreadInThread: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format a date as readable time, like WhatsApp */
const formatMessageTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (!isValid(date)) return '';
  return format(date, 'HH:mm', { locale: it });
};

/** Format a date for the thread list sidebar */
const formatThreadDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (!isValid(date)) return '';

  if (isToday(date)) return format(date, 'HH:mm', { locale: it });
  if (isYesterday(date)) return 'Ieri';
  if (isThisWeek(date)) return format(date, 'EEEE', { locale: it });
  return format(date, 'dd/MM/yyyy', { locale: it });
};

/** Format a date for the day separator inside the chat */
const formatDaySeparator = (dateString: string): string => {
  const date = new Date(dateString);
  if (!isValid(date)) return '';

  if (isToday(date)) return 'Oggi';
  if (isYesterday(date)) return 'Ieri';
  return format(date, 'dd MMMM yyyy', { locale: it });
};

/** Check if two dates are on different calendar days */
const isDifferentDay = (a: string, b: string): boolean => {
  const dA = new Date(a);
  const dB = new Date(b);
  return (
    dA.getFullYear() !== dB.getFullYear() ||
    dA.getMonth() !== dB.getMonth() ||
    dA.getDate() !== dB.getDate()
  );
};

/**
 * Normalize thread data from the API.
 * The backend returns List<MessaggioResponse> (Messaggio[]).
 * The service tries to reconstruct it as a single Messaggio with risposte[],
 * but depending on how apiRequest<T> infers the generic, the component
 * may receive either Messaggio[] or Messaggio. This helper handles both.
 */
const normalizeThreadData = (data: Messaggio | Messaggio[]): Messaggio => {
  if (Array.isArray(data)) {
    if (data.length === 0) throw new Error('Thread vuoto');
    const sorted = [...data].sort(
      (a, b) => new Date(a.dataInvio).getTime() - new Date(b.dataInvio).getTime()
    );
    const parent = sorted[0];
    const replies = sorted.slice(1);
    return { ...parent, risposte: replies };
  }
  // Already a single Messaggio (service reconstructed it)
  return data;
};

/** Extract error message from ApiResponse */
const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return error.message;
  return defaultMessage;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Day Separator ────────────────────────────────────────────────────────────

const DaySeparator: React.FC<{ dateString: string }> = ({ dateString }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
    <Chip
      label={formatDaySeparator(dateString)}
      size="small"
      sx={{
        bgcolor: 'action.hover',
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: 0.3,
        height: 24,
        px: 1,
      }}
    />
  </Box>
);

// ── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Messaggio;
  isOwn: boolean;
  showSender: boolean;
  isLastInGroup: boolean;
  senderName: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showSender,
  isLastInGroup,
  senderName,
}) => {
  const theme = useTheme();

  // WhatsApp-like palette
  const ownBubbleBg =
    theme.palette.mode === 'dark' ? '#1a3a4a' : '#dbeafe';
  const otherBubbleBg =
    theme.palette.mode === 'dark' ? '#1f2c33' : '#f0f2f5';
  const ownTextColor =
    theme.palette.mode === 'dark' ? '#e9edef' : '#111b21';
  const otherTextColor =
    theme.palette.mode === 'dark' ? '#e9edef' : '#111b21';

  // Tail styling
  const tailSize = 8;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        px: 2,
        mb: isLastInGroup ? 1 : 0.25,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxWidth: { xs: '85%', sm: '75%', md: '65%' },
          minWidth: 80,
          bgcolor: isOwn ? ownBubbleBg : otherBubbleBg,
          color: isOwn ? ownTextColor : otherTextColor,
          borderRadius: 2,
          // Tail shape on the first message of a group
          ...(showSender && {
            borderTopLeftRadius: isOwn ? 8 : 0,
            borderTopRightRadius: isOwn ? 0 : 8,
          }),
          px: 1.5,
          py: 0.75,
          boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
          // Small triangle tail
          ...(showSender && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              [isOwn ? 'right' : 'left']: -tailSize,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: isOwn
                ? `0 0 ${tailSize}px ${tailSize}px`
                : `0 ${tailSize}px ${tailSize}px 0`,
              borderColor: isOwn
                ? `transparent transparent transparent ${ownBubbleBg}`
                : `transparent ${otherBubbleBg} transparent transparent`,
            },
          }),
        }}
      >
        {/* Sender name */}
        {showSender && !isOwn && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              display: 'block',
              mb: 0.25,
              fontSize: '0.75rem',
            }}
          >
            {senderName}
          </Typography>
        )}

        {/* Priority indicator */}
        {message.priorita && showSender && (
          <Chip
            icon={<PriorityHigh sx={{ fontSize: 14 }} />}
            label="Priorità"
            size="small"
            color="error"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem', mb: 0.5 }}
          />
        )}

        {/* Content */}
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.45,
            fontSize: '0.875rem',
          }}
        >
          {message.contenuto}
          {/* Inline timestamp + read status */}
          <Box
            component="span"
            sx={{
              float: 'right',
              ml: 1.5,
              mt: 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.3,
            }}
          >
            <Typography
              component="span"
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                opacity: 0.65,
                whiteSpace: 'nowrap',
              }}
            >
              {formatMessageTime(message.dataInvio)}
            </Typography>
            {isOwn && (
              message.letto ? (
                <DoneAll sx={{ fontSize: 14, color: '#53bdeb' }} />
              ) : (
                <Done sx={{ fontSize: 14, opacity: 0.5 }} />
              )
            )}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

// ── Thread List Item ─────────────────────────────────────────────────────────

interface ThreadListItemProps {
  thread: ThreadSummary;
  selected: boolean;
  currentUserId: number;
  userNameMap: Map<number, string>;
  onClick: () => void;
}

const ThreadListItem: React.FC<ThreadListItemProps> = ({
  thread,
  selected,
  currentUserId,
  userNameMap,
  onClick,
}) => {
  const theme = useTheme();
  const { parentMessage, lastMessage, hasUnread } = thread;

  // Determine the other party's name via the userNameMap lookup
  const otherPartyId =
    parentMessage.mittenteId === currentUserId
      ? parentMessage.destinatarioId
      : parentMessage.mittenteId;
  const otherPartyName =
    userNameMap.get(otherPartyId) || parentMessage.mittenteNome;

  // Preview: show last message content, truncated
  const preview =
    lastMessage.contenuto.length > 60
      ? lastMessage.contenuto.substring(0, 60) + '…'
      : lastMessage.contenuto;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
        '&:hover': {
          bgcolor: selected
            ? alpha(theme.palette.primary.main, 0.12)
            : 'action.hover',
        },
        borderLeft: selected
          ? `3px solid ${theme.palette.primary.main}`
          : '3px solid transparent',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 48,
          height: 48,
          bgcolor: hasUnread ? 'primary.main' : 'grey.400',
          fontSize: '1.1rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {otherPartyName?.[0]?.toUpperCase() || '?'}
      </Avatar>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: hasUnread ? 700 : 500,
              flex: 1,
              mr: 1,
            }}
          >
            {otherPartyName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              flexShrink: 0,
              color: hasUnread ? 'primary.main' : 'text.secondary',
              fontWeight: hasUnread ? 700 : 400,
              fontSize: '0.7rem',
            }}
          >
            {formatThreadDate(lastMessage.dataInvio)}
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ fontSize: '0.75rem', mt: -0.25 }}
        >
          {parentMessage.oggetto}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.25 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{
              flex: 1,
              mr: 1,
              fontSize: '0.8rem',
              fontWeight: hasUnread ? 600 : 400,
            }}
          >
            {lastMessage.mittenteId === currentUserId && (
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Tu:{' '}
              </Box>
            )}
            {preview}
          </Typography>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {parentMessage.priorita && (
              <PriorityHigh color="error" sx={{ fontSize: 16 }} />
            )}
            {hasUnread && (
              <Box
                sx={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  px: 0.5,
                }}
              >
                {thread.unreadInThread}
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

// ── Chat View (Thread detail with bubbles) ───────────────────────────────────

interface ChatViewProps {
  thread: Messaggio; // parent message with risposte[]
  currentUserId: number;
  userNameMap: Map<number, string>;
  onReply: (content: string) => Promise<void>;
  onDelete: (messageId: number) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  sending: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({
  thread,
  currentUserId,
  userNameMap,
  onReply,
  onDelete,
  onBack,
  showBackButton = false,
  sending,
}) => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyText, setReplyText] = useState('');

  /** Resolve user ID to display name, fallback to mittenteNome */
  const resolveName = useCallback(
    (userId: number, fallback: string): string =>
      userNameMap.get(userId) || fallback,
    [userNameMap]
  );

  // Determine the "other party" in the conversation
  const otherPartyId =
    thread.mittenteId === currentUserId
      ? thread.destinatarioId
      : thread.mittenteId;
  const otherPartyName = resolveName(otherPartyId, thread.mittenteNome);

  // Flatten thread: parent + replies, sorted chronologically
  const allMessages = useMemo(() => {
    const msgs: Messaggio[] = [thread];
    if (thread.risposte && thread.risposte.length > 0) {
      msgs.push(...thread.risposte);
    }
    return msgs.sort(
      (a, b) => new Date(a.dataInvio).getTime() - new Date(b.dataInvio).getTime()
    );
  }, [thread]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSend = async () => {
    const text = replyText.trim();
    if (!text) return;
    setReplyText('');
    await onReply(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clean white chat background
  const chatBgColor =
    theme.palette.mode === 'dark' ? '#0b141a' : '#ffffff';

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* ── Chat Header ─────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? '#1f2c33' : '#f0f2f5',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 56,
        }}
      >
        {showBackButton && (
          <IconButton onClick={onBack} size="small" sx={{ mr: 0.5 }}>
            <ArrowBack />
          </IconButton>
        )}

        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontWeight: 700,
          }}
        >
          {otherPartyName?.[0]?.toUpperCase() || '?'}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {thread.oggetto}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {otherPartyName}
            {thread.risposte && thread.risposte.length > 0
              ? ` · ${thread.risposte.length + 1} messaggi`
              : ' · 1 messaggio'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Elimina conversazione">
            <IconButton
              onClick={() => onDelete(thread.id)}
              size="small"
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ── Messages Area ────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: chatBgColor,
          py: 1,
        }}
      >
        {allMessages.map((msg, index) => {
          const isOwn = msg.mittenteId === currentUserId;
          const prevMsg = index > 0 ? allMessages[index - 1] : null;
          const nextMsg =
            index < allMessages.length - 1 ? allMessages[index + 1] : null;

          // Show sender if first message or different sender from previous
          const showSender = !prevMsg || prevMsg.mittenteId !== msg.mittenteId;

          // Is last in a consecutive group from same sender
          const isLastInGroup = !nextMsg || nextMsg.mittenteId !== msg.mittenteId;

          // Show day separator if first message or different day
          const showDaySep =
            !prevMsg ||
            isDifferentDay(prevMsg.dataInvio, msg.dataInvio);

          return (
            <React.Fragment key={msg.id}>
              {showDaySep && <DaySeparator dateString={msg.dataInvio} />}
              <MessageBubble
                message={msg}
                isOwn={isOwn}
                showSender={showSender}
                isLastInGroup={isLastInGroup}
                senderName={resolveName(msg.mittenteId, msg.mittenteNome)}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* ── Inline Reply Input ───────────────────────────────────── */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? '#1f2c33' : '#f0f2f5',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Scrivi un messaggio..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          disabled={sending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'background.paper',
              fontSize: '0.9rem',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'divider' },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 1,
              },
            },
          }}
        />

        <IconButton
          onClick={handleSend}
          disabled={!replyText.trim() || sending}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 40,
            height: 40,
            flexShrink: 0,
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          {sending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Send sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const AdminMessagingPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess, showError } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ── State ──────────────────────────────────────────────────────────────────
  const [messaggiRicevuti, setMessaggiRicevuti] = useState<Messaggio[]>([]);
  const [messaggiInviati, setMessaggiInviati] = useState<Messaggio[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Messaggio | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [utenti, setUtenti] = useState<UserListDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose form
  const [destinatario, setDestinatario] = useState<UserListDTO | null>(null);
  const [oggetto, setOggetto] = useState('');
  const [contenuto, setContenuto] = useState('');
  const [priorita, setPriorita] = useState(false);

  const currentUserId = user?.id ? parseInt(user.id) : 0;

  /** Lookup map: userId → displayName (from loaded utenti list) */
  const userNameMap = useMemo(() => {
    const map = new Map<number, string>();
    utenti.forEach((u) => map.set(u.id, u.displayName || u.username));
    return map;
  }, [utenti]);

  // ── Data loading ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (user?.id) {
      loadData();
      loadUtenti();
    }
  }, [user?.id]);

  // Auto-refresh unread count
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMessaggiRicevuti(),
        loadMessaggiInviati(),
        loadUnreadCount(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessaggiRicevuti = async () => {
    if (!user?.id) return;
    try {
      const response = await messaggiService.getMessaggi(parseInt(user.id));
      if (response.success && response.data) {
        setMessaggiRicevuti(response.data);
      }
    } catch (error) {
      console.error('Errore caricamento messaggi ricevuti:', error);
    }
  };

  const loadMessaggiInviati = async () => {
    if (!user?.id) return;
    try {
      const response = await messaggiService.getMessaggiInviati(parseInt(user.id));
      if (response.success && response.data) {
        setMessaggiInviati(response.data);
      }
    } catch (error) {
      console.error('Errore caricamento messaggi inviati:', error);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const response = await messaggiService.getUnreadCount(parseInt(user.id));
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Errore conteggio non letti:', error);
    }
  };

  const loadUtenti = async () => {
    try {
      const response = await messaggiService.getUtenti();
      if (response.success && response.data) {
        setUtenti(response.data);
      }
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
      showError('Impossibile caricare la lista utenti');
    }
  };

  // ── Thread building ────────────────────────────────────────────────────────

  /**
   * Build thread summaries from a flat list of messages.
   * Only messages without messaggioPadreId are considered thread roots.
   * We match replies to parents by messaggioPadreId.
   */
  const buildThreadSummaries = useCallback(
    (messages: Messaggio[]): ThreadSummary[] => {
      // Separate parents and children
      const parentMessages = messages.filter((m) => !m.messaggioPadreId);
      const childMessages = messages.filter((m) => m.messaggioPadreId);

      // Group children by parent ID
      const childrenByParent = new Map<number, Messaggio[]>();
      childMessages.forEach((child) => {
        const parentId = child.messaggioPadreId!;
        if (!childrenByParent.has(parentId)) {
          childrenByParent.set(parentId, []);
        }
        childrenByParent.get(parentId)!.push(child);
      });

      const threads: ThreadSummary[] = parentMessages.map((parent) => {
        const replies = childrenByParent.get(parent.id) || [];
        const allInThread = [parent, ...replies].sort(
          (a, b) => new Date(a.dataInvio).getTime() - new Date(b.dataInvio).getTime()
        );
        const lastMessage = allInThread[allInThread.length - 1];

        // Count ALL unread messages in the thread where user is recipient
        const unreadInThread = allInThread.filter(
          (m) => !m.letto && m.destinatarioId === currentUserId
        ).length;

        return {
          parentMessage: parent,
          lastMessage,
          replyCount: replies.length,
          hasUnread: unreadInThread > 0,
          unreadInThread,
        };
      });

      // Sort by last message date descending (most recent first)
      threads.sort(
        (a, b) =>
          new Date(b.lastMessage.dataInvio).getTime() -
          new Date(a.lastMessage.dataInvio).getTime()
      );

      return threads;
    },
    [currentUserId]
  );

  /**
   * Merge ricevuti + inviati into a single deduplicated list.
   * A message may appear in both lists (e.g. admin sends, then receives a reply).
   */
  const allMessages = useMemo(() => {
    const map = new Map<number, Messaggio>();
    [...messaggiRicevuti, ...messaggiInviati].forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }, [messaggiRicevuti, messaggiInviati]);

  /** Thread summaries, filtered by search */
  const threads = useMemo(() => {
    const all = buildThreadSummaries(allMessages);
    if (!searchQuery.trim()) return all;

    const q = searchQuery.toLowerCase();
    return all.filter(
      (t) =>
        t.parentMessage.oggetto.toLowerCase().includes(q) ||
        t.parentMessage.mittenteNome.toLowerCase().includes(q) ||
        t.lastMessage.contenuto.toLowerCase().includes(q)
    );
  }, [allMessages, buildThreadSummaries, searchQuery]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleThreadClick = async (thread: ThreadSummary) => {
    try {
      const threadResponse = await messaggiService.getMessaggioThread(
        thread.parentMessage.id
      );

      if (threadResponse.success && threadResponse.data) {
        const normalized = normalizeThreadData(threadResponse.data as Messaggio | Messaggio[]);
        setSelectedThread(normalized);

        // Mark ALL unread messages in the thread where user is the recipient
        const allInThread = [normalized, ...(normalized.risposte || [])];
        const unreadMessages = allInThread.filter(
          (m) => !m.letto && m.destinatarioId === currentUserId
        );

        if (unreadMessages.length > 0) {
          // Mark each unread message as read in parallel
          await Promise.all(
            unreadMessages.map((m) => messaggiService.markMessaggioAsRead(m.id))
          );

          // Update local state for immediate UI feedback
          const unreadIds = new Set(unreadMessages.map((m) => m.id));
          setMessaggiRicevuti((prev) =>
            prev.map((m) => (unreadIds.has(m.id) ? { ...m, letto: true } : m))
          );

          // Reload actual count from backend (source of truth)
          await loadUnreadCount();
        }
      }
    } catch (error) {
      console.error('Errore caricamento thread:', error);
      showError('Errore durante il caricamento della conversazione');
    }
  };

  const handleReply = async (content: string) => {
    if (!user?.id || !selectedThread) return;

    setSending(true);
    try {
      const response = await messaggiService.sendRisposta({
        messaggioPadreId: selectedThread.id,
        mittenteId: parseInt(user.id),
        contenuto: content,
      });

      if (response.success) {
        // Reload thread
        const threadResponse = await messaggiService.getMessaggioThread(
          selectedThread.id
        );
        if (threadResponse.success && threadResponse.data) {
          setSelectedThread(normalizeThreadData(threadResponse.data as Messaggio | Messaggio[]));
        }
        await loadData();
      } else {
        showError(
          getErrorMessage(response.error, "Errore durante l'invio della risposta")
        );
      }
    } catch (err) {
      console.error('Errore invio risposta:', err);
      showError("Errore durante l'invio della risposta");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa conversazione?'))
      return;

    try {
      const response = await messaggiService.eliminaMessaggio(messageId);
      if (response.success) {
        showSuccess('Conversazione eliminata con successo');
        setSelectedThread(null);
        await loadData();
      } else {
        showError(
          getErrorMessage(response.error, "Errore durante l'eliminazione")
        );
      }
    } catch (error) {
      console.error('Errore eliminazione:', error);
      showError("Errore durante l'eliminazione della conversazione");
    }
  };

  // ── Compose ────────────────────────────────────────────────────────────────

  const handleComposeOpen = () => {
    setDestinatario(null);
    setOggetto('');
    setContenuto('');
    setPriorita(false);
    setComposeOpen(true);
  };

  const handleSendMessage = async () => {
    if (!user?.id || !destinatario || !oggetto || !contenuto) {
      showError('Compila tutti i campi obbligatori');
      return;
    }

    try {
      const data: CreaMessaggioRequest = {
        mittenteId: parseInt(user.id),
        destinatarioId: destinatario.id,
        mittenteNome: `${user.firstName} ${user.lastName}`.trim() || user.email,
        oggetto,
        contenuto,
        priorita,
      };

      const response = await messaggiService.sendMessaggio(data);

      if (response.success) {
        showSuccess('Messaggio inviato con successo');
        setComposeOpen(false);
        await loadData();
      } else {
        showError(
          getErrorMessage(response.error, "Errore durante l'invio del messaggio")
        );
      }
    } catch (err) {
      console.error('Errore invio messaggio:', err);
      showError("Errore durante l'invio del messaggio");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  /** Empty state for thread list */
  const renderEmptyList = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Inbox sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography variant="body2" color="text.secondary">
        Nessuna conversazione
      </Typography>
    </Box>
  );

  /** Thread sidebar list */
  const renderThreadList = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search */}
      <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Cerca conversazione..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'action.hover',
              '& fieldset': { border: 'none' },
              fontSize: '0.85rem',
            },
          }}
        />
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        ) : threads.length === 0 ? (
          renderEmptyList()
        ) : (
          threads.map((thread) => (
            <React.Fragment key={thread.parentMessage.id}>
              <ThreadListItem
                thread={thread}
                selected={selectedThread?.id === thread.parentMessage.id}
                currentUserId={currentUserId}
                userNameMap={userNameMap}
                onClick={() => handleThreadClick(thread)}
              />
              <Divider sx={{ ml: 9 }} />
            </React.Fragment>
          ))
        )}
      </Box>
    </Box>
  );

  /** Placeholder when no thread is selected */
  const renderNoSelection = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        bgcolor: theme.palette.mode === 'dark' ? '#0b141a' : '#f0f2f5',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Inbox sx={{ fontSize: 36, color: 'text.disabled' }} />
      </Box>
      <Typography variant="h6" color="text.secondary" fontWeight={500}>
        MyFamilyDoc Messaggi
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
        Seleziona una conversazione per visualizzarla
      </Typography>
    </Box>
  );

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            📨 Messaggi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestisci la comunicazione con gli utenti
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
            disabled={loading}
          >
            Aggiorna
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleComposeOpen}
          >
            Nuovo Messaggio
          </Button>
        </Stack>
      </Stack>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge badgeContent={unreadCount} color="error">
                <Inbox color="primary" sx={{ fontSize: 40 }} />
              </Badge>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {threads.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conversazioni
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Outbox color="action" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {messaggiInviati.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inviati
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* ── Main chat area ──────────────────────────────────────────── */}
      <Card sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {/* Split panel */}
        <Box
          sx={{
            display: 'flex',
            height: { xs: 500, sm: 550, md: 620 },
          }}
        >
          {/* ── Left panel: Thread list ─────────────────────────────── */}
          <Box
            sx={{
              width: { xs: '100%', md: 380 },
              flexShrink: 0,
              borderRight: { md: 1 },
              borderColor: 'divider',
              display: {
                xs: selectedThread && isMobile ? 'none' : 'flex',
                md: 'flex',
              },
              flexDirection: 'column',
            }}
          >
            {renderThreadList()}
          </Box>

          {/* ── Right panel: Chat ──────────────────────────────────── */}
          <Box
            sx={{
              flex: 1,
              display: {
                xs: !selectedThread && isMobile ? 'none' : 'flex',
                md: 'flex',
              },
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            {selectedThread ? (
              <ChatView
                thread={selectedThread}
                currentUserId={currentUserId}
                userNameMap={userNameMap}
                onReply={handleReply}
                onDelete={handleDelete}
                onBack={() => setSelectedThread(null)}
                showBackButton={isMobile}
                sending={sending}
              />
            ) : (
              renderNoSelection()
            )}
          </Box>
        </Box>
      </Card>

      {/* ── Compose Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Nuovo Messaggio</Typography>
            <IconButton onClick={() => setComposeOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              options={utenti}
              getOptionLabel={(option) => option.displayName}
              value={destinatario}
              onChange={(_, newValue) => setDestinatario(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body1">{option.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Destinatario" required />
              )}
            />

            <TextField
              label="Oggetto"
              value={oggetto}
              onChange={(e) => setOggetto(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Messaggio"
              value={contenuto}
              onChange={(e) => setContenuto(e.target.value)}
              required
              fullWidth
              multiline
              rows={6}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={priorita}
                  onChange={(e) => setPriorita(e.target.checked)}
                />
              }
              label="Priorità Alta"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            startIcon={<Send />}
            disabled={
              !destinatario || !oggetto.trim() || !contenuto.trim()
            }
          >
            Invia
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMessagingPage;
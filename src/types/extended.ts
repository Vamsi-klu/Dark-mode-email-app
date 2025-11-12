// Extended types for NovaMail v2.0 advanced features

export type Label = {
  id: string
  name: string
  color: string
  count?: number
}

export type Attachment = {
  id: string
  name: string
  size: number // bytes
  type: string // MIME type
  url?: string
  preview?: string // base64 or URL for images
  uploadProgress?: number // 0-100
}

export type Contact = {
  id: string
  name: string
  email: string
  avatarColor?: string
  avatarUrl?: string
  frequency?: number // how often you email them
  lastEmailed?: string // ISO date
  labels?: string[]
}

export type EmailSignature = {
  id: string
  name: string
  content: string
  isDefault: boolean
}

export type EmailTemplate = {
  id: string
  name: string
  subject: string
  body: string
  category?: string
  usageCount?: number
}

export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export type EmailRule = {
  id: string
  name: string
  enabled: boolean
  conditions: {
    field: 'from' | 'to' | 'subject' | 'body' | 'hasAttachment'
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matches'
    value: string | boolean
  }[]
  actions: {
    type: 'move' | 'label' | 'star' | 'markRead' | 'delete' | 'forward'
    value: string
  }[]
}

export type SnoozeInfo = {
  snoozedUntil?: string // ISO date (legacy)
  until?: string // ISO date (new format)
  snoozedAt: string // ISO date
  reason?: string // Why it was snoozed
}

export type ScheduledSend = {
  scheduledFor?: string // ISO date (legacy)
  sendAt?: string // ISO date (new format)
  scheduledAt: string // ISO date
  cancelable?: boolean
  recurring?: 'daily' | 'weekly' | 'monthly' // Recurring schedule
}

export type DraftState = {
  id: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  attachments: Attachment[]
  signature?: string
  lastSaved?: string // ISO date
  autoSaveEnabled: boolean
}

export type SortOption = {
  field: 'date' | 'sender' | 'subject' | 'size' | 'priority'
  order: 'asc' | 'desc'
}

export type SearchFilter = {
  query: string
  from?: string
  to?: string
  subject?: string
  hasAttachment?: boolean
  isUnread?: boolean
  isStarred?: boolean
  dateFrom?: string
  dateTo?: string
  labels?: string[]
  priority?: Priority
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type Notification = {
  id: string
  type: NotificationType
  message: string
  duration?: number // ms, undefined = persistent
  action?: {
    label: string
    onClick: () => void
  }
}

export type KeyboardShortcut = {
  key: string
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[]
  action: string
  description: string
  handler: () => void
}

export type BulkAction = {
  type: 'delete' | 'archive' | 'markRead' | 'markUnread' | 'star' | 'unstar' | 'move' | 'label'
  emailIds: string[]
  value?: string // for move/label actions
}

export type Folder = {
  id: string
  name: string
  icon?: string
  color?: string
  count?: number
  parent?: string // parent folder ID for nesting
  isSystem: boolean // true for inbox, sent, etc.
}

export type QuickReply = {
  id: string
  text: string
  category: 'positive' | 'neutral' | 'question' | 'busy'
  confidence?: number // 0-1
}

export type SentimentData = {
  score: number // -1 to 1
  label: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence: number
  keywords: { word: string; weight: number }[]
}

export type AIAnalytics = {
  totalEmails: number
  unreadCount: number
  averageResponseTime: number // hours
  topSenders: { email: string; count: number }[]
  sentimentTrend: { date: string; score: number }[]
  busyHours: { hour: number; count: number }[]
  labelDistribution: { label: string; count: number }[]
}

export type OfflineQueueItem = {
  id: string
  type: 'send' | 'delete' | 'update' | 'move'
  data: any
  timestamp: string
  retries: number
  maxRetries: number
}

export type VirtualScrollConfig = {
  itemHeight: number
  overscan: number
  containerHeight: number
}

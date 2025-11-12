// Attachment management utilities for email file handling

import type { Attachment } from '../types/extended'

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 0) return 'Invalid size'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1)
  const size = bytes / Math.pow(k, i)

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return ''
  }
  return filename.substring(lastDot + 1).toLowerCase()
}

/**
 * Get file type category from MIME type
 */
export function getFileCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'

  if (mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('text/')) {
    return 'document'
  }

  if (mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('tar') ||
      mimeType.includes('7z') ||
      mimeType.includes('compressed')) {
    return 'archive'
  }

  return 'other'
}

/**
 * Validate file for email attachment
 */
export function validateAttachment(
  file: File,
  maxSize: number = 25 * 1024 * 1024, // 25MB default
  allowedTypes?: string[]
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
    }
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0]
        return file.type.startsWith(category + '/')
      }
      return file.type === type
    })

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      }
    }
  }

  return { valid: true }
}

/**
 * Create attachment object from File
 */
export function createAttachment(file: File, id?: string): Attachment {
  return {
    id: id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream'
  }
}

/**
 * Calculate total size of attachments
 */
export function getTotalAttachmentSize(attachments: Attachment[]): number {
  return attachments.reduce((total, att) => total + att.size, 0)
}

/**
 * Check if attachment is an image
 */
export function isImageAttachment(attachment: Attachment): boolean {
  return attachment.type.startsWith('image/')
}

/**
 * Check if attachment can be previewed in browser
 */
export function canPreview(attachment: Attachment): boolean {
  const category = getFileCategory(attachment.type)
  return category === 'image' ||
         attachment.type === 'application/pdf' ||
         attachment.type.startsWith('text/')
}

/**
 * Get icon name for attachment type
 */
export function getAttachmentIcon(attachment: Attachment): string {
  const category = getFileCategory(attachment.type)

  switch (category) {
    case 'image':
      return 'image'
    case 'video':
      return 'video'
    case 'audio':
      return 'music'
    case 'document':
      if (attachment.type.includes('pdf')) return 'file-text'
      if (attachment.type.includes('word')) return 'file-text'
      if (attachment.type.includes('excel') || attachment.type.includes('spreadsheet')) return 'file-spreadsheet'
      if (attachment.type.includes('powerpoint') || attachment.type.includes('presentation')) return 'file-presentation'
      return 'file-text'
    case 'archive':
      return 'archive'
    default:
      return 'file'
  }
}

/**
 * Sort attachments by name, size, or type
 */
export function sortAttachments(
  attachments: Attachment[],
  by: 'name' | 'size' | 'type' = 'name',
  order: 'asc' | 'desc' = 'asc'
): Attachment[] {
  const sorted = [...attachments].sort((a, b) => {
    let comparison = 0

    switch (by) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}

/**
 * Filter attachments by type category
 */
export function filterAttachmentsByCategory(
  attachments: Attachment[],
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
): Attachment[] {
  return attachments.filter(att => getFileCategory(att.type) === category)
}

/**
 * Generate download filename with sanitization
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters for filenames
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Replace invalid chars
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Check if filename is safe (no path traversal)
 */
export function isSafeFilename(filename: string): boolean {
  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false
  }

  // Check for null bytes
  if (filename.includes('\x00')) {
    return false
  }

  return true
}

import { describe, it, expect } from 'vitest'
import {
  formatFileSize,
  getFileExtension,
  getFileCategory,
  validateAttachment,
  createAttachment,
  getTotalAttachmentSize,
  isImageAttachment,
  canPreview,
  getAttachmentIcon,
  sortAttachments,
  filterAttachmentsByCategory,
  sanitizeFilename,
  isSafeFilename
} from 'src/lib/attachments'
import type { Attachment } from 'src/types/extended'

describe('attachments utility', () => {
  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
      expect(formatFileSize(1073741824)).toBe('1.0 GB')
      expect(formatFileSize(1099511627776)).toBe('1.0 TB')
    })

    it('handles negative sizes', () => {
      expect(formatFileSize(-100)).toBe('Invalid size')
    })

    it('handles large numbers', () => {
      const size = formatFileSize(999999999999)
      expect(size).toContain('GB') // 999999999999 bytes = 931.3 GB
      const tbSize = formatFileSize(1099511627776) // 1 TB
      expect(tbSize).toContain('TB')
    })

    it('rounds decimals appropriately', () => {
      expect(formatFileSize(1234)).toBe('1.2 KB')
      expect(formatFileSize(1234567)).toBe('1.2 MB')
    })
  })

  describe('getFileExtension', () => {
    it('extracts file extension', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('image.jpg')).toBe('jpg')
      expect(getFileExtension('archive.tar.gz')).toBe('gz')
    })

    it('returns empty string for files without extension', () => {
      expect(getFileExtension('filename')).toBe('')
      expect(getFileExtension('no-ext')).toBe('')
    })

    it('handles edge cases', () => {
      expect(getFileExtension('.')).toBe('')
      expect(getFileExtension('..')).toBe('')
      expect(getFileExtension('.hidden')).toBe('hidden')
      expect(getFileExtension('file.')).toBe('')
    })

    it('converts to lowercase', () => {
      expect(getFileExtension('FILE.PDF')).toBe('pdf')
      expect(getFileExtension('Image.JPG')).toBe('jpg')
    })
  })

  describe('getFileCategory', () => {
    it('categorizes images', () => {
      expect(getFileCategory('image/png')).toBe('image')
      expect(getFileCategory('image/jpeg')).toBe('image')
      expect(getFileCategory('image/gif')).toBe('image')
    })

    it('categorizes videos', () => {
      expect(getFileCategory('video/mp4')).toBe('video')
      expect(getFileCategory('video/avi')).toBe('video')
    })

    it('categorizes audio', () => {
      expect(getFileCategory('audio/mp3')).toBe('audio')
      expect(getFileCategory('audio/wav')).toBe('audio')
    })

    it('categorizes documents', () => {
      expect(getFileCategory('application/pdf')).toBe('document')
      expect(getFileCategory('application/msword')).toBe('document')
      expect(getFileCategory('text/plain')).toBe('document')
    })

    it('categorizes archives', () => {
      expect(getFileCategory('application/zip')).toBe('archive')
      expect(getFileCategory('application/x-rar')).toBe('archive')
      expect(getFileCategory('application/x-tar')).toBe('archive')
    })

    it('returns other for unknown types', () => {
      expect(getFileCategory('application/octet-stream')).toBe('other')
      expect(getFileCategory('unknown/type')).toBe('other')
    })
  })

  describe('validateAttachment', () => {
    const createMockFile = (size: number, type: string, name: string = 'test.txt'): File => {
      return new File([new ArrayBuffer(size)], name, { type })
    }

    it('validates valid files', () => {
      const file = createMockFile(1000, 'text/plain')
      const result = validateAttachment(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects files exceeding max size', () => {
      const file = createMockFile(30 * 1024 * 1024, 'text/plain') // 30MB
      const result = validateAttachment(file, 25 * 1024 * 1024) // 25MB max
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds maximum')
    })

    it('rejects empty files', () => {
      const file = createMockFile(0, 'text/plain')
      const result = validateAttachment(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('validates allowed file types', () => {
      const file = createMockFile(1000, 'image/png')
      const result = validateAttachment(file, 25 * 1024 * 1024, ['image/*'])
      expect(result.valid).toBe(true)
    })

    it('rejects disallowed file types', () => {
      const file = createMockFile(1000, 'video/mp4')
      const result = validateAttachment(file, 25 * 1024 * 1024, ['image/*'])
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('handles exact type matching', () => {
      const file = createMockFile(1000, 'application/pdf')
      const result = validateAttachment(file, 25 * 1024 * 1024, ['application/pdf', 'image/png'])
      expect(result.valid).toBe(true)
    })

    it('handles wildcard type matching', () => {
      const pngFile = createMockFile(1000, 'image/png')
      const jpgFile = createMockFile(1000, 'image/jpeg')
      const allowedTypes = ['image/*']

      expect(validateAttachment(pngFile, 25 * 1024 * 1024, allowedTypes).valid).toBe(true)
      expect(validateAttachment(jpgFile, 25 * 1024 * 1024, allowedTypes).valid).toBe(true)
    })
  })

  describe('createAttachment', () => {
    const mockFile = new File([new ArrayBuffer(1000)], 'test.pdf', { type: 'application/pdf' })

    it('creates attachment from file', () => {
      const attachment = createAttachment(mockFile)
      expect(attachment.name).toBe('test.pdf')
      expect(attachment.size).toBe(1000)
      expect(attachment.type).toBe('application/pdf')
      expect(attachment.id).toMatch(/^att-/)
    })

    it('uses provided ID', () => {
      const attachment = createAttachment(mockFile, 'custom-id')
      expect(attachment.id).toBe('custom-id')
    })

    it('generates unique IDs', () => {
      const att1 = createAttachment(mockFile)
      const att2 = createAttachment(mockFile)
      expect(att1.id).not.toBe(att2.id)
    })

    it('handles files without type', () => {
      const fileNoType = new File([new ArrayBuffer(100)], 'unknown')
      const attachment = createAttachment(fileNoType)
      expect(attachment.type).toBe('application/octet-stream')
    })
  })

  describe('getTotalAttachmentSize', () => {
    const attachments: Attachment[] = [
      { id: 'a1', name: 'file1.pdf', size: 1000, type: 'application/pdf' },
      { id: 'a2', name: 'file2.jpg', size: 2000, type: 'image/jpeg' },
      { id: 'a3', name: 'file3.doc', size: 3000, type: 'application/msword' }
    ]

    it('calculates total size', () => {
      expect(getTotalAttachmentSize(attachments)).toBe(6000)
    })

    it('returns 0 for empty array', () => {
      expect(getTotalAttachmentSize([])).toBe(0)
    })

    it('handles single attachment', () => {
      expect(getTotalAttachmentSize([attachments[0]])).toBe(1000)
    })
  })

  describe('isImageAttachment', () => {
    it('identifies image attachments', () => {
      expect(isImageAttachment({ id: 'a1', name: 'img.png', size: 100, type: 'image/png' })).toBe(true)
      expect(isImageAttachment({ id: 'a2', name: 'img.jpg', size: 100, type: 'image/jpeg' })).toBe(true)
    })

    it('rejects non-image attachments', () => {
      expect(isImageAttachment({ id: 'a1', name: 'doc.pdf', size: 100, type: 'application/pdf' })).toBe(false)
      expect(isImageAttachment({ id: 'a2', name: 'vid.mp4', size: 100, type: 'video/mp4' })).toBe(false)
    })
  })

  describe('canPreview', () => {
    it('allows preview for images', () => {
      expect(canPreview({ id: 'a1', name: 'img.png', size: 100, type: 'image/png' })).toBe(true)
    })

    it('allows preview for PDFs', () => {
      expect(canPreview({ id: 'a1', name: 'doc.pdf', size: 100, type: 'application/pdf' })).toBe(true)
    })

    it('allows preview for text files', () => {
      expect(canPreview({ id: 'a1', name: 'file.txt', size: 100, type: 'text/plain' })).toBe(true)
      expect(canPreview({ id: 'a2', name: 'code.js', size: 100, type: 'text/javascript' })).toBe(true)
    })

    it('disallows preview for other types', () => {
      expect(canPreview({ id: 'a1', name: 'archive.zip', size: 100, type: 'application/zip' })).toBe(false)
      expect(canPreview({ id: 'a2', name: 'video.mp4', size: 100, type: 'video/mp4' })).toBe(false)
    })
  })

  describe('getAttachmentIcon', () => {
    it('returns correct icons for different types', () => {
      expect(getAttachmentIcon({ id: 'a1', name: 'img.png', size: 100, type: 'image/png' })).toBe('image')
      expect(getAttachmentIcon({ id: 'a2', name: 'vid.mp4', size: 100, type: 'video/mp4' })).toBe('video')
      expect(getAttachmentIcon({ id: 'a3', name: 'song.mp3', size: 100, type: 'audio/mp3' })).toBe('music')
      expect(getAttachmentIcon({ id: 'a4', name: 'doc.pdf', size: 100, type: 'application/pdf' })).toBe('file-text')
      expect(getAttachmentIcon({ id: 'a5', name: 'archive.zip', size: 100, type: 'application/zip' })).toBe('archive')
      expect(getAttachmentIcon({ id: 'a6', name: 'unknown', size: 100, type: 'application/octet-stream' })).toBe('file')
    })

    it('returns specific icons for Office documents', () => {
      expect(getAttachmentIcon({ id: 'a1', name: 'doc.docx', size: 100, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).toBe('file-text')
      expect(getAttachmentIcon({ id: 'a2', name: 'sheet.xlsx', size: 100, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })).toBe('file-spreadsheet')
      expect(getAttachmentIcon({ id: 'a3', name: 'pres.pptx', size: 100, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })).toBe('file-presentation')
    })
  })

  describe('sortAttachments', () => {
    const attachments: Attachment[] = [
      { id: 'a1', name: 'z-file.pdf', size: 3000, type: 'application/pdf' },
      { id: 'a2', name: 'a-file.jpg', size: 1000, type: 'image/jpeg' },
      { id: 'a3', name: 'm-file.doc', size: 2000, type: 'application/msword' }
    ]

    it('sorts by name ascending', () => {
      const sorted = sortAttachments(attachments, 'name', 'asc')
      expect(sorted[0].name).toBe('a-file.jpg')
      expect(sorted[1].name).toBe('m-file.doc')
      expect(sorted[2].name).toBe('z-file.pdf')
    })

    it('sorts by name descending', () => {
      const sorted = sortAttachments(attachments, 'name', 'desc')
      expect(sorted[0].name).toBe('z-file.pdf')
      expect(sorted[2].name).toBe('a-file.jpg')
    })

    it('sorts by size ascending', () => {
      const sorted = sortAttachments(attachments, 'size', 'asc')
      expect(sorted[0].size).toBe(1000)
      expect(sorted[1].size).toBe(2000)
      expect(sorted[2].size).toBe(3000)
    })

    it('sorts by size descending', () => {
      const sorted = sortAttachments(attachments, 'size', 'desc')
      expect(sorted[0].size).toBe(3000)
      expect(sorted[2].size).toBe(1000)
    })

    it('sorts by type', () => {
      const sorted = sortAttachments(attachments, 'type', 'asc')
      expect(sorted[0].type).toBe('application/msword')
      expect(sorted[1].type).toBe('application/pdf')
      expect(sorted[2].type).toBe('image/jpeg')
    })

    it('does not mutate original array', () => {
      const original = [...attachments]
      sortAttachments(attachments, 'name', 'asc')
      expect(attachments).toEqual(original)
    })
  })

  describe('filterAttachmentsByCategory', () => {
    const attachments: Attachment[] = [
      { id: 'a1', name: 'img.png', size: 100, type: 'image/png' },
      { id: 'a2', name: 'doc.pdf', size: 100, type: 'application/pdf' },
      { id: 'a3', name: 'vid.mp4', size: 100, type: 'video/mp4' },
      { id: 'a4', name: 'img2.jpg', size: 100, type: 'image/jpeg' }
    ]

    it('filters by image category', () => {
      const filtered = filterAttachmentsByCategory(attachments, 'image')
      expect(filtered).toHaveLength(2)
      expect(filtered.every(a => a.type.startsWith('image/'))).toBe(true)
    })

    it('filters by document category', () => {
      const filtered = filterAttachmentsByCategory(attachments, 'document')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('doc.pdf')
    })

    it('filters by video category', () => {
      const filtered = filterAttachmentsByCategory(attachments, 'video')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('vid.mp4')
    })

    it('returns empty array when no matches', () => {
      const filtered = filterAttachmentsByCategory(attachments, 'audio')
      expect(filtered).toHaveLength(0)
    })
  })

  describe('sanitizeFilename', () => {
    it('removes invalid characters', () => {
      expect(sanitizeFilename('file<name>.txt')).toBe('file_name_.txt')
      expect(sanitizeFilename('file:name.txt')).toBe('file_name.txt')
      expect(sanitizeFilename('file|name.txt')).toBe('file_name.txt')
    })

    it('removes leading dots', () => {
      expect(sanitizeFilename('...file.txt')).toBe('file.txt')
      expect(sanitizeFilename('.file.txt')).toBe('file.txt')
    })

    it('normalizes whitespace', () => {
      expect(sanitizeFilename('file   name.txt')).toBe('file name.txt')
      expect(sanitizeFilename('  file.txt  ')).toBe('file.txt')
    })

    it('preserves valid filenames', () => {
      expect(sanitizeFilename('valid-file_name.txt')).toBe('valid-file_name.txt')
      expect(sanitizeFilename('file.name.txt')).toBe('file.name.txt')
    })
  })

  describe('isSafeFilename', () => {
    it('accepts safe filenames', () => {
      expect(isSafeFilename('file.txt')).toBe(true)
      expect(isSafeFilename('my-file_name.pdf')).toBe(true)
      expect(isSafeFilename('file123.jpg')).toBe(true)
    })

    it('rejects path traversal attempts', () => {
      expect(isSafeFilename('../file.txt')).toBe(false)
      expect(isSafeFilename('../../etc/passwd')).toBe(false)
      expect(isSafeFilename('file/../other.txt')).toBe(false)
    })

    it('rejects paths with slashes', () => {
      expect(isSafeFilename('path/to/file.txt')).toBe(false)
      expect(isSafeFilename('path\\to\\file.txt')).toBe(false)
    })

    it('rejects null bytes', () => {
      expect(isSafeFilename('file\x00.txt')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles very large file sizes', () => {
      const huge = 1024 * 1024 * 1024 * 1024 * 10 // 10TB
      const formatted = formatFileSize(huge)
      expect(formatted).toContain('TB')
    })

    it('handles empty attachment arrays', () => {
      expect(getTotalAttachmentSize([])).toBe(0)
      expect(sortAttachments([], 'name')).toEqual([])
      expect(filterAttachmentsByCategory([], 'image')).toEqual([])
    })

    it('handles filenames with multiple extensions', () => {
      expect(getFileExtension('file.tar.gz')).toBe('gz')
      expect(getFileExtension('backup.2023.01.01.zip')).toBe('zip')
    })

    it('handles unusual MIME types', () => {
      const category = getFileCategory('application/vnd.custom-type')
      expect(['document', 'other']).toContain(category)
    })
  })
})

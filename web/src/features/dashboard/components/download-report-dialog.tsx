'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, FileSpreadsheet } from 'lucide-react'
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'

type ExportFormat = 'csv' | 'pdf'

interface DownloadReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function escapeCsvCell(value: unknown): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildEntriesCsv(entries: Record<string, unknown>[]): string {
  if (entries.length === 0) return 'No entries'
  const headers = Object.keys(entries[0])
  const rows = [headers.map(escapeCsvCell).join(',')]
  for (const row of entries) {
    rows.push(headers.map((h) => escapeCsvCell(row[h])).join(','))
  }
  return rows.join('\n')
}

function buildUsersCsv(users: Record<string, unknown>[]): string {
  if (users.length === 0) return 'No users'
  const headers = Object.keys(users[0])
  const rows = [headers.map(escapeCsvCell).join(',')]
  for (const row of users) {
    rows.push(headers.map((h) => escapeCsvCell(row[h])).join(','))
  }
  return rows.join('\n')
}

function collectHeaders(rows: Record<string, unknown>[]) {
  const headers = new Set<string>()
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => headers.add(key))
  })
  return Array.from(headers)
}

function formatValue(value: unknown) {
  if (value == null) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

async function buildPdfReport(entries: Record<string, unknown>[], users: Record<string, unknown>[]) {
  const pdfDoc = await PDFDocument.create()
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const brandColor = rgb(124 / 255, 58 / 255, 237 / 255)
  const brandSoft = rgb(237 / 255, 233 / 255, 254 / 255)
  const slate900 = rgb(15 / 255, 23 / 255, 42 / 255)
  const slate600 = rgb(71 / 255, 85 / 255, 105 / 255)
  const borderColor = rgb(226 / 255, 232 / 255, 240 / 255)
  const rowStripe = rgb(249 / 255, 247 / 255, 255 / 255)

  const margin = 40
  const headerHeight = 78
  const rowHeight = 24
  const generatedAt = new Date().toLocaleString()
  const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value)

  let page = pdfDoc.addPage()
  let { width, height } = page.getSize()
  let cursorY = height - headerHeight - 28

  const contentWidth = () => width - margin * 2

  const drawPageHeader = () => {
    page.drawRectangle({
      x: 0,
      y: height - headerHeight,
      width,
      height: headerHeight,
      color: brandColor,
    })

    page.drawText('Canstory Admin', {
      x: margin,
      y: height - 38,
      size: 22,
      color: rgb(1, 1, 1),
      font: boldFont,
    })

    page.drawText('Rapport du tableau de bord', {
      x: margin,
      y: height - 58,
      size: 13,
      color: brandSoft,
      font: regularFont,
    })

    const dateSize = 11
    const dateWidth = regularFont.widthOfTextAtSize(generatedAt, dateSize)
    page.drawText(generatedAt, {
      x: width - margin - dateWidth,
      y: height - 58,
      size: dateSize,
      color: brandSoft,
      font: regularFont,
    })
  }

  const newPage = () => {
    page = pdfDoc.addPage()
    ;({ width, height } = page.getSize())
    drawPageHeader()
    cursorY = height - headerHeight - 28
  }

  drawPageHeader()

  const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number) => {
    if (!text) return ['']
    const words = text.split(/\s+/)
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (font.widthOfTextAtSize(testLine, size) > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) lines.push(currentLine)
    return lines.length ? lines : ['']
  }

  const ensureSpace = (needed = 32) => {
    if (cursorY - needed < margin) {
      newPage()
    }
  }

  const writeParagraph = (
    text: string,
    {
      font = regularFont,
      size = 11,
      color = slate600,
    }: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}
  ) => {
    const availableWidth = contentWidth()
    const lines = wrapText(text, font, size, availableWidth)
    lines.forEach((line) => {
      ensureSpace(size + 6)
      page.drawText(line, {
        x: margin,
        y: cursorY,
        size,
        font,
        color,
      })
      cursorY -= size + 4
    })
  }

  const drawSectionHeading = (title: string, subtitle?: string) => {
    ensureSpace(40)
    page.drawText(title, {
      x: margin,
      y: cursorY,
      size: 16,
      font: boldFont,
      color: slate900,
    })
    cursorY -= 20
    if (subtitle) {
      writeParagraph(subtitle, { size: 11 })
    }
    cursorY -= 6
  }

  const fitText = (text: string, font: PDFFont, size: number, maxWidth: number) => {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
    let truncated = text
    while (truncated.length && font.widthOfTextAtSize(`${truncated}…`, size) > maxWidth) {
      truncated = truncated.slice(0, -1)
    }
    return truncated ? `${truncated}…` : ''
  }

  const drawStatCards = (stats: { label: string; value: number | string; caption?: string }[]) => {
    if (!stats.length) return
    const cardGap = 12
    const availableWidth = contentWidth()
    const cardWidth = (availableWidth - cardGap * (stats.length - 1)) / stats.length
    const cardHeight = 64

    ensureSpace(cardHeight + 12)
    stats.forEach((stat, index) => {
      const x = margin + index * (cardWidth + cardGap)
      page.drawRectangle({
        x,
        y: cursorY - cardHeight,
        width: cardWidth,
        height: cardHeight,
        color: rgb(1, 1, 1),
        borderColor,
        borderWidth: 1,
      })

      page.drawText(stat.label, {
        x: x + 12,
        y: cursorY - 18,
        size: 10,
        font: regularFont,
        color: slate600,
      })

      page.drawText(typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value, {
        x: x + 12,
        y: cursorY - 38,
        size: 20,
        font: boldFont,
        color: brandColor,
      })

      if (stat.caption) {
        page.drawText(stat.caption, {
          x: x + 12,
          y: cursorY - 54,
          size: 9,
          font: regularFont,
          color: slate600,
        })
      }
    })
    cursorY -= cardHeight + 24
  }

  const drawTable = (title: string, rows: Record<string, unknown>[], subtitle?: string) => {
    drawSectionHeading(title, subtitle)

    if (!rows.length) {
      writeParagraph('Aucune donnée disponible pour cette section.')
      cursorY -= 8
      return
    }

    const headers = collectHeaders(rows)
    const selectedHeaders = headers.length ? headers.slice(0, 5) : ['Valeur']
    const tableWidth = contentWidth()
    const columnWidth = tableWidth / selectedHeaders.length
    const maxRowsPerSection = 15

    const drawRow = (
      cells: string[],
      {
        font = regularFont,
        color = slate900,
        background = rgb(1, 1, 1),
        bold = false,
      }: {
        font?: PDFFont
        color?: ReturnType<typeof rgb>
        background?: ReturnType<typeof rgb>
        bold?: boolean
      } = {}
    ) => {
      ensureSpace(rowHeight + 6)
      page.drawRectangle({
        x: margin,
        y: cursorY - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: background,
        borderColor,
        borderWidth: 1,
      })

      cells.forEach((cell, idx) => {
        const text = fitText(cell, font, 10, columnWidth - 12)
        page.drawText(text, {
          x: margin + idx * columnWidth + 8,
          y: cursorY - rowHeight + 7,
          size: 10,
          font: bold ? boldFont : font,
          color,
        })
      })

      cursorY -= rowHeight
    }

    drawRow(
      selectedHeaders.map((header) => header.toUpperCase()),
      { color: brandColor, background: brandSoft, bold: true }
    )

    rows.slice(0, maxRowsPerSection).forEach((row, index) => {
      const rowValues = selectedHeaders.map((header) => formatValue(row[header]))
      drawRow(rowValues, { background: index % 2 === 0 ? rowStripe : rgb(1, 1, 1) })
    })

    if (rows.length > maxRowsPerSection) {
      writeParagraph(`+${rows.length - maxRowsPerSection} lignes supplémentaires non affichées pour conserver la lisibilité.`)
    }

    cursorY -= 16
  }

  const entryStatusCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    const status = typeof entry.status === 'string' ? entry.status.toLowerCase() : 'autres'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  drawSectionHeading('Vue d’ensemble', 'Résumé professionnel du répertoire Canstory et des comptes système.')
  drawStatCards([
    { label: 'Entrées totales', value: entries.length },
    { label: 'Approuvées', value: entryStatusCounts.approved || 0 },
    { label: 'En attente', value: entryStatusCounts.pending || 0 },
    { label: 'Rejetées', value: entryStatusCounts.rejected || 0 },
    { label: 'Utilisateurs', value: users.length },
  ])

  drawTable(
    `Annuaire (${entries.length} entrées)`,
    entries,
    "Liste consolidée des inscriptions (limite visuelle de 5 champs par ligne pour une lecture claire)."
  )
  drawTable(
    `Utilisateurs (${users.length} comptes)`,
    users,
    'Détails principaux des comptes système exportés depuis le tableau de bord.'
  )

  return pdfDoc.save()
}

export function DownloadReportDialog({ open, onOpenChange }: DownloadReportDialogProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)

  async function fetchData() {
    const origin = getOrigin()
    const [entriesRes, usersRes] = await Promise.all([
      fetch(`${origin}/api/admin/annuaire`, { credentials: 'include' }),
      fetch(`${origin}/api/admin/users?pageSize=500`, { credentials: 'include' }),
    ])
    const entries = entriesRes.ok ? (await entriesRes.json()).data || [] : []
    const users = usersRes.ok ? (await usersRes.json()).data || [] : []
    return { entries, users }
  }

  async function handleExport(format: ExportFormat) {
    setLoading(format)
    try {
      const { entries, users } = await fetchData()

      if (format === 'csv') {
        const entriesCsv = buildEntriesCsv(entries)
        const usersCsv = buildUsersCsv(users)
        const combined = `Directory entries\n${entriesCsv}\n\nUsers\n${usersCsv}`
        const blob = new Blob(['\uFEFF' + combined], { type: 'text/csv;charset=utf-8;' })
        downloadBlob(blob, `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`)
      } else {
        const pdfBytes = await buildPdfReport(entries, users)
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        downloadBlob(blob, `dashboard-report-${new Date().toISOString().slice(0, 10)}.pdf`)
      }
      onOpenChange(false)
    } catch (e) {
      console.error('Export failed:', e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' showCloseButton>
        <DialogHeader>
          <DialogTitle>Télécharger le rapport</DialogTitle>
          <DialogDescription>
            Le format CSV télécharge un fichier contenant les inscriptions et les utilisateurs. Le format PDF génère un rapport complet prêt à être partagé, directement depuis votre tableau de bord.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          <Button
            variant='outline'
            className='flex-1'
            disabled={!!loading}
            onClick={() => handleExport('csv')}
          >
            <FileSpreadsheet className='mr-2 h-4 w-4' />
            {loading === 'csv' ? 'Préparation…' : 'Télécharger CSV'}
          </Button>
          <Button
            className='flex-1'
            disabled={!!loading}
            onClick={() => handleExport('pdf')}
          >
            <FileText className='mr-2 h-4 w-4' />
            {loading === 'pdf' ? 'Préparation…' : 'Télécharger PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

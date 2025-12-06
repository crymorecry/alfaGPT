'use client'

import { useMemo, useRef, useState } from 'react'
import { Button, Dialog, Portal } from '@chakra-ui/react'
import { useTranslations } from 'next-intl'
import { useBusiness } from '@/components/business/BusinessProvider'
import { toaster } from '@/components/ui/toaster'
import { ArrowDownToLine, CheckCircle2, FileDown, Upload, XIcon, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'

type ParsedRow = {
  row: number
  date: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
}

type InvalidRow = {
  row: number
  reason: string
}

interface ImportTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportTransactionsModal({ isOpen, onClose, onSuccess }: ImportTransactionsModalProps) {
  const t = useTranslations('finance')
  const { currentBusiness } = useBusiness()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [validRows, setValidRows] = useState<ParsedRow[]>([])
  const [invalidRows, setInvalidRows] = useState<InvalidRow[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const categoryOptions = useMemo(() => [
    'Продажи',
    'Зарплата',
    'Маркетинг',
    'Оборудование',
    'Коммунальные',
    'Прочие'
  ], [])

  const reset = () => {
    setValidRows([])
    setInvalidRows([])
    setIsParsing(false)
    setIsSaving(false)
    setFileName(null)
    fileInputRef.current?.value && (fileInputRef.current.value = '')
  }

  const closeModal = () => {
    reset()
    onClose()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setIsParsing(true)
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      const parsed: ParsedRow[] = []
      const invalid: InvalidRow[] = []

      rows.forEach((row, idx) => {
        const rowNumber = idx + 2 // +2 because header is row 1
        const rawDate = row.Date || row.date || row['Дата'] || row['date']
        const rawType = (row.Type || row.type || row['Тип'] || '').toString().toLowerCase().trim()
        const rawAmount = row.Amount ?? row.amount ?? row['Сумма']
        const rawCategory = row.Category || row.category || row['Категория'] || ''
        const rawDescription = row.Description || row.description || row['Описание'] || ''

        const errors: string[] = []

        const isoDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : ''
        if (!rawDate || Number.isNaN(Date.parse(rawDate)) || !isoDate) {
          errors.push(t('validation_error_date'))
        }

        const type = rawType === 'income' ? 'income' : rawType === 'expense' ? 'expense' : ''
        if (!type) {
          errors.push(t('validation_error_type'))
        }

        const amountNum = Number(rawAmount)
        if (!rawAmount || Number.isNaN(amountNum) || amountNum <= 0) {
          errors.push(t('validation_error_amount'))
        }

        const category = rawCategory?.toString().trim() || ''
        if (!category) {
          errors.push(t('validation_error_category'))
        }

        if (errors.length) {
          invalid.push({ row: rowNumber, reason: errors.join('; ') })
          return
        }

        parsed.push({
          row: rowNumber,
          date: isoDate,
          type: type as 'income' | 'expense',
          amount: amountNum,
          category,
          description: rawDescription?.toString() || ''
        })
      })

      setValidRows(parsed)
      setInvalidRows(invalid)
    } catch (err) {
      console.error(err)
      toaster.create({ title: t('error'), description: t('parse_error') })
    } finally {
      setIsParsing(false)
    }
  }

  const handleSave = async () => {
    if (!currentBusiness) {
      toaster.create({ title: t('error'), description: t('no_business_selected') })
      return
    }
    if (!validRows.length) {
      toaster.create({ title: t('error'), description: t('no_valid_rows') })
      return
    }

    setIsSaving(true)
    try {
      let successCount = 0
      for (const row of validRows) {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: row.date,
            category: row.category,
            type: row.type,
            amount: row.amount,
            description: row.description,
            businessId: currentBusiness.id
          })
        })
        if (res.ok) successCount += 1
      }

      if (successCount === validRows.length) {
        toaster.create({ title: t('success'), description: t('added_count', { count: successCount }) })
      } else {
        toaster.create({
          title: t('error'),
          description: t('partial_success', { success: successCount, total: validRows.length })
        })
      }
      onSuccess()
      closeModal()
    } catch (err) {
      console.error(err)
      toaster.create({ title: t('error'), description: t('error_adding_transaction') })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && closeModal()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="4xl" className="rounded-3xl">
            <Dialog.Header className="flex items-center justify-between mb-4 gap-2">
              <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5" />
                {t('import_transactions')}
              </Dialog.Title>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={closeModal} />
              </div>
            </Dialog.Header>

            <Dialog.Body className="flex flex-col gap-4 px-4 py-0">
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 px-4 py-2 rounded-xl"
                    disabled={isParsing}
                  >
                    <Upload className="w-4 h-4" />
                    {fileName || t('choose_file')}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <a
                    href="/samples/transactions-sample-1.xlsx"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    download
                  >
                    <FileDown className="w-4 h-4" />
                    {t('download_template')} #1
                  </a>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('format_hint')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {t('file_requirements')}
                </p>
              </div>

              {isParsing && (
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('processing')}</div>
              )}

              {!isParsing && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-sm">
                        {t('rows_valid', { count: validRows.length })}
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                      {validRows.length === 0 && (
                        <p className="text-gray-500">{t('no_valid_rows')}</p>
                      )}
                      {validRows.map((row) => (
                        <div key={row.row} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{t('row_label', { row: row.row })}</span>
                            <span>{row.type === 'income' ? t('income') : t('expense')}</span>
                          </div>
                          <div className="font-semibold">
                            {row.amount.toLocaleString('ru-RU')} ₽ — {row.category}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {row.date} • {row.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-sm">
                        {t('invalid_rows', { count: invalidRows.length })}
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                      {invalidRows.length === 0 && (
                        <p className="text-gray-500">{t('no_errors')}</p>
                      )}
                      {invalidRows.map((row) => (
                        <div key={row.row} className="border border-amber-200 bg-amber-50 text-amber-800 rounded-lg p-2">
                          <div className="text-xs font-semibold">{t('row_label', { row: row.row })}</div>
                          <div className="text-xs">{row.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Body>

            <Dialog.Footer className="flex items-center justify-end gap-3">
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={closeModal} className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md">
                  {t('cancel_transaction')}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleSave}
                disabled={isSaving || isParsing || !validRows.length}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                {isSaving ? t('processing') : t('add_all')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}


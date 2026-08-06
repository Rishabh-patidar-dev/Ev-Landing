'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileText, RotateCcw, Eye } from 'lucide-react'
import { VerificationBadge } from './VerificationBadge'
import { Button } from '@/components/ui/Button'
import type { VerifyStatus } from '@/lib/store/dealerStore'
import { extractGPSFromImage } from '@/lib/apis/exif'

interface DocumentUploadZoneProps {
  docType: string
  label: string
  hint: string
  stage: number
  dealerId: string
  verifyApi: string
  accept?: string
  currentStatus?: VerifyStatus
  storagePath?: string
  readOnly?: boolean
  onStatusChange?: (status: VerifyStatus, path?: string) => void
  onGPSExtracted?: (lat: number, lng: number) => void
}

export function DocumentUploadZone({
  docType,
  label,
  hint,
  stage,
  dealerId,
  verifyApi,
  accept,
  currentStatus = 'pending',
  storagePath,
  readOnly = false,
  onStatusChange,
  onGPSExtracted,
}: DocumentUploadZoneProps) {
  const [status, setStatus] = useState<VerifyStatus>(currentStatus)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const updateStatus = (s: VerifyStatus, path?: string) => {
    setStatus(s)
    onStatusChange?.(s, path)
  }

  const pollVerification = useCallback(async (documentId: string) => {
    let attempts = 0
    const maxAttempts = 20

    const poll = async () => {
      attempts++
      const res = await fetch(`/api/verify/${docType}?documentId=${documentId}`)
      const data = await res.json()

      if (data.verifyStatus === 'verified') {
        updateStatus('verified')
        return
      } else if (data.verifyStatus === 'failed') {
        updateStatus('failed')
        setErrorMessage(data.error || 'Verification failed')
        return
      }

      if (attempts < maxAttempts) {
        pollRef.current = setTimeout(poll, 3000)
      } else {
        updateStatus('failed')
        setErrorMessage('Verification timed out')
      }
    }

    pollRef.current = setTimeout(poll, 3000)
  }, [docType])

  const handleFile = useCallback(async (file: File) => {
    if (pollRef.current) clearTimeout(pollRef.current)
    setErrorMessage(null)
    setFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)
    updateStatus('verifying')

    try {
      // Extract GPS if it's an image
      if (file.type.startsWith('image/') && onGPSExtracted) {
        const gps = await extractGPSFromImage(file)
        if (gps) onGPSExtracted(gps.lat, gps.lng)
      }

      // Get signed upload URL
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId, stage, docType, fileName: file.name, contentType: file.type }),
      })

      if (!signRes.ok) throw new Error('Failed to get upload URL')
      const { signedUrl, documentId, path } = await signRes.json()

      // Upload file directly to Supabase Storage using XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed')))
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      setIsUploading(false)
      updateStatus('verifying', path)

      // Trigger async verification
      await fetch(`/api/verify/${docType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, dealerId }),
      })

      pollVerification(documentId)
    } catch (err) {
      setIsUploading(false)
      updateStatus('failed')
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
    }
  }, [dealerId, stage, docType, onGPSExtracted, pollVerification])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const borderColor = {
    pending: 'border-sand/40',
    verifying: 'border-amber-300',
    verified: 'border-green-400',
    failed: 'border-red-400',
  }[status]

  return (
    <div className={['border-2 rounded-2xl p-4 transition-all duration-200 bg-brand-white', borderColor, isDragging ? 'border-slate scale-[1.01]' : ''].join(' ')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-slate flex-shrink-0" />
            <span className="text-sm font-semibold text-ink">{label}</span>
            {verifyApi !== 'none' && (
              <span className="text-xs text-sand px-1.5 py-0.5 bg-sand/10 rounded-md">{verifyApi}</span>
            )}
          </div>
          <p className="text-xs text-sand mb-3">{hint}</p>

          {/* Upload area */}
          {status !== 'verified' && !readOnly && (
            <div
              className={['border border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors', isDragging ? 'border-slate bg-slate/5' : 'border-sand/40 hover:border-slate/50'].join(' ')}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-5 h-5 text-sand mx-auto mb-1" />
              <p className="text-xs text-sand">{fileName || 'Drop or click to upload'}</p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Read-only pending placeholder */}
          {status !== 'verified' && readOnly && (
            <div className="border border-dashed border-sand/20 rounded-xl p-3 text-center bg-sand/5">
              <p className="text-xs text-sand/50">Not submitted</p>
            </div>
          )}

          {/* Upload progress */}
          {isUploading && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-sand mb-1">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-sand/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error + retry */}
          {status === 'failed' && errorMessage && !readOnly && (
            <div className="mt-2 flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
              <p className="text-xs text-red-600">{errorMessage}</p>
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                <RotateCcw className="w-3 h-3" /> Retry
              </Button>
            </div>
          )}

          {/* Verified state */}
          {status === 'verified' && storagePath && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-green-700 flex-1 truncate">{fileName}</span>
              <a
                href={`/api/upload?path=${encodeURIComponent(storagePath)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate hover:underline"
              >
                <Eye className="w-3 h-3" /> View
              </a>
            </div>
          )}
        </div>

        <VerificationBadge status={status} size="md" showLabel={false} />
      </div>
    </div>
  )
}

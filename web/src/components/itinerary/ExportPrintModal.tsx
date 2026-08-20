import React, { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Share01Icon,
  Download01Icon,
  Bookmark01Icon,
  Tick02Icon,
  Loading01Icon,
  Copy01Icon,
  Cancel01Icon,
  WhatsappIcon,
  NewTwitterIcon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

interface ExportPrintModalProps {
  onSaveTrip: () => void
  onExportPdf?: () => void
  isSaving: boolean
  isSaved: boolean
  isExportingPdf?: boolean
  savedUuid?: string | null
  destination?: string
}

export const ExportPrintModal: React.FC<ExportPrintModalProps> = ({
  onSaveTrip,
  onExportPdf,
  isSaving,
  isSaved,
  isExportingPdf = false,
  savedUuid,
  destination = 'Travel',
}) => {
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const shareUrl = savedUuid
    ? `${window.location.origin}/discover/ai-itinerary?id=${savedUuid}`
    : `${window.location.origin}/discover/ai-itinerary?destination=${encodeURIComponent(destination)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Sharable itinerary link copied to clipboard!')
    setTimeout(() => setCopied(false), 2500)
  }

  const shareText = `Check out my ${destination} AI travel itinerary on Nearby!`

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')
  }

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-sm border border-border bg-card shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveTrip}
            disabled={isSaving || isSaved}
            className={`h-9 px-4 rounded-sm font-bold text-xs flex items-center gap-2 transition-colors shadow-xs ${
              isSaved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <HugeiconsIcon icon={isSaved ? Tick02Icon : Bookmark01Icon} className="size-3.5" />
            <span>{isSaved ? 'Itinerary Saved' : isSaving ? 'Saving...' : 'Save Itinerary'}</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="h-9 px-4 rounded-sm border border-border bg-muted/40 hover:bg-muted text-foreground font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <HugeiconsIcon
              icon={isExportingPdf ? Loading01Icon : Download01Icon}
              className={`size-3.5 ${isExportingPdf ? 'animate-spin text-emerald-400' : ''}`}
            />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF (Jinja2 Template)'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            handleCopyLink()
            setShowShareModal(true)
          }}
          className="h-9 px-4 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
        >
          <HugeiconsIcon icon={Share01Icon} className="size-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share Itinerary Link'}</span>
        </button>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border rounded-sm p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={Share01Icon} className="size-4 text-emerald-400" />
                <span>Share {destination} Itinerary</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-sm"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Share this neural itinerary with friends, family, or travel companions. Anyone with this link can view the route.
            </p>

            {/* Direct Link Copy Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-muted-foreground">Sharable URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="h-9 flex-1 px-3 rounded-sm bg-muted/60 border border-border text-xs font-mono text-foreground focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-9 px-3 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                >
                  <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">Quick Social Share</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="h-9 px-3 rounded-sm bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <HugeiconsIcon icon={WhatsappIcon} className="size-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleTwitter}
                  className="h-9 px-3 rounded-sm bg-foreground/10 hover:bg-foreground/20 border border-border text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <HugeiconsIcon icon={NewTwitterIcon} className="size-4" />
                  <span>Twitter / X</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ExportPrintModal

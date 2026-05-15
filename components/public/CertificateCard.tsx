'use client'

import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface CertificateCardProps {
  certificateId: string | null
  certificateStatus: string
  projectName: string
}

export default function CertificateCard({ certificateId, certificateStatus, projectName }: CertificateCardProps) {
  if (!certificateId || certificateStatus === 'NONE') {
    return (
      <div className="bg-surface border border-border rounded-sm p-4 flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />
        <div>
          <div className="text-off-white text-sm font-medium">No Vantis Certificate</div>
          <div className="text-gray text-xs mt-1">
            This project has not been verified by Vantis. Proceed with caution.
          </div>
        </div>
      </div>
    )
  }

  const certUrl = `https://vantis-mocha.vercel.app/certificate/${certificateId}`

  const statusIcon =
    certificateStatus === 'FULL' ? (
      <CheckCircle className="w-5 h-5 text-green shrink-0 mt-0.5" />
    ) : (
      <AlertCircle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
    )

  const statusLabel =
    certificateStatus === 'FULL' ? 'Full Vantis Certificate' : 'Provisional Vantis Certificate'

  const statusDesc =
    certificateStatus === 'FULL'
      ? 'Verified across all 5 databases. Title, land area, litigation, zoning, and financials all clear.'
      : 'Partial verification. One or more checks flagged. Review before finalising.'

  const badgeClasses =
    certificateStatus === 'FULL'
      ? 'bg-green/15 text-green border border-green/30'
      : 'bg-amber/15 text-amber border border-amber/30'

  return (
    <div className="bg-surface border border-border rounded-sm p-4 flex flex-col sm:flex-row items-start gap-4">
      <div className="flex-1">
        <div className="flex items-start gap-3">
          {statusIcon}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-off-white text-sm font-medium">{statusLabel}</div>
              <span className={`text-xs px-2 py-0.5 rounded-sm ${badgeClasses}`}>{certificateStatus}</span>
            </div>
            <div className="text-gray text-xs mt-1 max-w-xs">{statusDesc}</div>
            <div className="font-mono text-gold-dim text-xs mt-2">{certificateId}</div>
          </div>
        </div>
        <a
          href={certUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-gold hover:text-gold-light transition-colors duration-150"
        >
          <ExternalLink className="w-3 h-3" />
          View Full Certificate
        </a>
      </div>
      <div className="shrink-0 p-2 bg-white rounded-sm">
        <QRCodeSVG value={certUrl} size={80} level="M" />
      </div>
    </div>
  )
}

'use client'

import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, AlertTriangle, XCircle, Shield, ArrowLeft } from 'lucide-react'
import certificates from '@/data/certificates.json'

interface Verification {
  label: string
  source: string
  result: string
  detail: string
}

interface Certificate {
  id: string
  project_name: string
  rera: string
  developer_name: string
  location: string
  status: string
  issued_date: string
  last_verified: string
  valid_until: string
  verifications: Record<string, Verification>
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtDateTime(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function ResultIcon({ result }: { result: string }) {
  if (result === 'PASS')    return <CheckCircle className="w-5 h-5 text-green shrink-0 mt-0.5" />
  if (result === 'FLAGGED') return <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
  return <XCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />
}

function resultColor(r: string) {
  if (r === 'PASS')    return 'text-green'
  if (r === 'FLAGGED') return 'text-amber'
  return 'text-red'
}

function resultBg(r: string) {
  if (r === 'PASS')    return 'bg-green/5 border-green/20'
  if (r === 'FLAGGED') return 'bg-amber/5 border-amber/20'
  return 'bg-red/5 border-red/20'
}

function statusConfig(s: string) {
  if (s === 'FULL')        return { banner: 'bg-[#F0FBF5] border-b-2 border-b-green', text: 'text-green', label: '✓  FULL CERTIFICATE' }
  if (s === 'PROVISIONAL') return { banner: 'bg-[#FFFBF0] border-b-2 border-b-amber', text: 'text-amber', label: '⚠  PROVISIONAL CERTIFICATE' }
  return { banner: 'bg-[#FFF5F5] border-b-2 border-b-red', text: 'text-red', label: '✗  FLAGGED' }
}

export default function CertificateContent({ params }: { params: { id: string } }) {
  const cert = (certificates as Certificate[]).find(c => c.id === params.id)
  const certUrl = `https://vantis-mocha.vercel.app/certificate/${params.id}`

  if (!cert) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="w-10 h-10 text-gray mx-auto mb-3" />
          <div className="text-[#1A1A28] font-syne text-xl mb-2">Certificate Not Found</div>
          <div className="text-[#6B6B88] text-sm mb-1">Certificate ID:</div>
          <div className="font-mono text-gold text-sm mb-6 break-all px-4">{params.id}</div>
          <a href="/" className="text-gold hover:text-[#8B7035] text-sm transition-colors duration-150 underline">
            ← Return to Vantis Public Portal
          </a>
        </div>
      </div>
    )
  }

  const sc = statusConfig(cert.status)
  const verEntries = Object.values(cert.verifications)

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-6 px-4 print:py-0 print:px-0">
      <div className="max-w-[600px] mx-auto">

        <div className="mb-4 print:hidden">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-[#6B6B88] hover:text-gold transition-colors duration-150">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Portal
          </a>
        </div>

        <div className="bg-white border border-[#E2DDD4] rounded-sm overflow-hidden">

          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DDD4] bg-[#FAF8F3]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              <span className="font-syne text-sm text-[#1A1A28] font-semibold">Vantis by Orianode</span>
            </div>
            <span className="text-[#6B6B88] text-xs">K-RERA Compliance Certificate</span>
          </div>

          <div className={`${sc.banner} px-6 py-3 text-center`}>
            <span className={`font-syne text-sm font-bold tracking-[0.15em] ${sc.text}`}>{sc.label}</span>
          </div>

          <div className="px-6 py-6">

            <div className="text-center mb-6">
              <h1 className="font-syne text-2xl sm:text-3xl text-[#1A1A28] font-bold mb-2 leading-tight">
                {cert.project_name}
              </h1>
              <div className="font-mono text-gold text-xs sm:text-sm tracking-wide break-all mb-1">
                {cert.rera}
              </div>
              <div className="text-[#6B6B88] text-sm">{cert.developer_name}</div>
              <div className="text-[#6B6B88] text-xs mt-0.5">{cert.location}</div>
            </div>

            <div className="border-t-2 border-dashed border-[#E2DDD4] my-5" />

            <div className="mb-5">
              <div className="text-[#6B6B88] text-xs font-semibold uppercase tracking-widest mb-3 text-center">
                5-Point Regulatory Verification
              </div>
              <div className="space-y-2.5">
                {verEntries.map((v, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 border rounded-sm ${resultBg(v.result)}`}>
                    <ResultIcon result={v.result} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[#1A1A28] text-sm font-semibold">{v.label}</span>
                        <span className={`font-mono text-xs font-bold shrink-0 ${resultColor(v.result)}`}>{v.result}</span>
                      </div>
                      <div className="text-[#6B6B88] text-xs mb-1">Source: {v.source}</div>
                      <div className="text-[#6B6B88] text-xs leading-relaxed">{v.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E2DDD4] my-5" />

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-[#6B6B88] text-[10px] uppercase tracking-widest font-semibold mb-1">Certificate ID</div>
                <div className="font-mono text-gold text-xs break-all leading-relaxed">{cert.id}</div>
              </div>
              <div>
                <div className="text-[#6B6B88] text-[10px] uppercase tracking-widest font-semibold mb-1">Valid Until</div>
                <div className="text-[#1A1A28] text-sm font-medium">{fmtDate(cert.valid_until)}</div>
              </div>
              <div>
                <div className="text-[#6B6B88] text-[10px] uppercase tracking-widest font-semibold mb-1">Issued On</div>
                <div className="text-[#1A1A28] text-sm">{fmtDate(cert.issued_date)}</div>
              </div>
              <div>
                <div className="text-[#6B6B88] text-[10px] uppercase tracking-widest font-semibold mb-1">Last Verified</div>
                <div className="text-[#1A1A28] text-xs">{fmtDateTime(cert.last_verified)}</div>
              </div>
            </div>

            <div className="border-t border-[#E2DDD4] my-5" />

            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="p-3 bg-white border border-[#E2DDD4] rounded-sm">
                <QRCodeSVG value={certUrl} size={110} level="M" fgColor="#1A1A28" />
              </div>
              <div className="text-[#6B6B88] text-xs text-center max-w-xs">
                Scan to verify this certificate on the Vantis platform
              </div>
            </div>

            <div className="border-t border-[#E2DDD4] pt-4 text-center">
              <div className="text-[#6B6B88] text-xs leading-relaxed">
                Issued by{' '}
                <span className="text-[#1A1A28] font-semibold">Orianode Technologies Private Limited</span>
                <br />
                Powered by <span className="text-gold font-semibold">Vantis</span>
                <span className="mx-1">·</span>
                Data sourced from K-RERA, Kaveri 2.0, Bhoomi, eCourts, BBMP/BDA
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-5 print:hidden">
          <a href="/" className="text-[#6B6B88] hover:text-gold text-xs transition-colors duration-150">
            Verify another project at vantis.orianode.com
          </a>
        </div>
      </div>
    </div>
  )
}

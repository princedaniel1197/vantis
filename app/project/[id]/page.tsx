import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Building2, Users, IndianRupee, Scale, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import CertificateCard from '@/components/public/CertificateCard'
import projects from '@/data/projects.json'
import qprData from '@/data/qpr.json'
import complaintsData from '@/data/complaints.json'

interface QPREntry {
  status: string
  filed_date: string | null
  completion_pct: number | null
}

interface Submission {
  project_id: string
  [key: string]: QPREntry | string
}

interface LitigationItem {
  type: string
  court: string
  filed: string
  status: string
}

interface Project {
  id: string
  name: string
  rera: string
  developer_id: string
  developer_name: string
  location: string
  survey_numbers: string[]
  type: string
  total_units: number
  units_sold: number
  declared_cost_crore: number
  completion_date: string
  registration_date: string
  registration_valid_until: string
  extensions: number
  status: string
  risk_score: number
  certificate_id: string | null
  certificate_status: string
  complaints_pending: number
  complaints_resolved: number
  litigation: LitigationItem[]
}

function statusColor(s: string) {
  if (s === 'COMPLIANT') return 'text-green'
  if (s === 'CAUTION')   return 'text-amber'
  return 'text-red'
}
function statusDot(s: string) {
  if (s === 'COMPLIANT') return 'bg-green'
  if (s === 'CAUTION')   return 'bg-amber'
  return 'bg-red'
}

function statusSentence(project: Project) {
  if (project.status === 'COMPLIANT')
    return `${project.name} is fully compliant with K-RERA regulations. All reports filed on time, no pending complaints, and no active litigation. This project has a clean regulatory record.`
  if (project.status === 'CAUTION')
    return `${project.name} has compliance concerns. Some QPR filings were late and complaints are pending. Review all details carefully before proceeding.`
  return `${project.name} is HIGH RISK. Multiple consecutive QPR failures, ${project.complaints_pending} pending complaints, and ${project.litigation.length} active court case${project.litigation.length !== 1 ? 's' : ''}. Exercise extreme caution.`
}

function qprKey(quarter: string): string {
  return quarter.toLowerCase().replace(' ', '_')
}

function dotClasses(status: string) {
  if (status === 'ON_TIME') return 'bg-green border-green shadow-[0_0_8px_rgba(46,204,113,0.5)]'
  if (status === 'LATE') return 'bg-amber border-amber shadow-[0_0_8px_rgba(243,156,18,0.5)]'
  if (status === 'MISSED') return 'bg-red border-red shadow-[0_0_8px_rgba(231,76,60,0.5)]'
  return 'bg-gray/30 border-gray/30'
}

function dotLabel(status: string) {
  if (status === 'ON_TIME') return 'Filed'
  if (status === 'LATE') return 'Late'
  if (status === 'MISSED') return 'Missed'
  return 'N/A'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#2ECC71' : score >= 40 ? '#F39C12' : '#E74C3C'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

export function generateStaticParams() {
  return [
    { id: 'divya-villas' },
    { id: 'ozone-urbana' },
    { id: 'prestige-lakeside' },
    { id: 'skylark-arcadia' },
  ]
}

export default function ProjectProfile({ params }: { params: { id: string } }) {
  const project = (projects as Project[]).find(p => p.id === params.id)

  if (!project) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-syne text-xl text-off-white mb-2">Project Not Found</div>
          <div className="text-gray text-sm mb-6">No project with ID &quot;{params.id}&quot; found in our database.</div>
          <Link href="/" className="text-gold hover:text-gold-light text-sm transition-colors duration-150">
            ← Back to Search
          </Link>
        </div>
      </main>
    )
  }

  const submission = (qprData.submissions as Submission[]).find(s => s.project_id === project.id)
  const quarters = qprData.quarters

  const totalComplaints = project.complaints_pending + project.complaints_resolved
  const complaintsInData = (complaintsData as Array<{ project_id: string }>).filter(c => c.project_id === project.id)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 border-b border-border px-4 sm:px-8 py-3 flex items-center justify-between backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-light hover:text-gold transition-colors duration-150 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <span className="font-mono text-xs text-gray-light tracking-wider">K-RERA PUBLIC REGISTRY</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Section 1 — Status */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="font-syne text-2xl sm:text-3xl text-off-white leading-tight">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-gray shrink-0" />
                <span className="text-gray text-sm">{project.location}</span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${statusColor(project.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(project.status)}`} />
              {project.status}
            </span>
          </div>
          <div className="font-mono text-gold text-xs mb-4 tracking-wider">{project.rera}</div>

          {/* Vantis score */}
          <div className="bg-surface border border-border rounded-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-light text-xs uppercase tracking-wider">Vantis Risk Score</span>
              <span className="text-xs text-gray">100 = lowest risk</span>
            </div>
            <ScoreBar score={project.risk_score} />
          </div>

          {/* Plain language sentence */}
          <div className="border-l-2 border-gold pl-4 bg-surface rounded-r-sm p-4">
            <p className="text-off-white text-sm leading-relaxed">{statusSentence(project)}</p>
          </div>
        </div>

        {/* Section 2 — Project Facts */}
        <div>
          <h2 className="font-syne text-base text-gold-dim uppercase tracking-widest mb-4">Project Details</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Building2, label: 'Type', value: project.type },
              { icon: Users, label: 'Total Units', value: project.total_units.toLocaleString('en-IN') },
              { icon: Users, label: 'Units Sold', value: `${project.units_sold} / ${project.total_units}` },
              { icon: IndianRupee, label: 'Declared Cost', value: `Rs.${project.declared_cost_crore} Cr` },
              { icon: Calendar, label: 'Completion', value: formatDate(project.completion_date) },
              { icon: Calendar, label: 'Registered', value: formatDate(project.registration_date) },
              { icon: Calendar, label: 'Valid Until', value: formatDate(project.registration_valid_until) },
              { icon: AlertTriangle, label: 'Extensions', value: project.extensions === 0 ? 'None' : `${project.extensions} granted` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-surface border border-border rounded-sm p-3 flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-gray shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray text-xs">{label}</div>
                  <div className="text-off-white text-sm font-medium mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-surface border border-border rounded-sm p-3">
            <div className="text-gray text-xs mb-1">Survey Numbers</div>
            <div className="font-mono text-off-white text-sm">{project.survey_numbers.join(', ')}</div>
          </div>
        </div>

        {/* Section 3 — QPR Timeline */}
        <div>
          <h2 className="font-syne text-base text-gold-dim uppercase tracking-widest mb-2">Quarterly Progress Reports</h2>
          <p className="text-gray text-xs mb-5">Last 8 quarters · Most recent on right</p>

          <div className="bg-surface border border-border rounded-sm p-5">
            {/* Dots row */}
            <div className="flex items-end justify-between gap-1 sm:gap-2 mb-4 relative">
              {/* Progress line behind dots */}
              <div className="absolute top-4 left-4 right-4 h-px bg-border" />
              {quarters.map(q => {
                const key = qprKey(q)
                const entry = submission ? (submission[key] as QPREntry | undefined) : undefined
                const status = entry?.status ?? 'NA'
                return (
                  <div key={q} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                    <div
                      title={`${q}: ${dotLabel(status)}`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${dotClasses(status)} transition-transform duration-150 hover:scale-110 cursor-default`}
                    />
                    <span className="font-mono text-gray text-[9px] sm:text-xs text-center leading-tight whitespace-nowrap">
                      {q.replace(' ', '\n')}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-3 border-t border-border flex-wrap">
              {[
                { color: 'bg-green', label: 'Filed on time' },
                { color: 'bg-amber', label: 'Filed late' },
                { color: 'bg-red', label: 'Missed' },
                { color: 'bg-gray/30', label: 'Pre-registration' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-gray text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 — Complaint Summary */}
        <div>
          <h2 className="font-syne text-base text-gold-dim uppercase tracking-widest mb-4">Complaints</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: project.complaints_pending, label: 'Pending', color: project.complaints_pending > 0 ? 'text-red' : 'text-green' },
              { value: project.complaints_resolved, label: 'Resolved', color: 'text-green' },
              { value: totalComplaints, label: 'Total Filed', color: 'text-off-white' },
            ].map(({ value, label, color }) => (
              <div key={label} className="bg-surface border border-border rounded-sm p-4 text-center">
                <div className={`font-syne text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-gray text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
          {complaintsInData.length > 0 && (
            <div className="mt-3 bg-surface border border-border rounded-sm p-3">
              <div className="text-gray text-xs">Recent complaints on file for this project in the K-RERA database.</div>
            </div>
          )}
          {project.complaints_pending === 0 && project.complaints_resolved === 0 && (
            <div className="mt-3 flex items-center gap-2 text-green text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>No complaints have been filed against this project.</span>
            </div>
          )}
        </div>

        {/* Section 5 — Certificate */}
        <div>
          <h2 className="font-syne text-base text-gold-dim uppercase tracking-widest mb-4">Vantis Certificate</h2>
          <CertificateCard
            certificateId={project.certificate_id}
            certificateStatus={project.certificate_status}
            projectName={project.name}
          />
        </div>

        {/* Section 6 — Litigation */}
        <div>
          <h2 className="font-syne text-base text-gold-dim uppercase tracking-widest mb-4">Court Cases</h2>
          {project.litigation.length === 0 ? (
            <div className="flex items-center gap-2 text-green text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>No active court cases against this project.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {project.litigation.map((lit, i) => (
                <div key={i} className="bg-surface border border-red/30 rounded-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Scale className="w-4 h-4 text-red shrink-0 mt-0.5" />
                      <div>
                        <div className="text-off-white text-sm font-medium">{lit.type} Case</div>
                        <div className="text-gray text-xs mt-0.5">{lit.court}</div>
                        <div className="font-mono text-gray-light text-xs mt-1">Filed: {formatDate(lit.filed)}</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-red shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0" />
                      {lit.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="pb-6 flex flex-col sm:flex-row gap-3">
          <a
            href={`/complaint/file?project=${project.id}`}
            className="flex-1 text-center bg-gold hover:bg-gold-light text-background font-semibold text-sm py-3 px-6 rounded-sm transition-colors duration-150"
          >
            File a Complaint
          </a>
          <a
            href={`/alerts?project=${project.id}`}
            className="flex-1 text-center border border-border hover:border-gold text-off-white hover:text-gold text-sm py-3 px-6 rounded-sm transition-colors duration-150"
          >
            Set Alert for This Project
          </a>
        </div>
      </div>
    </main>
  )
}

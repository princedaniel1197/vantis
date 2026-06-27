/**
 * K-RERA Deep Scraper
 *
 * Phase 1 — listing: POSTs per-district to get basic project info + numeric IDs
 * Phase 2 — detail:  POSTs /projectDetails for each numeric ID → full data
 *
 * Usage:
 *   node scraper/scrape-rera.js              # full run (listing + detail)
 *   node scraper/scrape-rera.js --listing    # listing only
 *   node scraper/scrape-rera.js --detail     # detail only (needs listing checkpoint)
 *   node scraper/scrape-rera.js --district "Bengaluru Urban"  # one district
 *
 * Output:
 *   data/projects.json              full project list
 *   data/complaints.json            all complaints extracted
 *   data/rera-district-stats.json   per-district counts
 *   scraper/checkpoint.json         resume state
 */

const https  = require('https')
const qs     = require('querystring')
const fs     = require('fs')
const path   = require('path')

/* ── Config ───────────────────────────────────────────────────────────────── */
const DELAY_MS       = 1500   // ms between requests
const DETAIL_DELAY   = 800    // ms between detail requests (lighter)
const MAX_RETRIES    = 3
const DATA_DIR       = path.join(__dirname, '..', 'data')
const CHECKPOINT     = path.join(__dirname, 'checkpoint.json')

const DISTRICTS = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru  Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri',
  'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysore', 'Raichur',
  'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada',
  'Vijayanagara', 'Vijayapura', 'Yadgir'
]

/* ── HTTP helpers ─────────────────────────────────────────────────────────── */
function postRaw(urlPath, data, retries = MAX_RETRIES) {
  const body = qs.stringify(data)
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const opts = {
        hostname: 'rera.karnataka.gov.in', port: 443,
        path: urlPath, method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
          'Referer': 'https://rera.karnataka.gov.in/viewAllProjects',
          'Accept-Encoding': 'identity'
        }
      }
      const req = https.request(opts, res => {
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      })
      req.on('error', err => {
        if (n > 1) { setTimeout(() => attempt(n - 1), 3000) }
        else reject(err)
      })
      req.setTimeout(120000, () => {
        req.destroy()
        if (n > 1) { setTimeout(() => attempt(n - 1), 5000) }
        else reject(new Error('timeout'))
      })
      req.write(body)
      req.end()
    }
    attempt(retries)
  })
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

/* ── HTML parsing helpers ─────────────────────────────────────────────────── */
function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#039;/g, "'").replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function parseDate(s) {
  if (!s || !s.trim()) return null
  const t = s.trim()
  const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  return t
}

function extractSection(html, startLabel, endLabel) {
  const s = html.indexOf(startLabel)
  if (s < 0) return ''
  const e = endLabel ? html.indexOf(endLabel, s + startLabel.length) : s + 5000
  return html.substring(s, e > s ? e : s + 5000)
}

function labeledValue(html, label) {
  const re = new RegExp(label + '[\\s\\S]{0,200}?<[bt][dh][^>]*>([\\s\\S]*?)<\\/[bt][dh]>', 'i')
  const m = html.match(re)
  return m ? cleanText(m[1]) : ''
}

function tableToRows(html) {
  const rows = []
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g
  let rm
  while ((rm = rowRe.exec(html)) !== null) {
    const cells = []
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g
    let cm
    while ((cm = cellRe.exec(rm[1])) !== null) cells.push(cleanText(cm[1]))
    if (cells.length > 0) rows.push(cells)
  }
  return rows
}

/* ── Phase 1: listing parse ───────────────────────────────────────────────── */
function parseListingRows(html, district) {
  const rows = tableToRows(html)
  const projects = []

  for (const cells of rows) {
    if (cells.length < 8) continue
    const regNo = cells[2]
    if (!regNo || regNo === 'REGISTRATION NO') continue
    if (!regNo.includes('KA') && !regNo.includes('KN')) continue

    const completionDate = parseDate(cells[10])
    const approvedDate   = parseDate(cells[9])
    const status         = (cells[6] || '').toUpperCase()
    const complaintsRaw  = cells[cells.length - 1] || ''
    const complaintCount = parseInt((complaintsRaw.match(/\d+/) || ['0'])[0], 10)

    const now = new Date()
    let riskScore = 20
    if (completionDate) {
      const monthsOverdue = (now - new Date(completionDate)) / (1000 * 60 * 60 * 24 * 30)
      if (monthsOverdue > 24)      riskScore += 50
      else if (monthsOverdue > 12) riskScore += 35
      else if (monthsOverdue > 6)  riskScore += 20
      else if (monthsOverdue > 0)  riskScore += 10
    }
    riskScore += Math.min(complaintCount * 5, 30)
    riskScore = Math.min(riskScore, 99)

    projects.push({
      id: regNo.replace(/[^A-Za-z0-9]/g, '-'),
      _numeric_id: null,
      rera_id: regNo,
      ack_no: cells[1] || '',
      name: cells[5] || '',
      developer_name: cells[4] || '',
      location: (cells[7] || district).trim(),
      taluk: cells[8] || '',
      type: cells[9] || '',
      status,
      risk_score: riskScore,
      complaints_pending: complaintCount,
      approved_on: approvedDate,
      proposed_completion: completionDate,
      completion_at_registration: parseDate(cells[11]),
      covid_extension: parseDate(cells[12]),
      section6_extension: parseDate(cells[13]),
      further_extension: parseDate(cells[14])
    })
  }

  // Extract numeric IDs from onclick anchors, matched by position order
  const anchorRe = /<a id="(\d+)" class="btn btn-md" onclick="return showFileApplicationPreview/g
  let am
  const numericIds = []
  while ((am = anchorRe.exec(html)) !== null) numericIds.push(am[1])

  // Align numeric IDs with parsed projects
  for (let i = 0; i < Math.min(projects.length, numericIds.length); i++) {
    projects[i]._numeric_id = numericIds[i]
  }

  return projects
}

/* ── Phase 2: detail parse ────────────────────────────────────────────────── */
// The detail page uses Bootstrap col-md-3 grid: label in one col, value in next col <p> tag
function colValue(html, label) {
  // Matches: LabelText ... </p></div> <div ...><p>VALUE</p>
  const re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '[\\s\\S]{0,150}?<\\/p>[\\s\\S]{0,80}?<div[^>]*>[\\s\\S]{0,30}?<p>([\\s\\S]*?)<\\/p>', 'i')
  const m = html.match(re)
  return m ? cleanText(m[1]) : null
}

function parseDetail(html, base) {
  const detail = {}

  // Project cost — "Project Cost (INR)" then next col <p>
  const costM = html.match(/Project Cost \(INR\)[\s\S]{0,500}?<p>\s*(\d{6,})\s*<\/p>/i)
  if (costM) detail.project_cost_inr = parseInt(costM[1], 10)

  // Address
  const addrM = html.match(/Project Address[\s\S]{0,500}?<p>\s*([^<]{10,})\s*<\/p>/i)
  if (addrM) detail.address = cleanText(addrM[1])

  // Escrow bank & account
  const bankM = html.match(/Bank Name[\s\S]{0,500}?<p>\s*([^<]{3,}?)\s*<\/p>/i)
  const acctM = html.match(/Account No\.\(70% Account\)[\s\S]{0,500}?<p>\s*(\d{5,})\s*[<\s]/i)
  if (bankM) detail.escrow_bank = cleanText(bankM[1])
  if (acctM) detail.escrow_account = acctM[1].trim()

  // Towers — "Tower Details - <b>Name</b>"
  const towerNames = [...html.matchAll(/Tower Details - <b>([^<]{2,60})<\/b>/g)].map(m => m[1].trim())
  const towers = []
  for (const name of towerNames) {
    const secStart = html.indexOf(`Tower Details - <b>${name}</b>`)
    const secEnd   = html.indexOf('Tower Details - <b>', secStart + 10)
    const sec = html.substring(secStart, secEnd > secStart ? secEnd : secStart + 4000)
    const rows = tableToRows(sec)
    const t = { name }
    for (const cells of rows) {
      if (cells.length < 2) continue
      const k = cells[0].toLowerCase()
      if (k.includes('no. of floors'))   t.floors = parseInt(cells[1], 10) || null
      if (k.includes('total no. of units') && !k.includes('parking')) t.total_units = parseInt(cells[1], 10) || null
      if (k.includes('total no. of parking')) t.parking = parseInt(cells[1], 10) || null
      if (k.includes('no. of basement'))  t.basements = parseInt(cells[1], 10) || null
    }
    if (t.name) towers.push(t)
  }
  if (towers.length) detail.towers = towers

  // Units inventory — table after "Total units, Sold and Unsold units details"
  const unitsSec = extractSection(html, 'Total units, Sold and Unsold units details', 'Project Bank')
  if (unitsSec) {
    const unitRows = tableToRows(unitsSec)
    const inventory = []
    for (const cells of unitRows) {
      if (cells.length >= 3 && /\d/.test(cells[1]) && /BHK|Villa|Plot|Commercial|Studio|Shop|Office|Apart/i.test(cells[0])) {
        inventory.push({
          type: cells[0],
          total: parseInt(cells[1], 10) || 0,
          sold: parseInt(cells[2], 10) || 0,
          unsold: parseInt(cells[3], 10) || 0,
          carpet_sqmt: parseFloat(cells[4]) || null
        })
      }
    }
    if (inventory.length) detail.inventory = inventory
    detail.total_units_all = inventory.reduce((s, i) => s + i.total, 0) || null
    detail.units_sold      = inventory.reduce((s, i) => s + i.sold, 0) || null
  }

  // Construction schedule % — rows with work type + progress number
  const schedSec = extractSection(html, 'Project Schedule', 'Quarterly Update')
  if (schedSec) {
    const schedRows = tableToRows(schedSec)
    const schedule = {}
    for (const cells of schedRows) {
      if (cells.length >= 2 && cells[0] && cells[0].length < 80) {
        const pct = cells.find(c => /^\d{1,3}$/.test(c.trim()))
        if (pct) schedule[cells[0]] = parseInt(pct, 10)
      }
    }
    if (Object.keys(schedule).length) detail.construction_schedule = schedule
  }

  // QPR — last row of quarterly updates table
  const qprSec = extractSection(html, 'Quarterly Update Details', 'Completion Details')
  if (qprSec) {
    const qprRows = tableToRows(qprSec)
    if (qprRows.length >= 2) {
      const headers = qprRows[0]
      const lastRow = qprRows[qprRows.length - 1]
      const qpr = {}
      headers.forEach((h, i) => { if (h && lastRow[i]) qpr[h.toLowerCase().replace(/\s+/g,'_')] = lastRow[i] })
      if (Object.keys(qpr).length) detail.latest_qpr = qpr
    }
  }

  // Complaints — table inside "Complaint Details" section
  const complaintSec = extractSection(html, 'Complaint Details', 'Project Details')
  const complaintRows = tableToRows(complaintSec)
  const complaints = []
  for (const cells of complaintRows) {
    if (cells.length >= 5 && /^\d+$/.test(cells[0])) {
      complaints.push({
        complaint_no: cells[1],
        complainant: cells[2],
        date: parseDate(cells[3]),
        subject: cells[4],
        status: cells[7] || ''
      })
    }
  }
  if (complaints.length) detail.complaints = complaints

  // Extension details
  const extSec = extractSection(html, 'Project Extension Details', 'Current Project Details')
  if (extSec) {
    const extM1 = extSec.match(/Extension Applied On[\s\S]{0,200}?<p>\s*([^<]{6,}?)\s*<\/p>/i)
    const extM2 = extSec.match(/Extension Approved On[\s\S]{0,200}?<p>\s*([^<]{6,}?)\s*<\/p>/i)
    if (extM1) detail.extension_applied_on  = parseDate(cleanText(extM1[1]))
    if (extM2) detail.extension_approved_on = parseDate(cleanText(extM2[1]))
  }

  return { ...base, ...detail }
}

/* ── Checkpoint helpers ───────────────────────────────────────────────────── */
function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT)) return { phase1_done: [], phase2_done: [], projects: [] }
  return JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8'))
}

function saveCheckpoint(cp) {
  fs.writeFileSync(CHECKPOINT, JSON.stringify(cp, null, 2), 'utf8')
}

/* ── Phase 1 ──────────────────────────────────────────────────────────────── */
async function runListing(targetDistricts) {
  const cp = loadCheckpoint()
  const allProjects = []

  for (const district of targetDistricts) {
    if (cp.phase1_done.includes(district)) {
      console.log(`  [SKIP] ${district} (already done)`)
      continue
    }
    process.stdout.write(`  Listing ${district}...`)
    try {
      const html = await postRaw('/projectViewDetails', {
        project: '', firm: '', appNo: '', regNo: '',
        district, subdistrict: '0', btn1: 'Search'
      })
      const projects = parseListingRows(html, district)
      console.log(` ${projects.length} projects (${projects.filter(p => p._numeric_id).length} with IDs)`)
      cp.projects.push(...projects)
      cp.phase1_done.push(district)
      saveCheckpoint(cp)
      await sleep(DELAY_MS)
    } catch (e) {
      console.log(` ERROR: ${e.message}`)
    }
  }

  return cp.projects
}

/* ── Phase 2 ──────────────────────────────────────────────────────────────── */
async function runDetail(projects) {
  const cp = loadCheckpoint()
  const detailedProjects = []
  const allComplaints = []

  const toFetch = projects.filter(p => p._numeric_id && !cp.phase2_done.includes(p._numeric_id))
  console.log(`\nPhase 2: ${toFetch.length} projects to detail-scrape (${cp.phase2_done.length} already done)`)

  let done = 0
  for (const proj of toFetch) {
    try {
      const html = await postRaw('/projectDetails', { action: proj._numeric_id })
      const detailed = parseDetail(html, proj)
      detailedProjects.push(detailed)

      if (detailed.complaints && detailed.complaints.length) {
        allComplaints.push(...detailed.complaints.map(c => ({
          ...c,
          project_id: proj.id,
          project_name: proj.name,
          developer_name: proj.developer_name,
          district: proj.location
        })))
      }

      cp.phase2_done.push(proj._numeric_id)
      done++

      if (done % 50 === 0) {
        saveCheckpoint(cp)
        writeOutputs(detailedProjects, allComplaints)
        console.log(`  Progress: ${done}/${toFetch.length}`)
      }

      await sleep(DETAIL_DELAY)
    } catch (e) {
      console.log(`  ERROR ${proj.rera_id}: ${e.message}`)
    }
  }

  // Final save
  saveCheckpoint(cp)
  writeOutputs(detailedProjects, allComplaints)

  return { projects: detailedProjects, complaints: allComplaints }
}

/* ── Output writers ───────────────────────────────────────────────────────── */
function writeOutputs(projects, complaints) {
  fs.mkdirSync(DATA_DIR, { recursive: true })

  const seen = new Set()
  const deduped = projects.filter(p => {
    if (seen.has(p.rera_id)) return false
    seen.add(p.rera_id)
    return true
  })

  fs.writeFileSync(path.join(DATA_DIR, 'projects.json'), JSON.stringify(deduped, null, 2))

  if (complaints.length) {
    fs.writeFileSync(path.join(DATA_DIR, 'complaints.json'), JSON.stringify(complaints, null, 2))
  }

  const stats = {}
  for (const p of deduped) {
    const d = p.location || 'Unknown'
    if (!stats[d]) stats[d] = { total: 0, complaints: 0, high_risk: 0 }
    stats[d].total++
    stats[d].complaints += p.complaints_pending || 0
    if ((p.risk_score || 0) >= 65) stats[d].high_risk++
  }
  fs.writeFileSync(path.join(DATA_DIR, 'rera-district-stats.json'), JSON.stringify(stats, null, 2))
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
async function main() {
  const args = process.argv.slice(2)
  const listingOnly = args.includes('--listing')
  const detailOnly  = args.includes('--detail')
  const districtArg = args.find(a => a.startsWith('--district'))
  const targetDistricts = districtArg
    ? [districtArg.replace('--district', '').replace(/^[= "]+|["]+$/g, '').trim()]
    : DISTRICTS

  console.log('K-RERA Deep Scraper')
  console.log(`Districts: ${targetDistricts.join(', ')}`)
  console.log(`Mode: ${listingOnly ? 'listing only' : detailOnly ? 'detail only' : 'full (listing + detail)'}\n`)

  let projects

  if (!detailOnly) {
    console.log('=== Phase 1: Listing ===')
    projects = await runListing(targetDistricts)
    console.log(`\nListing complete: ${projects.length} total projects`)

    const distStats = {}
    for (const p of projects) {
      distStats[p.location] = (distStats[p.location] || 0) + 1
    }
    Object.entries(distStats).sort((a, b) => b[1] - a[1])
      .forEach(([d, c]) => console.log(`  ${d}: ${c}`))
  } else {
    const cp = loadCheckpoint()
    projects = cp.projects
    console.log(`Loaded ${projects.length} projects from checkpoint`)
  }

  if (!listingOnly) {
    console.log('\n=== Phase 2: Detail scrape ===')
    const { projects: detailed, complaints } = await runDetail(projects)
    console.log(`\nComplete: ${detailed.length} projects, ${complaints.length} complaints`)
    console.log(`Output: ${DATA_DIR}/projects.json`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })

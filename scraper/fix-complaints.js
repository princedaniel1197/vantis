const fs = require('fs');
const projects = JSON.parse(fs.readFileSync('data/projects.json','utf8'));
const complaints = JSON.parse(fs.readFileSync('data/complaints.json','utf8'));

// Count complaints per project
const complaintsByProject = {};
for (const c of complaints) {
  complaintsByProject[c.project_id] = (complaintsByProject[c.project_id]||0) + 1;
}

// Update each project's complaints_pending from real data
const updated = projects.map(p => ({
  ...p,
  complaints_pending: complaintsByProject[p.id] || (p.complaints ? p.complaints.length : 0)
}));

fs.writeFileSync('data/projects.json', JSON.stringify(updated, null, 2));

// Rebuild stats
const stats = {};
for (const p of updated) {
  const d = p.location||'Unknown';
  if (!stats[d]) stats[d]={total:0,complaints:0,high_risk:0};
  stats[d].total++;
  stats[d].complaints += p.complaints_pending||0;
  if ((p.risk_score||0)>=65) stats[d].high_risk++;
}
fs.writeFileSync('data/rera-district-stats.json', JSON.stringify(stats,null,2));

const totalComplaints = Object.values(stats).reduce((s,d)=>s+d.complaints,0);
console.log(`Total complaints: ${totalComplaints}`);
console.log('\nTop districts by complaints:');
Object.entries(stats).sort((a,b)=>b[1].complaints-a[1].complaints).slice(0,10)
  .forEach(([d,s])=>console.log(`  ${d}: ${s.total} projects, ${s.complaints} complaints, ${s.high_risk} high-risk`));

const fs = require('fs'), path = require('path');
const DATA_DIR = 'data';
const cp = JSON.parse(fs.readFileSync('scraper/checkpoint.json','utf8'));
const prev = JSON.parse(fs.readFileSync('data/projects.json','utf8'));
const detailMap = new Map(prev.map(p=>[p.rera_id, p]));
const seen = new Set();
const merged = [];
for (const base of cp.projects) {
  if (seen.has(base.rera_id)) continue;
  seen.add(base.rera_id);
  const d = detailMap.get(base.rera_id);
  merged.push(d ? {...base,...d} : base);
}
fs.writeFileSync('data/projects.json', JSON.stringify(merged,null,2));
const stats = {};
for (const p of merged) {
  const d = p.location||'Unknown';
  if (!stats[d]) stats[d]={total:0,complaints:0,high_risk:0};
  stats[d].total++;
  stats[d].complaints += p.complaints_pending||0;
  if ((p.risk_score||0)>=65) stats[d].high_risk++;
}
fs.writeFileSync('data/rera-district-stats.json', JSON.stringify(stats,null,2));
console.log('Merged:', merged.length, 'total projects');
console.log('Detailed:', prev.length, '| Basic only:', merged.length - prev.length);
console.log('\nTop districts:');
Object.entries(stats).sort((a,b)=>b[1].total-a[1].total).slice(0,10)
  .forEach(([d,s])=>console.log(`  ${d}: ${s.total} projects, ${s.complaints} complaints, ${s.high_risk} high-risk`));

import fs from 'fs';
import path from 'path';

const REPO_ROOT = process.cwd();

const TARGET = {
  'AI_and_Agents': 'AI_and_Agents/references',
  'Data_Engineering': 'Data_Engineering/references',
  'Mobile': 'Mobile/references',
  'Product_and_Business': 'Product_and_Business/references',
  'Security': 'Security/references',
  'Software_Engineering_and_Other': 'Software_Engineering_and_Other/references',
  'ci-cd': 'DevOps_and_Cloud/ci-cd/references',
  'cloud': 'DevOps_and_Cloud/cloud/references',
  'containers-orchestration': 'DevOps_and_Cloud/containers-orchestration/references',
  'infrastructure-as-code': 'DevOps_and_Cloud/infrastructure-as-code/references',
  'observability-monitoring-logging': 'DevOps_and_Cloud/observability-monitoring-logging/references',
};

function walkMd(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(full, out);
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out;
}
const allMd = walkMd('.', []);
const catAlt = Object.keys(TARGET).map(c => c.replace(/[-]/g, '\\-')).join('|');
const pathRe = new RegExp(`((?:\\.\\./)*|\\./)?Global_References/(${catAlt})/([^)\\]\\(\\s\`]+)`, 'g');

const skipped = [];
for (const f of allMd) {
  const content = fs.readFileSync(f, 'utf-8');
  let m;
  while ((m = pathRe.exec(content))) {
    const cat = m[2], rest = m[3];
    const hashIdx = rest.indexOf('#');
    const restPath = hashIdx === -1 ? rest : rest.slice(0, hashIdx);
    const resolvedNew = TARGET[cat] + '/' + restPath;
    if (!fs.existsSync(path.join(REPO_ROOT, resolvedNew))) {
      skipped.push({ cat, rest, file: f });
    }
  }
}
console.log('total skipped occurrences:', skipped.length);
const uniqueTargets = new Set(skipped.map(s => s.cat + '/' + s.rest));
console.log('unique skipped targets:', uniqueTargets.size);
console.log([...uniqueTargets].slice(0, 40).join('\n'));

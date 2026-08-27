import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');

const MAX_DEPENDENCIES = 5;

interface SkillData {
  filePath: string;
  name: string;
  content: string;
  frontmatter: any;
  markdownStartIdx: number;
  lines: string[];
}

async function main() {
  console.log('Scanning for all SKILL.md files...');
  const skillFiles = await glob('**/SKILL.md', {
    cwd: REPO_ROOT,
    absolute: true,
    ignore: ['node_modules/**', 'mcp-server/**']
  });

  console.log(`Found ${skillFiles.length} skills. Indexing...`);
  
  const allSkills: SkillData[] = [];
  const skillNames = new Set<string>();

  // 1. Index Phase
  for (const file of skillFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const cleanContent = content.replace(/^\uFEFF/, '');
    const lines = cleanContent.split('\n');
    let markdownStartIdx = 0;
    let frontmatterStr = '';

    if (lines[0].trim() === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          markdownStartIdx = i + 1;
          break;
        }
        frontmatterStr += lines[i] + '\n';
      }
    }

    try {
      const data = parse(frontmatterStr);
      if (data && data.name) {
        allSkills.push({
          filePath: file,
          name: data.name,
          content: lines.slice(markdownStartIdx).join('\n').toLowerCase(),
          frontmatter: data,
          markdownStartIdx,
          lines
        });
        skillNames.add(data.name);
      }
    } catch (e) {
      console.warn(`[WARN] Skipping ${file} due to YAML parse error`);
    }
  }

  console.log(`Indexed ${allSkills.length} valid skills. Generating graph...`);

  // 2. Linking Phase
  let updatedCount = 0;
  
  for (const skill of allSkills) {
    const deps = new Set<string>();
    
    // Scan content for other skill names
    for (const targetName of skillNames) {
      if (targetName === skill.name) continue;
      
      // Simple word boundary check
      const regex = new RegExp(`\\b${targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(skill.content)) {
        deps.add(targetName);
        if (deps.size >= MAX_DEPENDENCIES) break; // Cap to prevent context explosion
      }
    }

    // 3. Write Phase
    if (deps.size > 0) {
      const newDeps = Array.from(deps);
      // Check if it's actually different
      const currentDeps = skill.frontmatter.depends_on || [];
      const isDifferent = newDeps.length !== currentDeps.length || !newDeps.every((v, i) => v === currentDeps[i]);

      if (isDifferent) {
        skill.frontmatter.depends_on = newDeps;
        
        const newFrontmatter = stringify(skill.frontmatter);
        const newContent = `---\n${newFrontmatter}---\n${skill.lines.slice(skill.markdownStartIdx).join('\n')}`;
        
        await fs.writeFile(skill.filePath, newContent, 'utf-8');
        updatedCount++;
      }
    }
  }

  console.log('--- Dependency Graph Complete ---');
  console.log(`Successfully mapped dependencies for ${updatedCount} skills.`);
}

main().catch(console.error);

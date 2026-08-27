import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');

async function processSkill(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  let frontmatterStr = '';
  let markdownStartIdx = 0;
  let hasFrontmatter = false;

  // 1. Detect frontmatter
  if (lines[0].trim() === '---') {
    hasFrontmatter = true;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        markdownStartIdx = i + 1;
        break;
      }
      frontmatterStr += lines[i] + '\n';
    }
  }

  let data: any = {};
  if (hasFrontmatter) {
    try {
      data = parse(frontmatterStr) || {};
    } catch (e) {
      console.warn(`[WARN] Failed to parse YAML in ${filePath}. Resetting.`);
      data = {};
      hasFrontmatter = false; // Treat as missing
    }
  }

  const folderName = path.basename(path.dirname(filePath));
  const parentFolderName = path.basename(path.resolve(path.dirname(filePath), '..'));

  // 2. Heal Missing Data
  if (!data.name) data.name = folderName;
  if (!data.description || typeof data.description !== 'string' || data.description.length < 10) {
    data.description = `Comprehensive guidelines and best practices for ${folderName}. Use this skill when working with related components.`;
  }

  // 3. Upgrade Architecture (Tags & Dependencies)
  if (!data.tags) {
    data.tags = [parentFolderName.toLowerCase(), folderName.toLowerCase()];
  }
  if (!data.depends_on) {
    data.depends_on = [];
  }

  // 4. Reconstruct File
  const newFrontmatter = stringify(data);
  let newContent = `---\n${newFrontmatter}---\n`;
  
  if (hasFrontmatter) {
    newContent += lines.slice(markdownStartIdx).join('\n');
  } else {
    newContent += content;
  }

  await fs.writeFile(filePath, newContent, 'utf-8');
}

async function main() {
  console.log('Scanning for all SKILL.md files...');
  const skillFiles = await glob('**/SKILL.md', {
    cwd: REPO_ROOT,
    absolute: true,
    ignore: ['node_modules/**', 'mcp-server/**']
  });

  console.log(`Found ${skillFiles.length} skills. Upgrading...`);
  
  let success = 0;
  let errors = 0;

  for (const file of skillFiles) {
    try {
      await processSkill(file);
      success++;
    } catch (e) {
      console.error(`[ERROR] Failed to upgrade ${file}:`, e);
      errors++;
    }
  }

  console.log('--- Upgrade Complete ---');
  console.log(`Successfully upgraded: ${success}`);
  console.log(`Failed: ${errors}`);
}

main().catch(console.error);

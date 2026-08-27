import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../");

const MAX_WORD_COUNT = 2500; // Roughly ~3500 tokens. Anything above this is risky for context.

let totalSkills = 0;
let errors = 0;
let warnings = 0;

function lintSkill(absolutePath) {
    totalSkills++;
    const content = fs.readFileSync(absolutePath, "utf-8");
    const relativePath = path.relative(REPO_ROOT, absolutePath);
    
    // Check for BOM
    if (content.charCodeAt(0) === 0xFEFF) {
        console.warn(`[WARN] BOM detected in ${relativePath}`);
        warnings++;
    }

    const cleanContent = content.replace(/^\uFEFF/, '');
    
    // Check for YAML Frontmatter
    const yamlMatch = cleanContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!yamlMatch) {
        console.error(`[ERROR] Missing YAML frontmatter in ${relativePath}`);
        errors++;
        return;
    }
    
    const frontmatter = yamlMatch[1];
    
    // Check Name
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    if (!nameMatch) {
        console.error(`[ERROR] Missing 'name' in frontmatter: ${relativePath}`);
        errors++;
    }
    
    // Check Description
    const descMatch = frontmatter.match(/^description:\s*(?:>|\|)?\s*(.+?)(?=\n[a-z]+:|$)/ms);
    if (!descMatch) {
        console.error(`[ERROR] Missing 'description' in frontmatter: ${relativePath}`);
        errors++;
    }
    
    // Check Length (Word Count)
    const wordCount = cleanContent.split(/\s+/).length;
    if (wordCount > MAX_WORD_COUNT) {
        console.warn(`[WARN] Massive skill detected (${wordCount} words): ${relativePath}. Consider splitting this to save tokens.`);
        warnings++;
    }
}

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'mcp-server' || entry.name === 'scripts') continue;
        
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (entry.isFile() && entry.name === "SKILL.md") {
            lintSkill(fullPath);
        }
    }
}

console.log("🔍 Starting Skill Linter...");
walkDir(REPO_ROOT);
console.log("\n✅ Linting Complete!");
console.log(`- Skills Parsed: ${totalSkills}`);
console.log(`- Errors: ${errors}`);
console.log(`- Warnings: ${warnings}`);

if (errors > 0) {
    process.exit(1);
}

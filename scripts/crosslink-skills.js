import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../");

const DRY_RUN = process.argv.includes('--dry-run');

// 1. Gather all skills
const skills = [];

function gatherSkills(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'mcp-server' || entry.name === 'scripts') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            gatherSkills(fullPath);
        } else if (entry.isFile() && entry.name === "SKILL.md") {
            const content = fs.readFileSync(fullPath, "utf-8");
            const cleanContent = content.replace(/^\uFEFF/, '');
            const yamlMatch = cleanContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
            if (yamlMatch) {
                const nameMatch = yamlMatch[1].match(/^name:\s*(.+)$/m);
                if (nameMatch) {
                    let name = nameMatch[1].trim().replace(/^["']|["']$/g, '');
                    // Only match specific alphanumeric names to avoid over-matching common words (e.g. "go", "react")
                    if (name.length > 4 && /^[a-zA-Z0-9-]+$/.test(name)) {
                        skills.push({ name, absolutePath: fullPath });
                    }
                }
            }
        }
    }
}

console.log("Gathering skills for cross-linking...");
gatherSkills(REPO_ROOT);
// Sort by length descending to match longest names first
skills.sort((a, b) => b.name.length - a.name.length);
console.log(`Found ${skills.length} eligible skills for linking.`);

let totalLinksAdded = 0;

function crosslinkSkills(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'mcp-server' || entry.name === 'scripts') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            crosslinkSkills(fullPath);
        } else if (entry.isFile() && entry.name === "SKILL.md") {
            let content = fs.readFileSync(fullPath, "utf-8");
            let modified = false;
            
            // Only process the body, not the frontmatter
            const split = content.split(/---\r?\n/);
            if (split.length >= 3) {
                let body = split.slice(2).join('---\n');
                const originalBody = body;
                
                for (const skill of skills) {
                    if (skill.absolutePath === fullPath) continue; // Don't link to self
                    
                    // Regex: Match word boundary, ensure it's not inside an existing markdown link or backticks
                    // This is a naive but safe approximation.
                    const regex = new RegExp(`(?<!\\[|\\\\\`)(?:\\b)(${skill.name})(?:\\b)(?!\\]|\\\\\`)`, "gi");
                    
                    if (regex.test(body)) {
                        const relPath = path.relative(path.dirname(fullPath), skill.absolutePath).replace(/\\/g, '/');
                        body = body.replace(regex, (match) => {
                            modified = true;
                            totalLinksAdded++;
                            return `[${match}](${relPath})`;
                        });
                    }
                }
                
                if (modified) {
                    const newContent = `${split[0]}---\n${split[1]}---\n${body}`;
                    if (!DRY_RUN) {
                        fs.writeFileSync(fullPath, newContent, "utf-8");
                    }
                    console.log(`[LINKED] Added links to: ${path.relative(REPO_ROOT, fullPath)}`);
                }
            }
        }
    }
}

console.log(`Applying cross-links... (Dry Run: ${DRY_RUN})`);
crosslinkSkills(REPO_ROOT);
console.log(`\n✅ Cross-linking Complete! Total links injected: ${totalLinksAdded}`);

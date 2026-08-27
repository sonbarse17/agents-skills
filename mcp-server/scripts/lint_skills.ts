import fs from "fs";
import path from "path";
import { z } from "zod";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../..");

// Zod schema for the frontmatter
const FrontmatterSchema = z.object({
  name: z.string().min(1, "Skill must have a name"),
  description: z.string().min(10, "Skill description must be at least 10 characters"),
  tags: z.array(z.string()).optional(),
  depends_on: z.array(z.string()).optional()
});

let validCount = 0;
let errorCount = 0;

function lintFile(absolutePath: string) {
  try {
    const content = fs.readFileSync(absolutePath, "utf-8");
    const cleanContent = content.replace(/^\uFEFF/, '');
    const yamlMatch = cleanContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    
    if (!yamlMatch) {
      console.error(`[Error] ${absolutePath}: Missing or malformed YAML frontmatter.`);
      errorCount++;
      return;
    }

    const frontmatter = yamlMatch[1];
    
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(?:>|\|)?\s*(.+?)(?=\n[a-z]+:|$)/ms);
    const tagsMatch = frontmatter.match(/^tags:\s*\[(.*?)\]/m);
    const dependsMatch = frontmatter.match(/^depends_on:\s*\[(.*?)\]/m);
    
    let name = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, '') : undefined;
    let description = descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, '').replace(/\r?\n\s+/g, ' ') : undefined;
    let tags = tagsMatch ? tagsMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : undefined;
    let depends_on = dependsMatch ? dependsMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : undefined;

    const data = {
      name,
      description,
      ...(tags && { tags }),
      ...(depends_on && { depends_on })
    };

    const parsed = FrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`[Error] ${absolutePath}: Invalid frontmatter. ${parsed.error.message}`);
      errorCount++;
    } else {
      validCount++;
    }
  } catch (err: unknown) {
    console.error(`[Error] Failed to read ${absolutePath}`, err);
    errorCount++;
  }
}

function walkDir(dir: string) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }
  
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'mcp-server') continue;
    
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && entry.name === "SKILL.md") {
      lintFile(fullPath);
    }
  }
}

console.log("Linting skills repository...");
walkDir(REPO_ROOT);

console.log(`\nLinting Complete!`);
console.log(`Valid Skills: ${validCount}`);
console.log(`Errors: ${errorCount}`);

if (errorCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

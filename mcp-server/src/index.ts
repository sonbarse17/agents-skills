import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const REPO_ROOT = path.resolve(__dirname, "../../");

interface Skill {
  name: string;
  folder: string;
  description: string;
  category: string;
  subcategory: string;
  path: string;
  absolute_path: string;
}

class SkillRouterServer {
  private server: Server;
  private skills: Skill[] = [];
  private categories: Record<string, Record<string, number>> = {};

  constructor() {
    this.server = new Server(
      {
        name: "skill-router",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.buildIndexDynamically();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private buildIndexDynamically() {
    console.error("Dynamically indexing skills repository...");
    this.skills = [];
    this.categories = {};

    const walkDir = (dir: string) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (err) {
        return;
      }
      
      for (const entry of entries) {
        // Skip hidden folders (like .git, .gemini) and specific ignored folders
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'mcp-server') continue;
        
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile() && entry.name === "SKILL.md") {
          this.processSkillFile(fullPath);
        }
      }
    };
    
    try {
      walkDir(REPO_ROOT);
      console.error(`Successfully indexed ${this.skills.length} skills.`);
    } catch (err) {
      console.error("Error building index:", err);
    }
  }

  private processSkillFile(absolutePath: string) {
    try {
      const content = fs.readFileSync(absolutePath, "utf-8");
      
      // Match YAML frontmatter (ignoring BOM if present)
      const cleanContent = content.replace(/^\uFEFF/, '');
      const yamlMatch = cleanContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!yamlMatch) return;
      
      const frontmatter = yamlMatch[1];
      
      // Basic regex parsing for name and description
      const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
      // Match description, optionally handling block scalars (> or |)
      const descMatch = frontmatter.match(/^description:\s*(?:>|\|)?\s*(.+?)(?=\n[a-z]+:|$)/ms);
      
      let name = nameMatch ? nameMatch[1].trim() : "Unknown";
      let description = descMatch ? descMatch[1].trim() : "No description available";
      
      // Clean up quotes if present
      name = name.replace(/^["']|["']$/g, '');
      description = description.replace(/^["']|["']$/g, '');
      
      // Clean up description if it was a block scalar (remove newlines)
      description = description.replace(/\r?\n\s+/g, ' ');
      
      const relativePath = path.relative(REPO_ROOT, path.dirname(absolutePath));
      const parts = relativePath.split(path.sep);
      
      // Determine category and subcategory from path structure
      const category = parts.length > 0 ? parts[0] : "Uncategorized";
      const subcategory = parts.length > 1 ? parts[1] : "General";
      
      const skill: Skill = {
        name,
        folder: path.basename(path.dirname(absolutePath)),
        description,
        category,
        subcategory,
        path: relativePath.replace(/\\/g, '/'),
        absolute_path: absolutePath
      };
      
      this.skills.push(skill);
      
      // Update categories map
      if (!this.categories[category]) {
        this.categories[category] = {};
      }
      this.categories[category][subcategory] = (this.categories[category][subcategory] || 0) + 1;
      
    } catch (err) {
      console.error(`Failed to parse ${absolutePath}`, err);
    }
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    text = text.toLowerCase();
    text = text.replace(/[^\w\s-]/g, ' ');
    return text.split(/\s+/).filter(w => w.length > 2);
  }

  private scoreSkill(userTokens: string[], skill: Skill): number {
    let score = 0;
    const skillName = skill.name.toLowerCase();
    const skillFolder = skill.folder.toLowerCase();
    const descTokens = this.tokenize(skill.description);
    const catTokens = this.tokenize(skill.category);
    
    for (const token of userTokens) {
      if (token === skillName || token === skillFolder) score += 10.0;
      else if (skillName.includes(token) || skillFolder.includes(token)) score += 5.0;
      
      if (catTokens.includes(token)) score += 2.0;
      if (descTokens.includes(token)) score += 1.0;
    }
    return score;
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search_skills",
          description: "Search the 1,640+ skills repository to find the most relevant skill for a given task. Returns the top matches and their paths.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The task or concept you need a skill for (e.g. 'deploy fastapi to kubernetes')",
              },
              limit: {
                type: "number",
                description: "Max number of results to return (default: 3)",
                default: 3
              }
            },
            required: ["query"],
          },
        },
        {
          name: "get_skill_content",
          description: "Read the full SKILL.md instruction file for a specific skill. Provide the relative path obtained from search_skills.",
          inputSchema: {
            type: "object",
            properties: {
              skill_path: {
                type: "string",
                description: "The relative path to the skill (e.g. 'AI_and_Agents/Workflows/agent-builder')",
              }
            },
            required: ["skill_path"],
          },
        },
        {
          name: "list_categories",
          description: "List all skill categories and subcategories in the repository, along with the count of skills in each.",
          inputSchema: {
            type: "object",
            properties: {}
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "search_skills") {
        const query = String(request.params.arguments?.query || "");
        const limit = Number(request.params.arguments?.limit || 3);
        
        const userTokens = this.tokenize(query);
        if (userTokens.length === 0) {
          return { content: [{ type: "text", text: "Query too short." }] };
        }
        
        const scored = this.skills.map(skill => ({
          score: this.scoreSkill(userTokens, skill),
          skill
        })).filter(s => s.score > 0);
        
        scored.sort((a, b) => b.score - a.score);
        const topResults = scored.slice(0, limit);
        
        if (topResults.length === 0) {
          return { content: [{ type: "text", text: "No matching skills found." }] };
        }
        
        const formatted = topResults.map((r, i) => {
          const s = r.skill;
          return `Match #${i + 1} (Score: ${r.score})\nName: ${s.name}\nPath: ${s.path}\nCategory: ${s.category} / ${s.subcategory}\nDescription: ${s.description.substring(0, 200)}...`;
        }).join("\n\n");
        
        return { content: [{ type: "text", text: formatted }] };
      }

      if (request.params.name === "get_skill_content") {
        const skillPath = String(request.params.arguments?.skill_path || "");
        
        // Find the absolute path
        const absPath = path.join(REPO_ROOT, skillPath, "SKILL.md");
        
        if (!fs.existsSync(absPath)) {
          throw new McpError(ErrorCode.InvalidParams, `Skill file not found at: ${absPath}`);
        }
        
        const content = fs.readFileSync(absPath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      }

      if (request.params.name === "list_categories") {
        let output = "Skill Categories:\n\n";
        for (const [cat, subcats] of Object.entries(this.categories)) {
          output += `- ${cat}\n`;
          for (const [sub, count] of Object.entries(subcats as Record<string, number>)) {
            output += `  - ${sub}: ${count} skills\n`;
          }
        }
        return { content: [{ type: "text", text: output }] };
      }

      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Skill Router MCP server running on stdio");
  }
}

const server = new SkillRouterServer();
server.run().catch(console.error);

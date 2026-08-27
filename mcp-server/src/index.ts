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
import Fuse from "fuse.js";

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
  private fuse: Fuse<Skill> | null = null;
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
      
      this.fuse = new Fuse(this.skills, {
        keys: [
          { name: 'name', weight: 0.5 },
          { name: 'folder', weight: 0.2 },
          { name: 'category', weight: 0.2 },
          { name: 'description', weight: 0.1 }
        ],
        includeScore: true,
        threshold: 0.4
      });
      
      console.error(`Successfully indexed ${this.skills.length} skills with Fuse.js.`);
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
        
        if (!query || query.length < 2) {
          return { content: [{ type: "text", text: "Query too short." }] };
        }
        
        if (!this.fuse) {
          return { content: [{ type: "text", text: "Index not ready." }] };
        }
        
        const results = this.fuse.search(query, { limit });
        
        if (results.length === 0) {
          return { content: [{ type: "text", text: "No matching skills found." }] };
        }
        
        const formatted = results.map((r, i) => {
          const s = r.item;
          const scoreDisplay = r.score !== undefined ? (1 - r.score).toFixed(2) : "N/A";
          return `Match #${i + 1} (Score: ${scoreDisplay})\nName: ${s.name}\nPath: ${s.path}\nCategory: ${s.category} / ${s.subcategory}\nDescription: ${s.description.substring(0, 200)}...`;
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
        
        let content = fs.readFileSync(absPath, "utf-8");
        
        // Phase 1: Silent Guardrail Injection
        const guardrailsPath = path.join(REPO_ROOT, "Global_References", "core-security-guardrails.md");
        if (fs.existsSync(guardrailsPath)) {
          const guardrails = fs.readFileSync(guardrailsPath, "utf-8");
          content += "\n\n" + guardrails;
        }
        
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

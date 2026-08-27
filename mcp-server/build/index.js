import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Paths
const REPO_ROOT = path.resolve(__dirname, "../../");
const MANIFEST_PATH = path.join(REPO_ROOT, "skills_manifest.json");
class SkillRouterServer {
    server;
    skills = [];
    categories = {};
    constructor() {
        this.server = new Server({
            name: "skill-router",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.loadManifest();
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    loadManifest() {
        try {
            if (!fs.existsSync(MANIFEST_PATH)) {
                console.error(`Manifest not found at ${MANIFEST_PATH}. Run the manifest builder script.`);
                return;
            }
            const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
            this.skills = data.skills || [];
            this.categories = data.categories || {};
            console.error(`Loaded ${this.skills.length} skills from manifest.`);
        }
        catch (error) {
            console.error("Failed to load manifest:", error);
        }
    }
    tokenize(text) {
        if (!text)
            return [];
        text = text.toLowerCase();
        text = text.replace(/[^\w\s-]/g, ' ');
        return text.split(/\s+/).filter(w => w.length > 2);
    }
    scoreSkill(userTokens, skill) {
        let score = 0;
        const skillName = skill.name.toLowerCase();
        const skillFolder = skill.folder.toLowerCase();
        const descTokens = this.tokenize(skill.description);
        const catTokens = this.tokenize(skill.category);
        for (const token of userTokens) {
            if (token === skillName || token === skillFolder)
                score += 10.0;
            else if (skillName.includes(token) || skillFolder.includes(token))
                score += 5.0;
            if (catTokens.includes(token))
                score += 2.0;
            if (descTokens.includes(token))
                score += 1.0;
        }
        return score;
    }
    setupToolHandlers() {
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
                    for (const [sub, count] of Object.entries(subcats)) {
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

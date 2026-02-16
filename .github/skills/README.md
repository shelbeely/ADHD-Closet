# GitHub Copilot Agent Skills

This directory contains Agent Skills for GitHub Copilot, following the [official GitHub agent skills format](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).

## What are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that Copilot can load when relevant to improve its performance in specialized tasks. Agent Skills is an [open standard](https://github.com/agentskills/agentskills), used by a range of different agents.

## Skills.sh Integration

This repository integrates with [skills.sh](https://skills.sh) — a registry of reusable agent skills from the community. The coding agent environment has the skills CLI pre-installed.

### Two Types of Skills

**1. Local Skills (This Directory)**
- Project-specific skills stored in `.github/skills/`
- Automatically available to all agents
- Maintained as part of the repository
- Examples: humanizer, remotion, threejs-fundamentals

**2. Registry Skills (skills.sh)**
- Community skills from https://skills.sh
- Installed on-demand via `npx skills add <skill-path>`
- Extend agent capabilities dynamically
- Examples: testing frameworks, deployment scripts, documentation tools

### How Agents Should Use Skills

**Priority Order:**
1. **Check local skills first** - Browse `.github/skills/` for project-specific capabilities
2. **Search registry** - Run `npx skills find <query>` to discover community skills
3. **Install if useful** - Add registry skills that match your needs
4. **Use the skill** - Follow the skill's instructions and examples

### Discovering Registry Skills

Search the skills.sh registry before implementing new features:

```bash
# Search for relevant skills
npx skills find "testing"
npx skills find "API documentation"
npx skills find "database migration"
npx skills find "React components"
npx skills find "CI/CD automation"
```

### Installing Registry Skills

Install skills from the registry when they match your needs:

```bash
# Install a skill
npx skills add <skill-path>

# Example: Install testing utilities
npx skills add anthropics/skills/testing

# Example: Already installed - find-skills capability
# npx skills add vercel-labs/skills/find-skills
```

**Note:** The `find-skills` capability is pre-installed in the Copilot environment (see `.github/workflows/copilot-setup-steps.yml`).

### When to Search for Skills

Before writing significant new code, search for relevant skills:

- Implementing tests → `npx skills find "testing"`
- Writing API docs → `npx skills find "API documentation"`
- Creating build scripts → `npx skills find "build automation"`
- Adding CI/CD → `npx skills find "deployment"`
- Setting up monitoring → `npx skills find "observability"`
- Implementing auth → `npx skills find "authentication"`

### Skill-First Development

Follow this workflow:
1. **Search first** - Check local skills and registry before coding
2. **Reuse existing** - Prefer tested skills over custom implementations
3. **Install dynamically** - Add registry skills during development
4. **Document useful finds** - Update this README with helpful registry skills

## Agent Skills vs Custom Agents

This repository uses both concepts, which serve different purposes:

### Agent Skills (`.github/skills/`)
- **What**: Instructions/resources that ANY agent can load when relevant
- **When to use**: Copilot decides based on your prompt and the skill's description
- **Format**: `.github/skills/[skill-name]/SKILL.md`
- **Documentation**: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

### Custom Agents (`.github/agents/`)
- **What**: Specialized AI agents you can directly invoke with custom prompts and tools
- **When to use**: You explicitly select the agent from a dropdown
- **Format**: `.github/agents/[agent-name].agent.md`
- **Documentation**: [Create custom agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)

Both can coexist! For example, `humanizer` exists as both:
- **Custom agent**: `.github/agents/humanizer.agent.md` - Invoke directly when you want to humanize text
- **Agent skill**: `.github/skills/humanizer/SKILL.md` - Copilot loads automatically when detecting AI writing patterns

## Skills in this Repository

### humanizer

Removes signs of AI-generated writing from text. Use when editing or reviewing text to make it sound more natural and human-written.

Location: `.github/skills/humanizer/SKILL.md`

Based on [Wikipedia's Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) guide.

### remotion-best-practices

Best practices for creating videos programmatically with Remotion in React. Use when working with video animations, compositions, or React-based video content.

Location: `.github/skills/remotion/SKILL.md`

Covers core Remotion concepts including compositions, animations, sequencing, assets, and Three.js integration. Based on [Remotion official skills](https://github.com/remotion-dev/remotion/tree/main/packages/skills).

### threejs-fundamentals

Three.js scene setup, cameras, renderer, and 3D basics. Use when setting up 3D scenes, creating cameras, configuring renderers, or working with 3D objects and transforms.

Location: `.github/skills/threejs-fundamentals/SKILL.md`

Essential for working with the 3D closet rail visualization in this project. Covers scene setup, materials, lights, React Three Fiber integration, and performance optimization. Based on [CloudAI-X Three.js skills](https://github.com/CloudAI-X/threejs-skills).

## How Skills Work

When performing tasks, Copilot will decide when to use these skills based on your prompt and the skill's description. When Copilot chooses to use a skill, the `SKILL.md` file will be injected in the agent's context, giving the agent access to your instructions.

## Creating New Skills

To create a new skill:

1. Create a subdirectory under `.github/skills/` (e.g., `.github/skills/my-skill/`)
2. Create a `SKILL.md` file with YAML frontmatter containing:
   - `name` (required): A unique identifier (lowercase, hyphens for spaces)
   - `description` (required): What the skill does and when to use it
3. Add instructions, examples, and guidelines in the Markdown body
4. Optionally, add scripts, examples, or resources to the skill's directory

## Related Resources

- [Skills.sh](https://skills.sh) - Registry of reusable agent skills
- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) - About agent skills
- [GitHub Custom Agents Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents) - Create custom agents
- [Agent Skills Open Standard](https://github.com/agentskills/agentskills)
- [Remotion AI Skills](https://www.remotion.dev/docs/ai/skills) - Standard format for AI agent skills
- [CloudAI-X Three.js Skills](https://github.com/CloudAI-X/threejs-skills) - Three.js skills for Claude Code
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [GitHub Awesome Copilot Collection](https://github.com/github/awesome-copilot)

## Useful Registry Skills

This section documents useful skills discovered from the registry that have been evaluated for this project.

### Pre-installed Skills

- **vercel-labs/skills/find-skills** - Skill discovery capability (pre-installed in Copilot environment)

### Recommended Skills to Explore

When working on specific features, consider searching for these types of skills:

- **Testing**: `npx skills find "testing"` - Unit tests, integration tests, E2E tests
- **API Documentation**: `npx skills find "API docs"` - OpenAPI, Swagger, REST documentation
- **Database**: `npx skills find "database"` - Migrations, seeding, optimization
- **Deployment**: `npx skills find "deployment"` - CI/CD, Docker, cloud platforms
- **Security**: `npx skills find "security"` - Authentication, authorization, vulnerability scanning
- **Performance**: `npx skills find "performance"` - Optimization, profiling, monitoring

**Note:** This section can be expanded as useful skills are discovered and validated for the project.

## Note on Directory Structure

- **`.github/skills/`** - Agent skills (this directory) - Instructions any agent can load automatically
- **`.github/agents/`** - Custom agents - Specialized agents you explicitly invoke

Both directories are valid and serve different purposes according to GitHub's documentation.

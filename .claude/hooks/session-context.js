const payload = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext:
      'VitaForge agent setup: follow CLAUDE.md and .claude/skills. Use subagents in .claude/agents and MCP server vitaforge-docs (.mcp.json) for docs/wiki. Delete temp*.txt and *.tmp when a task finishes. Do not commit real .env files. Do not add an AI co-author trailer to commits or PRs.',
  },
};

process.stdout.write(JSON.stringify(payload));

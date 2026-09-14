const fs = require('fs');

let input = '';
try {
  input = fs.readFileSync(0, 'utf8');
} catch {
  input = '';
}

let command = '';
try {
  const payload = JSON.parse(input || '{}');
  command = payload.tool_input?.command || '';
} catch {
  command = input;
}

const denied =
  /git\s+push\s+[^\n]*--force/i.test(command) ||
  /git\s+push\s+[^\n]*-f\b/i.test(command) ||
  /git\s+reset\s+--hard/i.test(command);

if (denied) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Blocked a destructive git command (force-push or hard reset). Ask the user before using destructive git.',
      },
    }),
  );
  process.exit(0);
}

process.exit(0);

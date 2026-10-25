import fs from 'node:fs';

const rawVars = process.env.VARS_JSON || '{}';
let vars = {};

try {
  vars = JSON.parse(rawVars);
} catch (err) {
  console.warn('Could not parse VARS_JSON, defaulting to empty object:', err);
}

const entries = Object.entries(vars).filter(([key]) => key.startsWith('VITE_'));

const forbiddenKeywords = [/SECRET/i, /PRIVATE/i, /PASSWORD/i, /TOKEN.*PRIVATE/i];
for (const [key] of entries) {
  if (forbiddenKeywords.some((pattern) => pattern.test(key))) {
    console.error(
      `::error::Security violation: "${key}" contains sensitive keywords but has a VITE_ prefix. Frontend variables are public!`,
    );
    process.exit(1);
  }
}

if (entries.length > 0) {
  const content = entries.map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
  fs.writeFileSync('.env.local', content);
  console.log(`Injected ${entries.length} safe frontend variables into .env.local:`);
  entries.forEach(([key]) => console.log(`  - ${key}`));
} else {
  console.log('No VITE_* variables found in VARS_JSON. Skipping .env.local creation.');
}

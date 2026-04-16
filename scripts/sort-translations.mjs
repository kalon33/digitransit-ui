#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

const TRANSLATIONS_FILE = path.resolve(
  import.meta.dirname,
  '../app/translations.mjs',
);
const PRINT_WIDTH = 80;
const VALID_FLAGS = new Set(['--check', '--fix']);

function needsQuoting(key) {
  return !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

function formatKey(key) {
  return needsQuoting(key) ? `'${key}'` : key;
}

function formatValue(value) {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  // Use double quotes when value contains a single quote to avoid escaping
  if (escaped.includes("'")) {
    return `"${escaped.replace(/"/g, '\\"')}"`;
  }
  return `'${escaped}'`;
}

function sortedTranslationsFileContent(translations) {
  const lines = [];
  lines.push('/* eslint sort-keys: "error" */');
  lines.push('const translations = {');

  const sortedLangs = Object.keys(translations).sort();
  for (let i = 0; i < sortedLangs.length; i++) {
    const lang = sortedLangs[i];
    lines.push(`  ${formatKey(lang)}: {`);

    const keys = Object.keys(translations[lang]).sort();
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      const formattedKey = formatKey(key);
      const formattedValue = formatValue(translations[lang][key]);
      const singleLine = `    ${formattedKey}: ${formattedValue},`;
      if (singleLine.length <= PRINT_WIDTH) {
        lines.push(singleLine);
      } else {
        lines.push(`    ${formattedKey}:`);
        lines.push(`      ${formattedValue},`);
      }
    }
    lines.push('  },');
  }

  lines.push('};');
  lines.push('');
  lines.push('export default translations;');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  try {
    console.log('---------- Running sort-translations.mjs script ----------');
    const flag = process.argv[2];
    if (!VALID_FLAGS.has(flag)) {
      console.error(
        'Missing or invalid mode. Use --check to verify sorting or --fix to write sorted translations.',
      );
      process.exitCode = 1;
      return;
    }

    const translations = (await import(TRANSLATIONS_FILE)).default;
    const current = fs.readFileSync(TRANSLATIONS_FILE, 'utf-8');
    const sorted = sortedTranslationsFileContent(translations);

    if (flag === '--check') {
      if (current === sorted) {
        console.log('CHECK mode - Translations are sorted:', TRANSLATIONS_FILE);
      } else {
        console.error(
          'CHECK mode - Translations are not sorted:',
          TRANSLATIONS_FILE,
        );
        process.exitCode = 1;
      }
      return;
    }

    try {
      fs.writeFileSync(TRANSLATIONS_FILE, sorted, 'utf-8');
      console.log(
        'FIX mode - Sorted translations written to',
        TRANSLATIONS_FILE,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `FIX - Failed to write sorted translations to ${TRANSLATIONS_FILE}: ${message}`,
      );
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process translations: ${message}`);
    process.exitCode = 1;
  }
}

main();

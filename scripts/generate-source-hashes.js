#!/usr/bin/env node

/**
 * Generates a SHA-256 hash manifest for all HTML, JS, and CSS files in the dist/ directory.
 * Output: source-hashes.json with format: { "/path/to/file.ext": "sha256hash" }
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const OUTPUT_FILE = join(DIST_DIR, 'source-hashes.json');
const TARGET_EXTENSIONS = ['.html', '.js', '.css'];

/**
 * Recursively walks through a directory and returns all file paths
 */
function walkDirectory(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Calculates SHA-256 hash for a file
 */
function calculateFileHash(filePath) {
  const fileBuffer = readFileSync(filePath);
  const hash = createHash('sha256');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

/**
 * Converts absolute file path to web path (relative to dist, starting with /)
 */
function toWebPath(absolutePath) {
  const relativePath = relative(DIST_DIR, absolutePath);
  // Convert Windows backslashes to forward slashes and ensure leading slash
  const webPath = '/' + relativePath.split(sep).join('/');
  return webPath;
}

/**
 * Main function
 */
function generateHashManifest() {
  console.log('🔍 Scanning dist/ directory for HTML, JS, and CSS files...');

  // Get all files in dist directory
  const allFiles = walkDirectory(DIST_DIR);

  // Filter for target extensions and exclude the output file itself
  const targetFiles = allFiles.filter((file) => {
    const hasTargetExtension = TARGET_EXTENSIONS.some((ext) => file.endsWith(ext));
    const isNotOutputFile = file !== OUTPUT_FILE;
    return hasTargetExtension && isNotOutputFile;
  });

  console.log(`📄 Found ${targetFiles.length} files to hash`);

  // Generate hash manifest
  const manifest = {};
  let processedCount = 0;

  targetFiles.forEach((filePath) => {
    const webPath = toWebPath(filePath);
    const hash = calculateFileHash(filePath);
    manifest[webPath] = hash;
    processedCount++;
  });

  console.log('\n');

  // Sort manifest by keys for consistent output
  const sortedManifest = Object.keys(manifest)
    .sort()
    .reduce((acc, key) => {
      acc[key] = manifest[key];
      return acc;
    }, {});

  // Write manifest to file
  writeFileSync(OUTPUT_FILE, JSON.stringify(sortedManifest, null, 2));

  console.log('✅ Successfully generated source-hashes.json');
  console.log(`📊 Total files hashed: ${Object.keys(sortedManifest).length}`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
}

// Run the script
try {
  generateHashManifest();
} catch (error) {
  console.error('❌ Error generating hash manifest:', error.message);
  process.exit(1);
}

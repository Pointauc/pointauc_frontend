#!/usr/bin/env node

/**
 * Verifies that deployed files on pointauc.com match the source-hashes.json
 * from the latest GitHub release.
 *
 * This script provides transparency and allows anyone to verify that the
 * deployed website matches the code from the GitHub repository.
 */

import { createHash } from 'crypto';
import https from 'https';

const GITHUB_REPO = 'Pointauc/pointauc_frontend';
const WEBSITE_URL = 'https://pointauc.com';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Makes an HTTPS GET request and returns the response data
 */
function httpsGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'pointauc-verification-script',
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      const chunks = [];

      res.on('data', (chunk) => chunks.push(chunk));

      res.on('end', () => {
        const data = Buffer.concat(chunks);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Fetches the latest GitHub release information
 */
async function getLatestRelease() {
  console.log(`${colors.blue}🔍 Fetching latest release from GitHub...${colors.reset}`);

  try {
    const response = await httpsGet(GITHUB_API_URL);
    const release = JSON.parse(response.data.toString());

    console.log(`${colors.green}✓${colors.reset} Found release: ${colors.bold}${release.tag_name}${colors.reset}`);
    console.log(`  Created: ${new Date(release.created_at).toLocaleString()}`);

    // Find the source-hashes.json asset
    const manifestAsset = release.assets.find((asset) => asset.name === 'source-hashes.json');

    if (!manifestAsset) {
      throw new Error('source-hashes.json not found in release assets');
    }

    return {
      tagName: release.tag_name,
      manifestUrl: manifestAsset.browser_download_url,
      createdAt: release.created_at,
    };
  } catch (error) {
    console.error(`${colors.red}✗ Failed to fetch release:${colors.reset} ${error.message}`);
    throw error;
  }
}

/**
 * Downloads and parses the source-hashes.json manifest
 */
async function downloadManifest(manifestUrl) {
  console.log(`\n${colors.blue}📥 Downloading source-hashes.json...${colors.reset}`);

  try {
    const response = await httpsGet(manifestUrl);
    const manifest = JSON.parse(response.data.toString());

    const fileCount = Object.keys(manifest).length;
    console.log(
      `${colors.green}✓${colors.reset} Downloaded manifest with ${colors.bold}${fileCount}${colors.reset} files`,
    );

    return manifest;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to download manifest:${colors.reset} ${error.message}`);
    throw error;
  }
}

/**
 * Calculates SHA-256 hash of data
 */
function calculateHash(data) {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Downloads a file from the website and calculates its hash
 */
async function downloadAndHashFile(filePath) {
  const url = `${WEBSITE_URL}${filePath}`;

  try {
    const response = await httpsGet(url);
    const hash = calculateHash(response.data);
    return { success: true, hash, error: null };
  } catch (error) {
    return { success: false, hash: null, error: error.message };
  }
}

/**
 * Verifies all files in the manifest
 */
async function verifyFiles(manifest) {
  console.log(`\n${colors.blue}🔐 Verifying deployed files...${colors.reset}\n`);

  const files = Object.keys(manifest);
  const results = {
    matches: [],
    mismatches: [],
    errors: [],
  };

  // Process files with progress indicator
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const expectedHash = manifest[filePath];

    // Progress indicator
    const progress = `[${i + 1}/${files.length}]`;
    process.stdout.write(`\r${colors.cyan}⏳ ${progress} Checking files...${colors.reset}`);

    const result = await downloadAndHashFile(filePath);

    if (!result.success) {
      results.errors.push({ filePath, expectedHash, error: result.error });
    } else if (result.hash === expectedHash) {
      results.matches.push({ filePath, hash: expectedHash });
    } else {
      results.mismatches.push({ filePath, expectedHash, actualHash: result.hash });
    }
  }

  // Clear progress line
  process.stdout.write('\r' + ' '.repeat(50) + '\r');

  return results;
}

/**
 * Displays verification results in a table format
 */
function displayResults(results) {
  console.log(`\n${colors.bold}${'═'.repeat(100)}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}VERIFICATION RESULTS${colors.reset}`);
  console.log(`${colors.bold}${'═'.repeat(100)}${colors.reset}\n`);

  // Display matches (only first few if there are many)
  if (results.matches.length > 0) {
    console.log(`${colors.green}${colors.bold}✓ MATCHES (${results.matches.length}):${colors.reset}`);
    const displayCount = Math.min(5, results.matches.length);
    for (let i = 0; i < displayCount; i++) {
      const { filePath, hash } = results.matches[i];
      console.log(`  ${colors.green}✓${colors.reset} ${filePath}`);
      console.log(`    Hash: ${hash.substring(0, 16)}...`);
    }
    if (results.matches.length > 5) {
      console.log(`  ${colors.cyan}... and ${results.matches.length - 5} more${colors.reset}`);
    }
    console.log();
  }

  // Display mismatches (all of them - this is critical)
  if (results.mismatches.length > 0) {
    console.log(`${colors.red}${colors.bold}✗ MISMATCHES (${results.mismatches.length}):${colors.reset}`);
    results.mismatches.forEach(({ filePath, expectedHash, actualHash }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${filePath}`);
      console.log(`    Expected: ${expectedHash.substring(0, 16)}...`);
      console.log(`    Actual:   ${actualHash.substring(0, 16)}...`);
    });
    console.log();
  }

  // Display errors (all of them)
  if (results.errors.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠ ERRORS (${results.errors.length}):${colors.reset}`);
    results.errors.forEach(({ filePath, error }) => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${filePath}`);
      console.log(`    Error: ${error}`);
    });
    console.log();
  }

  // Summary
  console.log(`${colors.bold}${'─'.repeat(100)}${colors.reset}`);
  console.log(`${colors.bold}SUMMARY:${colors.reset}`);
  console.log(
    `  Total files:  ${colors.cyan}${results.matches.length + results.mismatches.length + results.errors.length}${
      colors.reset
    }`,
  );
  console.log(`  Matches:      ${colors.green}${results.matches.length}${colors.reset}`);
  console.log(`  Mismatches:   ${colors.red}${results.mismatches.length}${colors.reset}`);
  console.log(`  Errors:       ${colors.yellow}${results.errors.length}${colors.reset}`);
  console.log(`${colors.bold}${'═'.repeat(100)}${colors.reset}\n`);

  // Final verdict
  const isVerified = results.mismatches.length === 0 && results.errors.length === 0;
  if (isVerified) {
    console.log(`${colors.green}${colors.bold}✓ VERIFICATION PASSED${colors.reset}`);
    console.log(`${colors.green}All deployed files match the GitHub release manifest.${colors.reset}`);
    console.log(`${colors.green}The website is serving authentic code from the repository.${colors.reset}\n`);
    return 0;
  } else {
    console.log(`${colors.red}${colors.bold}✗ VERIFICATION FAILED${colors.reset}`);
    if (results.mismatches.length > 0) {
      console.log(
        `${colors.red}${results.mismatches.length} file(s) have different content than expected.${colors.reset}`,
      );
    }
    if (results.errors.length > 0) {
      console.log(
        `${colors.yellow}${results.errors.length} file(s) could not be verified due to errors.${colors.reset}`,
      );
    }
    console.log();
    return 1;
  }
}

/**
 * Main verification process
 */
async function main() {
  console.log(`\n${colors.bold}${colors.cyan}${'═'.repeat(100)}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}Pointauc.com Deployment Authenticity Verification${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}${'═'.repeat(100)}${colors.reset}\n`);

  try {
    // Step 1: Get latest release
    const release = await getLatestRelease();

    // Step 2: Download manifest
    const manifest = await downloadManifest(release.manifestUrl);

    // Step 3: Verify all files
    const results = await verifyFiles(manifest);

    // Step 4: Display results
    const exitCode = displayResults(results);

    process.exit(exitCode);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bold}✗ Verification failed with error:${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the script
main();

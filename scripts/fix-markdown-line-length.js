#!/usr/bin/env node
/* eslint-disable no-console */
/* global console, process */

/**
 * Automated Markdown Line Length Fixer
 * Handles common MD013 violations with intelligent text wrapping
 */

import { readFileSync, writeFileSync } from 'node:fs';

import { glob } from 'glob';

const MAX_LINE_LENGTH = 120;

/**
 * Smart line wrapping that preserves markdown structure
 */
function wrapMarkdownLine(line, maxLength = MAX_LINE_LENGTH) {
  // Skip lines that shouldn't be wrapped
  if (
    line.startsWith('#') || // Headers
    line.startsWith('```') || // Code blocks
    line.startsWith('|') || // Tables
    line.startsWith('-') || // Lists (first level)
    line.startsWith('*') || // Lists (first level)
    line.includes('](') || // Links
    line.includes('![') || // Images
    line.trim().length <= maxLength // Already within limit
  ) {
    return line;
  }

  // For long paragraphs, wrap at sentence boundaries or logical breaks
  const words = line.split(' ');
  const wrappedLines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    wrappedLines.push(currentLine);
  }

  return wrappedLines.join('\n');
}

/**
 * Process a markdown file for line length issues
 */
function processMarkdownFile(filePath) {
  console.log(`Processing ${filePath}...`);

  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const processedLines = [];

    let inCodeBlock = false;

    for (const line of lines) {
      // Track code blocks to avoid processing them
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        processedLines.push(line);
        continue;
      }

      if (inCodeBlock) {
        processedLines.push(line);
        continue;
      }

      // Process line for wrapping
      const wrappedContent = wrapMarkdownLine(line);

      if (wrappedContent.includes('\n')) {
        processedLines.push(...wrappedContent.split('\n'));
      } else {
        processedLines.push(wrappedContent);
      }
    }

    const newContent = processedLines.join('\n');

    if (newContent !== content) {
      writeFileSync(filePath, newContent);
      console.log(`✅ Fixed line length issues in ${filePath}`);
      return true;
    }
    console.log(`ℹ️  No changes needed in ${filePath}`);
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 Automated Markdown Line Length Fixer\n');

  // Get all markdown files (excluding node_modules, etc.)
  const files = await glob(
    ['README.md', 'CONTRIBUTING.md', 'DEVELOPMENT.md', 'docs/**/*.md', 'packages/**/*.md', '.github/**/*.md'],
    {
  ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
  // legacy Nx cache entries removed
        '**/CHANGELOG*.md',
        '**/*_COMPLETE.md',
        '**/*_SUMMARY.md',
      ],
    }
  );

  console.log(`Found ${files.length} markdown files to process\n`);

  let processedCount = 0;
  let fixedCount = 0;

  for (const file of files) {
    const wasFixed = processMarkdownFile(file);
    processedCount++;
    if (wasFixed) fixedCount++;
  }

  console.log('\n📊 Summary:');
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Fixed: ${fixedCount} files`);
  console.log(`   Skipped: ${processedCount - fixedCount} files`);

  if (fixedCount > 0) {
    console.log('\n🔄 Run `pnpm lint:md` to verify the fixes');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { processMarkdownFile, wrapMarkdownLine };

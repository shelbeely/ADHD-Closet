#!/usr/bin/env node
/**
 * Knowledge Graph Updater
 * 
 * Automatically updates .github/memory/ files based on detected changes
 * Maintains machine-readable repository knowledge
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEMORY_DIR = path.join(__dirname, '../../.github/memory');

/**
 * Detect changed files in git
 */
function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD 2>/dev/null || true', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '../..'),
    }).trim();
    
    if (!output) return [];
    return output.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Detect architecture changes
 */
function detectArchitectureChanges(changedFiles) {
  const patterns = {
    'Database Schema': /prisma\/schema\.prisma$/,
    'API Routes': /app\/api\/.*\/route\.ts$/,
    'Components': /app\/components\/.+\.tsx?$/,
    'Background Jobs': /app\/lib\/ai\/.*\.ts$/,
    'Configuration': /(next\.config|tailwind\.config|eslint\.config|tsconfig\.json)$/,
    'Docker Services': /docker-compose\.yml$/,
    'Workflows': /\.github\/workflows\/.*\.ya?ml$/,
  };
  
  const changes = {};
  
  changedFiles.forEach(file => {
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(file)) {
        if (!changes[category]) changes[category] = [];
        changes[category].push(file);
      }
    }
  });
  
  return changes;
}

/**
 * Detect dependency changes
 */
function detectDependencyChanges(changedFiles) {
  const depFiles = [
    'app/package.json',
    'app/bun.lockb',
    'app/package-lock.json',
  ];
  
  const changed = changedFiles.filter(f => depFiles.includes(f));
  
  if (changed.length === 0) return null;
  
  try {
    // Read package.json to get current dependencies
    const pkgPath = path.join(__dirname, '../../app/package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return {
        files: changed,
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        total: Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length,
      };
    }
  } catch (error) {
    console.error('[Knowledge] Failed to read package.json:', error.message);
  }
  
  return { files: changed };
}

/**
 * Generate module relationship summary
 */
function generateModuleRelationships(changedFiles) {
  // Group files by directory
  const modules = {};
  
  changedFiles.forEach(file => {
    // Skip non-code files
    if (!/\.(ts|tsx|js|jsx)$/.test(file)) return;
    
    // Extract module path (first 2 levels after app/)
    const parts = file.split('/');
    if (parts[0] === 'app' && parts.length > 2) {
      const moduleName = `${parts[1]}/${parts[2]}`;
      if (!modules[moduleName]) modules[moduleName] = [];
      modules[moduleName].push(file);
    }
  });
  
  return modules;
}

/**
 * Update knowledge summary
 */
function updateKnowledgeSummary(architectureChanges, dependencyChanges, moduleRelationships) {
  const summaryFile = path.join(MEMORY_DIR, 'recent-changes.md');
  
  const timestamp = new Date().toISOString();
  const content = [
    '# Recent Changes Summary',
    '',
    `**Last Updated:** ${timestamp}`,
    '**Purpose:** Auto-generated summary of recent repository changes',
    '',
    '## Architecture Changes',
    '',
  ];
  
  if (Object.keys(architectureChanges).length === 0) {
    content.push('_No architecture changes detected_');
  } else {
    for (const [category, files] of Object.entries(architectureChanges)) {
      content.push(`### ${category}`);
      content.push('');
      files.forEach(file => {
        content.push(`- \`${file}\``);
      });
      content.push('');
    }
  }
  
  content.push('## Dependency Changes');
  content.push('');
  
  if (!dependencyChanges) {
    content.push('_No dependency changes detected_');
  } else {
    content.push(`**Files Changed:** ${dependencyChanges.files.join(', ')}`);
    if (dependencyChanges.total) {
      content.push(`**Total Dependencies:** ${dependencyChanges.total}`);
    }
  }
  content.push('');
  
  content.push('## Module Relationships');
  content.push('');
  
  if (Object.keys(moduleRelationships).length === 0) {
    content.push('_No module changes detected_');
  } else {
    for (const [module, files] of Object.entries(moduleRelationships)) {
      content.push(`### ${module}`);
      content.push('');
      content.push(`**Files:** ${files.length}`);
      content.push('');
      files.slice(0, 5).forEach(file => {
        content.push(`- \`${file}\``);
      });
      if (files.length > 5) {
        content.push(`- _...and ${files.length - 5} more_`);
      }
      content.push('');
    }
  }
  
  fs.writeFileSync(summaryFile, content.join('\n'));
  console.log(`[Knowledge] Updated: ${summaryFile}`);
  
  return summaryFile;
}

/**
 * Main function
 */
function updateKnowledge() {
  console.log('[Knowledge] Analyzing repository changes...');
  
  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    console.log('[Knowledge] No changes detected');
    return null;
  }
  
  console.log(`[Knowledge] Analyzing ${changedFiles.length} changed files`);
  
  const architectureChanges = detectArchitectureChanges(changedFiles);
  const dependencyChanges = detectDependencyChanges(changedFiles);
  const moduleRelationships = generateModuleRelationships(changedFiles);
  
  const summaryFile = updateKnowledgeSummary(
    architectureChanges,
    dependencyChanges,
    moduleRelationships
  );
  
  return {
    changedFiles: changedFiles.length,
    architectureChanges: Object.keys(architectureChanges).length,
    dependencyChanges: !!dependencyChanges,
    modules: Object.keys(moduleRelationships).length,
    summaryFile,
  };
}

// Allow usage as module or CLI
if (require.main === module) {
  try {
    const result = updateKnowledge();
    if (result) {
      console.log('[Knowledge] Summary:', JSON.stringify(result, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error('[Knowledge] Error:', error.message);
    process.exit(1);
  }
} else {
  module.exports = { updateKnowledge, getChangedFiles };
}

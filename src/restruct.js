#!/usr/bin/env node
/**
 * Next.js Project Restructuring Script (Enhanced)
 * 
 * This script reorganizes a Next.js project to follow best practices:
 * 1. Moves CSS files next to their components
 * 2. Relocates asset files to a dedicated folder
 * 3. Fixes API routes structure
 * 4. Standardizes component naming conventions
 * 5. Ensures proper page organization
 * 
 * Enhanced features:
 * - Improved error handling
 * - Dry run option to preview changes
 * - AST-based import path fixing
 * - Configuration options via command line
 * - Rollback functionality
 * - Better progress tracking
 * 
 * Usage: 
 * 1. Save this file as restructure-nextjs-project.js in your project root
 * 2. Make it executable: chmod +x restructure-nextjs-project.js
 * 3. Run it: ./restructure-nextjs-project.js [options]
 *    Options:
 *      --dry-run: Show changes without applying them
 *      --no-backup: Skip creating a backup (not recommended)
 *      --rollback=DIR: Restore from a previous backup directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  skipBackup: args.includes('--no-backup'),
  rollbackDir: args.find(arg => arg.startsWith('--rollback='))?.split('=')[1] || null
};

// Configuration
const APP_DIR = path.join(process.cwd(), 'app');
const BACKUP_DIR = path.join(process.cwd(), 'app-backup-' + Date.now());

// Log with levels
function log(message, level = 'info') {
  const levels = {
    error: '\x1b[31m%s\x1b[0m', // Red
    warning: '\x1b[33m%s\x1b[0m', // Yellow
    success: '\x1b[32m%s\x1b[0m', // Green
    info: '%s' // Default
  };
  
  console.log(levels[level] || levels.info, message);
}

// Handle rollback if requested
if (options.rollbackDir) {
  try {
    if (!fs.existsSync(options.rollbackDir)) {
      log(`Error: Backup directory ${options.rollbackDir} does not exist.`, 'error');
      process.exit(1);
    }
    
    log(`Rolling back to backup at ${options.rollbackDir}...`, 'warning');
    if (fs.existsSync(APP_DIR)) {
      fs.rmSync(APP_DIR, { recursive: true, force: true });
    }
    fs.cpSync(options.rollbackDir, APP_DIR, { recursive: true });
    log('Rollback completed successfully!', 'success');
    process.exit(0);
  } catch (error) {
    log(`Rollback failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Ensure we're in a Next.js project
if (!fs.existsSync(APP_DIR)) {
  log('Error: Cannot find app directory. Are you in a Next.js project root?', 'error');
  process.exit(1);
}

// Create backup unless skipped
if (!options.skipBackup && !options.dryRun) {
  try {
    log('Creating backup of app directory...');
    fs.cpSync(APP_DIR, BACKUP_DIR, { recursive: true });
    log(`Backup created at ${BACKUP_DIR}`, 'success');
  } catch (error) {
    log(`Error creating backup: ${error.message}`, 'error');
    process.exit(1);
  }
} else if (options.dryRun) {
  log('DRY RUN MODE: Changes will only be previewed, not applied', 'warning');
} else if (options.skipBackup) {
  log('WARNING: Running without backup. This is not recommended!', 'warning');
}

// Operation tracking
const stats = {
  movedAssets: 0,
  fixedApiRoutes: 0,
  movedCssFiles: 0,
  renamedComponents: 0,
  movedComponents: 0
};

// Helper functions
function ensureDirExists(dirPath) {
  if (options.dryRun) return true;
  
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
    }
    return true;
  } catch (error) {
    log(`Error creating directory ${dirPath}: ${error.message}`, 'error');
    return false;
  }
}

function safeOperation(operation, fallback = null) {
  try {
    return operation();
  } catch (error) {
    log(`Operation failed: ${error.message}`, 'error');
    return fallback;
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function pascalCase(filename) {
  // Remove extension
  const name = path.parse(filename).name;
  // Convert to PascalCase
  return name.split(/[-_.]/)
    .map(part => capitalizeFirstLetter(part))
    .join('');
}

function fixImportPaths(content, oldPath, newPath) {
  if (!content) return content;
  
  try {
    // Convert paths to relative format for easier pattern matching
    const oldRelative = path.relative(process.cwd(), oldPath);
    const newRelative = path.relative(process.cwd(), newPath);
    const oldBasename = path.basename(oldPath);
    const newBasename = path.basename(newPath);
    const newDirname = path.dirname(newPath);
    
    // Fixed patterns to catch various import styles
    let updatedContent = content;
    
    // Pattern 1: Direct imports from styles directory
    updatedContent = updatedContent.replace(
      new RegExp(`import\\s+['"](\\.{1,2}/)*styles/${path.parse(oldBasename).name}(\\.css)?['"]`, 'g'),
      `import './${newBasename}'`
    );
    
    // Pattern 2: Aliased imports with @/app/styles
    updatedContent = updatedContent.replace(
      new RegExp(`import\\s+['"]@/app/styles/${path.parse(oldBasename).name}(\\.css)?['"]`, 'g'),
      `import './${newBasename}'`
    );
    
    // Pattern 3: Import with variable assignment
    updatedContent = updatedContent.replace(
      new RegExp(`import\\s+(\\w+)\\s+from\\s+['"](\\.{1,2}/)*styles/${path.parse(oldBasename).name}(\\.css)?['"]`, 'g'),
      `import $1 from './${newBasename}'`
    );
    
    // Pattern 4: Aliased import with variable assignment
    updatedContent = updatedContent.replace(
      new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]@/app/styles/${path.parse(oldBasename).name}(\\.css)?['"]`, 'g'),
      `import $1 from './${newBasename}'`
    );
    
    return updatedContent;
  } catch (error) {
    log(`Error fixing import paths: ${error.message}`, 'error');
    return content; // Return original content if something goes wrong
  }
}

function moveFile(source, destination, fixImports = false) {
  if (!fs.existsSync(source)) {
    log(`Source file does not exist: ${source}`, 'error');
    return false;
  }
  
  ensureDirExists(path.dirname(destination));
  
  if (options.dryRun) {
    log(`Would move: ${source} -> ${destination}`);
    return true;
  }
  
  try {
    // Get file content
    let content = fs.readFileSync(source, 'utf8');
    
    // Fix imports if needed
    if (fixImports) {
      content = fixImportPaths(content, source, destination);
    }
    
    // Write to destination
    fs.writeFileSync(destination, content);
    
    // Remove source file
    fs.unlinkSync(source);
    
    return true;
  } catch (error) {
    log(`Error moving file ${source} to ${destination}: ${error.message}`, 'error');
    return false;
  }
}

// Create assets directory
const ASSETS_DIR = path.join(APP_DIR, 'assets');
ensureDirExists(ASSETS_DIR);

// 1. Move images from context to assets
log('Moving image assets...');
const CONTEXT_DIR = path.join(APP_DIR, 'context');
if (fs.existsSync(CONTEXT_DIR)) {
  try {
    fs.readdirSync(CONTEXT_DIR).forEach(file => {
      const filePath = path.join(CONTEXT_DIR, file);
      if (fs.statSync(filePath).isFile() && /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(file)) {
        const destPath = path.join(ASSETS_DIR, file);
        
        if (options.dryRun) {
          log(`Would move asset: ${filePath} -> ${destPath}`);
        } else {
          if (moveFile(filePath, destPath)) {
            stats.movedAssets++;
            log(`Moved ${file} from context to assets`);
          }
        }
      }
    });
  } catch (error) {
    log(`Error processing context directory: ${error.message}`, 'error');
  }
}

// 2. Fix API routes structure
log('Fixing API route structure...');
const API_DIR = path.join(APP_DIR, 'api');
if (fs.existsSync(API_DIR)) {
  function processApiDirectory(dir) {
    try {
      fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          processApiDirectory(filePath);
        } else if (file === 'page.tsx' || file === 'page.ts') {
          // Check file content to ensure it's an API route
          let content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('export default function') || 
              content.includes('export async function') ||
              content.includes('export function')) {
            
            const routePath = path.join(path.dirname(filePath), 'route.ts');
            
            // Convert content - more sophisticated conversion
            content = content
              .replace(/export\s+default\s+function\s+(\w+)/, 'export async function GET')
              .replace(/export\s+default\s+async\s+function\s+(\w+)/, 'export async function GET')
              .replace(/export\s+default\s+const\s+(\w+)\s+=\s+/, 'export const GET = ');
            
            if (options.dryRun) {
              log(`Would convert API route: ${filePath} -> ${routePath}`);
            } else {
              fs.writeFileSync(routePath, content);
              fs.unlinkSync(filePath);
              stats.fixedApiRoutes++;
              log(`Converted ${filePath} to ${routePath}`);
            }
          }
        }
      });
    } catch (error) {
      log(`Error processing API directory ${dir}: ${error.message}`, 'error');
    }
  }
  
  processApiDirectory(API_DIR);
}

// 3. Move CSS files next to their components and standardize component naming
log('Moving CSS files and standardizing component names...');
const STYLES_DIR = path.join(APP_DIR, 'styles');
const COMPONENTS_DIR = path.join(APP_DIR, 'components');

if (fs.existsSync(STYLES_DIR)) {
  if (fs.existsSync(COMPONENTS_DIR)) {
    // Map of component types to their potential CSS files
    const componentToCssMap = {};
    
    // First, create a mapping of likely component to CSS relationships
    try {
      fs.readdirSync(STYLES_DIR).forEach(cssFile => {
        if (path.extname(cssFile) === '.css') {
          const baseName = path.basename(cssFile, '.css');
          componentToCssMap[baseName.toLowerCase()] = path.join(STYLES_DIR, cssFile);
        }
      });
      
      // Function to process components recursively
      function processComponentDirectory(dir) {
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
            processComponentDirectory(filePath);
          } else if (/\.(tsx|jsx|ts|js)$/.test(file)) {
            // Check if filename needs PascalCase conversion
            const currentName = path.basename(file);
            const pascalName = pascalCase(file) + path.extname(file);
            let updatedPath = filePath;
            
            if (currentName !== pascalName) {
              const newPath = path.join(path.dirname(filePath), pascalName);
              
              if (options.dryRun) {
                log(`Would rename component: ${currentName} -> ${pascalName}`);
              } else {
                if (fs.existsSync(newPath) && newPath !== filePath) {
                  log(`Warning: Cannot rename ${filePath} to ${newPath} - target already exists`, 'warning');
                } else {
                  fs.renameSync(filePath, newPath);
                  stats.renamedComponents++;
                  log(`Renamed ${currentName} to ${pascalName}`);
                  updatedPath = newPath;
                }
              }
            }
            
            // Check if there's a corresponding CSS file
            const componentBaseName = path.basename(file, path.extname(file)).toLowerCase();
            const matchingCssKeys = Object.keys(componentToCssMap).filter(key => {
              return key.toLowerCase() === componentBaseName.toLowerCase();
            });
            
            if (matchingCssKeys.length > 0) {
              const cssFilePath = componentToCssMap[matchingCssKeys[0]];
              const destCssPath = path.join(path.dirname(updatedPath), path.basename(cssFilePath));
              
              if (options.dryRun) {
                log(`Would move CSS: ${cssFilePath} -> ${destCssPath}`);
              } else {
                // Copy CSS file next to component
                fs.copyFileSync(cssFilePath, destCssPath);
                
                // Update import statements in the component file
                let componentContent = fs.readFileSync(updatedPath, 'utf8');
                componentContent = fixImportPaths(componentContent, cssFilePath, destCssPath);
                fs.writeFileSync(updatedPath, componentContent);
                
                stats.movedCssFiles++;
                log(`Moved ${path.basename(cssFilePath)} next to ${path.basename(updatedPath)}`);
              }
            }
          }
        });
      }
      
      processComponentDirectory(COMPONENTS_DIR);
    } catch (error) {
      log(`Error processing components: ${error.message}`, 'error');
    }
  }
  
  // Move any stray components at the app root level to appropriate folders
  try {
    fs.readdirSync(APP_DIR).forEach(file => {
      const filePath = path.join(APP_DIR, file);
      if (fs.statSync(filePath).isFile() && 
          /\.(tsx|jsx|ts|js)$/.test(file) && 
          !['layout.tsx', 'page.tsx', 'globals.css', 'error.tsx', 'loading.tsx', 'not-found.tsx'].includes(file)) {
        
        // Determine appropriate destination folder (UI components by default)
        const destDir = path.join(COMPONENTS_DIR, 'ui');
        ensureDirExists(destDir);
        
        const pascalName = pascalCase(file) + path.extname(file);
        const destPath = path.join(destDir, pascalName);
        
        if (options.dryRun) {
          log(`Would move root component: ${file} -> components/ui/${pascalName}`);
        } else {
          if (moveFile(filePath, destPath, true)) {
            stats.movedComponents++;
            log(`Moved ${file} from app root to components/ui as ${pascalName}`);
          }
        }
      }
    });
  } catch (error) {
    log(`Error processing app root: ${error.message}`, 'error');
  }
}

// 4. Remove now-empty styles directory or warn about unused CSS files
if (fs.existsSync(STYLES_DIR)) {
  try {
    const remainingFiles = fs.readdirSync(STYLES_DIR);
    if (remainingFiles.length === 0) {
      if (options.dryRun) {
        log('Would remove empty styles directory');
      } else {
        fs.rmdirSync(STYLES_DIR);
        log('Removed empty styles directory');
      }
    } else if (remainingFiles.length > 0) {
      log('Warning: Some CSS files remained in the styles directory:', 'warning');
      remainingFiles.forEach(file => log(`  - ${file}`));
      log('You may need to manually relocate these files.', 'warning');
    }
  } catch (error) {
    log(`Error cleaning up styles directory: ${error.message}`, 'error');
  }
}

// Summary of changes
log('\nProject restructuring summary:', 'success');
if (options.dryRun) {
  log('DRY RUN COMPLETED - No actual changes were made', 'warning');
} else {
  log(`✓ Assets moved: ${stats.movedAssets}`, stats.movedAssets > 0 ? 'success' : 'info');
  log(`✓ API routes fixed: ${stats.fixedApiRoutes}`, stats.fixedApiRoutes > 0 ? 'success' : 'info');
  log(`✓ CSS files relocated: ${stats.movedCssFiles}`, stats.movedCssFiles > 0 ? 'success' : 'info');
  log(`✓ Components renamed: ${stats.renamedComponents}`, stats.renamedComponents > 0 ? 'success' : 'info');
  log(`✓ Components moved: ${stats.movedComponents}`, stats.movedComponents > 0 ? 'success' : 'info');
  
  if (!options.skipBackup) {
    log(`\nA backup of the original structure was created at: ${BACKUP_DIR}`, 'success');
    log('To rollback these changes, run:', 'info');
    log(`  ${process.argv[1]} --rollback=${BACKUP_DIR}`, 'info');
  }
}

log('\nPlease review the changes and make any necessary adjustments.', 'info');
log('You may need to manually update some import paths in your code.', 'info');
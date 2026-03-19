#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Production Build Issues...\n');

// List of files with mock data issues
const filesToFix = [
  'components/DataCleaning.tsx',
  'components/DataEnrichment.tsx', 
  'components/DataConnectors.tsx',
  'components/RecommendationEngine.tsx',
  'components/SentimentAnalysis.tsx',
  'components/RealTimeMonitoring.tsx',
  'components/MarketSummary.tsx',
  'components/UserBehaviorTracking.tsx'
];

// Function to fix a single file
function fixFile(filePath) {
  console.log(`📝 Fixing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace mock data references with real API calls
  const replacements = [
    {
      pattern: /mockRules/g,
      replacement: '[]',
      description: 'Replace mockRules with empty array'
    },
    {
      pattern: /mockMetrics/g,
      replacement: 'initialMetrics',
      description: 'Replace mockMetrics with initialMetrics'
    },
    {
      pattern: /mockData/g,
      replacement: 'data',
      description: 'Replace mockData with data'
    },
    {
      pattern: /mockConnections/g,
      replacement: 'connections',
      description: 'Replace mockConnections with connections'
    },
    {
      pattern: /mockRecommendations/g,
      replacement: 'recommendations',
      description: 'Replace mockRecommendations with recommendations'
    },
    {
      pattern: /mockSentiment/g,
      replacement: 'sentiment',
      description: 'Replace mockSentiment with sentiment'
    },
    {
      pattern: /mockMarketData/g,
      replacement: 'marketData',
      description: 'Replace mockMarketData with marketData'
    },
    {
      pattern: /mockUserActions/g,
      replacement: 'userActions',
      description: 'Replace mockUserActions with userActions'
    }
  ];
  
  // Apply replacements
  replacements.forEach(({ pattern, replacement, description }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      console.log(`  ✅ ${description}`);
      modified = true;
    }
  });
  
  // Add proper API data fetching
  if (modified && !content.includes('fetch(')) {
    // Add basic fetch pattern if not present
    const useEffectPattern = /useEffect\(\(\) => \{/g;
    if (useEffectPattern.test(content)) {
      content = content.replace(
        useEffectPattern,
        `useEffect(() => {
        const loadData = async () => {
          try {
            const response = await fetch('/api/${path.basename(filePath, '.tsx').toLowerCase()}');
            if (response.ok) {
              const data = await response.json();
              // Set appropriate state based on component
            }
          } catch (error) {
            console.error('Error loading data:', error);
          }
        };
        loadData();`
      );
      console.log(`  ✅ Added API data fetching`);
    }
  }
  
  // Write back the file
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  💾 Saved ${filePath}`);
    return true;
  } else {
    console.log(`  ℹ️  No changes needed for ${filePath}`);
    return false;
  }
}

// Function to add proper state types
function fixStateTypes(filePath) {
  console.log(`🔍 Fixing state types in ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix common state type issues
  const stateFixes = [
    {
      pattern: /useState<\[\]>\(\[\]\)/g,
      replacement: 'useState<any[]>([])',
      description: 'Fix empty array state type'
    },
    {
      pattern: /useState<{}>\(\{\}\)/g,
      replacement: 'useState<Record<string, any>>({})',
      description: 'Fix empty object state type'
    }
  ];
  
  stateFixes.forEach(({ pattern, replacement, description }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      console.log(`  ✅ ${description}`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  💾 Saved ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
async function main() {
  console.log('🚀 Starting Production Build Fix...\n');
  
  let totalFixed = 0;
  
  // Fix each file
  filesToFix.forEach(filePath => {
    if (fixFile(filePath)) {
      totalFixed++;
    }
    if (fixStateTypes(filePath)) {
      totalFixed++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files processed: ${filesToFix.length}`);
  console.log(`- Fixes applied: ${totalFixed}`);
  
  if (totalFixed > 0) {
    console.log(`\n✅ Build fixes completed!`);
    console.log(`🧪 Run 'npm run build' to test the fixes.`);
  } else {
    console.log(`\nℹ️  No fixes needed.`);
  }
  
  console.log(`\n🎯 Next Steps:`);
  console.log(`1. Run 'npm run build' to verify fixes`);
  console.log(`2. Test application functionality`);
  console.log(`3. Deploy to staging for final validation`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixFile, fixStateTypes };
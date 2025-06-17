#!/usr/bin/env node

import { createRequire } from 'module';
import fs from 'fs';
import http from 'http';

const require = createRequire(import.meta.url);
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  console.log('🔍 Starting simple Lighthouse audit...');
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--no-sandbox',
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows'
    ]
  });

  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    maxWaitForLoad: 30000,
    maxWaitForFcp: 10000
  };

  try {
    console.log('📊 Running Lighthouse audit on http://localhost:4173');
    const runnerResult = await lighthouse('http://localhost:4173', options);
    
    if (!runnerResult) {
      throw new Error('Lighthouse returned no results');
    }

    const scores = runnerResult.lhr.categories;
    
    console.log('\n📈 Lighthouse Results:');
    console.log('====================');
    console.log(`🎯 Performance: ${Math.round(scores.performance.score * 100)}/100`);
    console.log(`♿ Accessibility: ${Math.round(scores.accessibility.score * 100)}/100`);
    console.log(`✅ Best Practices: ${Math.round(scores['best-practices'].score * 100)}/100`);
    console.log(`🔍 SEO: ${Math.round(scores.seo.score * 100)}/100`);
    
    // Save detailed report
    const reportJson = JSON.stringify(runnerResult.lhr, null, 2);
    fs.writeFileSync('./lighthouse-report.json', reportJson);
    console.log('\n💾 Detailed report saved to lighthouse-report.json');
    
    // Check if scores meet minimum thresholds
    const minScores = {
      performance: 0.6,
      accessibility: 0.85,
      'best-practices': 0.75,
      seo: 0.85
    };
    
    let allPassed = true;
    for (const [category, minScore] of Object.entries(minScores)) {
      const actualScore = scores[category].score;
      if (actualScore < minScore) {
        console.log(`❌ ${category}: ${Math.round(actualScore * 100)}/100 (minimum: ${Math.round(minScore * 100)})`);
        allPassed = false;
      } else {
        console.log(`✅ ${category}: ${Math.round(actualScore * 100)}/100 (minimum: ${Math.round(minScore * 100)})`);
      }
    }
    
    if (allPassed) {
      console.log('\n🎉 All Lighthouse audits passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some Lighthouse audits did not meet minimum thresholds');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

// Check if server is running
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:4173', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => reject(false));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(false);
    });
  });
};

checkServer()
  .then(isRunning => {
    if (!isRunning) {
      console.error('❌ Server is not running on http://localhost:4173');
      console.log('💡 Please run: npm run preview');
      process.exit(1);
    }
    return runLighthouse();
  })
  .catch(() => {
    console.error('❌ Could not connect to server on http://localhost:4173');
    console.log('💡 Please run: npm run preview');
    process.exit(1);
  });
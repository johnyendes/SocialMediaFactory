const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  async runAudit() {
    console.log('🔒 Starting Security Audit...\n');

    // Check various security aspects
    this.checkEnvironmentVariables();
    this.checkDependencies();
    this.checkCodePatterns();
    this.checkConfigurations();
    this.checkAPIEndpoints();
    this.checkAuthentication();
    this.checkDataValidation();

    this.generateReport();
  }

  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const envFiles = ['.env', '.env.local', '.env.production'];
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.checkFileForSecrets(file);
      }
    });

    // Check for hardcoded secrets in code
    const jsFiles = this.findFiles('./app', ['.js', '.jsx', '.ts', '.tsx']);
    jsFiles.forEach(file => {
      this.checkFileForSecrets(file);
    });

    console.log('✅ Environment variables check completed\n');
  }

  checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const vulnerabilities = this.checkForVulnerableDependencies(packageJson);
      
      if (vulnerabilities.length === 0) {
        this.passed.push('No obvious vulnerable dependencies found');
      } else {
        this.issues.push(...vulnerabilities);
      }
    } catch (error) {
      this.warnings.push('Could not analyze dependencies: ' + error.message);
    }

    console.log('✅ Dependencies check completed\n');
  }

  checkCodePatterns() {
    console.log('🔍 Checking code patterns...');
    
    const dangerousPatterns = [
      { pattern: /eval\s*\(/, issue: 'Use of eval() function' },
      { pattern: /Function\s*\(/, issue: 'Dynamic function creation' },
      { pattern: /innerHTML\s*=/, issue: 'Direct innerHTML assignment' },
      { pattern: /outerHTML\s*=/, issue: 'Direct outerHTML assignment' },
      { pattern: /document\.write\s*\(/, issue: 'Use of document.write()' },
      { pattern: /setTimeout\s*\(\s*["']/, issue: 'setTimeout with string argument' },
      { pattern: /setInterval\s*\(\s*["']/, issue: 'setInterval with string argument' }
    ];

    const jsFiles = this.findFiles('./app', ['.js', '.jsx', '.ts', '.tsx']);
    const componentFiles = this.findFiles('./components', ['.js', '.jsx', '.ts', '.tsx']);

    [...jsFiles, ...componentFiles].forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      dangerousPatterns.forEach(({ pattern, issue }) => {
        if (pattern.test(content)) {
          this.issues.push(`${issue} found in ${file}`);
        }
      });
    });

    // Check for proper error handling
    const apiFiles = this.findFiles('./api', ['.js', '.ts']);
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('try') && !content.includes('catch')) {
        this.warnings.push(`No error handling found in ${file}`);
      }
    });

    console.log('✅ Code patterns check completed\n');
  }

  checkConfigurations() {
    console.log('🔍 Checking configurations...');
    
    // Check Next.js configuration
    if (fs.existsSync('next.config.js')) {
      const config = fs.readFileSync('next.config.js', 'utf8');
      if (!config.includes('headers')) {
        this.warnings.push('No security headers configured in next.config.js');
      }
    }

    // Check middleware
    if (fs.existsSync('middleware.ts')) {
      const middleware = fs.readFileSync('middleware.ts', 'utf8');
      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection'
      ];

      requiredHeaders.forEach(header => {
        if (!middleware.includes(header)) {
          this.issues.push(`Missing security header: ${header}`);
        }
      });
    } else {
      this.issues.push('No middleware.ts file found');
    }

    console.log('✅ Configurations check completed\n');
  }

  checkAPIEndpoints() {
    console.log('🔍 Checking API endpoints...');
    
    const apiFiles = this.findFiles('./api', ['.js', '.ts']);
    
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for rate limiting
      if (!content.includes('rate') && !content.includes('limit')) {
        this.warnings.push(`No rate limiting found in ${file}`);
      }

      // Check for input validation
      if (content.includes('req.body') && !content.includes('validation')) {
        this.warnings.push(`No input validation found in ${file}`);
      }

      // Check for CORS configuration
      if (!content.includes('CORS') && !content.includes('Access-Control')) {
        this.warnings.push(`No CORS configuration found in ${file}`);
      }
    });

    console.log('✅ API endpoints check completed\n');
  }

  checkAuthentication() {
    console.log('🔍 Checking authentication...');
    
    // Check for NextAuth configuration
    const hasNextAuth = fs.existsSync('./app/api/auth/') || 
                       fs.existsSync('./pages/api/auth/') ||
                       fs.readdirSync('./').some(file => file.includes('auth'));

    if (hasNextAuth) {
      this.passed.push('Authentication system detected');
    } else {
      this.warnings.push('No authentication system detected');
    }

    // Check for JWT secrets
    const envFiles = ['.env', '.env.local', '.env.production'];
    let hasJWTSecret = false;
    
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('JWT_SECRET') || content.includes('NEXTAUTH_SECRET')) {
          hasJWTSecret = true;
        }
      }
    });

    if (!hasJWTSecret) {
      this.issues.push('No JWT secret configured');
    }

    console.log('✅ Authentication check completed\n');
  }

  checkDataValidation() {
    console.log('🔍 Checking data validation...');
    
    const apiFiles = this.findFiles('./api', ['.js', '.ts']);
    
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for SQL injection protection
      if (content.includes('SELECT') && !content.includes('parameterized') && 
          !content.includes('prepared') && !content.includes('parameter')) {
        this.warnings.push(`Potential SQL injection risk in ${file}`);
      }

      // Check for XSS protection
      if (content.includes('req.body') && !content.includes('sanitize') && 
          !content.includes('escape') && !content.includes('DOMPurify')) {
        this.warnings.push(`Potential XSS risk in ${file}`);
      }
    });

    console.log('✅ Data validation check completed\n');
  }

  checkFileForSecrets(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const secretPatterns = [
      { pattern: /password\s*=\s*["'].*["']/i, type: 'Password' },
      { pattern: /api[_-]?key\s*=\s*["'].*["']/i, type: 'API Key' },
      { pattern: /secret\s*=\s*["'].*["']/i, type: 'Secret' },
      { pattern: /token\s*=\s*["'].*["']/i, type: 'Token' },
      { pattern: /sk-[a-zA-Z0-9]{48}/, type: 'OpenAI API Key' },
      { pattern: /ghp_[a-zA-Z0-9]{36}/, type: 'GitHub Token' }
    ];

    secretPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(content)) {
        this.issues.push(`${type} found in ${filePath}`);
      }
    });
  }

  checkForVulnerableDependencies(packageJson) {
    const vulnerabilities = [];
    const knownVulnerablePackages = [
      'lodash<4.17.21',
      'axios<0.21.1',
      'node-forge<1.3.0',
      'request<2.88.2'
    ];

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    knownVulnerablePackages.forEach(vulnPkg => {
      const [name, maxVersion] = vulnPkg.split('<');
      if (allDeps[name] && this.compareVersions(allDeps[name], maxVersion) < 0) {
        vulnerabilities.push(`Vulnerable dependency: ${name}@${allDeps[name]} (should be >=${maxVersion})`);
      }
    });

    return vulnerabilities;
  }

  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    return 0;
  }

  findFiles(dir, extensions) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  generateReport() {
    console.log('📋 Security Audit Report');
    console.log('='.repeat(50));
    
    console.log(`\n❌ Critical Issues (${this.issues.length})`);
    if (this.issues.length === 0) {
      console.log('No critical issues found!');
    } else {
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log(`\n⚠️  Warnings (${this.warnings.length})`);
    if (this.warnings.length === 0) {
      console.log('No warnings found!');
    } else {
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log(`\n✅ Passed Checks (${this.passed.length})`);
    this.passed.forEach((check, index) => {
      console.log(`${index + 1}. ${check}`);
    });

    // Overall assessment
    console.log('\n🎯 Security Assessment');
    console.log('='.repeat(50));
    
    if (this.issues.length === 0 && this.warnings.length <= 3) {
      console.log('🟢 SECURE - Application follows security best practices');
    } else if (this.issues.length <= 2 && this.warnings.length <= 10) {
      console.log('🟡 MODERATELY SECURE - Some security improvements needed');
    } else {
      console.log('🔴 SECURITY RISK - Multiple security issues need attention');
    }

    // Recommendations
    if (this.issues.length > 0 || this.warnings.length > 0) {
      console.log('\n📝 Recommendations');
      console.log('='.repeat(50));
      console.log('1. Address all critical security issues immediately');
      console.log('2. Implement proper input validation for all API endpoints');
      console.log('3. Add rate limiting to prevent abuse');
      console.log('4. Use environment variables for all secrets');
      console.log('5. Keep dependencies updated regularly');
      console.log('6. Implement proper error handling without exposing sensitive information');
      console.log('7. Add comprehensive logging for security events');
    }
  }
}

// Run the audit if called directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = SecurityAuditor;
// Using built-in fetch in Node.js 18+

async function testScoring() {
  try {
    console.log('🧪 Testing Predictive Scoring API...');
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3001/api/scoring/predictive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: 'AAPL' }),
      timeout: 120000 // 2 minutes timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Scoring API Response:');
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Overall Score: ${data.scores.overall}/100`);
    console.log(`🎯 Recommendation: ${data.recommendation}`);
    console.log(`🔍 Confidence: ${data.confidence}%`);
    console.log(`🏢 Company: ${data.company} (${data.symbol})`);
    
    console.log('\n📈 Score Breakdown:');
    Object.entries(data.breakdown).forEach(([key, value]) => {
      console.log(`  ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}/100`);
    });
    
    console.log('\n💪 Strengths:');
    data.analysis.strengths.forEach((strength, i) => {
      console.log(`  ${i + 1}. ${strength}`);
    });
    
    console.log('\n⚠️  Weaknesses:');
    data.analysis.weaknesses.forEach((weakness, i) => {
      console.log(`  ${i + 1}. ${weakness}`);
    });
    
    console.log('\n🚨 Risks:');
    data.analysis.risks.forEach((risk, i) => {
      console.log(`  ${i + 1}. ${risk}`);
    });
    
    console.log('\n🔧 Technical Indicators:');
    Object.entries(data.technicalIndicators).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}%`);
    });
    
    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing scoring API:', error.message);
  }
}

testScoring();
const dotenv = require('dotenv');
const NetworkDiagnostics = require('./src/utils/networkDiagnostics');

// Load environment variables
dotenv.config();

async function runDiagnostics() {
  const diagnostics = new NetworkDiagnostics();
  
  try {
    const report = await diagnostics.generateDiagnosticReport();
    
    console.log('\n📋 DIAGNOSTIC REPORT');
    console.log('='.repeat(50));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Environment: ${report.environment}`);
    console.log(`Node.js: ${report.systemInfo.nodeVersion}`);
    console.log(`Platform: ${report.systemInfo.platform}`);
    
    console.log('\n🔍 TEST RESULTS:');
    console.log(`Internet Connectivity: ${report.tests.internetConnectivity.success ? '✅' : '❌'}`);
    console.log(`Atlas DNS Resolution: ${report.tests.atlasHostDNS.success ? '✅' : '❌'}`);
    console.log(`Atlas SRV Records: ${report.tests.atlasSRV.success ? '✅' : '❌'}`);
    
    if (report.tests.portConnectivity) {
      console.log('\n🔌 PORT CONNECTIVITY:');
      report.tests.portConnectivity.forEach(test => {
        console.log(`${test.host}:${test.port} - ${test.success ? '✅' : '❌'}`);
      });
    }
    
    console.log('\n💡 SUGGESTIONS:');
    report.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

runDiagnostics();
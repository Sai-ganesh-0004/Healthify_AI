const dns = require('dns').promises;
const net = require('net');
const https = require('https');

class NetworkDiagnostics {
  /**
   * Test DNS resolution for MongoDB hostnames
   */
  async testDNSResolution(hostname) {
    try {
      console.log(`🔍 Testing DNS resolution for: ${hostname}`);
      const addresses = await dns.resolve(hostname);
      console.log(`✅ DNS resolved: ${addresses.join(', ')}`);
      return { success: true, addresses };
    } catch (error) {
      console.log(`❌ DNS resolution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test SRV record resolution for MongoDB Atlas
   */
  async testSRVResolution(hostname) {
    try {
      console.log(`🔍 Testing SRV resolution for: ${hostname}`);
      const records = await dns.resolveSrv(hostname);
      console.log(`✅ SRV records found: ${records.length} records`);
      records.forEach(record => {
        console.log(`   - ${record.name}:${record.port} (priority: ${record.priority})`);
      });
      return { success: true, records };
    } catch (error) {
      console.log(`❌ SRV resolution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test port connectivity to a host
   */
  async testPortConnectivity(host, port, timeout = 5000) {
    return new Promise((resolve) => {
      console.log(`🔍 Testing connectivity to ${host}:${port}`);
      const socket = new net.Socket();
      
      const timer = setTimeout(() => {
        socket.destroy();
        console.log(`❌ Connection timeout to ${host}:${port}`);
        resolve({ success: false, error: 'Connection timeout' });
      }, timeout);

      socket.connect(port, host, () => {
        clearTimeout(timer);
        socket.destroy();
        console.log(`✅ Successfully connected to ${host}:${port}`);
        resolve({ success: true });
      });

      socket.on('error', (error) => {
        clearTimeout(timer);
        console.log(`❌ Connection failed to ${host}:${port}: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
    });
  }

  /**
   * Test internet connectivity
   */
  async testInternetConnectivity() {
    return new Promise((resolve) => {
      console.log('🔍 Testing internet connectivity...');
      const req = https.get('https://www.google.com', (res) => {
        console.log('✅ Internet connectivity confirmed');
        resolve({ success: true });
      });

      req.on('error', (error) => {
        console.log(`❌ Internet connectivity failed: ${error.message}`);
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        console.log('❌ Internet connectivity timeout');
        resolve({ success: false, error: 'Timeout' });
      });
    });
  }

  /**
   * Validate MongoDB connection string format
   */
  validateConnectionString(uri) {
    console.log(`🔍 Validating connection string format...`);
    
    if (!uri) {
      console.log('❌ Connection string is empty');
      return { valid: false, error: 'Connection string is empty' };
    }

    const mongoUriRegex = /^mongodb(\+srv)?:\/\/.+/;
    if (!mongoUriRegex.test(uri)) {
      console.log('❌ Invalid MongoDB URI format');
      return { valid: false, error: 'Invalid MongoDB URI format' };
    }

    console.log('✅ Connection string format is valid');
    return { valid: true };
  }

  /**
   * Generate comprehensive diagnostic report
   */
  async generateDiagnosticReport() {
    console.log('\n🔬 Starting comprehensive network diagnostics...\n');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      tests: {}
    };

    // Test internet connectivity
    report.tests.internetConnectivity = await this.testInternetConnectivity();

    // Test MongoDB Atlas hostname resolution
    const atlasHostname = 'healthai.euujfv5.mongodb.net';
    report.tests.atlasHostDNS = await this.testDNSResolution(atlasHostname);

    // Test SRV record resolution
    const srvHostname = `_mongodb._tcp.${atlasHostname}`;
    report.tests.atlasSRV = await this.testSRVResolution(srvHostname);

    // Test direct MongoDB port connectivity if SRV works
    if (report.tests.atlasSRV.success) {
      const srvRecords = report.tests.atlasSRV.records;
      report.tests.portConnectivity = [];
      
      for (const record of srvRecords.slice(0, 3)) { // Test first 3 records
        const result = await this.testPortConnectivity(record.name, record.port);
        report.tests.portConnectivity.push({
          host: record.name,
          port: record.port,
          ...result
        });
      }
    }

    // Validate connection strings
    report.tests.connectionStringValidation = {
      primary: this.validateConnectionString(process.env.MONGO_URI),
      direct: this.validateConnectionString(process.env.MONGO_URI_DIRECT)
    };

    // Generate suggestions based on results
    report.suggestions = this.generateSuggestions(report.tests);

    return report;
  }

  /**
   * Generate troubleshooting suggestions based on test results
   */
  generateSuggestions(tests) {
    const suggestions = [];

    if (!tests.internetConnectivity.success) {
      suggestions.push('Check your internet connection');
      suggestions.push('Verify firewall settings are not blocking outbound connections');
    }

    if (!tests.atlasHostDNS.success) {
      suggestions.push('Try changing DNS servers to 8.8.8.8 or 1.1.1.1');
      suggestions.push('Check if your ISP is blocking MongoDB Atlas domains');
    }

    if (!tests.atlasSRV.success) {
      suggestions.push('Use direct connection string instead of SRV format');
      suggestions.push('Check if corporate firewall blocks SRV record lookups');
    }

    if (tests.portConnectivity && tests.portConnectivity.some(test => !test.success)) {
      suggestions.push('Check if ports 27017-27019 are blocked by firewall');
      suggestions.push('Try connecting from a different network');
    }

    if (!tests.connectionStringValidation.primary.valid) {
      suggestions.push('Fix the primary MongoDB connection string format');
    }

    if (suggestions.length === 0) {
      suggestions.push('All network tests passed - the issue might be with MongoDB Atlas cluster');
      suggestions.push('Check MongoDB Atlas dashboard for cluster status');
      suggestions.push('Verify your IP address is whitelisted in Atlas Network Access');
    }

    return suggestions;
  }
}

module.exports = NetworkDiagnostics;
const https = require('https');

console.log('🔍 Checking your current IP address...');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log(`📍 Your current IP address is: ${result.ip}`);
      console.log('\n📋 Steps to fix MongoDB connection:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Navigate to Network Access');
      console.log('3. Click "Add IP Address"');
      console.log(`4. Add this IP: ${result.ip}`);
      console.log('5. Save and wait a few minutes for changes to take effect');
    } catch (error) {
      console.error('❌ Error parsing IP response:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Error fetching IP:', error.message);
  console.log('💡 You can also check your IP at: https://whatismyipaddress.com/');
});
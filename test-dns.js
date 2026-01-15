const dns = require('dns');

console.log('Testing SRV resolution for _mongodb._tcp.basho.p12mz56.mongodb.net');

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('DNS servers set to Google DNS');
} catch (e) {
    console.error('Failed to set DNS servers:', e);
}

dns.resolveSrv('_mongodb._tcp.basho.p12mz56.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('SRV Resolution Failed:', err);
    } else {
        console.log('SRV Resolution Success:', addresses);
    }
});

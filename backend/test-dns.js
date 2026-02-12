const dns = require('dns');
console.log('Node.js version:', process.version);
console.log('Looking up db.sdvikraysasolvzanixo.supabase.co...');

dns.lookup('db.sdvikraysasolvzanixo.supabase.co', { all: true }, (err, addresses) => {
    if (err) {
        console.error('DNS Lookup Error:', err);
    } else {
        console.log('Resolved addresses:', addresses);
    }
});

// Try resolving specifically IPv4
dns.resolve4('db.sdvikraysasolvzanixo.supabase.co', (err, addresses) => {
    if (err) {
        console.error('IPv4 Resolve Error:', err);
    } else {
        console.log('IPv4 Addresses:', addresses);
    }
});

const dns = require('node:dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}

const origLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  let cb = callback;
  let opts = options;
  if (typeof options === 'function') {
    cb = options;
    opts = {};
  }

  // Pass through localhost / loopback immediately
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return origLookup.call(dns, hostname, opts, cb);
  }

  // Attempt direct DNS resolution via nameservers (8.8.8.8 / 1.1.1.1)
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return origLookup.call(dns, hostname, opts, cb);
    }
    if (opts && opts.all) {
      return cb(null, addresses.map((addr) => ({ address: addr, family: 4 })));
    }
    return cb(null, addresses[0], 4);
  });
};

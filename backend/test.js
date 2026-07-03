const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dns.resolveSrv(
  "_mongodb._tcp.cluster0.xyklpii.mongodb.net",
  (err, addresses) => {
    console.log(err);
    console.log(addresses);
  }
);
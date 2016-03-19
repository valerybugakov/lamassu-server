var https = require('https')
var fs = require('fs')
var path = require('path')
var certsPath = path.join(__dirname, 'certs', 'server')
var caCertsPath = path.join(__dirname, 'certs', 'ca')
var targetDeviceId = process.argv[2] || 1
var targetFile = process.argv[3] || 'exec.sh'

var options = {
  key: fs.readFileSync(path.join(certsPath, 'my-server.key.pem')),
  // This certificate should be a bundle containing your server certificate and any intermediates
  // cat certs/cert.pem certs/chain.pem > certs/server-bundle.pem
  cert: fs.readFileSync(path.join(certsPath, 'my-server.crt.pem')),
  // ca only needs to be specified for peer-certificates
  ca: [ fs.readFileSync(path.join(caCertsPath, 'my-root-ca.crt.pem')) ],
  secureProtocol: 'TLSv1_method',
  requestCert: true,
  ciphers: 'AES128-GCM-SHA256:RC4:HIGH:!MD5:!aNULL:!EDH',
  honorCipherOrder: true,
  rejectUnauthorized: true,
}

process.on('SIGINT', function() { console.log('quitting'); process.exit() })
process.on('SIGTERM', function() { console.log('terminating'); process.exit() })

var server = https.createServer(options, function (req, res) {
  var timestamp = new Date().toISOString()
  var clientCert = req.connection.getPeerCertificate()
  var deviceId = req.headers['device-id']
  var remoteVersionString = req.headers['application-version']
  var ipAddress = req.connection.remoteAddress

  // console.log('%s | %s | %s | %s | %s | %s', timestamp, remoteVersionString, deviceId, countryCode, country, ipAddress)
  var filename = path.join(__dirname, targetFile)
  // console.log('DeviceId: %s | File: %s', deviceId, filename)

  if (deviceId == targetDeviceId) {
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        res.writeHead(500, {"Content-Type": "text/plain"})
        res.write(err + "\n")
        res.end()
        return
      } else {
        res.writeHead(200)
        res.end(file, 'binary', function() {
          // console.log('File sent succesfully')
          process.exit()
        })
      }
    })
  } else {
    res.writeHead(304, {'content-type': 'text/plain'});
    res.end('Up to date\n');
    console.log(304);
  }
})

server.listen(8000, function() {
  var port = server.address().port
  console.log('Listening on https://127.0.0.1:' + port)
})

server.on('error', console.log)

server.on('clientError', function(err) {
  console.log('client error: %s', err.message)
})

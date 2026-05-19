import http from 'http';

http.get('http://localhost:8080/api/orders', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`BODY: ${data.substring(0, 300)}`);
  });
}).on('error', err => {
  console.log("Error:", err.message);
});

import http from 'http';

http.get('http://localhost:8080/api/attendances/adminattendances', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`BODY: ${data.substring(0, 500)}`);
  });
}).on('error', err => {
  console.log("Error:", err.message);
});

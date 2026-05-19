import http from 'http';

http.get('http://localhost:8080/api/v1/admin/fsdlkjfds', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`BODY: ${data.substring(0, 300)}`);
  });
});

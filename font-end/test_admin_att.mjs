import http from 'http';

http.get('http://localhost:8080/api/attendances/adminattandances', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2).substring(0, 500));
    } catch (e) {
      console.log("Error parsing JSON:", data);
    }
  });
}).on('error', err => {
  console.log("Error:", err.message);
});

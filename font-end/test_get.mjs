import http from 'http';

http.get('http://localhost:8080/api/attendances/adminattandances?date=2026-04-20', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log("Status Code:", res.statusCode);
      if (Array.isArray(parsed)) {
          console.log("Records length:", parsed.length);
          if (parsed.length > 0) {
              console.log("First record:", JSON.stringify(parsed[0], null, 2));
          }
      } else if (parsed && parsed.data) {
          console.log("Nested data length:", parsed.data.length);
          if (parsed.data.length > 0) {
              console.log("First nested record:", JSON.stringify(parsed.data[0], null, 2));
          }
      } else {
        console.log("Raw JSON:", parsed);
      }
    } catch(e) {
      console.log("Error parsing:", e.message);
      console.log("Raw Response:", data);
    }
  });
}).on('error', (err) => console.log("Http Error:", err));

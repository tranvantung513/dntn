import http from 'http';

function getAttendances(dateStr) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8080/api/attendances/adminattandances?date=${dateStr}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
           const parsed = JSON.parse(data);
           resolve(parsed);
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const start = new Date();
  // Try previous 100 days
  for (let i = 0; i < 100; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    try {
      const records = await getAttendances(dateStr);
      let arr = [];
      if (Array.isArray(records)) arr = records;
      else if (records && Array.isArray(records.data)) arr = records.data;
      else if (records && Array.isArray(records.content)) arr = records.content;
      
      if (arr.length > 0) {
        console.log(`Found ${arr.length} records on date ${dateStr}!`);
        console.log("Sample Record Data:");
        console.log(JSON.stringify(arr[0], null, 2));
        return;
      }
    } catch(e) {
       // ignore
    }
  }
  console.log("No records found in the last 100 days.");
}

run();

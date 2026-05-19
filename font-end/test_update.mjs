import http from 'http';

function getAttendances() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:8080/api/attendances/adminattandances?date=2026-04-20', (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
           resolve(JSON.parse(data));
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function updateAttendance(id) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      checkIn: "2026-04-20T08:00:00",
      checkOut: "2026-04-20T17:00:00"
    });

    const req = http.request('http://localhost:8080/api/attendances/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  try {
    const records = await getAttendances();
    console.log("Found records:", records.length);
    if (records.length > 0) {
      console.log("Updating record ID:", records[0].id);
      const res = await updateAttendance(records[0].id);
      console.log("Update response:", res.status, res.body);
      
      const recordsAfter = await getAttendances();
      console.log("Record after update:", recordsAfter.find(r => r.id === records[0].id));
    } else {
      console.log("No records to test on this date.");
    }
  } catch (err) {
    console.log("Error:", err);
  }
}

run();

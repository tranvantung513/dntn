import fs from 'fs';

async function test() {
    const payload = {
      email: "ducpeter10@gmail.com",
      password: "Duc123456@"
    };

    console.log("Sending Login payload...");
    const res = await fetch('http://103.82.24.142:9090/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.text();
    fs.writeFileSync('test_out2.txt', data, 'utf-8');
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

test();

import axios from 'axios';

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/v1/auth/login', {
      email: 'admin@gmail.com',
      password: '123'
    });
    
    const token = loginRes.data.data.token;
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
    console.log("JWT Payload:", payload);
  } catch (error) {
    console.error("Login failed:", error.response ? error.response.status : error.message);
  }
}

run();

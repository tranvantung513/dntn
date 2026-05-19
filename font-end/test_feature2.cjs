const axios = require('axios');
async function test() {
  const uuid = '147b019f-b952-40c3-a88e-c51c9e55b785'; // Valid UUID
  const url = `http://localhost:5173/api/v1/admin/menu-items/${uuid}/feature`;

  const methods = ['put', 'post', 'patch'];
  for (let m of methods) {
    try {
       const res = await axios[m](url);
       console.log(`${m.toUpperCase()} success:`, res.status);
    } catch(e) { 
       console.log(`${m.toUpperCase()} failed:`, e.response?.status, e.response?.statusText); 
    }
  }
}
test();

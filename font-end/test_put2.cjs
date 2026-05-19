const axios = require('axios');
async function test() {
  const uuid = '147b019f-b952-40c3-a88e-c51c9e55b785';
  
  // Try { quantity: 2 }
  try {
    const res = await axios.put(`http://103.82.24.142:9090/api/v1/cart/items/${uuid}`, { quantity: 2 });
    console.log("PUT {quantity:2} status:", res.status);
  } catch(e) {
    console.log("PUT {quantity:2} failed:", e.response?.status);
  }

  // Try directly sending 2 as body
  try {
    const res = await axios.put(`http://103.82.24.142:9090/api/v1/cart/items/${uuid}`, 2, { headers: { 'Content-Type': 'application/json' } });
    console.log("PUT 2 body status:", res.status);
  } catch(e) {
    console.log("PUT 2 body failed:", e.response?.status);
  }

  // Try ?quantity=2
  try {
    const res = await axios.put(`http://103.82.24.142:9090/api/v1/cart/items/${uuid}?quantity=2`);
    console.log("PUT ?quantity=2 status:", res.status);
  } catch(e) {
    console.log("PUT ?quantity=2 failed:", e.response?.status);
  }
}
test();

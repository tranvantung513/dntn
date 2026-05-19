const axios = require('axios');
async function test() {
  const uuid = '4986b8e0-ad0a-422f-b0e8-0375511e73a8';
  try {
    const res = await axios.put(`http://103.82.24.142:9090/api/v1/cart/items/${uuid}`, { quantity: 1 });
    console.log("PUT status:", res.status);
  } catch(e) {
    console.error("PUT failed:", e.response?.status, e.response?.data || e.message);
  }
}
test();

const axios = require('axios');
async function test() {
  const uuid = '147b019f-b952-40c3-a88e-c51c9e55b785'; // Valid UUID from prev test
  const url = `http://103.82.24.142:9090/api/v1/admin/menu-items/${uuid}`;
  try {
     const res = await axios.get(url);
     console.log(Object.keys(res.data?.data || res.data));
     console.log('Feature fields:', res.data.isFeatured, res.data.featured, res.data.data?.isFeatured, res.data.data?.featured);
  } catch(e) { console.log("GET failed:", e.response?.status); }
}
test();

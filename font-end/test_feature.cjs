const axios = require('axios');
async function test() {
  const uuid = '147b019f-b952-40c3-a88e-c51c9e55b785'; // Valid UUID from prev test
  const url = `http://103.82.24.142:9090/api/v1/admin/menu-items/${uuid}/feature`;

  try {
     const resPatch = await axios.patch(url);
     console.log("PATCH success:", resPatch.status);
     return;
  } catch(e) { console.log("PATCH failed:", e.response?.status); }

  try {
     const resPut = await axios.put(url);
     console.log("PUT success:", resPut.status);
     return;
  } catch(e) { console.log("PUT failed:", e.response?.status); }

  try {
     const resPost = await axios.post(url);
     console.log("POST success:", resPost.status);
     return;
  } catch(e) { console.log("POST failed:", e.response?.status); }
}
test();

const axios = require('axios');
async function test() {
  const uuid = '4986b8e0-ad0a-422f-b0e8-0375511e73a8';
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items/${uuid}?quantity=1`, { method: 'PUT' });
    console.log("PUT ?quantity=1 status:", res.status);
  } catch(e) { }
}
test();

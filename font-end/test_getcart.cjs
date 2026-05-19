const axios = require('axios');
const fs = require('fs');
async function test() {
  try {
    const res = await axios.get('http://103.82.24.142:9090/api/v1/cart');
    fs.writeFileSync('cart_out.json', JSON.stringify(res.data, null, 2));
    console.log("Written to cart_out.json");
  } catch(e) {
    console.error(e.message);
  }
}
test();

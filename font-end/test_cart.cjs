const axios = require('axios');

async function testCart() {
  try {
    const res = await axios.post('http://103.82.24.142:9090/api/v1/cart/items', {
      productId: 1, // Let's guess 1 exists
      quantity: 1
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("FAILED WITH DATA:", err.response?.data || err.message);
  }

  try {
    const res2 = await axios.post('http://103.82.24.142:9090/api/v1/cart/items', {
      menuItemId: 1, 
      quantity: 1
    });
    console.log("SUCCESS 2:", res2.data);
  } catch (err) {
    console.log("FAILED 2 WITH DATA:", err.response?.data || err.message);
  }
}

testCart();

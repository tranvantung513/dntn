const axios = require('axios');

async function testPost() {
  try {
    const res = await axios.post('http://103.82.24.142:9090/api/v1/admin/discounts', {
      code: "TESTCODE" + Date.now(),
      name: "TESTING",
      description: "Test",
      discountType: 0,
      discountValue: 10,
      minOrderValue: 100000,
      maxDiscount: 50000,
      startDate: "2026-06-01T15:00:00",
      endDate: "2026-06-02T15:00:00",
      status: true,
      isDeleted: false
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
}

testPost();

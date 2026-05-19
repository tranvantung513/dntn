const axios = require('axios');
async function run() {
  const res = await axios.get('http://103.82.24.142:9090/api/v1/admin/discounts');
  const d = res.data.content[0];
  console.log("Original status:", d.status);
  
  const cleanPayload = {
    code: d.code,
    name: d.name,
    description: d.description,
    discountType: d.discountType,
    discountValue: d.discountValue,
    minOrderValue: d.minOrderValue,
    maxDiscount: d.maxDiscount,
    startDate: d.startDate,
    endDate: d.endDate,
    status: !d.status
  };
  
  console.log("Clean payload:", cleanPayload);
  
  const putRes = await axios.put(`http://103.82.24.142:9090/api/v1/admin/discounts/${d.id}`, cleanPayload);
  
  const res2 = await axios.get('http://103.82.24.142:9090/api/v1/admin/discounts');
  const d2 = res2.data.content.find(x => x.id === d.id);
  console.log("Final status:", d2.status);
}
run();

const axios = require('axios');
async function run() {
  const res = await axios.get('http://103.82.24.142:9090/api/v1/admin/discounts');
  console.log(res.data.content.map(d => ({id: d.id, name: d.name, status: d.status, code: d.code })));
}
run();

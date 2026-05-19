import axios from 'axios';
async function test() {
   try {
      const res = await axios.get('http://103.82.24.142:9090/api/v1/admin/menu-items');
      console.log(res.data?.data?.[0] || res.data?.content?.[0] || res.data);
   } catch(e) { console.log(e.message); }
}
test();

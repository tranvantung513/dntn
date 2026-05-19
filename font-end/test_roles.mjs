import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:8080/api/v1/admin/roles');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error(e.message);
  }
}
test();

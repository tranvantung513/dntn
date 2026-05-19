async function t() {
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart`, {
      method: 'GET'
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) { console.log(e); }
}
t();

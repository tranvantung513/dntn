async function t() {
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart`, {
      method: 'GET'
    });
    console.log("GET /cart:", res.status, await res.text());
  } catch (e) { console.log(e); }
}
t();

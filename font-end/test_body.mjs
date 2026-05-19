async function t() {
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log("Empty Object:", res.status, await res.text());
  } catch (e) { }
}
t();

async function testFetch() {
  try {
    const r1 = await fetch('http://103.82.24.142:9090/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1, quantity: 1 })
    });
    const d1 = await r1.text();
    console.log("R1 status:", r1.status, "Body:", d1);
  } catch (e) {
    console.log("R1 Error:", e.message);
  }

  try {
    const r2 = await fetch('http://103.82.24.142:9090/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: 1, quantity: 1 })
    });
    const d2 = await r2.text();
    console.log("R2 status:", r2.status, "Body:", d2);
  } catch (e) {
    console.log("R2 Error:", e.message);
  }
}
testFetch();

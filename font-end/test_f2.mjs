async function testFetch() {
  const uuid = '4986b8e0-ad0a-422f-b4b1-eaf2c42cc3d9';
  console.log("Testing with valid UUID...");

  try {
    const r1 = await fetch('http://103.82.24.142:9090/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: uuid, quantity: 1 })
    });
    console.log("menuItemId -> status:", r1.status, await r1.text());
  } catch (e) {
    console.log("mID Error:", e);
  }

  try {
    const r2 = await fetch('http://103.82.24.142:9090/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: uuid, quantity: 1 })
    });
    console.log("productId -> status:", r2.status, await r2.text());
  } catch (e) {
    console.log("pID Error:", e);
  }
}
testFetch();

async function t() {
  try {
    const res = await fetch('http://103.82.24.142:9090/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: '4986b8e0-ad0a-422f-b4b1-eaf2c42cc3d9', quantity: 1 })
    });
    console.log("Response:", await res.json());
  } catch (e) { console.log(e); }
}
t();

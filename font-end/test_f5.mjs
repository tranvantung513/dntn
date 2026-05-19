async function t() {
  const uuid = '4986b8e0-ad0a-422f-b4b1-eaf2c42cc3d9';
  
  // Try sending menuItem object
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItem: { id: uuid }, quantity: 1 })
    });
    console.log("menuItem Object:", res.status, await res.text());
  } catch (e) { }

  // Try sending product object
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: { id: uuid }, quantity: 1 })
    });
    console.log("product Object:", res.status, await res.text());
  } catch (e) { }
}
t();

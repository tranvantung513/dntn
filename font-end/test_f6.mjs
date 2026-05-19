async function t() {
  const uuid = '4986b8e0-ad0a-422f-b4b1-eaf2c42cc3d9';
  
  // Try sending userId in body
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, menuItemId: uuid, quantity: 1 })
    });
    console.log("userId in body:", res.status, await res.text());
  } catch (e) { }

  // Try sending userId in query
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items?userId=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: uuid, quantity: 1 })
    });
    console.log("userId in query:", res.status, await res.text());
  } catch (e) { }

   // Try sending user_id in header
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user_id': '1' },
      body: JSON.stringify({ menuItemId: uuid, quantity: 1 })
    });
    console.log("userId in header:", res.status, await res.text());
  } catch (e) { }
}
t();

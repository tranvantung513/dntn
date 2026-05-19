async function test() {
  const getRes = await fetch('http://103.82.24.142:9090/api/v1/cart');
  const cart = await getRes.json();
  console.log("Cart Items count:", cart.items?.length);
  if (!cart.items || cart.items.length === 0) return;
  
  const first = cart.items[0];
  console.log("First item keys:", Object.keys(first));
  console.log("First item id:", first.id, " productId:", first.productId);
  
  // Try DELETE by productId
  try {
     const delByProduct = await fetch(`http://103.82.24.142:9090/api/v1/cart/items/${first.productId}`, { method: 'DELETE' });
     console.log("Deleted by productId:", delByProduct.status, await delByProduct.text());
  } catch (e) { console.log(e); }

  // Check if still exists
  const getRes2 = await fetch('http://103.82.24.142:9090/api/v1/cart');
  const cart2 = await getRes2.json();
  console.log("After DELETE by productId, items count:", cart2.items?.length);

  // Try DELETE by id (Cart Item ID)
  if (first.id) {
      try {
         const delById = await fetch(`http://103.82.24.142:9090/api/v1/cart/items/${first.id}`, { method: 'DELETE' });
         console.log("Deleted by id:", delById.status, await delById.text());
      } catch (e) { console.log(e); }

      const getRes3 = await fetch('http://103.82.24.142:9090/api/v1/cart');
      const cart3 = await getRes3.json();
      console.log("After DELETE by id, items count:", cart3.items?.length);
  }
}
test();

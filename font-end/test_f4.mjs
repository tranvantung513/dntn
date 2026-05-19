async function t() {
  const uuid = '4986b8e0-ad0a-422f-b4b1-eaf2c42cc3d9';
  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items?productId=${uuid}&quantity=1`, {
      method: 'POST'
    });
    console.log("RequestParam productId:", res.status, await res.text());
  } catch (e) { console.log(e); }

  try {
    const res = await fetch(`http://103.82.24.142:9090/api/v1/cart/items?menuItemId=${uuid}&quantity=1`, {
      method: 'POST'
    });
    console.log("RequestParam menuItemId:", res.status, await res.text());
  } catch (e) { console.log(e); }
}
t();

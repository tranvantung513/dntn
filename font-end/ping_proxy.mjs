async function checkProxy() {
    try {
        const res = await fetch('http://localhost:5173/api/v1/categories', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        const text = await res.text();
        console.log('Status:', res.status, 'Body Length:', text.length);
        if (text.includes('<!DOCTYPE html>')) {
            console.log('Vite Trả về HTML thay vì proxy!');
        } else {
            console.log('Body snippet:', text.substring(0, 200));
        }
    } catch (err) {
        console.log('Lỗi proxy:', err.message);
    }
}
checkProxy();

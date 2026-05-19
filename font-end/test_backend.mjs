async function check() {
    console.log('--- TEST /auth/login POST ---');
    const res = await fetch('http://103.82.24.142:9090/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: '123' })
    });
    console.log('Login Status:', res.status);
    console.log('Login Body:', await res.text());

    console.log('--- TEST /api/v1/categories GET ---');
    const res2 = await fetch('http://103.82.24.142:9090/api/v1/categories', {
        method: 'GET'
    });
    console.log('Categories Status:', res2.status);
    console.log('Categories Body:', await res2.text());
}
check();

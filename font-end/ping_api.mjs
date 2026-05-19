async function check() {
    try {
        console.log('Đang thử kết nối tới http://103.82.24.142:9090/auth/login ...');
        const res = await fetch('http://103.82.24.142:9090/auth/login', { method: 'OPTIONS' });
        console.log('Kết nối API bình thường. Status:', res.status);
    } catch (err) {
        console.log('LỖI GỌI API:', err.message);
    }
}
check();

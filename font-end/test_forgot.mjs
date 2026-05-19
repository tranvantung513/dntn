

import fs from 'fs';

const out = [];
async function testApi(payload) {
    const res = await fetch('http://103.82.24.142:9090/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const text = await res.text();
    out.push(`Payload: ${JSON.stringify(Object.keys(payload))} -> Status: ${res.status} Response: ${text.replace(/\r?\n|\r/g, " ")}`);
}

async function run() {
    await testApi({ email: "ducpeter10@gmail.com" });
    await testApi({ email: "ducpeter10@gmail.com", password: "Password123@" });
    await testApi({ email: "ducpeter10@gmail.com", newPassword: "Password123@" });
    await testApi({ email: "ducpeter10@gmail.com", password: "Password123@", confirmPassword: "Password123@" });
    await testApi({ email: "ducpeter10@gmail.com", newPassword: "Password123@", confirmPassword: "Password123@" });
    await testApi({ email: "ducpeter10@gmail.com", password: "Password123@", newPassword: "Password123@" });
    await testApi({ email: "ducpeter10@gmail.com", password: "Password123@", newPassword: "Password123@", confirmPassword: "Password123@" });
    fs.writeFileSync('test_forgot_out.txt', out.join('\n'));
}

run();

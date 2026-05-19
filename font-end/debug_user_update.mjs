import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:8080/api/v1' });

async function debug() {
  try {
    const loginRes = await api.post('/auth/login', { email: 'admin@gmail.com', password: '123456' });
    const token = loginRes.data.accessToken;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Get users
    const usersRes = await api.get('/admin/users', config);
    const users = usersRes.data.data || usersRes.data.content || usersRes.data;
    if (users.length > 0) {
       const u = users[0];
       console.log("Found user:", u.id, u.email);
       
       // Try updating
       try {
           const payload = { fullName: u.fullName, phone: u.phone, email: u.email, gender: u.gender, status: u.status };
           if (u.dateOfBirth) payload.dateOfBirth = u.dateOfBirth.includes('T') ? u.dateOfBirth : `${u.dateOfBirth}T00:00:00`;
           
           console.log("Sending payload:", payload);
           const upRes = await api.put(`/admin/users/${u.id}`, payload, config);
           console.log("Update user success:", upRes.status);
       } catch (e) {
           console.log("Update user error:", e.response?.status, e.response?.data);
       }
    } else {
       console.log("No users found");
    }
  } catch (e) {
    console.error("Login failed", e.response?.status, e.response?.data);
  }
}
debug();

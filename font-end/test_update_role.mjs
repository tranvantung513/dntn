import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1'
});

async function run() {
  try {
    const loginRes = await api.post('/auth/login', {
      email: 'admin@gmail.com',
      password: '123'
    });
    
    const token = loginRes.data.data.token;
    console.log("Login success! Token:", token.substring(0, 20) + "...");
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const usersRes = await api.get('/admin/users');
    const firstUser = usersRes.data.data[0];
    console.log("Target user ID:", firstUser.id);
    
    console.log("Sending PUT /admin/users/" + firstUser.id + "/roles with ['ROLE_MANAGER']");
    const roleRes = await api.put(`/admin/users/${firstUser.id}/roles`, ['ROLE_MANAGER']);
    console.log("Success! Status:", roleRes.status);
    console.log("Data:", roleRes.data);
    
  } catch (error) {
    console.error("Error occurred!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

run();

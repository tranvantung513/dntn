import axios from 'axios';

async function debug() {
  // Try different passwords
  const passwords = ['123456', 'admin123', 'Admin@123', '12345678', 'password'];
  
  for (const pw of passwords) {
    try {
      const loginRes = await axios.post('http://localhost:8080/auth/login', { 
        email: 'admin@gmail.com', password: pw 
      });
      console.log(`✅ Login OK with password: ${pw}`);
      const token = loginRes.data.accessToken;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Lấy tất cả menu items
      const res = await axios.get('http://localhost:8080/api/menu-items?page=0&size=5', config);
      const data = res.data;
      const items = data?.content || data?.data || data || [];
      
      console.log(`Total items: ${items.length}`);
      items.slice(0, 3).forEach(item => {
        console.log({
          name: item.name,
          isActive: item.isActive,
          isAvailable: item.isAvailable,
          isDeleted: item.isDeleted,
          quantity: item.quantity
        });
      });
      return;
    } catch(e) {
      if (e.response?.data?.message === 'INVALID_PASSWORD') {
        console.log(`❌ Wrong password: ${pw}`);
      } else {
        console.log(`❌ Error with ${pw}:`, e.response?.status, e.response?.data?.message);
      }
    }
  }
}
debug();

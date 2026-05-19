import axios from 'axios';

async function testChat() {
  // Test chat với từ khóa chung
  console.log("=== Test 1: Hỏi về menu ===");
  try {
    const r1 = await axios.post('http://localhost:8080/api/chat', {
      message: "gửi menu mình xem",
      sessionId: "debug_1"
    });
    console.log("Response:", r1.data);
  } catch(e) {
    console.error("Lỗi:", e.response?.status, e.response?.data);
  }

  // Test trực tiếp API menu items
  console.log("\n=== Test 2: Gọi menu API trực tiếp ===");
  try {
    const r2 = await axios.get('http://localhost:8080/api/menu-items?page=0&size=5');
    const items = r2.data?.content || r2.data?.data || r2.data;
    console.log("Total items:", Array.isArray(items) ? items.length : JSON.stringify(items).substring(0, 200));
    if (Array.isArray(items) && items.length > 0) {
      const item = items[0];
      console.log("Sample item:", { 
        name: item.name, 
        isActive: item.isActive, 
        isAvailable: item.isAvailable, 
        isDeleted: item.isDeleted 
      });
    }
  } catch(e) {
    console.error("Lỗi menu:", e.response?.status, e.response?.data?.message || e.message);
  }
}

testChat();

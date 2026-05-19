import axios from 'axios';

async function testChat() {
  try {
    console.log("Testing /api/chat endpoint...");
    const res = await axios.post('http://localhost:8080/api/chat', {
      message: "có những món ăn nào?",
      sessionId: "test_session_123"
    });
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Error status:", error.response?.status);
    console.error("Error data:", JSON.stringify(error.response?.data, null, 2));
    console.error("Error message:", error.message);
  }
}

testChat();

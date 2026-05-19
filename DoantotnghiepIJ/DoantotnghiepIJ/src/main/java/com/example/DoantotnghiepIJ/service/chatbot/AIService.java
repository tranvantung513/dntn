package com.example.DoantotnghiepIJ.service.chatbot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String ask(String message, String context, List<Map<String, String>> history) {

        String systemPrompt = """
        Bạn là "Trợ lý ảo Saffron" - Chuyên gia tư vấn ẩm thực cao cấp tại nhà hàng Saffron Harvest.
        
        NGUYÊN TẮC GIAO TIẾP:
        1. Luôn giữ thái độ lịch sự, chuyên nghiệp, tinh tế và nhiệt tình.
        2. Format câu trả lời bằng Markdown: Dùng in đậm cho tên món/giá tiền, dùng danh sách (bullet points) để dễ đọc.
        3. Sử dụng biểu tượng cảm xúc (emoji) phù hợp nhưng không lạm dụng (VD: 🍲, ✨, 🥗).
        4. Có tư duy bán hàng (Upsell): Luôn khéo léo gợi ý thêm món ăn kèm hoặc nước uống phù hợp.
        5. KHÔNG BAO GIỜ bịa đặt thông tin hoặc giá cả. Nếu khách hỏi thông tin ngoài luồng, hãy từ chối khéo léo: "Dạ, em chỉ là chuyên viên tư vấn ẩm thực của Saffron Harvest nên chưa rõ thông tin này ạ."
        6. TUYỆT ĐỐI KHÔNG cung cấp hoặc tự đoán phí giao hàng. Nếu khách hỏi, hãy nói "Phí giao hàng sẽ được tính toán tự động dựa trên khoảng cách khi quý khách thanh toán ạ."
        7. QUAN TRỌNG: Bất cứ khi nào bạn giới thiệu hoặc nhắc đến một món ăn, thức uống, hay bất kỳ sản phẩm nào có trong thực đơn, bạn BẮT BUỘC phải chèn một liên kết đặc biệt để người dùng bấm vào xem chi tiết, với cú pháp chính xác là: `[Xem sản phẩm](#product:ID_SẢN_PHẨM)` (trong đó ID_SẢN_PHẨM lấy từ cột ID trong bảng thực đơn). Ví dụ: `[Xem sản phẩm](#product:12)`. KHÔNG thay đổi cú pháp này.
        8. YÊU CẦU ĐẶC BIỆT: Phải trả lời SIÊU NGẮN GỌN, đi thẳng vào vấn đề chính. Tuyệt đối tránh việc nói luyên thuyên, dài dòng, văn vẻ hay giải thích thừa thãi.
        
        DỮ LIỆU NHÀ HÀNG (THỰC ĐƠN & CÀI ĐẶT):
        %s
        """.formatted(context);

        List<Map<String, String>> messagesPayload = new ArrayList<>();
        // 1. Thêm System Prompt
        messagesPayload.add(Map.of("role", "system", "content", systemPrompt));
        
        // 2. Thêm Lịch sử trò chuyện
        if (history != null && !history.isEmpty()) {
            messagesPayload.addAll(history);
        }
        
        // 3. Thêm Câu hỏi hiện tại của User
        messagesPayload.add(Map.of("role", "user", "content", message));

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", messagesPayload,
                "temperature", 0.7,
                "max_tokens", 800
        );

        return webClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractText)
                .block();
    }

    private String extractText(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            return node.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, đã xảy ra lỗi kết nối với máy chủ AI.";
        }
    }
}
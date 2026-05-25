**HACKATHON ĐỀ BÀI**

**Task Mom 24/7**

*“Gom TODO từ mọi dự án, nhắc deadline — không quên, không giận, không hối.”*

|  |  |
| --- | --- |
| **Phiên bản** | Draft v0.1 |
| **Đối tượng** | Toàn bộ thành viên đơn vị (đa dạng vai trò: Dev, BA, QA, DM, AI, …) |
| **Hình thức** | Thi theo team (đề xuất 2–4 người/team) |
| **Thời lượng** | 01 ngày (Sprint Mode) HOẶC 01 tuần (Extended Mode) — xem mục Scope |

1. Bối cảnh & Vấn đề

Trong đơn vị, một thành viên có thể đồng thời tham gia nhiều dự án, nhiều vai trò. Công việc (TODO) đến từ rất nhiều nguồn khác nhau và không tập trung:

1. **Jira / project management tool:** ticket được assign, comment, status change
2. **Email:** yêu cầu từ khách hàng, nội bộ, deadline ngầm trong văn bản
3. **Meeting minutes:** action items được note lại nhưng dễ quên
4. **Chat (Teams/Slack):** yêu cầu nhanh, dễ trôi theo dòng tin nhắn
5. **Cá nhân:** ý tưởng, việc cần làm tự nhớ trong đầu

**Hệ quả:** Quên việc → trễ deadline → khách hàng phàn nàn → stress nội bộ → mất uy tín. Các giải pháp hiện có (Notion, Todoist, Microsoft To Do…) đòi hỏi user phải tự nhập tay, tự phân loại, tự nhắc — vẫn nặng về kỷ luật cá nhân.

**Insight:** Cái thiếu không phải là một “app TODO” thứ N, mà là một ***trợ lý chủ động*** có khả năng tự đọc, tự hiểu và tự gom việc từ các nguồn — như một người mẹ luôn nhắc “con đã làm cái này chưa?” mà không phán xét, không cằn nhằn.

2. Mục tiêu cuộc thi

1. **Sản phẩm:** Xây dựng một AI Agent có khả năng gom TODO đa nguồn, theo dõi deadline, và nhắc nhở người dùng một cách thông minh.
2. **Năng lực:** Khuyến khích thành viên thực hành thiết kế và triển khai AI Agent đúng nghĩa (reasoning + tool use + memory), không chỉ là wrapper gọi LLM.
3. **Triển khai:** Tạo ra prototype có thể được pilot trong đơn vị sau cuộc thi (không dừng ở mức demo cho có).

3. Persona & User Stories

3.1. Persona đại diện

**Tên:** Linh — Senior Developer, đồng thời là tech lead nhỏ cho 2 dự án.

1. Một ngày Linh check ~20 emails, ~30 Jira notifications, dự 2–3 cuộc họp, theo dõi 4–5 channel Teams.
2. Linh từng quên 1 commitment với khách vì nó nằm trong meeting minutes — và không ai gửi reminder.
3. Linh cần một “task mom” — nhắc đủ, không nhằn quá, không bỏ sót.

3.2. User Stories (must-have)

1. **US-01:** Là Linh, tôi muốn agent tự động đọc Jira / Email / Meeting minutes / Chat của tôi để rút ra các TODO mà không cần tôi nhập tay.
2. **US-02:** Là Linh, tôi muốn xem một dashboard duy nhất hiển thị toàn bộ TODO đã được gom — sắp xếp theo độ ưu tiên / deadline.
3. **US-03:** Là Linh, tôi muốn agent chủ động nhắc tôi trước deadline (ví dụ: 1 ngày, 1 giờ) qua kênh tôi chọn (email / Teams / Slack).
4. **US-04:** Là Linh, tôi muốn confirm hoặc reject các TODO mà agent gom được (không phải mọi câu trong email đều là task).

3.3. User Stories (nice-to-have)

1. **US-05:** Agent tự nhận diện task trùng lặp giữa các nguồn (1 task được nhắc trong cả email và meeting).
2. **US-06:** Agent đề xuất ưu tiên dựa trên context (deadline gần, sender quan trọng, blocking task).
3. **US-07:** Agent học từ phản hồi user (reject task này → lần sau không gom task tương tự).
4. **US-08:** Agent tóm tắt “tình hình hôm nay” mỗi sáng (daily briefing).

4. Yêu cầu chức năng

4.1. Core (BẮT BUỘC)

Tối thiểu agent phải làm được:

1. **Multi-source ingestion:** Tích hợp ÍT NHẤT 02 nguồn dữ liệu khác nhau (gợi ý: Jira + Email, hoặc Email + Meeting Minutes file, hoặc Teams chat + Jira). Có thể dùng mock data hoặc real API.
2. **Task extraction:** Dùng LLM để rút trích TODO từ nội dung phi cấu trúc (email body, transcript, chat log). Output phải structured: title, description, source, deadline (nếu có), assignee.
3. **Centralized view:** UI hoặc CLI hiển thị danh sách TODO đã gom — người dùng xem được toàn cảnh.
4. **Reminder:** Agent có cơ chế nhắc deadline (in-app notification / email / log message — chấp nhận mức tối thiểu).
5. **Human-in-the-loop:** User có thể accept/reject/edit các TODO mà agent gom (tránh false positive).
6. **Tính năng signature: Task Context**
   1. **Thread Intelligence — Hiểu ngữ cảnh chuỗi công việc:** Agent không chỉ extract task mà còn nhóm chúng theo context chung (client / project / issue), tạo narrative summary tóm tắt diễn biến từ đầu đến hiện tại, hiển thị mỗi task kèm lý do tồn tại trong câu chuyện chung, và tự đánh dấu task có khả năng bị invalidate do thay đổi requirement — yêu cầu user xác nhận trước khi giữ lại.
   2. **Confidence Meter — Xác nhận task theo độ tin cậy:** Mỗi task candidate được gắn điểm 0–100 dựa trên tín hiệu ngôn ngữ (“please deliver”, “action item”, “need by”…) kèm giải thích 1 dòng vì sao agent cho đây là task. User bắt buộc Accept / Edit / Reject trước khi task được thêm vào danh sách chính thức — không có auto-add ngầm. (Hỗ trợ xác nhận theo lô khi có nhiều task cùng lúc.)

4.2. Extended (CỘNG ĐIỂM — bắt buộc nếu chọn 1 tuần)

1. Tích hợp ≥ 03 nguồn dữ liệu thật (không mock).
2. Có memory: agent nhớ context cross-session (đã gom task này rồi thì không gom lại).
3. Có feedback loop: agent học từ accept/reject của user.
4. Daily briefing tự động.
5. Hỗ trợ multi-user (mỗi user có view riêng, không lẫn task).

5. Yêu cầu kỹ thuật

5.1. AI Agent đúng nghĩa

Để được công nhận là AI Agent (không phải chatbot wrapper), giải pháp phải thể hiện được ÍT NHẤT 02 trong 03 yếu tố sau:

| **Yếu tố** | **Mô tả & ví dụ minh chứng** |
| --- | --- |
| **Reasoning** | Agent tự lập kế hoạch nhiều bước (planning), tự quyết định gọi tool nào khi nào. Minh chứng: log/trace cho thấy chuỗi suy luận, không phải single-shot prompt. |
| **Tool use** | Agent gọi được ≥ 02 tools/functions để đọc dữ liệu thật (ví dụ: jira.search\_issues, email.fetch, calendar.create\_reminder). Bắt buộc có tool definition rõ ràng. |
| **Memory** | Agent lưu state qua các phiên: short-term (trong session) hoặc long-term (DB / vector store). Nhớ task đã gom, preference của user. |

5.2. Tech stack — KHÔNG ràng buộc

1. LLM provider: tự chọn (Claude / OpenAI / Gemini / local model — đều ok).
2. Framework: tự chọn (LangChain, LangGraph, CrewAI, Semantic Kernel, n8n, hoặc tự code from scratch).
3. UI: tự chọn (web app, CLI, Slack/Teams bot, Notion integration… — miễn demo được).
4. Hosting: local cũng được, miễn demo trên máy chạy ổn định.

5.3. Yêu cầu phi chức năng

1. **Bảo mật:** Không hardcode credentials trong code. Dùng .env hoặc secret manager. Nếu dùng dữ liệu thật từ đơn vị, phải mask thông tin nhạy cảm khi demo.
2. **Reproducibility:** Có README đầy đủ — người khác clone về phải chạy được trong < 30 phút.
3. **Observability:** Có log/trace để giám khảo nhìn được agent đang “suy nghĩ” gì (rất quan trọng để đánh giá tiêu chí AI Agent).

6. Scope theo thời lượng

Đề bài có 02 mode để Ban tổ chức linh hoạt chọn:

| **Khía cạnh** | **Sprint Mode (1 ngày)** | **Extended Mode (1 tuần)** |
| --- | --- | --- |
| **Số nguồn dữ liệu** | Tối thiểu 02 (chấp nhận mock data) | Tối thiểu 03 (≥ 02 nguồn thật) |
| **Functional** | Chỉ cần Core (US-01 → US-04) | Core + ≥ 02 Nice-to-have |
| **AI Agent** | Tối thiểu Tool use | Tool use + Memory + Reasoning trace rõ ràng |
| **UI** | CLI hoặc UI tối giản đều được | UI có UX tử tế (web/Slack/Teams bot) |
| **Demo** | 5 phút demo + 3 phút Q&A | 10 phút demo + 5 phút Q&A + pitch triển khai |

7. Deliverables

Mỗi team nộp đầy đủ các hạng mục sau (deadline: trước giờ chấm):

1. **Source code:** Repo Git (private hoặc public), có README với hướng dẫn setup và chạy.
2. **Demo video:** Video screen-record 3–5 phút (Sprint) hoặc 5–10 phút (Extended) thể hiện end-to-end flow.
3. **Architecture diagram:** 01 hình mô tả kiến trúc agent: data sources → ingestion → agent (LLM + tools + memory) → output → user.
4. **Pitch deck:** 5–10 slide trình bày: vấn đề → giải pháp → demo → tech stack → kế hoạch triển khai trong đơn vị.
5. **Reasoning trace:** 01 sample log/trace của agent xử lý 1 use case (rất quan trọng cho tiêu chí AI Agent).

8. Tiêu chí chấm điểm

Tổng 100 điểm, trọng số như sau:

| **Tiêu chí** | **Điểm** | **Mô tả chi tiết** |
| --- | --- | --- |
| **Độ hoàn thiện** | **30** | Sản phẩm chạy được end-to-end. Demo không lỗi. Code có thể clone về chạy lại. Có README đầy đủ. |
| **Chất lượng AI Agent** | **30** | Có reasoning + tool use + memory thật sự (không phải single-shot LLM call). Reasoning trace rõ ràng. Tool definition đúng chuẩn. |
| **Khả năng triển khai thực tế** | **25** | Có thể pilot ngay trong đơn vị hay không? Cost vận hành (LLM cost, infra) có hợp lý không? Có lộ trình rollout, security, privacy rõ ràng không? |
| **Sáng tạo & UX** | **10** | Cách tiếp cận có gì độc đáo? UX có tử tế và tinh tế không (đặc biệt là tone của agent — “không quên, không giận, không hối”)? |
| **Trình bày & pitch** | **5** | Pitch rõ ràng, đúng giờ. Trả lời Q&A của giám khảo thuyết phục. |

9. Ràng buộc & Ghi chú

1. **Dữ liệu:** Nếu dùng dữ liệu thật của đơn vị (Jira/Email/Teams), bắt buộc xin phép trước và mask thông tin nhạy cảm khi demo. Khuyến khích dùng dữ liệu tự sinh hoặc dataset cá nhân của thành viên team.
2. **LLM cost:** Ban tổ chức có thể tài trợ một phần API credit (cần xác nhận trước). Nếu không, các team tự lo.
3. **Code reuse:** Cho phép dùng open-source library, framework agent có sẵn. Nhưng phần “gom TODO + reasoning” phải là code/prompt do team viết.
4. **Đạo văn:** Bắt copy-paste solution có sẵn trên mạng → loại.
5. **Sau cuộc thi:** Top 1–3 sẽ được hỗ trợ pilot trong đơn vị (resource + 1 sponsor từ ban lãnh đạo).

10. Timeline gợi ý

Sprint Mode (1 ngày — 8 tiếng)

1. 09:00 – 09:30: Kick-off, công bố đề bài, Q&A.
2. 09:30 – 11:00: Team brainstorm + chốt scope + chia task.
3. 11:00 – 16:00: Coding & integration.
4. 16:00 – 17:00: Test, chuẩn bị demo.
5. 17:00 – 18:00: Demo & chấm điểm.

Extended Mode (1 tuần)

1. Day 1: Kick-off, brainstorm, chốt architecture.
2. Day 2–3: Build core (multi-source ingestion + extraction).
3. Day 4–5: Build agent layer (reasoning, tool use, memory).
4. Day 6: UI + reminder + integration test.
5. Day 7: Demo prep + chấm điểm.

11. Phụ lục — Gợi ý tiếp cận

*Phần này không bắt buộc đọc, chỉ để tham khảo cho team chưa quen với AI Agent.*

A. Kiến trúc tham khảo

User → [Trigger / Schedule] → Agent Core (LLM + Planner) → Tools (JiraAPI, EmailReader, MeetingParser, TeamsReader, ReminderService) → Memory (vector DB / SQLite) → Notification Channel → User

B. Tools gợi ý cho agent

1. fetch\_jira\_tasks(user, since)
2. fetch\_emails(user, since, folder)
3. parse\_meeting\_minutes(file\_path)
4. fetch\_teams\_messages(channel, since)
5. extract\_todos\_from\_text(text, source) — đây là tool dùng LLM
6. save\_todo(todo\_obj)
7. schedule\_reminder(todo\_id, when, channel)
8. get\_user\_feedback(todo\_id) → accept/reject/edit

C. Reference

1. Anthropic — “Building effective agents” (engineering blog)
2. OpenAI — Function calling docs
3. LangGraph — Agent patterns
4. ReAct paper (Yao et al., 2022)

*— HẾT —*

*TO DO: Daily 30 phút/ngày*

Ngày 1:

* Nghĩ idea signature: ALL
* Xác định công cụ (VD: ) sử dụng & input: anh Tình

Ngày 2:

* Tổng hợp, finalize ý tưởng
* Requirement, design doc, design material (gen = AI)

Ngày 3 – 4: Gen code

Ngày 5: Finalize report
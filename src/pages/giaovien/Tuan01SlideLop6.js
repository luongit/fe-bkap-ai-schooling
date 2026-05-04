import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Tuan01SlideLop6.css';

const TOTAL_SLIDES = 11;

const SLIDES_HTML = `
<!-- ============================================
         SLIDE 1: BÌA
         ============================================ -->
    <div class="slide cover active" id="slide-1" data-time="0" data-section="Trang bìa">
      <div class="cover-grid"></div>
      <div class="cover-content">
        <div class="cover-text">
          <div class="cover-eyebrow">⚡ TUẦN 1 · INO-AIE6-01</div>
          <h1 class="cover-title">Chào AI!<br>AI quanh em.</h1>
          <p class="cover-subtitle">Khởi động hành trình 4 năm khám phá Trí tuệ nhân tạo<br>cùng câu lạc bộ AI Thinker.</p>
          <div class="cover-info-row">
            <div class="cover-info-item">
              ⏱ Thời lượng
              <strong>45 phút</strong>
            </div>
            <div class="cover-info-item">
              🎯 Cấp độ
              <strong>AI Explorer · Lớp 6</strong>
            </div>
            <div class="cover-info-item">
              🧭 Bloom
              <strong>Remember</strong>
            </div>
          </div>
        </div>

        <div class="cover-visual">
          <div class="cover-bin-card">
            <svg viewBox="0 0 220 280" width="220" height="260" style="margin-top: 12px;">
              <!-- Anten -->
              <line x1="110" y1="22" x2="110" y2="44" stroke="#60A5FA" stroke-width="3" stroke-linecap="round"/>
              <circle cx="110" cy="20" r="6" fill="#F97316"/>
              <circle cx="110" cy="20" r="3" fill="#FED7AA"/>
              <!-- Đầu robot -->
              <rect x="55" y="44" width="110" height="92" rx="18" fill="#E2E8F0" stroke="#2563EB" stroke-width="2.5"/>
              <!-- Kính bảo hộ (Bin Lab) -->
              <rect x="60" y="68" width="100" height="34" rx="6" fill="#0F172A" opacity="0.92"/>
              <circle cx="85" cy="85" r="11" fill="#06B6D4"/>
              <circle cx="135" cy="85" r="11" fill="#06B6D4"/>
              <circle cx="88" cy="82" r="3" fill="#FFFFFF"/>
              <circle cx="138" cy="82" r="3" fill="#FFFFFF"/>
              <!-- Gọng kính -->
              <line x1="55" y1="85" x2="60" y2="85" stroke="#0F172A" stroke-width="3"/>
              <line x1="160" y1="85" x2="165" y2="85" stroke="#0F172A" stroke-width="3"/>
              <line x1="96" y1="85" x2="124" y2="85" stroke="#0F172A" stroke-width="2.5"/>
              <!-- Miệng (smile) -->
              <path d="M 92 118 Q 110 128 128 118" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              <!-- Áo blouse trắng -->
              <rect x="50" y="140" width="120" height="86" rx="10" fill="#FFFFFF" stroke="#2563EB" stroke-width="2.5"/>
              <!-- Ve áo -->
              <path d="M 110 140 L 92 165 L 110 168 L 128 165 Z" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
              <!-- Logo trên áo -->
              <rect x="125" y="158" width="22" height="14" rx="3" fill="#2563EB"/>
              <text x="136" y="168" text-anchor="middle" fill="white" font-size="9" font-weight="800" font-family="Inter">AI</text>
              <!-- Túi áo -->
              <rect x="62" y="168" width="22" height="20" rx="2" fill="none" stroke="#2563EB" stroke-width="1.5"/>
              <line x1="68" y1="174" x2="78" y2="174" stroke="#F97316" stroke-width="2"/>
              <line x1="68" y1="180" x2="76" y2="180" stroke="#F97316" stroke-width="2"/>
              <!-- Tay -->
              <rect x="34" y="148" width="20" height="58" rx="8" fill="#E2E8F0" stroke="#2563EB" stroke-width="2"/>
              <rect x="166" y="148" width="20" height="58" rx="8" fill="#E2E8F0" stroke="#2563EB" stroke-width="2"/>
              <!-- Bàn tay (giữ máy tính bảng) -->
              <rect x="160" y="200" width="36" height="26" rx="3" fill="#0F172A" stroke="#2563EB" stroke-width="2"/>
              <rect x="163" y="203" width="30" height="20" rx="2" fill="#06B6D4"/>
              <text x="178" y="216" text-anchor="middle" fill="white" font-size="8" font-weight="800" font-family="JetBrains Mono">LAB</text>
              <circle cx="44" cy="210" r="9" fill="#E2E8F0" stroke="#2563EB" stroke-width="2"/>
              <!-- Chân -->
              <rect x="76" y="226" width="22" height="38" rx="6" fill="#1E2D5C" stroke="#0F172A" stroke-width="2"/>
              <rect x="122" y="226" width="22" height="38" rx="6" fill="#1E2D5C" stroke="#0F172A" stroke-width="2"/>
              <ellipse cx="87" cy="266" rx="16" ry="5" fill="#0F172A"/>
              <ellipse cx="133" cy="266" rx="16" ry="5" fill="#0F172A"/>
            </svg>
            <p class="cover-bin-label">// LAB ASSISTANT</p>
            <p class="cover-bin-name">BIN · v6.0</p>
          </div>
        </div>
      </div>

      <div class="cover-footer">
        <span>INOHUB · AI THINKER THCS</span>
        <span>2026 — 2027 / SLIDE 01 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 2: CHÀO MỪNG NĂM HỌC + LỘ TRÌNH BÀI HỌC
         ============================================ -->
    <div class="slide" id="slide-2" data-time="2" data-section="Chào hỏi (5 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge">📍 CHÀO HỎI</span>
          <span class="slide-tag-time">Phút <strong>0 — 5</strong> · Mở đầu năm học</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 2 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">Chào mừng đến CLB AI Thinker!</h2>
      <p class="slide-subtitle">Hôm nay chúng ta sẽ đi qua 4 chặng — mỗi chặng có nhiệm vụ riêng.</p>

      <div class="slide-body">
        <div class="roadmap-grid">
          <div class="roadmap-item current">
            <div class="roadmap-icon">👋</div>
            <div class="roadmap-time">5 PHÚT</div>
            <div class="roadmap-phase">Chào hỏi</div>
            <div class="roadmap-detail">Làm quen, giới thiệu lộ trình 36 tuần & nội quy CLB.</div>
          </div>
          <div class="roadmap-item">
            <div class="roadmap-icon">🔍</div>
            <div class="roadmap-time">15 PHÚT</div>
            <div class="roadmap-phase">Khám phá</div>
            <div class="roadmap-detail">Xem video AI nổi bật + nhận diện AI quanh ta.</div>
          </div>
          <div class="roadmap-item">
            <div class="roadmap-icon">🛠</div>
            <div class="roadmap-time">20 PHÚT</div>
            <div class="roadmap-phase">Cùng làm</div>
            <div class="roadmap-detail">Hoạt động "Săn AI trong lớp" — điền Sổ Săn AI.</div>
          </div>
          <div class="roadmap-item">
            <div class="roadmap-icon">💬</div>
            <div class="roadmap-time">5 PHÚT</div>
            <div class="roadmap-phase">Chia sẻ</div>
            <div class="roadmap-detail">Ghi AI Journal — nhận BTVN tuần đầu tiên.</div>
          </div>
        </div>

        <div style="margin-top: 26px; padding: 18px 22px; background: linear-gradient(135deg, #FFF7ED, #FED7AA); border: 2px solid #FDBA74; border-radius: 14px; display: flex; gap: 16px; align-items: center;">
          <div style="font-size: 32px; flex-shrink: 0;">🎯</div>
          <div>
            <div style="font-size: 13px; color: #C2410C; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">Mục tiêu hôm nay</div>
            <div style="font-size: 15px; color: var(--ink-dark); font-weight: 500; line-height: 1.5;">Sau bài này, em sẽ <strong>kể được ít nhất 5 ứng dụng AI</strong> em đã gặp hằng ngày — và hiểu rằng AI <strong>không phải robot phim viễn tưởng</strong>, mà đang ở ngay trong điện thoại, lớp học, gia đình em.</div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Tuần 1 / 36 · Slide 2 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 3: HOOK — VIDEO AI BẤT NGỜ
         ============================================ -->
    <div class="slide" id="slide-3" data-time="5" data-section="Khám phá (15 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge" style="background: linear-gradient(135deg, #F97316, #F59E0B);">🎬 HOOK</span>
          <span class="slide-tag-time">Phút <strong>5 — 8</strong> · Video gây tò mò</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 3 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">AI làm được những gì rồi?</h2>
      <p class="slide-subtitle">Cùng xem 1 video ngắn — sau đó em sẽ trả lời 3 câu hỏi.</p>

      <div class="slide-body">
        <div class="hook-container">
          <div class="hook-video-area">
            <div class="hook-play-btn"></div>
            <div class="hook-video-meta">▶ VIDEO · 1:30 · GV CHIẾU TRỰC TIẾP</div>
            <div class="hook-video-title">"AI đã làm được gì trong năm 2025?"</div>
            <div class="hook-video-desc">Tổng hợp ngắn các ứng dụng AI nổi bật: ChatGPT trả lời như người, AI vẽ tranh từ chữ, xe Tesla tự lái, AI đánh bại kỳ thủ cờ vây, AI dự báo bão.</div>
            <div style="margin-top: 16px; font-size: 11px; color: rgba(255,255,255,0.6); font-family: 'JetBrains Mono', monospace;">📁 Video dự phòng: USB · YouTube cache (offline)</div>
          </div>

          <div class="hook-questions">
            <div class="hook-q-title">⚡ Câu hỏi gợi mở</div>
            <div class="hook-q-item"><span class="q-num">Q1.</span>Trong video, em thấy <strong>cái nào</strong> ấn tượng nhất? Vì sao?</div>
            <div class="hook-q-item"><span class="q-num">Q2.</span>Em đã từng <strong>tự mình dùng</strong> cái nào trong số đó chưa?</div>
            <div class="hook-q-item"><span class="q-num">Q3.</span>Theo em, AI <strong>có thật sự "thông minh"</strong> như con người không?</div>

            <div style="margin-top: 4px; padding: 10px 14px; background: #FEF3C7; border-radius: 8px; font-size: 12px; color: #92400E; font-weight: 600;">
              💡 GV: <em>không trả lời ngay</em> — để 3 câu hỏi này "treo lơ lửng" cho HS suy nghĩ trong cả tiết học.
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Khám phá · Phần 1/3 · Slide 3 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 4: AI QUANH TA — 8 ỨNG DỤNG QUEN THUỘC
         ============================================ -->
    <div class="slide" id="slide-4" data-time="8" data-section="Khám phá (15 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge">🔍 KHÁM PHÁ</span>
          <span class="slide-tag-time">Phút <strong>8 — 14</strong> · 8 AI em đã từng gặp</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 4 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">AI ở rất gần em — em chỉ chưa để ý.</h2>
      <p class="slide-subtitle">Bấm tay lên cao nếu em đã từng dùng/gặp ứng dụng này.</p>

      <div class="slide-body">
        <div class="apps-grid">
          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #10A37F, #0E8E6F);">💬</div>
            <div class="app-name">ChatGPT</div>
            <div class="app-fn">Trả lời câu hỏi, viết văn, giải toán</div>
          </div>
          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #FF0050, #FF4081);">🎵</div>
            <div class="app-name">TikTok</div>
            <div class="app-fn">Gợi ý video em sẽ thích</div>
          </div>
          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #4285F4, #34A853);">🗺</div>
            <div class="app-name">Google Maps</div>
            <div class="app-fn">Tránh tắc đường, dẫn đường</div>
          </div>
          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #0068FF, #00B0FF);">💌</div>
            <div class="app-name">Zalo AI</div>
            <div class="app-fn">Sửa ảnh, dịch tin nhắn</div>
          </div>

          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #1DB954, #1ED760);">🎧</div>
            <div class="app-name">Spotify</div>
            <div class="app-fn">Gợi ý bài hát mới</div>
          </div>
          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #2D2D2D, #5D5D5D);">📸</div>
            <div class="app-name">Camera điện thoại</div>
            <div class="app-fn">Nhận khuôn mặt, làm đẹp tự động</div>
          </div>
          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #4285F4, #1976D2);">🌐</div>
            <div class="app-name">Google Dịch</div>
            <div class="app-fn">Dịch tiếng Anh sang tiếng Việt</div>
          </div>
          <div class="app-card">
            <div class="app-icon" style="background: linear-gradient(135deg, #F97316, #FBBF24);">🎮</div>
            <div class="app-name">Game đối kháng</div>
            <div class="app-fn">"NPC" / bot là AI đó!</div>
          </div>
        </div>

        <div style="margin-top: 22px; display: flex; gap: 14px;">
          <div style="flex: 1; padding: 14px 18px; background: var(--paper); border-radius: 12px; border-left: 4px solid var(--tech-blue); font-size: 13px; color: var(--ink-mid); line-height: 1.5;">
            <strong style="color: var(--tech-navy);">Điểm chung:</strong> Tất cả đều <strong>"học" từ dữ liệu</strong> — càng dùng nhiều, càng "hiểu" em hơn.
          </div>
          <div style="flex: 1; padding: 14px 18px; background: var(--paper); border-radius: 12px; border-left: 4px solid var(--accent-orange); font-size: 13px; color: var(--ink-mid); line-height: 1.5;">
            <strong style="color: var(--tech-navy);">Khác biệt:</strong> Không có robot biết đi. AI thật <strong>thường vô hình</strong>, ẩn trong app.
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Khám phá · Phần 2/3 · Slide 4 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 5: AI THẬT vs ẢO TƯỞNG AI
         ============================================ -->
    <div class="slide" id="slide-5" data-time="14" data-section="Khám phá (15 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge">🔍 KHÁM PHÁ</span>
          <span class="slide-tag-time">Phút <strong>14 — 20</strong> · Phân biệt thật/ảo</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 5 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">AI thật ≠ "Ảo tưởng AI"</h2>
      <p class="slide-subtitle">Không phải cứ thấy chữ "AI" trên quảng cáo là có AI bên trong.</p>

      <div class="slide-body">
        <div class="discuss-grid">
          <div class="discuss-card true-ai">
            <div class="discuss-card-title">✅ ĐÂY MỚI LÀ AI THẬT</div>
            <ul class="discuss-list">
              <li><strong>ChatGPT</strong> — học từ hàng tỉ trang văn bản, trả lời linh hoạt mỗi lần một khác.</li>
              <li><strong>Camera làm đẹp</strong> — nhận diện đúng vị trí mắt, môi, mũi rồi mới chỉnh.</li>
              <li><strong>Google Maps tránh tắc</strong> — dự báo dựa trên hàng triệu xe đang chạy thật.</li>
              <li><strong>YouTube gợi ý</strong> — học thói quen xem của riêng từng em.</li>
            </ul>
          </div>

          <div class="discuss-card fake-ai">
            <div class="discuss-card-title">❌ "ẢO TƯỞNG AI" — KHÔNG PHẢI AI</div>
            <ul class="discuss-list">
              <li><strong>Đèn cảm biến</strong> bật khi có người — chỉ là cảm biến, không "học".</li>
              <li><strong>Máy tính bỏ túi</strong> — chỉ thực hiện công thức cố định.</li>
              <li><strong>Bàn phím gợi ý từ T9 cũ</strong> — bảng từ điển sẵn, không học theo người dùng.</li>
              <li><strong>Đồng hồ báo thức</strong> — chỉ kêu khi đến giờ, không "thông minh".</li>
            </ul>
          </div>
        </div>

        <div style="margin-top: 18px; padding: 14px 20px; background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border-radius: 12px; border: 2px solid var(--tech-blue-light); display: flex; gap: 14px; align-items: center;">
          <div style="font-size: 26px;">🧪</div>
          <div style="flex: 1; font-size: 14px; color: var(--ink-dark); line-height: 1.5;">
            <strong style="color: var(--tech-blue);">Câu test 30 giây:</strong> Một thiết bị/app được gọi là có AI khi nó <strong>"học được"</strong> từ dữ liệu — nghĩa là sẽ <strong>hoạt động khác đi</strong> sau khi gặp thêm dữ liệu mới. Đèn cảm biến hôm nay và 1 năm sau vẫn bật/tắt y hệt → không phải AI.
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Khám phá · Phần 3/3 · Slide 5 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 6: APPLY — GIỚI THIỆU "SĂN AI"
         ============================================ -->
    <div class="slide" id="slide-6" data-time="20" data-section="Cùng làm (20 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge" style="background: linear-gradient(135deg, #10B981, #059669);">🛠 CÙNG LÀM</span>
          <span class="slide-tag-time">Phút <strong>20 — 24</strong> · Giới thiệu nhiệm vụ</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 6 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">Nhiệm vụ #1: Săn AI trong lớp! 🔎</h2>
      <p class="slide-subtitle">Em là "thám tử AI". Trong 12 phút, em sẽ tìm 5 ứng dụng AI ngay xung quanh em.</p>

      <div class="slide-body">
        <div class="hunt-container">
          <div class="hunt-instructions">
            <div style="font-size: 14px; color: #047857; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">📋 Hướng dẫn 4 bước</div>

            <div class="hunt-step">
              <div class="hunt-step-num">1</div>
              <div class="hunt-step-text">Mở <strong>Sổ AI Journal</strong> đến trang "Tuần 1 — Sổ Săn AI" (đã in sẵn).</div>
            </div>
            <div class="hunt-step">
              <div class="hunt-step-num">2</div>
              <div class="hunt-step-text">Quan sát quanh em: <strong>điện thoại, máy tính, app trong cặp, sách, biển báo</strong>… ghi tên 5 thứ em <em>nghi ngờ</em> có AI.</div>
            </div>
            <div class="hunt-step">
              <div class="hunt-step-num">3</div>
              <div class="hunt-step-text">Với mỗi thứ, viết <strong>1 câu lý do</strong>: <em>"Vì nó học/đoán/gợi ý/nhận diện được…"</em></div>
            </div>
            <div class="hunt-step">
              <div class="hunt-step-num">4</div>
              <div class="hunt-step-text">Đánh dấu <strong>⭐ ngôi sao</strong> vào ứng dụng em <em>thích nhất</em> — sẽ chia sẻ ở phần sau.</div>
            </div>

            <div style="margin-top: auto; padding: 12px 14px; background: white; border-radius: 10px; font-size: 12px; color: var(--ink-mid); border-left: 3px solid var(--accent-emerald); line-height: 1.5;">
              ⏱ <strong>Thời gian:</strong> 10 phút làm cá nhân + 2 phút thảo luận theo cặp.
            </div>
          </div>

          <div class="hunt-table">
            <div class="hunt-table-title">Sổ Săn AI · Tuần 1</div>

            <div class="hunt-row head">
              <span>STT</span>
              <span>Em tìm thấy gì?</span>
              <span>Vì sao em nghĩ đây là AI?</span>
            </div>

            <div class="hunt-row example">
              <div class="num">VD</div>
              <div class="obj">Camera điện thoại</div>
              <div class="reason">Vì nó nhận đúng mặt em, tự làm đẹp.</div>
            </div>

            <div class="hunt-row">
              <div class="num">1</div>
              <div class="blank"></div>
              <div class="blank"></div>
            </div>
            <div class="hunt-row">
              <div class="num">2</div>
              <div class="blank"></div>
              <div class="blank"></div>
            </div>
            <div class="hunt-row">
              <div class="num">3</div>
              <div class="blank"></div>
              <div class="blank"></div>
            </div>
            <div class="hunt-row">
              <div class="num">4</div>
              <div class="blank"></div>
              <div class="blank"></div>
            </div>
            <div class="hunt-row">
              <div class="num">5</div>
              <div class="blank"></div>
              <div class="blank"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Cùng làm · Phần 1/3 · Slide 6 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 7: APPLY — GỢI Ý SĂN AI THEO KHU VỰC
         ============================================ -->
    <div class="slide" id="slide-7" data-time="24" data-section="Cùng làm (20 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge" style="background: linear-gradient(135deg, #10B981, #059669);">🛠 CÙNG LÀM</span>
          <span class="slide-tag-time">Phút <strong>24 — 34</strong> · HS làm việc cá nhân/cặp</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 7 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">Bí kíp săn AI: 4 vùng săn 🗺</h2>
      <p class="slide-subtitle">Nếu em "bí" — hãy quan sát theo 4 vùng này. Mỗi vùng đều có AI ẩn.</p>

      <div class="slide-body">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div style="background: linear-gradient(135deg, #EFF6FF, white); border: 2px solid var(--tech-blue-light); border-radius: 14px; padding: 18px 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--tech-blue); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">📱</div>
              <div style="font-size: 16px; font-weight: 800; color: var(--tech-navy);">Vùng 1 · Điện thoại của em</div>
            </div>
            <ul style="list-style: none; padding-left: 4px; font-size: 13px; color: var(--ink-mid); line-height: 1.7;">
              <li>• Bàn phím <strong>tự gợi ý từ tiếp theo</strong></li>
              <li>• Camera <strong>nhận khuôn mặt mở khóa</strong></li>
              <li>• Trợ lý <strong>"OK Google"</strong>, Siri, Bixby</li>
              <li>• <strong>Gợi ý ảnh</strong> theo người, theo địa điểm</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #FFF7ED, white); border: 2px solid #FDBA74; border-radius: 14px; padding: 18px 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--accent-orange); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">🎬</div>
              <div style="font-size: 16px; font-weight: 800; color: var(--tech-navy);">Vùng 2 · App giải trí</div>
            </div>
            <ul style="list-style: none; padding-left: 4px; font-size: 13px; color: var(--ink-mid); line-height: 1.7;">
              <li>• <strong>TikTok / YouTube</strong> chọn video hợp gu</li>
              <li>• <strong>Spotify / Zing MP3</strong> gợi ý bài hát mới</li>
              <li>• <strong>Bộ lọc</strong> Instagram / Snapchat / Zalo</li>
              <li>• <strong>Bot</strong> trong game online</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #ECFDF5, white); border: 2px solid #6EE7B7; border-radius: 14px; padding: 18px 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--accent-emerald); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">🎒</div>
              <div style="font-size: 16px; font-weight: 800; color: var(--tech-navy);">Vùng 3 · Học tập</div>
            </div>
            <ul style="list-style: none; padding-left: 4px; font-size: 13px; color: var(--ink-mid); line-height: 1.7;">
              <li>• <strong>ChatGPT, Gemini</strong> giải bài tập</li>
              <li>• <strong>Google Dịch</strong>, Microsoft Translate</li>
              <li>• <strong>Photomath</strong> — chụp toán ra lời giải</li>
              <li>• <strong>Duolingo</strong> chọn câu hỏi đúng trình độ</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #FDF2F8, white); border: 2px solid #F9A8D4; border-radius: 14px; padding: 18px 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--accent-rose); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">🏠</div>
              <div style="font-size: 16px; font-weight: 800; color: var(--tech-navy);">Vùng 4 · Đường phố & gia đình</div>
            </div>
            <ul style="list-style: none; padding-left: 4px; font-size: 13px; color: var(--ink-mid); line-height: 1.7;">
              <li>• <strong>Camera AI</strong> đọc biển số xe ở giao lộ</li>
              <li>• <strong>Robot hút bụi</strong> tự né đồ vật</li>
              <li>• <strong>Máy lạnh, tivi</strong> "smart" tự điều chỉnh</li>
              <li>• <strong>Be / Grab</strong> ước tính giá, ETA chuyến xe</li>
            </ul>
          </div>
        </div>

        <div style="margin-top: 18px; padding: 12px 18px; background: var(--tech-navy); color: white; border-radius: 10px; display: flex; gap: 14px; align-items: center; font-size: 13px;">
          <div style="font-size: 20px;">⏱</div>
          <div style="flex: 1;"><strong style="color: var(--accent-amber);">GV ghi đồng hồ đếm ngược trên bảng:</strong> Còn <strong>10 phút</strong> để hoàn thành Sổ Săn AI. GV đi quanh lớp hỗ trợ HS.</div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Cùng làm · Phần 2/3 · Slide 7 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 8: APPLY — GHÉP CẶP CHIA SẺ
         ============================================ -->
    <div class="slide" id="slide-8" data-time="34" data-section="Cùng làm (20 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge" style="background: linear-gradient(135deg, #10B981, #059669);">🛠 CÙNG LÀM</span>
          <span class="slide-tag-time">Phút <strong>34 — 38</strong> · Chia sẻ cặp đôi</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 8 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">Ghép cặp chia sẻ — 4 phút 🤝</h2>
      <p class="slide-subtitle">Em quay sang bạn bên cạnh, thay phiên nhau kể về danh sách AI của mình.</p>

      <div class="slide-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 22px; height: 100%;">
          <div style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border: 2px solid var(--tech-blue); border-radius: 16px; padding: 24px;">
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: white; color: var(--tech-blue); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; font-family: 'JetBrains Mono', monospace;">A</div>
              <div>
                <div style="font-size: 11px; color: var(--tech-blue); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">2 phút đầu</div>
                <div style="font-size: 18px; font-weight: 800; color: var(--ink-dark);">Bạn A nói — bạn B nghe</div>
              </div>
            </div>
            <ul style="list-style: none; padding: 0; font-size: 14px; color: var(--ink-dark); line-height: 1.7;">
              <li style="margin-bottom: 8px;">📝 Bạn A đọc <strong>5 ứng dụng</strong> AI mình tìm được.</li>
              <li style="margin-bottom: 8px;">⭐ Giải thích <strong>vì sao</strong> chọn ứng dụng có sao.</li>
              <li style="margin-bottom: 8px;">🤔 Bạn B <strong>hỏi 1 câu</strong>: "Em chắc đó là AI không?"</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #FFF7ED, #FED7AA); border: 2px solid var(--accent-orange); border-radius: 16px; padding: 24px;">
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: white; color: var(--accent-orange); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; font-family: 'JetBrains Mono', monospace;">B</div>
              <div>
                <div style="font-size: 11px; color: var(--accent-orange); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">2 phút sau</div>
                <div style="font-size: 18px; font-weight: 800; color: var(--ink-dark);">Đổi vai — bạn B nói</div>
              </div>
            </div>
            <ul style="list-style: none; padding: 0; font-size: 14px; color: var(--ink-dark); line-height: 1.7;">
              <li style="margin-bottom: 8px;">🎤 Bạn B đọc danh sách AI của mình.</li>
              <li style="margin-bottom: 8px;">✏️ Hai bạn <strong>thêm</strong> 1-2 ứng dụng mới vào sổ nhau.</li>
              <li style="margin-bottom: 8px;">✨ Tìm <strong>1 ứng dụng giống nhau</strong> — đánh dấu hai sao.</li>
            </ul>
          </div>
        </div>

        <div style="margin-top: 16px; padding: 14px 20px; background: var(--paper); border-radius: 12px; border-left: 4px solid var(--accent-violet); font-size: 13px; color: var(--ink-dark); line-height: 1.5;">
          <strong style="color: var(--accent-violet);">💡 Mục tiêu của hoạt động cặp:</strong> Em sẽ phát hiện cùng 1 thứ (vd. điện thoại) nhưng <strong>nhìn thấy AI khác nhau</strong> — đó chính là cách AI Thinker bắt đầu hình thành tư duy quan sát đa chiều.
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Cùng làm · Phần 3/3 · Slide 8 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 9: REFLECT — AI JOURNAL 3 CÂU HỎI
         ============================================ -->
    <div class="slide" id="slide-9" data-time="38" data-section="Chia sẻ (5 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">💬 CHIA SẺ</span>
          <span class="slide-tag-time">Phút <strong>38 — 41</strong> · Ghi AI Journal</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 9 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">AI Journal — 3 câu cố định mỗi tuần</h2>
      <p class="slide-subtitle">Em ghi vào sổ AI Journal cá nhân — đây là sổ em sẽ giữ <strong>suốt 4 năm</strong> THCS.</p>

      <div class="slide-body">
        <div class="reflect-grid">
          <div class="reflect-journal">
            <div class="reflect-journal-title">📔 AI JOURNAL · TUẦN 1</div>

            <div class="reflect-q">
              <span class="reflect-q-num">Q1.</span>Hôm nay em đã <strong>khám phá ra</strong> điều gì mới về AI?
            </div>
            <div class="reflect-q">
              <span class="reflect-q-num">Q2.</span>Em còn <strong>thắc mắc</strong> gì về AI mà chưa được trả lời?
            </div>
            <div class="reflect-q">
              <span class="reflect-q-num">Q3.</span>Tuần này em sẽ <strong>để ý xem</strong> AI ở đâu trong cuộc sống của mình?
            </div>

            <div style="margin-top: 14px; padding: 10px 14px; background: white; border-radius: 8px; font-size: 12px; color: var(--ink-mid);">
              ✏️ <strong>Mỗi câu trả 1-2 dòng</strong>. Không có đáp án đúng/sai. Cô đọc và ghi nhận.
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border: 2px solid var(--accent-emerald); border-radius: 14px; padding: 18px 20px;">
              <div style="font-size: 13px; color: #047857; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">🎤 Mời 2-3 HS chia sẻ trước lớp</div>
              <ul style="list-style: none; padding: 0; font-size: 13px; color: var(--ink-dark); line-height: 1.6;">
                <li style="margin-bottom: 6px;">• Mỗi em <strong>30 giây</strong> — chia sẻ 1 ứng dụng AI có sao ⭐</li>
                <li style="margin-bottom: 6px;">• Cô <strong>không sửa</strong> — chỉ ghi nhận và đặt thêm 1 câu hỏi mở</li>
                <li>• Cả lớp <strong>vỗ tay</strong> sau mỗi bạn chia sẻ</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #FDF2F8, #FCE7F3); border: 2px solid var(--accent-rose); border-radius: 14px; padding: 18px 20px;">
              <div style="font-size: 13px; color: #BE185D; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">⚠️ Lưu ý quan trọng</div>
              <p style="font-size: 13px; color: var(--ink-dark); line-height: 1.55;">
                <strong>Không cắt bỏ</strong> phần Reflect dù APPLY có kéo dài. Theo đường cong lãng quên Ebbinghaus, không có Reflect → HS quên 70% kiến thức trong 24h.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Chia sẻ · Phần 1/2 · Slide 9 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 10: BTVN — CHỤP 5 ỨNG DỤNG AI Ở NHÀ
         ============================================ -->
    <div class="slide" id="slide-10" data-time="41" data-section="Chia sẻ (5 phút)">
      <div class="slide-header">
        <div class="slide-tag">
          <span class="slide-tag-badge" style="background: linear-gradient(135deg, #F59E0B, #F97316);">📚 BÀI TẬP VỀ NHÀ</span>
          <span class="slide-tag-time">Phút <strong>41 — 44</strong> · Giao nhiệm vụ tuần</span>
        </div>
        <div class="slide-meta">
          <span class="code">INO-AIE6-01</span>
          <span>Slide 10 / 11</span>
        </div>
      </div>

      <h2 class="slide-title">BTVN: Săn 5 AI ở nhà em! 📷</h2>
      <p class="slide-subtitle">Mở rộng "vùng săn" — về nhà tìm 5 ứng dụng AI khác (không trùng với danh sách hôm nay).</p>

      <div class="slide-body">
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 22px; height: 100%;">
          <div class="homework-card">
            <div class="homework-title">🎯 Nhiệm vụ chính</div>
            <div class="homework-due">📅 NỘP: ĐẦU TIẾT TUẦN SAU</div>

            <div class="homework-task">
              <strong>1. Chụp ảnh 5 ứng dụng AI ở nhà</strong> — có thể là điện thoại bố mẹ, smart TV, máy lạnh, robot hút bụi, đồng hồ thông minh, app trên iPad…
            </div>
            <div class="homework-task">
              <strong>2. Với mỗi ảnh, viết 1 câu chú thích:</strong> tên thiết bị/app + 1 lý do em nghĩ đây là AI thật.
            </div>
            <div class="homework-task">
              <strong>3. Gửi vào Padlet lớp</strong> (link cô đã chia sẻ) — hoặc dán in vào sổ AI Journal.
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: white; border: 2px solid var(--line); border-radius: 14px; padding: 18px 20px;">
              <div style="font-size: 13px; color: var(--tech-blue); font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">⏱ Thời gian dự kiến</div>
              <div style="font-size: 28px; font-weight: 900; color: var(--ink-dark); font-family: 'JetBrains Mono', monospace;">15 — 20'</div>
              <div style="font-size: 12px; color: var(--ink-soft); margin-top: 4px;">Có thể nhờ bố/mẹ giải thích thêm.</div>
            </div>

            <div style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border: 2px solid var(--tech-blue-light); border-radius: 14px; padding: 18px 20px;">
              <div style="font-size: 13px; color: var(--tech-blue); font-weight: 800; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">🏆 Thưởng</div>
              <p style="font-size: 13px; color: var(--ink-dark); line-height: 1.55;">Bài có <strong>5 ứng dụng đa dạng</strong> + chú thích rõ → <strong>+1 điểm bonus</strong> vào AI Portfolio. Bài hay sẽ được chọn chia sẻ ở slide 2 tuần sau.</p>
            </div>

            <div style="background: var(--paper); border: 1.5px dashed var(--ink-soft); border-radius: 12px; padding: 12px 16px; font-size: 12px; color: var(--ink-mid); line-height: 1.5;">
              💡 <strong>Mẹo:</strong> Nếu nhà em không có nhiều thiết bị thông minh, em có thể tìm AI trong các app trên điện thoại bố mẹ (Zalo, Shopee, YouTube...).
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div class="brand"><span class="brand-dot"></span><span>INOHUB · AI Thinker THCS</span></div>
        <span>Chia sẻ · Phần 2/2 · Slide 10 / 11</span>
      </div>
    </div>

    <!-- ============================================
         SLIDE 11: KẾT THÚC — TẠM BIỆT + GIỚI THIỆU TUẦN 2
         ============================================ -->
    <div class="slide completion" id="slide-11" data-time="44" data-section="Kết thúc">
      <div class="completion-content">
        <div class="completion-badge">⚡ TUẦN 1 HOÀN THÀNH</div>

        <h1 class="completion-title">Cảm ơn em!<br>Hẹn gặp tuần sau.</h1>

        <p class="completion-subtitle">
          Hôm nay em đã chính thức trở thành <strong style="color: #FED7AA;">AI Explorer</strong> — bắt đầu hành trình 36 tuần khám phá Trí tuệ nhân tạo. Tuần sau sẽ thú vị hơn nữa!
        </p>

        <div class="completion-next">
          <div class="completion-next-label">▸ TUẦN 2 · INO-AIE6-02</div>
          <div class="completion-next-title">AI là gì? Máy có thông minh không?</div>
          <div class="completion-next-desc">Em sẽ chơi <em>"Người hay máy?"</em> — phiên bản mini của Turing Test, để xem mình có phân biệt được tin nhắn của bạn và tin nhắn của AI không.</div>
        </div>

        <div style="position: absolute; bottom: 24px; left: 64px; right: 64px; display: flex; justify-content: space-between; color: rgba(255,255,255,0.4); font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px;">
          <span>INOHUB · AI THINKER THCS · 2026-2027</span>
          <span>SLIDE 11 / 11 · END_OF_LESSON</span>
        </div>
      </div>
    </div>
`;

const teacherNotes = {
    1: {
      section: 'Trang bìa · Mở đầu năm học',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> Tạo không khí phấn khích cho buổi đầu tiên của CLB AI Thinker. HS lớp 6 thường hồi hộp + tò mò — cần "đón" cảm xúc đó.</p>
        <div class="notes-section-title">Kịch bản 60 giây mở</div>
        <ul>
          <li>Mở slide trước khi HS vào lớp 2-3 phút, để nhạc nền nhẹ</li>
          <li>Đứng ở cửa, chào từng em vào — gọi tên nếu nhớ được</li>
          <li>Nói: <em>"Chào các em — chào mừng đến CLB AI Thinker. Trong 36 tuần tới, các em sẽ làm AI thật, không phải chỉ học lý thuyết."</em></li>
        </ul>
        <div class="notes-section-title">Tương tác mở đầu</div>
        <ul>
          <li>Hỏi nhanh: <em>"Có bạn nào đã từng dùng ChatGPT chưa?"</em> — đếm số tay giơ</li>
          <li>Không phán xét đáp án — chỉ lắng nghe và "wow!"</li>
        </ul>
        <div class="notes-section-title">💡 Mẹo</div>
        <p>Nhân vật <strong>Bin Lab</strong> trên slide bìa là "trợ lý phòng lab" suốt năm — giới thiệu Bin để HS nhớ.</p>
        <div class="notes-section-title">⚙️ Plan B</div>
        <p>Nếu máy chiếu hỏng: in slide bìa A3, dán bảng. Nếu HS vào muộn: vẫn giữ năng lượng — không cau có.</p>
      `
    },
    2: {
      section: 'Phần 1 · Chào hỏi (5 phút)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS hiểu được cấu trúc tiết học 4 pha (Hook–Explore–Apply–Reflect) và mục tiêu hôm nay.</p>
        <div class="notes-section-title">Kịch bản 4 phút</div>
        <ul>
          <li>Đi qua nhanh 4 ô lộ trình — chỉ vào ô "Cùng làm" và nói: <em>"20 phút này các em là chính, cô chỉ hỗ trợ."</em></li>
          <li>Nhấn vào ô mục tiêu màu cam dưới: <em>"Cuối tiết, mỗi em PHẢI kể được 5 ứng dụng AI."</em></li>
          <li>Giới thiệu nội quy: 3 quy tắc — (1) Tôn trọng ý kiến, (2) Không cười câu trả lời, (3) Mọi câu hỏi đều hợp lệ</li>
        </ul>
        <div class="notes-section-title">Tương tác</div>
        <ul>
          <li>Yêu cầu HS giơ tay: <em>"Bạn nào đã từng nghĩ AI là robot có hình người?"</em></li>
          <li>Không sửa — chỉ ghi nhận: <em>"Cuối tiết các em sẽ thấy AI khác xa cái đó."</em></li>
        </ul>
        <div class="notes-section-title">💡 Mẹo dạy</div>
        <p>Pha CHÀO HỎI dễ bị "lướt qua" — nhưng đây là pha <strong>tạo hợp đồng tâm lý</strong> giữa GV và HS. Đầu tư đủ 5 phút.</p>
        <div class="notes-section-title">⚙️ Plan B</div>
        <p>Nếu lớp đông >35 HS: giới thiệu nội quy ngắn hơn, dồn vào slide 6 khi giới thiệu nhiệm vụ chính.</p>
      `
    },
    3: {
      section: 'Phần 2 · Khám phá / HOOK (3 phút)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> Gây "WOW!" — kích thích tò mò trước khi giảng giải. Theo nguyên tắc HOOK, KHÔNG được trả lời 3 câu hỏi này ngay.</p>
        <div class="notes-section-title">Kịch bản 3 phút</div>
        <ul>
          <li>Chiếu video 1:30. Tắt đèn nếu được</li>
          <li>Sau video, hỏi 3 câu — KHÔNG để HS trả lời ngay</li>
          <li>Chỉ ghi nhận 2-3 cánh tay đầu tiên: <em>"Em sẽ nói cho cả lớp nghe ở phần Chia sẻ cuối tiết!"</em></li>
        </ul>
        <div class="notes-section-title">Tương tác</div>
        <ul>
          <li>Sau Q3 ("AI có thật sự thông minh không?") — hỏi HS giơ ngón tay cái lên/xuống</li>
          <li>Đếm sơ bộ: <em>"À, lớp mình chia khá đều — câu này sẽ là chủ đề cả tuần sau!"</em></li>
        </ul>
        <div class="notes-section-title">💡 Mẹo dạy</div>
        <p><strong>Nguyên tắc HOOK:</strong> "Gieo tò mò, không trả lời." Để câu hỏi "treo" suốt tiết → HS sẽ tự tìm câu trả lời ở pha APPLY.</p>
        <div class="notes-section-title">⚙️ Plan B (KHÔNG có Internet)</div>
        <p>Có sẵn video MP4 trong USB GV. Nếu cả USB cũng hỏng: kể bằng miệng — GV mô tả video bằng giọng kể chuyện. Hiệu ứng tương đương.</p>
      `
    },
    4: {
      section: 'Phần 2 · Khám phá / EXPLORE (6 phút)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS nhận ra <strong>AI ở rất gần</strong> qua 8 ứng dụng quen thuộc. Phá bỏ ấn tượng "AI = robot phim Hollywood".</p>
        <div class="notes-section-title">Kịch bản 6 phút</div>
        <ul>
          <li>Đi qua nhanh 8 ô — mỗi ô <strong>30 giây</strong>: nhấn tên + chức năng AI</li>
          <li>Yêu cầu HS giơ tay nếu đã từng dùng — đếm nhanh</li>
          <li>Lưu ý các ô có HS giơ tay >50% → chốt: <em>"Cả lớp đã đụng AI mỗi ngày!"</em></li>
        </ul>
        <div class="notes-section-title">Tương tác cao điểm</div>
        <ul>
          <li>Hỏi: <em>"Tại sao TikTok lại biết em thích video nào?"</em> → để HS tự đoán</li>
          <li>Đáp án gợi ý: <em>"Vì em xem video gì lâu, lướt nhanh video gì — TikTok ghi nhớ và 'học' gu của em."</em></li>
        </ul>
        <div class="notes-section-title">💡 Mẹo dạy</div>
        <p>Box "Điểm chung" + "Khác biệt" ở dưới — đây là <strong>chốt kiến thức quan trọng nhất</strong> của slide. Đừng chỉ chiếu — đọc to và nhấn mạnh.</p>
        <div class="notes-section-title">⚙️ Plan B</div>
        <p>Nếu HS không quen với app nào (lớp vùng sâu): thay TikTok bằng "video YouTube tự động phát tiếp", thay Spotify bằng "nhạc trên app điện thoại".</p>
      `
    },
    5: {
      section: 'Phần 2 · Khám phá / EXPLORE (6 phút)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS phân biệt được <strong>AI thật và "Ảo tưởng AI"</strong> — đây là kỹ năng phản biện quan trọng cho cả 4 năm.</p>
        <div class="notes-section-title">Kịch bản 6 phút</div>
        <ul>
          <li>Đọc 4 ví dụ "AI thật" trước (3 phút)</li>
          <li>Sau đó đọc 4 ví dụ "Ảo tưởng AI" (2 phút) — hỏi: <em>"Tại sao đèn cảm biến không phải AI?"</em></li>
          <li>Đọc box "Câu test 30 giây" và chốt định nghĩa hoạt động: <strong>AI = học từ dữ liệu</strong></li>
        </ul>
        <div class="notes-section-title">Tương tác - Câu hỏi bẫy</div>
        <ul>
          <li>Hỏi: <em>"Máy giặt có chữ 'Smart' trên thân — đó là AI không?"</em></li>
          <li>Đáp án: <strong>Tuỳ</strong> — nếu nó tự nhận đúng loại vải qua cảm biến và <strong>điều chỉnh</strong> mỗi lần khác đi → AI; nếu chỉ có chương trình cố định → không phải AI</li>
        </ul>
        <div class="notes-section-title">💡 Mẹo dạy</div>
        <p>Khái niệm "AI = học từ dữ liệu" sẽ được nhắc lại ở Tuần 2, 5, 6, 19, 20. Hôm nay chỉ cần HS <strong>nhớ câu này</strong>, chưa cần hiểu sâu.</p>
        <div class="notes-section-title">⚙️ Plan B</div>
        <p>Nếu HS quá khá (lớp chuyên): yêu cầu HS tự đưa thêm 1 ví dụ AI thật + 1 ví dụ "ảo tưởng AI" → ghi bảng.</p>
      `
    },
    6: {
      section: 'Phần 3 · Cùng làm / APPLY (4 phút giới thiệu)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS hiểu rõ nhiệm vụ "Săn AI" — biết phải làm gì trong 12 phút tiếp theo.</p>
        <div class="notes-section-title">Kịch bản 4 phút</div>
        <ul>
          <li>Phát Sổ AI Journal (đã in sẵn — INOHUB cung cấp) — mỗi em 1 cuốn</li>
          <li>Hướng dẫn HS giở đến trang "Tuần 1 — Sổ Săn AI"</li>
          <li>Đi qua 4 bước trên slide, đọc <strong>chậm</strong> từng bước</li>
          <li>Chỉ vào ô VD trong bảng: <em>"Đây là ví dụ — em không cần copy. Em tự tìm 5 cái khác."</em></li>
        </ul>
        <div class="notes-section-title">Tương tác</div>
        <ul>
          <li>Hỏi: <em>"Có em nào chưa hiểu nhiệm vụ?"</em> — đợi 5 giây</li>
          <li>Nếu có HS hỏi: trả lời nhanh, không đi sâu vào ví dụ</li>
        </ul>
        <div class="notes-section-title">💡 Mẹo dạy</div>
        <p><strong>Nguyên tắc Pha APPLY:</strong> GV nói càng ít càng tốt sau khi giao nhiệm vụ. HS làm việc — GV đi quanh hỗ trợ.</p>
        <div class="notes-section-title">⚙️ Plan B (Sổ chưa được in)</div>
        <p>Phát giấy A4 trắng. HS tự kẻ 3 cột: STT — Tên — Lý do. Cuối tiết dán vào sổ sau.</p>
      `
    },
    7: {
      section: 'Phần 3 · Cùng làm / APPLY (10 phút HS làm)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS tự nghĩ ra 5 ứng dụng AI từ đời sống của mình. Đây là <strong>sản phẩm cụ thể</strong> của tiết — Sổ Săn AI điền đủ.</p>
        <div class="notes-section-title">Kịch bản 10 phút</div>
        <ul>
          <li>Chiếu slide 4 vùng săn — để HS tham khảo nếu bí</li>
          <li>Bật <strong>đồng hồ đếm ngược 10 phút</strong> trên bảng (dùng Google Timer)</li>
          <li>Đi quanh lớp — KHÔNG gợi ý đáp án, chỉ hỏi: <em>"Em đã quan sát kĩ chưa?"</em></li>
          <li>Phút 5: nhắc <em>"Còn 5 phút!"</em></li>
          <li>Phút 8: nhắc <em>"Đánh sao vào ứng dụng em thích nhất!"</em></li>
        </ul>
        <div class="notes-section-title">Tương tác - HS bí</div>
        <ul>
          <li>HS không nghĩ ra: <em>"Em hãy mở app trên điện thoại bố mẹ — Zalo, Facebook, Shopee đều có AI."</em></li>
          <li>HS không có điện thoại: <em>"Em quan sát máy chiếu, máy in, đồng hồ trong lớp."</em></li>
        </ul>
        <div class="notes-section-title">💡 Mẹo quan sát</div>
        <p>Đi quanh lớp ghi nhớ 2-3 HS có câu trả lời <strong>thú vị nhất</strong> — cuối tiết mời các em này chia sẻ trước lớp ở pha REFLECT.</p>
        <div class="notes-section-title">⚙️ Plan B - HS xong sớm</div>
        <p>HS xong sớm: yêu cầu các em tìm thêm 3 ứng dụng nữa, hoặc <strong>vẽ logo</strong> cho ứng dụng yêu thích.</p>
      `
    },
    8: {
      section: 'Phần 3 · Cùng làm / APPLY (4 phút ghép cặp)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS chia sẻ thành quả với bạn bên cạnh — học cách <strong>nói về AI</strong> bằng lời của chính mình.</p>
        <div class="notes-section-title">Kịch bản 4 phút</div>
        <ul>
          <li>Yêu cầu HS quay sang bạn cùng bàn — nếu lớp lẻ thì nhóm 3</li>
          <li>Bật đồng hồ <strong>2 phút</strong> cho lượt A → đổi vai → 2 phút cho lượt B</li>
          <li>GV đi quanh lắng nghe — ghi nhận các cặp nói tốt</li>
        </ul>
        <div class="notes-section-title">Tương tác - Khi cặp im lặng</div>
        <ul>
          <li>Đi đến cặp im lặng, hỏi: <em>"Hai em đã xong chưa? Có thể chia sẻ với cô được không?"</em></li>
          <li>Nếu HS ngại: <em>"Em đọc cái đầu tiên trong sổ cho cô nghe đi."</em></li>
        </ul>
        <div class="notes-section-title">💡 Mẹo dạy</div>
        <p>Mục tiêu của ghép cặp <strong>không phải</strong> là ai đúng ai sai — mà là <strong>HS tự tin nói</strong> về AI bằng ngôn ngữ riêng. Đừng ngắt lời để sửa.</p>
        <div class="notes-section-title">⚙️ Plan B - Lớp ồn ào</div>
        <p>Bật chuông/clap rhythm để gọi sự chú ý. Nếu vẫn ồn: cắt 4 phút xuống còn 2 phút (chỉ 1 lượt A nói, B nghe).</p>
      `
    },
    9: {
      section: 'Phần 4 · Chia sẻ / REFLECT (3 phút)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS ghi <strong>AI Journal lần đầu tiên</strong> — đây là sổ em sẽ giữ suốt 4 năm (lưu giữ hành trình).</p>
        <div class="notes-section-title">Kịch bản 3 phút</div>
        <ul>
          <li>Mở Sổ AI Journal trang Reflect — đọc to 3 câu hỏi</li>
          <li>Bật đồng hồ <strong>2 phút</strong> để HS viết</li>
          <li>Mời 2-3 HS xung phong chia sẻ Q1 (đã chọn từ pha APPLY) — mỗi em 30 giây</li>
          <li>Cả lớp vỗ tay sau mỗi bạn</li>
        </ul>
        <div class="notes-section-title">Tương tác</div>
        <ul>
          <li>Sau khi HS chia sẻ, KHÔNG sửa — chỉ <strong>hỏi tiếp</strong> 1 câu mở: <em>"Tại sao em chọn cái đó?"</em></li>
          <li>Nếu HS chia sẻ ngắn quá: <em>"Em có thể nói thêm 1 câu nữa được không?"</em></li>
        </ul>
        <div class="notes-section-title">💡 Mẹo dạy</div>
        <p><strong>3 câu hỏi này LẶP LẠI mỗi tuần</strong> — để cuối năm HS có 36 entry. Đó là tài sản vô giá để đánh giá trưởng thành.</p>
        <div class="notes-section-title">⚙️ Plan B - HS không muốn chia sẻ</div>
        <p>Không ép. Cô đọc thay 1-2 entry mà cô đã đi quanh lớp đọc lén được (ghi nhận tên HS để cảm ơn).</p>
      `
    },
    10: {
      section: 'Phần 4 · Chia sẻ / Giao BTVN (3 phút)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> HS hiểu rõ BTVN, biết cách nộp, biết hạn nộp. BTVN tuần 1 là <strong>mở rộng vùng săn AI</strong> sang nhà em.</p>
        <div class="notes-section-title">Kịch bản 3 phút</div>
        <ul>
          <li>Đọc to 3 nhiệm vụ của BTVN</li>
          <li>Chỉ vào hộp "📅 NỘP: ĐẦU TIẾT TUẦN SAU" — nhấn mạnh deadline</li>
          <li>Chia sẻ <strong>link Padlet lớp</strong> (đã tạo trước) — yêu cầu HS chụp QR code trên slide hoặc gõ link</li>
          <li>Nhắc thưởng +1 điểm AI Portfolio cho bài tốt</li>
        </ul>
        <div class="notes-section-title">Tương tác</div>
        <ul>
          <li>Hỏi: <em>"Em nào có băn khoăn về BTVN không?"</em></li>
          <li>Trả lời nhanh các thắc mắc thường gặp: "Có cần in ảnh không?" (Không, gửi link là đủ); "Nếu nhà không có nhiều thiết bị?" (Đã ghi mẹo trên slide)</li>
        </ul>
        <div class="notes-section-title">💡 Mẹo</div>
        <p>BTVN tuần 1 phải <strong>NHẸ NHÀNG</strong> — đừng để HS sợ ngay tuần đầu. 5 ảnh trong 15 phút là đủ.</p>
        <div class="notes-section-title">⚙️ Plan B - Trường cấm điện thoại</div>
        <p>HS có thể vẽ tay 5 ứng dụng AI (mỗi cái 1 ô vuông + chú thích) — nộp giấy thay ảnh.</p>
      `
    },
    11: {
      section: 'Kết thúc · Liên kết tuần sau (1 phút)',
      content: `
        <p><strong>🎯 Mục tiêu:</strong> Đóng tiết với năng lượng tích cực + gieo tò mò cho tuần 2.</p>
        <div class="notes-section-title">Kịch bản 1 phút</div>
        <ul>
          <li>Cảm ơn lớp đã tham gia tích cực</li>
          <li>Đọc to ô "TUẦN 2 · INO-AIE6-02" — nhấn vào trò chơi <em>"Người hay máy?"</em></li>
          <li>Tạo tò mò: <em>"Tuần sau cô sẽ gửi 5 tin nhắn — 3 do người viết, 2 do AI viết. Em đoán được không?"</em></li>
          <li>Chào lớp tươi tắn — đợi HS đứng dậy đi ra mới tắt slide</li>
        </ul>
        <div class="notes-section-title">Tương tác</div>
        <ul>
          <li>Có thể yêu cầu lớp đồng thanh: <em>"Hẹn gặp tuần sau!"</em> kèm vẫy tay với Bin</li>
        </ul>
        <div class="notes-section-title">💡 Mẹo</div>
        <p><strong>Câu cuối tiết quyết định</strong> HS có háo hức quay lại tuần sau hay không. Đừng đọc thẳng — kể như sắp có "bí mật".</p>
        <div class="notes-section-title">⚙️ Plan B - Hết giờ sớm/muộn</div>
        <p>Sớm: cho HS đặt 1 câu hỏi về AI mình muốn được trả lời ở tuần sau. Muộn: bỏ phần đồng thanh, vẫy tay chào nhanh.</p>
      `
    }
  };

export default function Tuan01SlideLop6() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const [notesShown, setNotesShown] = useState(false);
  const [helpShown, setHelpShown] = useState(false);

  const goToSlide = useCallback((n) => {
    const next = Math.max(1, Math.min(TOTAL_SLIDES, Number(n) || 1));
    setCurrentSlide(next);
  }, []);

  const nextSlide = useCallback(() => setCurrentSlide((prev) => Math.min(TOTAL_SLIDES, prev + 1)), []);
  const prevSlide = useCallback(() => setCurrentSlide((prev) => Math.max(1, prev - 1)), []);

 const scaleSlide = useCallback(() => {
  const stage = stageRef.current;
  const wrapper = wrapperRef.current;
  if (!stage || !wrapper) return;

  const baseW = 1280;
  const baseH = 720;
  const padding = isFullscreen ? 0 : 40;

  const rect = wrapper.getBoundingClientRect();
  const availW = rect.width - padding * 2;
  const availH = rect.height - padding * 2;

  const scale = Math.min(availW / baseW, availH / baseH, 1);

  stage.style.transform = `scale(${scale})`;
}, [isFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await wrapperRef.current?.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch (err) {
      alert('Không thể vào toàn màn hình: ' + (err?.message || err));
    }
  }, []);

  const toggleControls = useCallback(() => setControlsHidden((prev) => !prev), []);
  const toggleNotes = useCallback(() => setNotesShown((prev) => !prev), []);
  const toggleHelp = useCallback(() => setHelpShown((prev) => !prev), []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.querySelectorAll('.slide').forEach((slide) => slide.classList.remove('active'));
    stage.querySelector(`#slide-${currentSlide}`)?.classList.add('active');
  }, [currentSlide]);

  useEffect(() => {
    const onResize = () => scaleSlide();
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener('resize', onResize);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    scaleSlide();
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [scaleSlide]);

  useEffect(() => { scaleSlide(); }, [scaleSlide, isFullscreen]);

  useEffect(() => {
    const onMouseMove = () => {
      clearTimeout(hideTimerRef.current);
      if (controlsHidden) return;
      hideTimerRef.current = setTimeout(() => {
        if (document.fullscreenElement) setControlsHidden(true);
      }, 3000);
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      clearTimeout(hideTimerRef.current);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [controlsHidden]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tagName = e.target?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault(); nextSlide(); break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault(); prevSlide(); break;
        case 'Home':
          e.preventDefault(); goToSlide(1); break;
        case 'End':
          e.preventDefault(); goToSlide(TOTAL_SLIDES); break;
        case 'f':
        case 'F':
          e.preventDefault(); toggleFullscreen(); break;
        case 'n':
        case 'N':
          e.preventDefault(); toggleNotes(); break;
        case 'h':
        case 'H':
          e.preventDefault(); toggleControls(); break;
        case '?':
        case '/':
          e.preventDefault(); toggleHelp(); break;
        case 'Escape':
          if (helpShown) setHelpShown(false);
          else if (notesShown) setNotesShown(false);
          break;
        default:
          break;
      }
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        goToSlide(Number(e.key));
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [goToSlide, nextSlide, prevSlide, toggleControls, toggleFullscreen, toggleHelp, toggleNotes, helpShown, notesShown]);

  useEffect(() => {
    try {
      if (!localStorage.getItem('aiThinker_INO-AIE6-01_v1_helpSeen')) {
        const timer = setTimeout(() => {
          setHelpShown(true);
          localStorage.setItem('aiThinker_INO-AIE6-01_v1_helpSeen', '1');
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (_) {}
  }, []);

  const currentNote = teacherNotes[currentSlide];
  const slideCounter = `${currentSlide}`;
  const counterText = `${String(currentSlide).padStart(2, '0')} / ${String(TOTAL_SLIDES).padStart(2, '0')}`;

  return (
    <div className="tuan01-slide-wrapper" ref={wrapperRef}>
      <div className={`presentation ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="slide-stage" ref={stageRef} dangerouslySetInnerHTML={{ __html: SLIDES_HTML }} />

        <div className={`progress-dots ${controlsHidden ? 'hidden' : ''}`}>
          {Array.from({ length: TOTAL_SLIDES }, (_, index) => {
            const slideNo = index + 1;
            const dotClass = ['dot', slideNo === currentSlide ? 'active' : '', slideNo < currentSlide ? 'completed' : ''].filter(Boolean).join(' ');
            return (
              <button key={slideNo} type="button" className={dotClass} onClick={() => goToSlide(slideNo)} title={`Slide ${slideNo}`} aria-label={`Đi đến slide ${slideNo}`} />
            );
          })}
        </div>

        <div className={`controls-bar ${controlsHidden ? 'hidden' : ''}`}>
          <button className="ctrl-btn" onClick={prevSlide} title="Slide trước (←)" type="button">‹</button>
          <span className="slide-counter">{counterText}</span>
          <button className="ctrl-btn primary" onClick={nextSlide} title="Slide tiếp (→)" type="button">›</button>
          <button className="ctrl-btn" onClick={toggleFullscreen} title="Toàn màn hình (F)" type="button">⛶</button>
          <button className="ctrl-btn" onClick={toggleNotes} title="Ghi chú GV (N)" type="button">📝</button>
          <button className="ctrl-btn" onClick={toggleHelp} title="Hướng dẫn phím tắt (?)" type="button">?</button>
        </div>

        <aside className={`teacher-notes ${notesShown ? 'show' : ''}`}>
          <h4>📝 Ghi chú giáo viên</h4>
          <div
            className="teacher-notes-content"
            dangerouslySetInnerHTML={{
              __html: currentNote ? `<p class="teacher-notes-section">${currentNote.section}</p>${currentNote.content}` : '',
            }}
          />
        </aside>

        <div className={`help-overlay ${helpShown ? 'show' : ''}`}>
          <div className="help-card">
            <h2>⌨️ Phím tắt cho giáo viên</h2>
            <p className="help-subtitle">Bài giảng AI Thinker · Lớp 6 · Tuần 1</p>
            <div className="help-shortcuts">
              <div className="help-row"><span className="key-cap">→</span> <span>Slide tiếp</span></div>
              <div className="help-row"><span className="key-cap">←</span> <span>Slide trước</span></div>
              <div className="help-row"><span className="key-cap">Space</span> <span>Slide tiếp</span></div>
              <div className="help-row"><span className="key-cap">Home</span> <span>Slide đầu</span></div>
              <div className="help-row"><span className="key-cap">End</span> <span>Slide cuối</span></div>
              <div className="help-row"><span className="key-cap">1-9</span> <span>Đến slide số</span></div>
              <div className="help-row"><span className="key-cap">F</span> <span>Toàn màn hình</span></div>
              <div className="help-row"><span className="key-cap">ESC</span> <span>Thoát fullscreen</span></div>
              <div className="help-row"><span className="key-cap">N</span> <span>Ghi chú GV</span></div>
              <div className="help-row"><span className="key-cap">H</span> <span>Ẩn/hiện điều khiển</span></div>
              <div className="help-row"><span className="key-cap">?</span> <span>Mở hướng dẫn</span></div>
              <div className="help-row"><span className="key-cap">R</span> <span>Reset slide hiện tại</span></div>
            </div>
            <button className="help-close" onClick={toggleHelp} type="button">Đã hiểu, đóng lại</button>
          </div>
        </div>
      </div>
    </div>
  );
}

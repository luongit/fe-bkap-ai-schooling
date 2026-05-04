import React, { useEffect, useMemo, useState } from 'react';
import './Tuan01Lop6.css';

const STORAGE_KEY = 'aiThinker_INO-AIE6-01_v1_react';
const TOTAL_STARS = 12;
const TOTAL_ACTIVITIES = 6;

const FLASHCARDS = [
  {
    id: 1,
    icon: '🤖',
    term: 'AI là gì?',
    text: 'AI (Trí tuệ nhân tạo) là máy tính/phần mềm được lập trình để "học" từ dữ liệu và đưa ra quyết định/dự đoán giống cách con người làm.',
  },
  {
    id: 2,
    icon: '📊',
    term: 'Dữ liệu',
    text: 'Là thông tin AI dùng để học: ảnh, văn bản, âm thanh, số liệu... Không có dữ liệu → AI không thể học. Vì vậy dữ liệu được gọi là "thức ăn" của AI.',
  },
  {
    id: 3,
    icon: '🎯',
    term: '"Ảo tưởng AI"',
    text: 'Sản phẩm được gắn nhãn "AI" nhưng thực ra chỉ chạy theo công thức cố định như đèn cảm biến, máy tính bỏ túi. Chúng không học, không thay đổi theo thời gian.',
  },
  {
    id: 4,
    icon: '🧠',
    term: '"Học" của AI',
    text: 'Là quá trình AI quan sát rất nhiều ví dụ rồi tự tìm ra quy luật. Càng nhiều ví dụ tốt → AI càng "giỏi". Đây là điểm khác biệt với máy thường.',
  },
];

const QUIZ_DATA = [
  {
    id: 'q1',
    text: 'Trong các thiết bị sau, đâu là AI thật?',
    options: [
      'Đồng hồ báo thức kêu lúc 6h sáng',
      'Đèn cảm biến tự bật khi có người đi qua',
      'TikTok gợi ý video đúng gu của em',
      'Máy tính bỏ túi tính 2 + 2 = 4',
    ],
    correct: 2,
  },
  {
    id: 'q2',
    text: 'Điểm khác biệt cốt lõi giữa AI và phần mềm thông thường là gì?',
    options: [
      'AI có giao diện đẹp hơn',
      'AI "học" được từ dữ liệu, hoạt động khác đi sau khi có dữ liệu mới',
      'AI luôn có hình robot',
      'AI chạy nhanh hơn và tốn ít pin hơn',
    ],
    correct: 1,
  },
  {
    id: 'q3',
    text: 'Em mở Google Maps và app gợi ý đường tránh tắc. Đó là vì sao?',
    options: [
      'Vì app có người ngồi tra bản đồ giấy giúp em',
      'Vì điện thoại em có chip riêng cho Maps',
      'Vì AI "học" từ hàng triệu xe đang chạy thật để dự đoán đường nào tắc',
      'Vì các đèn giao thông gửi tín hiệu trực tiếp về điện thoại',
    ],
    correct: 2,
  },
];

const CLASSIFY_ITEMS = [
  { id: 1, emoji: '💬', name: 'ChatGPT', isTrueAI: true },
  { id: 2, emoji: '⏰', name: 'Đồng hồ báo thức', isTrueAI: false },
  { id: 3, emoji: '📸', name: 'Camera nhận khuôn mặt', isTrueAI: true },
  { id: 4, emoji: '🔢', name: 'Máy tính bỏ túi', isTrueAI: false },
  { id: 5, emoji: '🎵', name: 'Spotify gợi ý nhạc', isTrueAI: true },
  { id: 6, emoji: '💡', name: 'Đèn cảm biến chuyển động', isTrueAI: false },
];

const DEFAULT_HUNT_FIELDS = Array.from({ length: 5 }, () => ({ name: '', reason: '' }));
const DEFAULT_JOURNAL = { q1: '', q2: '', q3: '' };
const DEFAULT_CHECKLIST = { hw1: false, hw2: false, hw3: false, hw4: false };

function isHuntRowDone(row) {
  const name = row.name.trim();
  const reason = row.reason.trim();
  const reasonWords = reason.split(/\s+/).filter((word) => word.length >= 2).length;
  return name.length >= 4 && reason.length >= 12 && reasonWords >= 2;
}

function isJournalDone(entries) {
  return Object.values(entries).every((text) => {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter((word) => word.length >= 2).length;
    return trimmed.length >= 20 && words >= 4;
  });
}

export default function Tuan01Lop6Ontap() {
  const [stars, setStars] = useState(0);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [placedItems, setPlacedItems] = useState({});
  const [activeClassifyItem, setActiveClassifyItem] = useState(null);
  const [classifyWrongFlash, setClassifyWrongFlash] = useState(null);
  const [huntFields, setHuntFields] = useState(DEFAULT_HUNT_FIELDS);
  const [journalEntries, setJournalEntries] = useState(DEFAULT_JOURNAL);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const data = JSON.parse(saved);
      setStars(data.stars || 0);
      setCompletedActivities(data.completedActivities || []);
      setFlippedCards(data.flippedCards || []);
      setQuizAnswers(data.quizAnswers || {});
      setPlacedItems(data.placedItems || {});
      setHuntFields(data.huntFields || DEFAULT_HUNT_FIELDS);
      setJournalEntries(data.journalEntries || DEFAULT_JOURNAL);
      setChecklist(data.checklist || DEFAULT_CHECKLIST);
    } catch (error) {
      console.warn('Không thể load tiến độ:', error);
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      stars,
      completedActivities,
      flippedCards,
      quizAnswers,
      placedItems,
      huntFields,
      journalEntries,
      checklist,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Không thể lưu tiến độ:', error);
    }
  }, [stars, completedActivities, flippedCards, quizAnswers, placedItems, huntFields, journalEntries, checklist]);

  const progressPercent = Math.round((completedActivities.length / TOTAL_ACTIVITIES) * 100);
  const huntDoneCount = useMemo(() => huntFields.filter(isHuntRowDone).length, [huntFields]);
  const allDone = completedActivities.length === TOTAL_ACTIVITIES;

  const showReward = (icon, title, text) => {
    setReward({ icon, title, text });
  };

  const markActivityDone = (actId, earnedStars, rewardData) => {
    setCompletedActivities((prev) => {
      if (prev.includes(actId)) return prev;
      setStars((oldStars) => Math.min(TOTAL_STARS, oldStars + earnedStars));
      if (rewardData) showReward(rewardData.icon, rewardData.title, rewardData.text);
      return [...prev, actId];
    });
  };

  const handleFlip = (id) => {
    if (flippedCards.includes(id)) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === FLASHCARDS.length) {
      markActivityDone(1, 2, {
        icon: '🎓',
        title: 'Học định nghĩa xong!',
        text: 'Em đã đọc hết 4 thẻ định nghĩa cốt lõi. +2 ⭐',
      });
    }
  };

  const handleQuiz = (qId, optionIdx, isCorrect) => {
    if (quizAnswers[qId] !== undefined) return;

    const newAnswers = { ...quizAnswers, [qId]: { chosen: optionIdx, isCorrect } };
    setQuizAnswers(newAnswers);

    if (Object.keys(newAnswers).length === QUIZ_DATA.length) {
      const correctCount = Object.values(newAnswers).filter((answer) => answer.isCorrect).length;
      markActivityDone(2, correctCount, {
        icon: '🧠',
        title: 'Quiz xong!',
        text: `Em trả lời đúng ${correctCount}/3 câu. +${correctCount} ⭐`,
      });
    }
  };

  const handleSelectClassifyItem = (item) => {
    if (placedItems[item.id]) return;
    setActiveClassifyItem(activeClassifyItem?.id === item.id ? null : item);
  };

  const handleChooseZone = (zoneType) => {
    if (!activeClassifyItem) return;

    const isMatch =
      (activeClassifyItem.isTrueAI && zoneType === 'true') ||
      (!activeClassifyItem.isTrueAI && zoneType === 'false');

    if (isMatch) {
      const newPlaced = { ...placedItems, [activeClassifyItem.id]: zoneType };
      setPlacedItems(newPlaced);
      setActiveClassifyItem(null);

      if (Object.keys(newPlaced).length === CLASSIFY_ITEMS.length) {
        markActivityDone(3, 2, {
          icon: '🔍',
          title: 'Phân loại đúng hết!',
          text: 'Em đã phân biệt được AI thật và "Ảo tưởng AI". +2 ⭐',
        });
      }
    } else {
      setClassifyWrongFlash(zoneType);
      window.setTimeout(() => setClassifyWrongFlash(null), 500);
    }
  };

  const handleHuntChange = (index, key, value) => {
    const newFields = huntFields.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [key]: value } : row,
    );
    setHuntFields(newFields);

    if (newFields.filter(isHuntRowDone).length === 5) {
      markActivityDone(4, 2, {
        icon: '🔎',
        title: 'Sổ Săn AI hoàn chỉnh!',
        text: 'Em đã ghi đủ 5 ứng dụng AI ở nhà với lý do đầy đủ. +2 ⭐',
      });
    }
  };

  const handleJournalChange = (qKey, value) => {
    const newEntries = { ...journalEntries, [qKey]: value };
    setJournalEntries(newEntries);

    if (isJournalDone(newEntries)) {
      markActivityDone(5, 2, {
        icon: '📔',
        title: 'AI Journal lần đầu!',
        text: 'Em đã ghi entry đầu tiên trong AI Journal. +2 ⭐',
      });
    }
  };

  const handleChecklist = (key) => {
    const newChecklist = { ...checklist, [key]: !checklist[key] };
    setChecklist(newChecklist);

    if (Object.values(newChecklist).every(Boolean)) {
      markActivityDone(6, 1, {
        icon: '✅',
        title: 'BTVN sẵn sàng!',
        text: 'Em đã hoàn tất hết các bước nộp BTVN. +1 ⭐',
      });
    }
  };

  const renderSectionHeader = (icon, colorClass, title, subtitle) => (
    <div className="section-header">
      <div className={`section-icon ${colorClass || ''}`}>{icon}</div>
      <div>
        <div className="section-title">{title}</div>
        <div className="section-subtitle">{subtitle}</div>
      </div>
    </div>
  );

  return (
    <div className={`tuan01-wrapper ${activeClassifyItem ? 'classify-armed' : ''}`}>
      <nav className="tuan-top-nav">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-logo">AI</div>
            <div className="brand-text">
              <div className="brand-text-main">AI Thinker · Lớp 6</div>
              <div className="brand-text-sub">INO-AIE6-01 · TUẦN 1</div>
            </div>
          </div>

          <div className="progress-bar-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="progress-text">{progressPercent}%</div>
          </div>

          <div className="stars-display">
            <span>⭐</span>
            <span>{stars}</span>
            <span style={{ opacity: 0.6 }}>/12</span>
          </div>
        </div>
      </nav>

      <main className="tuan-container">
        <section className="hero">
          <div className="hero-grid-bg" />
          <div className="hero-content">
            <div className="hero-eyebrow">⚡ TUẦN 1 · ÔN BÀI TẠI NHÀ</div>
            <h1>
              Chào AI!
              <br />
              AI quanh em.
            </h1>
            <p className="hero-subtitle">
              Em đã trải qua tiết đầu tiên của CLB AI Thinker. Đây là sách ôn để em <strong>củng cố lại kiến thức</strong> và chuẩn bị tốt cho tuần sau.
            </p>
            <div className="hero-info">
              <div className="hero-chip">⏱ <strong>15-20 phút</strong></div>
              <div className="hero-chip">🎯 <strong>6 hoạt động</strong></div>
              <div className="hero-chip">⭐ Tối đa <strong>12 sao</strong></div>
              <div className="hero-chip">🔒 Tự động lưu tiến độ</div>
            </div>
          </div>
        </section>

        <section className="recap-card">
          {renderSectionHeader('📖', '', 'Em nhớ lại bài hôm nay', '3 ý chính của tuần 1 · đọc nhanh trong 2 phút')}
          <div className="recap-summary">
            Hôm nay em đã khám phá ra rằng <strong>AI ở rất gần em</strong> — không phải robot trong phim viễn tưởng. AI đang ẩn trong điện thoại, app giải trí, app học tập và cả trên đường phố. Điểm chung của AI thật: chúng <strong>"học" được từ dữ liệu</strong>.
          </div>
          <div className="recap-keypoints">
            <div className="keypoint">
              <div className="keypoint-num">1</div>
              <div className="keypoint-text"><strong>AI vô hình</strong> — phần lớn AI ẩn trong app, không có hình robot.</div>
            </div>
            <div className="keypoint">
              <div className="keypoint-num">2</div>
              <div className="keypoint-text"><strong>AI ≠ "Ảo tưởng AI"</strong> — Đèn cảm biến, máy tính bỏ túi, đồng hồ báo thức không phải AI vì chúng không học.</div>
            </div>
            <div className="keypoint">
              <div className="keypoint-num">3</div>
              <div className="keypoint-text"><strong>Nhận diện AI:</strong> hỏi “cái này có hoạt động khác đi sau khi gặp dữ liệu mới không?” Có → AI.</div>
            </div>
          </div>
        </section>

        <section className={`activity-card ${completedActivities.includes(1) ? 'completed' : ''}`}>
          <div className="activity-num-badge">⚡ HOẠT ĐỘNG 1 · 2 ⭐</div>
          {renderSectionHeader('💡', 'orange', 'Lật thẻ — Học định nghĩa', 'Bấm vào thẻ để xem định nghĩa · Lật cả 4 thẻ để hoàn thành')}
          <div className="flashcard-deck">
            {FLASHCARDS.map((card) => (
              <div
                key={card.id}
                className={`flashcard ${flippedCards.includes(card.id) ? 'flipped' : ''}`}
                onClick={() => handleFlip(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === 'Enter' && handleFlip(card.id)}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-face flashcard-front">
                    <div className="flashcard-front-icon">{card.icon}</div>
                    <div className="flashcard-front-term">{card.term}</div>
                    <div className="flashcard-front-hint">// CHẠM ĐỂ LẬT</div>
                  </div>
                  <div className="flashcard-face flashcard-back">
                    <div className="flashcard-back-label">▸ ĐỊNH NGHĨA</div>
                    <div className="flashcard-back-text">{card.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 8 }}>
            Đã lật: {flippedCards.length} / 4 thẻ
          </div>
        </section>

        <section className={`activity-card ${completedActivities.includes(2) ? 'completed' : ''}`}>
          <div className="activity-num-badge">⚡ HOẠT ĐỘNG 2 · 3 ⭐</div>
          {renderSectionHeader('✅', 'emerald', 'Quiz nhanh — 3 câu hỏi', 'Kiểm tra em đã hiểu bài chưa · Mỗi câu đúng = 1 sao')}
          {QUIZ_DATA.map((question, index) => {
            const answer = quizAnswers[question.id];
            const isAnswered = answer !== undefined;
            return (
              <div key={question.id} className="quiz-question">
                <div className="quiz-q-text">
                  <span className="quiz-q-num">Q{index + 1}.</span>
                  {question.text}
                </div>
                <div className="quiz-options">
                  {question.options.map((optionText, optionIndex) => {
                    let optionClass = '';
                    if (isAnswered) {
                      if (optionIndex === question.correct) optionClass = 'correct';
                      else if (answer.chosen === optionIndex) optionClass = 'wrong';
                    }
                    return (
                      <button
                        key={optionText}
                        type="button"
                        className={`quiz-opt ${optionClass}`}
                        disabled={isAnswered}
                        onClick={() => handleQuiz(question.id, optionIndex, optionIndex === question.correct)}
                      >
                        <span className="quiz-opt-letter">{String.fromCharCode(65 + optionIndex)}</span>
                        <span>{optionText}</span>
                      </button>
                    );
                  })}
                </div>
                {isAnswered && (
                  <div className={`quiz-feedback show ${answer.isCorrect ? 'success' : 'error'}`}>
                    {answer.isCorrect ? <strong>🎉 Chính xác! </strong> : <strong>💭 Chưa đúng. </strong>}
                    {answer.isCorrect ? 'Em đã hiểu đúng bản chất của AI.' : 'Đáp án đúng đã được tô xanh — em đọc lại nhé.'}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className={`activity-card ${completedActivities.includes(3) ? 'completed' : ''}`}>
          <div className="activity-num-badge">⚡ HOẠT ĐỘNG 3 · 2 ⭐</div>
          {renderSectionHeader('🔍', 'rose', 'Phân loại: AI thật hay "Ảo tưởng AI"?', 'Bấm vào ô bên dưới để chọn vùng đúng cho mỗi mục')}
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1.5px solid var(--tech-blue-light)', borderRadius: 12, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: 'var(--ink-dark)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--tech-blue)' }}>📌 Cách chơi 2 bước:</strong> ① Chạm vào 1 mục bên dưới → ② Chạm vào ô vùng em nghĩ đúng.
          </div>

          <div className="classify-board">
            <div className={`classify-zone zone-true ${classifyWrongFlash === 'true' ? 'flash-wrong' : ''}`} onClick={() => handleChooseZone('true')}>
              <div className="classify-zone-title">✓ AI THẬT</div>
              <div className="classify-pool">
                {CLASSIFY_ITEMS.filter((item) => placedItems[item.id] === 'true').map((item) => (
                  <div key={item.id} className="classify-item placed placed-correct"><span className="classify-item-emoji">{item.emoji}</span>{item.name}</div>
                ))}
              </div>
            </div>

            <div className={`classify-zone zone-fake ${classifyWrongFlash === 'false' ? 'flash-wrong' : ''}`} onClick={() => handleChooseZone('false')}>
              <div className="classify-zone-title">✗ KHÔNG PHẢI AI</div>
              <div className="classify-pool">
                {CLASSIFY_ITEMS.filter((item) => placedItems[item.id] === 'false').map((item) => (
                  <div key={item.id} className="classify-item placed placed-correct"><span className="classify-item-emoji">{item.emoji}</span>{item.name}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--paper)', borderRadius: 12, padding: 14, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>📦 Các mục cần phân loại:</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono, monospace' }}>Đã xếp đúng: {Object.keys(placedItems).length} / {CLASSIFY_ITEMS.length}</div>
            </div>
            <div className="classify-pool">
              {CLASSIFY_ITEMS.filter((item) => !placedItems[item.id]).map((item) => (
                <div
                  key={item.id}
                  className={`classify-item ${activeClassifyItem?.id === item.id ? 'active' : ''}`}
                  onClick={() => handleSelectClassifyItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => event.key === 'Enter' && handleSelectClassifyItem(item)}
                >
                  <span className="classify-item-emoji">{item.emoji}</span>
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          <div className="classify-helper">
            {activeClassifyItem ? (
              <>✋ Em đã chọn <strong>“{activeClassifyItem.name}”</strong>. Giờ chạm vào vùng đúng bên trên.</>
            ) : (
              <>💡 Em <strong>chưa chọn mục nào</strong>. Hãy chạm vào 1 trong 6 mục để bắt đầu.</>
            )}
          </div>
        </section>

        <section className={`activity-card ${completedActivities.includes(4) ? 'completed' : ''}`}>
          <div className="activity-num-badge">⚡ HOẠT ĐỘNG 4 · 2 ⭐</div>
          {renderSectionHeader('🔎', '', 'Mở rộng Sổ Săn AI', 'Thêm 5 ứng dụng AI em phát hiện ở nhà · Em điền vào đây, sẽ tự lưu')}
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: 12, padding: '14px 16px', marginBottom: 14, fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.55 }}>
            💡 <strong>Gợi ý:</strong> Quan sát điện thoại của bố mẹ, smart TV, máy lạnh, app trên iPad, robot hút bụi, đồng hồ thông minh…
          </div>
          <div className="hunt-ext-table">
            {huntFields.map((field, index) => (
              <div key={index} className="hunt-ext-row">
                <div className="hunt-ext-num">{index + 1}</div>
                <div className="hunt-ext-fields">
                  <div className="hunt-ext-label">Tên thiết bị / app</div>
                  <input className="hunt-ext-input" placeholder={index === 0 ? 'VD: Camera điện thoại bố' : 'Em điền vào đây...'} value={field.name} onChange={(event) => handleHuntChange(index, 'name', event.target.value)} />
                  <div className="hunt-ext-label">Vì sao em nghĩ đây là AI?</div>
                  <input className="hunt-ext-input" placeholder={index === 0 ? 'VD: Vì nó tự nhận khuôn mặt và làm đẹp ảnh' : 'Em điền vào đây...'} value={field.reason} onChange={(event) => handleHuntChange(index, 'reason', event.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 10, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
            Hoàn thành: {huntDoneCount} / 5 dòng · 💾 Tự động lưu · <span style={{ color: 'var(--accent-orange)' }}>Cần: tên ≥ 4 ký tự · lý do ≥ 12 ký tự</span>
          </div>
        </section>

        <section className={`activity-card ${completedActivities.includes(5) ? 'completed' : ''}`}>
          <div className="activity-num-badge">⚡ HOẠT ĐỘNG 5 · 2 ⭐</div>
          {renderSectionHeader('📔', 'violet', 'AI Journal — 3 câu suy ngẫm', 'Em ghi vào đây, hoặc copy ra sổ AI Journal giấy · Tự lưu bản nháp')}
          {[
            ['q1', 'Hôm nay em đã khám phá ra điều gì mới về AI?', 'VD: Em không ngờ TikTok lại là AI! Em cứ tưởng AI phải là robot biết đi...'],
            ['q2', 'Em còn thắc mắc gì về AI mà chưa được giải đáp?', 'VD: Em muốn biết AI có cảm xúc thật không? Hay AI có thể tự dạy chính nó?'],
            ['q3', 'Tuần này em sẽ để ý xem AI ở đâu trong cuộc sống của mình?', 'VD: Mỗi tối em sẽ nhìn quanh nhà 1 lần, ghi nhanh 1 thứ AI mà em chưa thấy hôm nay...'],
          ].map(([key, question, placeholder], index) => {
            const value = journalEntries[key];
            const words = value.trim().split(/\s+/).filter((word) => word.length >= 2).length;
            const enough = value.trim().length >= 20 && words >= 4;
            return (
              <div key={key} className="journal-q">
                <div className="journal-q-text"><span className="journal-q-num">Q{index + 1}</span>{question}</div>
                <textarea className="journal-textarea" value={value} placeholder={placeholder} onChange={(event) => handleJournalChange(key, event.target.value)} />
                {value.trim().length > 5 && <span className="journal-saved-hint show">{enough ? '✓ Đã lưu (đủ tiêu chuẩn)' : '💾 Đang lưu... (cần ≥ 20 ký tự, ≥ 4 từ)'}</span>}
              </div>
            );
          })}
          <div style={{ background: 'var(--paper)', borderRadius: 10, padding: '12px 14px', marginTop: 14, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            🔒 <strong>Quan trọng:</strong> Đây là sổ <em>cá nhân</em> của em — không có đáp án đúng/sai.
          </div>
        </section>

        <section className={`activity-card ${completedActivities.includes(6) ? 'completed' : ''}`}>
          <div className="activity-num-badge">⚡ HOẠT ĐỘNG 6 · 1 ⭐</div>
          {renderSectionHeader('📷', 'orange', 'Checklist nộp BTVN', 'Em đánh dấu khi đã hoàn thành từng bước · Đảm bảo nộp đúng hạn')}
          <div style={{ background: 'var(--paper)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['hw1', 'Em đã chụp đủ 5 ảnh ứng dụng AI ở nhà (khác với 5 ứng dụng đã tìm ở lớp).'],
              ['hw2', 'Em đã viết chú thích dưới mỗi ảnh: tên thiết bị/app + lý do là AI.'],
              ['hw3', 'Em đã upload lên Padlet lớp — hoặc dán in vào AI Journal.'],
              ['hw4', 'Em đã hoàn tất Sổ Săn AI trên trang ôn này và AI Journal điện tử.'],
            ].map(([key, label], index) => (
              <label key={key} className="checklist-item" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, background: 'white', borderRadius: 10, border: '1.5px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={checklist[key]} onChange={() => handleChecklist(key)} style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2, accentColor: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: 14, color: 'var(--ink-dark)', lineHeight: 1.5 }}><strong>{index + 1}.</strong> {label}</span>
              </label>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FED7AA)', borderRadius: 10, padding: '12px 14px', marginTop: 12, fontSize: 12, color: '#92400E', fontWeight: 600, lineHeight: 1.5 }}>
            ⏰ <strong>Hạn nộp:</strong> Đầu tiết tuần sau (tuần 2). Nộp muộn vẫn được nhận, nhưng không được +1 điểm bonus.
          </div>
        </section>

        <section className="btvn-card">
          <div className="btvn-due">📅 NỘP TRƯỚC TIẾT TUẦN 2</div>
          <div className="btvn-title">📚 Tóm tắt 3 việc em cần làm trước tuần sau</div>
          <div className="btvn-task"><div className="btvn-task-num">1</div><div><strong>Chụp 5 ảnh</strong> ứng dụng AI ở nhà — khác với danh sách trên lớp.</div></div>
          <div className="btvn-task"><div className="btvn-task-num">2</div><div><strong>Hoàn thành sách ôn này</strong> — đặc biệt là Hoạt động 4 và Hoạt động 5.</div></div>
          <div className="btvn-task"><div className="btvn-task-num">3</div><div><strong>Mang sổ AI Journal giấy</strong> đến lớp tuần 2.</div></div>
        </section>

        <section className="next-week-card">
          <div className="next-week-content">
            <div className="next-week-label">▸ TUẦN 2 · INO-AIE6-02 · SẮP TỚI</div>
            <div className="next-week-title">AI là gì? Máy có thông minh không?</div>
            <div className="next-week-desc">
              Tuần sau, cả lớp sẽ chơi <strong>"Người hay máy?"</strong> — một phiên bản mini của Turing Test.
            </div>
            <div className="next-week-checklist">
              <div className="next-week-checklist-title">🎒 Em chuẩn bị gì cho tuần 2?</div>
              <ul>
                <li>Mang đủ <strong>sổ AI Journal</strong> + bút.</li>
                <li>Sẵn sàng tranh luận về câu: “Máy có thật sự thông minh không?”</li>
                <li>Nếu được, đọc trước về <strong>Alan Turing</strong>.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={`completion-card ${allDone ? '' : 'locked'}`}>
          <span className="completion-icon">{allDone ? '🏆' : '🔒'}</span>
          <div className="completion-title">{allDone ? 'Em chính thức là AI Explorer!' : 'Hoàn thành 6 hoạt động để mở khóa!'}</div>
          <div className="completion-text">
            {allDone ? (
              <>Tuyệt vời! Em đã hoàn thành tất cả 6 hoạt động ôn bài tuần 1, đạt <strong>{stars}/{TOTAL_STARS} sao</strong>.</>
            ) : (
              <>Em hãy hoàn tất tất cả 6 hoạt động phía trên. Sau khi đủ <strong>12 sao</strong>, em sẽ được trao danh hiệu <strong>AI Explorer</strong>.</>
            )}
          </div>
          <div className="completion-stars-final"><span>⭐</span><span>{stars}</span><span style={{ opacity: 0.6 }}>/12</span></div>
        </section>

        <footer className="footer">
          <strong>INOHUB · AI Thinker THCS · Lớp 6</strong><br />
          Tuần 1 — INO-AIE6-01 · Phiên bản ôn tập tại nhà v1.0<br />
          💾 Tiến độ tự lưu trên thiết bị này. Để in: bấm Ctrl/Cmd + P.
        </footer>
      </main>

      <div className={`reward-overlay ${reward ? 'show' : ''}`} onClick={() => setReward(null)} />
      <div className={`reward-popup ${reward ? 'show' : ''}`}>
        <span className="reward-popup-icon">{reward?.icon || '🏆'}</span>
        <div className="reward-popup-title">{reward?.title || 'Tuyệt vời!'}</div>
        <div className="reward-popup-text">{reward?.text || 'Em đã hoàn thành hoạt động này.'}</div>
        <button type="button" className="reward-popup-close" onClick={() => setReward(null)}>Tiếp tục ▸</button>
      </div>
    </div>
  );
}

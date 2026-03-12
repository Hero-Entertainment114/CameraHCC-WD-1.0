const scanBtn = document.getElementById('scanBtn');
const urlInput = document.getElementById('urlInput');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

const scoreBadge = document.getElementById('scoreBadge');
const scoreText = document.getElementById('scoreText');
const overviewList = document.getElementById('overviewList');
const analysisList = document.getElementById('analysisList');
const recommendationList = document.getElementById('recommendationList');
const pageTitle = document.getElementById('pageTitle');
const pageDescription = document.getElementById('pageDescription');
const pageSnippet = document.getElementById('pageSnippet');

scanBtn.addEventListener('click', runScan);
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runScan();
});

function normalizeUrl(raw) {
  const prefixed = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return new URL(prefixed);
}

function scoreUrl(url) {
  let score = 100;
  const findings = [];

  const hasHttps = url.protocol === 'https:';
  if (!hasHttps) {
    score -= 30;
    findings.push('URL không dùng HTTPS.');
  }

  const hostname = url.hostname.toLowerCase();
  const suspiciousWords = ['login', 'verify', 'secure', 'update', 'bank', 'wallet', 'bonus', 'free'];
  const matchedWords = suspiciousWords.filter((word) => hostname.includes(word) || url.pathname.includes(word));
  if (matchedWords.length) {
    score -= Math.min(25, matchedWords.length * 6);
    findings.push(`Có từ khóa nhạy cảm: ${matchedWords.join(', ')}.`);
  }

  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  if (isIp) {
    score -= 20;
    findings.push('Sử dụng địa chỉ IP thay vì tên miền.');
  }

  if (url.href.length > 120) {
    score -= 10;
    findings.push('URL quá dài, có thể dùng để che giấu mục đích.');
  }

  if ((url.pathname.match(/\//g) || []).length > 5) {
    score -= 8;
    findings.push('Đường dẫn có cấu trúc bất thường (nhiều tầng).');
  }

  const hasAtSymbol = url.href.includes('@');
  if (hasAtSymbol) {
    score -= 20;
    findings.push('URL chứa ký tự @ (thường dùng trong phishing).');
  }

  const safeScore = Math.max(0, Math.min(100, score));
  return { safeScore, findings };
}

async function fetchPageSnapshot(url) {
  const target = `https://r.jina.ai/http://${url.href.replace(/^https?:\/\//, '')}`;
  const resp = await fetch(target);
  if (!resp.ok) throw new Error('Không lấy được nội dung trang qua proxy.');

  const text = await resp.text();
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  const titleLine = lines.find((line) => line.toLowerCase().startsWith('title:')) || '';
  const descriptionLine = lines.find((line) => line.toLowerCase().startsWith('description:')) || '';

  return {
    title: titleLine.replace(/^title:\s*/i, '') || '(Không tìm thấy tiêu đề)',
    description: descriptionLine.replace(/^description:\s*/i, '') || '(Không tìm thấy mô tả)',
    snippet: lines.slice(0, 12).join(' ').slice(0, 700) || '(Không đọc được nội dung)'
  };
}

function renderList(element, items) {
  element.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    element.appendChild(li);
  });
}

function setScoreUI(score) {
  scoreBadge.textContent = `${score}/100`;
  scoreBadge.className = 'badge';

  if (score >= 75) {
    scoreBadge.classList.add('good');
    scoreText.textContent = 'Mức an toàn ước tính: Tương đối tốt';
  } else if (score >= 45) {
    scoreBadge.classList.add('warn');
    scoreText.textContent = 'Mức an toàn ước tính: Cần cẩn trọng';
  } else {
    scoreBadge.classList.add('danger');
    scoreText.textContent = 'Mức an toàn ước tính: Rủi ro cao';
  }
}

async function runScan() {
  const raw = urlInput.value.trim();
  if (!raw) {
    alert('Vui lòng nhập link cần quét.');
    return;
  }

  let url;
  try {
    url = normalizeUrl(raw);
  } catch {
    alert('Link không hợp lệ.');
    return;
  }

  loading.classList.remove('hidden');
  results.classList.add('hidden');

  const { safeScore, findings } = scoreUrl(url);
  const overview = [
    `Link chuẩn hóa: ${url.href}`,
    `Tên miền: ${url.hostname}`,
    `Giao thức: ${url.protocol.replace(':', '').toUpperCase()}`,
    `Độ dài URL: ${url.href.length} ký tự`
  ];

  const recommendations = [
    'Không nhập mật khẩu/OTP nếu trang yêu cầu bất thường.',
    'Kiểm tra kỹ tên miền trước khi đăng nhập.',
    'Dùng công cụ chuyên dụng (VirusTotal, Google Safe Browsing) để xác minh thêm.',
    'Ưu tiên trang có HTTPS và chứng chỉ hợp lệ.'
  ];

  try {
    const snapshot = await fetchPageSnapshot(url);
    pageTitle.textContent = snapshot.title;
    pageDescription.textContent = snapshot.description;
    pageSnippet.textContent = snapshot.snippet;
  } catch (error) {
    pageTitle.textContent = '(Không thể tải)';
    pageDescription.textContent = '(Không thể tải)';
    pageSnippet.textContent = `Lỗi tải nội dung: ${error.message}`;
  }

  setScoreUI(safeScore);
  renderList(overviewList, overview);
  renderList(
    analysisList,
    findings.length
      ? findings
      : ['Không phát hiện dấu hiệu bất thường rõ rệt trong phân tích heuristic cơ bản.']
  );
  renderList(recommendationList, recommendations);

  loading.classList.add('hidden');
  results.classList.remove('hidden');
}

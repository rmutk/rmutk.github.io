(function () {
  // ===== เลย์เอาต์แป้นพิมพ์ (Kedmanee มาตรฐาน) =====
  const TH_LOWER = [
    ['ๅ','/','-','ภ','ถ','ุ','ึ','ค','ต','จ','ข','ช'],
    ['ๆ','ไ','ำ','พ','ะ','ั','ี','ร','น','ย','บ','ล'],
    ['ฟ','ห','ก','ด','เ','้','่','า','ส','ว','ง'],
    ['ผ','ป','แ','อ','ิ','ื','ท','ม','ใ','ฝ'],
  ];
  const TH_UPPER = [
    ['+','๑','๒','๓','๔','ู','฿','๕','๖','๗','๘','๙'],
    ['๐','"','ฎ','ฑ','ธ','ํ','๊','ณ','ฯ','ญ','ฐ',','],
    ['ฤ','ฆ','ฏ','โ','ฌ','็','๋','ษ','ศ','ซ','.'],
    ['(',')','ฉ','ฮ','ฺ','์','?','ฒ','ฬ','ฦ'],
  ];
  const EN_LOWER = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'],
  ];
  const EN_UPPER = [
    ['!','@','#','$','%','^','&','*','(',')'],
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
  ];

  let lang = 'th';     // 'th' | 'en'
  let shift = false;
  let activeEl = null;

  // ===== สร้างโครง DOM ของแป้นพิมพ์ =====
  const kb = document.createElement('div');
  kb.id = 'virtual-keyboard';
  document.body.appendChild(kb);

  function currentLayout() {
    if (lang === 'th') return shift ? TH_UPPER : TH_LOWER;
    return shift ? EN_UPPER : EN_LOWER;
  }

  function render() {
    const layout = currentLayout();
    let html = `<div class="vk-toprow">
        <button type="button" class="vk-close-btn" data-action="close">✕ ปิดแป้นพิมพ์</button>
      </div>`;

    layout.forEach(row => {
      html += '<div class="vk-row">';
      row.forEach(ch => {
        html += `<button type="button" class="vk-key" data-char="${ch}">${ch}</button>`;
      });
      html += '</div>';
    });

    html += `<div class="vk-row">
        <button type="button" class="vk-key vk-wide vk-action" data-action="shift">⇧ Shift</button>
        <button type="button" class="vk-key vk-wide vk-action" data-action="lang">${lang === 'th' ? 'TH→EN' : 'EN→TH'}</button>
        <button type="button" class="vk-key vk-space" data-action="space">เว้นวรรค</button>
        <button type="button" class="vk-key vk-wide vk-action" data-action="backspace">⌫ ลบ</button>
        <button type="button" class="vk-key vk-wide vk-done" data-action="done">✓ เสร็จสิ้น</button>
      </div>`;

    kb.innerHTML = html;
  }

  // ===== ใส่ตัวอักษร/ลบ/เว้นวรรค แล้วยิง input event ให้ Yew รับรู้ =====
  function fireInputEvent(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function insertChar(ch) {
    if (!activeEl) return;
    const start = activeEl.selectionStart ?? activeEl.value.length;
    const end = activeEl.selectionEnd ?? activeEl.value.length;
    const val = activeEl.value;
    activeEl.value = val.slice(0, start) + ch + val.slice(end);
    const pos = start + ch.length;
    activeEl.setSelectionRange(pos, pos);
    fireInputEvent(activeEl);
  }

  function backspace() {
    if (!activeEl) return;
    const start = activeEl.selectionStart ?? activeEl.value.length;
    const end = activeEl.selectionEnd ?? activeEl.value.length;
    const val = activeEl.value;
    if (start === end && start > 0) {
      activeEl.value = val.slice(0, start - 1) + val.slice(end);
      activeEl.setSelectionRange(start - 1, start - 1);
    } else {
      activeEl.value = val.slice(0, start) + val.slice(end);
      activeEl.setSelectionRange(start, start);
    }
    fireInputEvent(activeEl);
  }

  function openKeyboard(el) {
    activeEl = el;
    kb.classList.add('vk-open');
    render();
  }

  function closeKeyboard() {
    kb.classList.remove('vk-open');
    activeEl = null;
  }

  // ===== คลิกปุ่มบนแป้นพิมพ์ =====
  // ใช้ mousedown + preventDefault กัน input เสีย focus ตอนกดปุ่ม
  kb.addEventListener('mousedown', function (e) {
    e.preventDefault();
  });

  kb.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn || !activeEl) {
      if (btn && btn.dataset.action === 'close') closeKeyboard();
      return;
    }

    if (btn.dataset.char !== undefined) {
      insertChar(btn.dataset.char);
      return;
    }

    switch (btn.dataset.action) {
      case 'shift':
        shift = !shift;
        render();
        break;
      case 'lang':
        lang = lang === 'th' ? 'en' : 'th';
        shift = false;
        render();
        break;
      case 'space':
        insertChar(' ');
        break;
      case 'backspace':
        backspace();
        break;
      case 'done':
      case 'close':
        closeKeyboard();
        break;
    }
  });

  // ===== เปิดแป้นพิมพ์อัตโนมัติเมื่อ input/textarea ถูก focus =====
  document.addEventListener('focusin', function (e) {
    const el = e.target;
    if (
      (el.tagName === 'INPUT' && ['text', 'email', 'search', 'tel', 'url', ''].includes(el.type)) ||
      el.tagName === 'TEXTAREA'
    ) {
      openKeyboard(el);
    }
  });

  // ปิดแป้นพิมพ์เมื่อคลิกพื้นที่อื่นที่ไม่ใช่ input และไม่ใช่ตัวแป้นพิมพ์เอง
  document.addEventListener('mousedown', function (e) {
    if (kb.contains(e.target)) return;
    const el = e.target;
    const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    if (!isInput) {
      closeKeyboard();
    }
  });
})();
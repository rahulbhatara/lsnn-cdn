(function () {
  'use strict';

  window.LSNN = window.LSNN || {};

  // =========================================================================
  // 1. KONFIGURASI DEFAULT (Dapat di-override via window.LSNN_CUSTOM_CONFIG)
  // =========================================================================
  const DEFAULT_CONFIG = {
    commercial: {
      categoryIds: [5],
      rateCardTopicId: 29,
      staffGroupSlugs: ['lsnn']
    },
    recruitment: {
      categoryIds: [12],
      guidelinesTopicId: 30,
      formatTopicId: null,
      staffGroupSlugs: ['lsnn']
    },
    reinstatement: {
      categoryIds: [13],
      guidelinesTopicId: null,
      staffGroupSlugs: ['lsnn']
    },
    assets: {
      logoMain: 'https://cdn.jsdelivr.net/gh/rahulbhatara/lsnn-cdn/vlm2.svg',
      logoPr: 'https://cdn.jsdelivr.net/gh/rahulbhatara/lsnn-cdn/Mq6N.svg',
      logoHrd: 'https://cdn.jsdelivr.net/gh/rahulbhatara/lsnn-cdn/Ql4h.svg',
      sigFallback: 'https://placehold.co/240x80/ffffff/94a3b8?text=SIGNATURE',
      photoFallback: 'https://placehold.co/150x200/f8fafc/1c283d?text=3:4+PHOTO'
    }
  };

  function mergeConfig(base, custom) {
    if (!custom) return base;
    return {
      commercial: { ...base.commercial, ...(custom.commercial || {}) },
      recruitment: { ...base.recruitment, ...(custom.recruitment || {}) },
      reinstatement: { ...base.reinstatement, ...(custom.reinstatement || {}) },
      assets: { ...base.assets, ...(custom.assets || {}) }
    };
  }

  LSNN.config = mergeConfig(DEFAULT_CONFIG, window.LSNN_CUSTOM_CONFIG);

  // =========================================================================
  // 2. HELPER UTILITIES & NOTIFICATIONS
  // =========================================================================
  const groupCache = new Map();

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMultiline(str) {
    return escapeHtml(str).replace(/\r?\n/g, '<br />');
  }

  function formatDateLosSantos(dateInput) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const d = dateInput ? new Date(dateInput) : new Date();
    if (Number.isNaN(d.getTime())) return escapeHtml(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatMoney(num) {
    return Number(num || 0).toLocaleString('en-US');
  }

  function notifySuccess(msg) {
    if (window.app && typeof app.alertSuccess === 'function') {
      app.alertSuccess(msg);
    } else {
      alert(msg);
    }
  }

  function notifyError(msg) {
    if (window.app && typeof app.alertError === 'function') {
      app.alertError(msg);
    } else {
      alert(msg);
    }
  }

  // =========================================================================
  // 3. PENGECEKAN ROLE / GRUP STAF NODEBB
  // =========================================================================
  async function checkUserInGroups(groupSlugs) {
    if (!window.app || !app.user || !app.user.uid) return false;
    if (app.user.isAdmin || app.user.isGlobalMod) return true;

    const normalized = (groupSlugs || []).map(s => String(s).toLowerCase());
    if (!normalized.length) return false;

    const cacheKey = `${app.user.uid}:${normalized.sort().join(',')}`;
    if (groupCache.has(cacheKey)) {
      return groupCache.get(cacheKey);
    }

    let matched = false;
    try {
      const res = await fetch(`/api/user/${encodeURIComponent(app.user.userslug)}`);
      const data = await res.json();
      matched = (data.groups || []).some(g =>
        (g.slug && normalized.includes(String(g.slug).toLowerCase())) ||
        (g.name && normalized.includes(String(g.name).toLowerCase()))
      );
    } catch (e) {
      matched = false;
    }

    groupCache.set(cacheKey, matched);
    return matched;
  }

  // =========================================================================
  // 4. UPLOAD FILE KE NODEBB & DECLARATIVE UPLOAD BINDING
  // =========================================================================
  async function uploadFileToNodeBB(fileOrBlob, filename) {
    const formData = new FormData();
    formData.append('files[]', fileOrBlob, filename);

    const res = await fetch('/api/post/upload', {
      method: 'POST',
      headers: {
        'x-csrf-token': window.config?.csrf_token || ''
      },
      body: formData
    });

    if (!res.ok) throw new Error('Gagal mengunggah file ke server.');
    const json = await res.json();

    const uploaded =
      (Array.isArray(json) && json[0]) ||
      (Array.isArray(json?.response) && json.response[0]) ||
      (Array.isArray(json?.response?.images) && json.response.images[0]) ||
      (Array.isArray(json?.images) && json.images[0]) ||
      (json?.response?.url ? json.response : null) ||
      (json?.url ? json : null);

    if (!uploaded || !uploaded.url) {
      console.error('[LSNN Upload] Unexpected response format:', json);
      throw new Error('URL upload tidak ditemukan.');
    }

    return uploaded.url;
  }

  function bindUploadTriggers(containerEl) {
    if (!containerEl) return;
    containerEl.addEventListener('change', async (e) => {
      const fileInput = e.target;
      if (!fileInput.matches('input[type="file"][data-lsnn-upload-target]')) return;

      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      const targetSelector = fileInput.getAttribute('data-lsnn-upload-target');
      const previewSelector = fileInput.getAttribute('data-lsnn-preview-target');
      const urlInput = containerEl.querySelector(targetSelector);
      const previewImg = previewSelector ? containerEl.querySelector(previewSelector) : null;

      if (!urlInput) return;

      const prevValue = urlInput.value;
      urlInput.value = 'Uploading image...';
      urlInput.disabled = true;

      try {
        const uploadedUrl = await uploadFileToNodeBB(file, file.name);
        urlInput.value = uploadedUrl;
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
        if (previewImg) {
          previewImg.src = uploadedUrl;
        }
      } catch (err) {
        urlInput.value = prevValue;
        notifyError(err.message);
      } finally {
        urlInput.disabled = false;
        fileInput.value = '';
      }
    });
  }

  // =========================================================================
  // 5. SELF-CONTAINED MODAL CONTROLLER (DENGAN PROTEKSI TUTUP TIDAK SENGAJA)
  // =========================================================================
  let activeEscHandler = null;

  function closeAllModals() {
    if (activeEscHandler) {
      document.removeEventListener('keydown', activeEscHandler);
      activeEscHandler = null;
    }
    document.querySelectorAll('.lsnn-active-modal').forEach(el => el.remove());
    const backdrop = document.getElementById('lsnnModalBackdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  function openModal(modalHtml, modalId, options = {}) {
    closeAllModals();

    const { protectDirty = true } = options;
    let isDirty = false;

    const backdrop = document.createElement('div');
    backdrop.id = 'lsnnModalBackdrop';
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.zIndex = '1050';
    document.body.appendChild(backdrop);

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById(modalId);
    modalEl.classList.add('lsnn-active-modal', 'show');
    modalEl.style.display = 'block';
    modalEl.style.zIndex = '1055';
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('role', 'dialog');
    modalEl.removeAttribute('aria-hidden');

    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    modalEl.addEventListener('input', () => {
      isDirty = true;
    });

    bindUploadTriggers(modalEl);

    function attemptClose(force = false) {
      if (!force && protectDirty && isDirty) {
        const ok = window.confirm('Tutup formulir ini? Perubahan yang belum dikirim akan disimpan sebagai draf jika didukung, atau hilang.');
        if (!ok) return;
      }
      closeAllModals();
    }

    modalEl.querySelectorAll('[data-lsnn-close]').forEach(btn => {
      btn.addEventListener('click', () => attemptClose(false));
    });

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl && !protectDirty) {
        attemptClose(false);
      }
    });

    activeEscHandler = (e) => {
      if (e.key === 'Escape') {
        attemptClose(false);
      }
    };
    document.addEventListener('keydown', activeEscHandler);

    return {
      el: modalEl,
      markClean: () => { isDirty = false; },
      close: () => closeAllModals()
    };
  }

  // =========================================================================
  // 6. DIGITAL SIGNATURE PAD & DUAL-MODE SIGNATURE WIDGET (DRAW + UPLOAD)
  // =========================================================================
  function initSignaturePad(canvasId, clearBtnId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    canvas.width = 360;
    canvas.height = 120;

    ctx.strokeStyle = '#1c283d';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;
    let hasDrawn = false;

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function startDraw(e) {
      drawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
      if (!drawing) return;
      e.preventDefault();
      hasDrawn = true;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function endDraw() {
      drawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    const clearBtn = document.getElementById(clearBtnId);
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
      });
    }

    return {
      isEmpty: () => !hasDrawn,
      toBlob: () => new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    };
  }

  function renderSignatureField({
    idPrefix,
    label = 'Digital Signature *',
    helpText = 'Gambar tanda tangan langsung di kanvas atau unggah gambar tanda tangan Anda (PNG/JPG/WEBP).'
  }) {
    const safePrefix = escapeHtml(idPrefix);
    return `<div class="mb-2" data-lsnn-sig-widget="${safePrefix}">
  <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
    <label class="form-label fw-semibold mb-0">${escapeHtml(label)}</label>
    <div class="btn-group btn-group-sm lsnn-sig-mode-tabs" role="group" aria-label="Signature Mode">
      <button type="button" class="btn btn-outline-primary active" data-sig-mode="draw">
        <i class="fa fa-pencil me-1"></i> Draw Signature
      </button>
      <button type="button" class="btn btn-outline-primary" data-sig-mode="upload">
        <i class="fa fa-upload me-1"></i> Upload Image / URL
      </button>
    </div>
  </div>

  <div data-sig-pane="draw">
    <div class="d-flex align-items-start gap-2 flex-wrap">
      <div class="lsnn-sig-pad-wrap">
        <canvas id="${safePrefix}Canvas"></canvas>
      </div>
      <button type="button" class="btn btn-sm btn-outline-secondary" id="${safePrefix}Clear">
        <i class="fa fa-eraser me-1"></i> Clear
      </button>
    </div>
  </div>

  <div data-sig-pane="upload" class="d-none">
    <div class="row g-2 align-items-center">
      <div class="col-md-7">
        <div class="input-group input-group-sm mb-2">
          <input type="text" class="form-control" id="${safePrefix}Url"
            data-lsnn-preview-target="#${safePrefix}Preview"
            placeholder="https://... atau upload file gambar" />
          <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
            <i class="fa fa-upload me-1"></i> Upload
            <input type="file" accept="image/png,image/jpeg,image/webp"
              data-lsnn-upload-target="#${safePrefix}Url"
              data-lsnn-preview-target="#${safePrefix}Preview" hidden />
          </label>
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary" id="${safePrefix}ClearUpload">
          <i class="fa fa-times me-1"></i> Reset Image
        </button>
      </div>
      <div class="col-md-5">
        <div class="lsnn-sig-upload-preview">
          <img id="${safePrefix}Preview" src="${LSNN.config.assets.sigFallback}" alt="Signature Preview" />
        </div>
      </div>
    </div>
  </div>

  ${helpText ? `<small class="text-muted d-block mt-1">${escapeHtml(helpText)}</small>` : ''}
</div>`;
  }

  function initSignatureField(idPrefix) {
    const widget = document.querySelector(`[data-lsnn-sig-widget="${CSS.escape(idPrefix)}"]`);
    const pad = initSignaturePad(`${idPrefix}Canvas`, `${idPrefix}Clear`);
    if (!widget) {
      return {
        getSignatureUrl: async (prefix = 'sig') => {
          if (pad && !pad.isEmpty()) {
            const blob = await pad.toBlob();
            return uploadFileToNodeBB(blob, `${prefix}-${Date.now()}.png`);
          }
          return LSNN.config.assets.sigFallback;
        }
      };
    }

    const urlInput = document.getElementById(`${idPrefix}Url`);
    const previewImg = document.getElementById(`${idPrefix}Preview`);
    const resetUploadBtn = document.getElementById(`${idPrefix}ClearUpload`);
    const modeBtns = widget.querySelectorAll('[data-sig-mode]');
    const drawPane = widget.querySelector('[data-sig-pane="draw"]');
    const uploadPane = widget.querySelector('[data-sig-pane="upload"]');

    let currentMode = 'draw';

    function setMode(mode) {
      currentMode = mode === 'upload' ? 'upload' : 'draw';
      modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sigMode === currentMode);
      });
      if (drawPane) drawPane.classList.toggle('d-none', currentMode !== 'draw');
      if (uploadPane) uploadPane.classList.toggle('d-none', currentMode !== 'upload');
    }

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.sigMode));
    });

    if (urlInput && previewImg) {
      const syncPreview = () => {
        const val = urlInput.value.trim();
        previewImg.src = /^(https?:\/\/|\/)/i.test(val) ? val : LSNN.config.assets.sigFallback;
      };
      urlInput.addEventListener('input', syncPreview);

      // Jika draft localStorage sudah berisi URL gambar tanda tangan, otomatis buka tab upload
      if (/^(https?:\/\/|\/)/i.test(urlInput.value.trim())) {
        syncPreview();
        setMode('upload');
      }
    }

    if (resetUploadBtn && urlInput && previewImg) {
      resetUploadBtn.addEventListener('click', () => {
        urlInput.value = '';
        previewImg.src = LSNN.config.assets.sigFallback;
      });
    }

    return {
      setMode,
      async getSignatureUrl(filePrefix = 'sig') {
        const uploadedUrl = urlInput ? urlInput.value.trim() : '';
        if (currentMode === 'upload' && /^(https?:\/\/|\/)/i.test(uploadedUrl)) {
          return uploadedUrl;
        }
        if (currentMode === 'draw' && pad && !pad.isEmpty()) {
          const blob = await pad.toBlob();
          return uploadFileToNodeBB(blob, `${filePrefix}-${Date.now()}.png`);
        }
        if (/^(https?:\/\/|\/)/i.test(uploadedUrl)) {
          return uploadedUrl;
        }
        return LSNN.config.assets.sigFallback;
      }
    };
  }

  // =========================================================================
  // 7. AUTO-SAVE DRAFT MANAGER (LOCALSTORAGE)
  // =========================================================================
  function createDraftManager(storageKey, formEl) {
    if (!formEl) return { clear: () => {} };

    let saveTimer = null;

    function restore() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const data = JSON.parse(raw);
        Object.keys(data).forEach(id => {
          const el = formEl.querySelector(`#${CSS.escape(id)}`);
          if (!el || el.type === 'file') return;
          if (el.type === 'checkbox') {
            el.checked = Boolean(data[id]);
          } else {
            el.value = data[id];
          }
          if (el.dataset.lsnnPreviewTarget && el.value) {
            const img = formEl.querySelector(el.dataset.lsnnPreviewTarget);
            if (img) img.src = el.value;
          }
        });
      } catch (e) {}
    }

    function save() {
      try {
        const payload = {};
        formEl.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
          if (el.type === 'file' || el.type === 'hidden') return;
          payload[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        });
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (e) {}
    }

    formEl.addEventListener('input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, 400);
    });

    restore();

    return {
      clear: () => {
        try {
          localStorage.removeItem(storageKey);
        } catch (e) {}
      }
    };
  }

  // =========================================================================
  // 8. NODEBB API HELPERS
  // =========================================================================
  async function createTopic({ cid, title, content, tags }) {
    const body = { cid: Number(cid), title, content };
    if (Array.isArray(tags) && tags.length) body.tags = tags;

    const res = await fetch('/api/v3/topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': window.config?.csrf_token || ''
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.status?.message || 'Gagal membuat topic baru.');
    }
    return result.response || result.payload || result;
  }

  async function replyTopic({ tid, content }) {
    const res = await fetch(`/api/v3/topics/${tid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': window.config?.csrf_token || ''
      },
      body: JSON.stringify({ content })
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.status?.message || 'Gagal mengirim balasan.');
    }
    return result.response || result.payload || result;
  }

  function injectButtonOnce({ btnId, anchorSelectors, html, onClick }) {
    if (document.getElementById(btnId)) return null;
    const anchor = document.querySelector(anchorSelectors);
    if (!anchor || !anchor.parentElement) return null;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = btnId;
    btn.className = 'btn btn-primary ms-2';
    btn.innerHTML = html;
    btn.addEventListener('click', onClick);

    anchor.parentElement.insertBefore(btn, anchor.nextSibling);
    return btn;
  }

  // Export ke namespace global LSNN
  LSNN.utils = {
    escapeHtml,
    formatMultiline,
    formatDateLosSantos,
    formatMoney,
    notifySuccess,
    notifyError,
    checkUserInGroups,
    uploadFileToNodeBB,
    bindUploadTriggers,
    openModal,
    closeAllModals,
    initSignaturePad,
    renderSignatureField,
    initSignatureField,
    createDraftManager,
    createTopic,
    replyTopic,
    injectButtonOnce
  };
})();
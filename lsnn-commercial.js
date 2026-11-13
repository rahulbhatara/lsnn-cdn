(function () {
  'use strict';

  if (!window.LSNN || !LSNN.utils || !LSNN.templates) return;

  const { utils, templates, config } = LSNN;
  const { escapeHtml, formatMoney, notifySuccess, notifyError } = utils;

  // =========================================================================
  // 1. MODAL UI: CLIENT COMMERCIAL REQUEST (BULKADS & BILLBOARDS)
  // =========================================================================
  function openClientRequestModal(cid) {
    const uid = window.app?.user?.uid || 'guest';
    const draftKey = `lsnn_draft_commercial_${uid}`;

    const modalHtml = `
<div class="modal fade" id="lsnnClientModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold">LSNN Commercial Service Application</h5>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="lsnn-form-tabs">
          <button type="button" class="lsnn-form-tab-btn active" data-form-type="bulkads">
            <i class="fa fa-bullhorn me-1"></i> Broadcast Advertisements ([Bulkads])
          </button>
          <button type="button" class="lsnn-form-tab-btn" data-form-type="billboards">
            <i class="fa fa-picture-o me-1"></i> Billboard Advertisements ([Billboards])
          </button>
        </div>

        <form id="lsnnClientRequestForm">
          <input type="hidden" id="lsnnFormType" value="bulkads" />

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Client / Business / Representative Name *</label>
              <input type="text" class="form-control" id="lsnnClientName" placeholder="e.g. Benny's Original Motor Works" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Contact Phone (In-Character) *</label>
              <input type="text" class="form-control" id="lsnnContactPhone" placeholder="e.g. 555-0192" required />
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Service Package / Tier *</label>
              <input type="text" class="form-control" id="lsnnServicePackage" placeholder="e.g. Bulk Broadcast Ads - Public / Medium Billboard" required />
            </div>
          </div>

          <div id="lsnnFieldsBulkads">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Total Quota (Runs) *</label>
                <input type="number" min="1" class="form-control" id="lsnnTotalQuota" placeholder="e.g. 20" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Airtime Interval (Minutes) *</label>
                <input type="number" min="1" class="form-control" id="lsnnAirtimeInterval" placeholder="e.g. 15" required />
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Campaign Advertisement Content (Max 250 chars/run) *</label>
                <textarea class="form-control" id="lsnnAdContent" rows="4" placeholder="Enter your complete advertisement text and links here..." required></textarea>
              </div>
            </div>
          </div>

          <div id="lsnnFieldsBillboards" class="d-none">
            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Preferred Location / Spot *</label>
                <input type="text" class="form-control" id="lsnnPreferredLocation" placeholder="e.g. Legion Square #02" />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Rental Duration *</label>
                <input type="text" class="form-control" id="lsnnRentalDuration" placeholder="e.g. 14 Days / 2 Weeks" />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Preferred Start Date *</label>
                <input type="date" class="form-control" id="lsnnPreferredStartDate" />
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Artwork Direct Image URL (.png / .jpg) *</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="lsnnArtworkUrl" pattern="^(https?://|/).+" placeholder="https://... or upload image" />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload me-1"></i> Upload Image
                    <input type="file" accept="image/png,image/jpeg,image/webp" data-lsnn-upload-target="#lsnnArtworkUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Additional Notes (Optional)</label>
                <input type="text" class="form-control" id="lsnnAdditionalNotes" placeholder="Orientation, placement remarks, or leave blank for N/A" />
              </div>
            </div>
          </div>

          ${utils.renderSignatureField({
            idPrefix: 'lsnnClientSig',
            label: 'Digital Signature *',
            helpText: 'Gambar tanda tangan di kanvas atau unggah gambar tanda tangan Anda.'
          })}
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <button type="button" class="btn btn-primary" id="lsnnSubmitClientBtn">
          <i class="fa fa-paper-plane"></i> Submit Request &amp; Create Topic
        </button>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnClientModal');
    const modalEl = modalCtrl.el;
    const formEl = document.getElementById('lsnnClientRequestForm');
    const draft = utils.createDraftManager(draftKey, formEl);
    const sigField = utils.initSignatureField('lsnnClientSig');

    modalEl.querySelectorAll('.lsnn-form-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalEl.querySelectorAll('.lsnn-form-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.formType;
        document.getElementById('lsnnFormType').value = type;

        const isBulk = type === 'bulkads';
        document.getElementById('lsnnFieldsBulkads').classList.toggle('d-none', !isBulk);
        document.getElementById('lsnnFieldsBillboards').classList.toggle('d-none', isBulk);

        document.getElementById('lsnnTotalQuota').required = isBulk;
        document.getElementById('lsnnAirtimeInterval').required = isBulk;
        document.getElementById('lsnnAdContent').required = isBulk;

        document.getElementById('lsnnPreferredLocation').required = !isBulk;
        document.getElementById('lsnnRentalDuration').required = !isBulk;
        document.getElementById('lsnnPreferredStartDate').required = !isBulk;
        document.getElementById('lsnnArtworkUrl').required = !isBulk;
      });
    });

    document.getElementById('lsnnSubmitClientBtn').addEventListener('click', async () => {
      if (!formEl.reportValidity()) return;

      const submitBtn = document.getElementById('lsnnSubmitClientBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Publishing...';

      try {
        const signatureUrl = await sigField.getSignatureUrl('sig-client');

        const type = document.getElementById('lsnnFormType').value;
        const clientName = document.getElementById('lsnnClientName').value.trim();
        const contactPhone = document.getElementById('lsnnContactPhone').value.trim();
        const servicePackage = document.getElementById('lsnnServicePackage').value.trim();

        const isBulk = type === 'bulkads';
        const topicTitle = isBulk ? `[Bulkads] ${clientName}` : `[Billboards] ${clientName}`;
        const topicContent = isBulk
          ? templates.bulkads({
              clientName,
              contactPhone,
              servicePackage,
              totalQuota: document.getElementById('lsnnTotalQuota').value.trim(),
              airtimeInterval: document.getElementById('lsnnAirtimeInterval').value.trim(),
              adContent: document.getElementById('lsnnAdContent').value.trim(),
              signatureUrl
            })
          : templates.billboards({
              clientName,
              contactPhone,
              servicePackage,
              preferredLocation: document.getElementById('lsnnPreferredLocation').value.trim(),
              rentalDuration: document.getElementById('lsnnRentalDuration').value.trim(),
              preferredStartDate: document.getElementById('lsnnPreferredStartDate').value,
              artworkUrl: document.getElementById('lsnnArtworkUrl').value.trim(),
              additionalNotes: document.getElementById('lsnnAdditionalNotes').value.trim(),
              signatureUrl
            });

        const created = await utils.createTopic({
          cid,
          title: topicTitle,
          content: topicContent
        });

        draft.clear();
        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Permohonan komersial berhasil dipublikasikan!');

        if (created?.slug && window.ajaxify) {
          ajaxify.go(`topic/${created.slug}`);
        }
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Request & Create Topic';
      }
    });
  }

  // =========================================================================
  // 2. MODAL UI: STAFF BILLING & PAYMENT NOTICE (REPLY IN TOPIC)
  // =========================================================================
  function openStaffBillingModal(tid, rawTopicTitle) {
    const guessedClient = (rawTopicTitle || '').replace(/^\[(Bulkads|Billboards)\]\s*/i, '').trim();
    const isBillboardTopic = /^\[Billboards\]/i.test(rawTopicTitle || '');

    const storageKey = `lsnn_staff_bank_${window.app?.user?.uid || 'guest'}`;
    let savedBank = { accountNumber: '', accountName: '' };
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (parsed.accountNumber) savedBank.accountNumber = parsed.accountNumber;
      if (parsed.accountName) savedBank.accountName = parsed.accountName;
    } catch (e) {}

    const modalHtml = `
<div class="modal fade" id="lsnnBillingModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold">Issue Commercial Billing &amp; Payment Notice</h5>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="lsnnBillingForm">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Client / Representative Name *</label>
              <input type="text" class="form-control" id="lsnnBillClientName" value="${escapeHtml(guessedClient)}" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Service Category *</label>
              <select class="form-select" id="lsnnBillServiceCategory">
                <option value="Broadcast Advertisements" ${!isBillboardTopic ? 'selected' : ''}>Broadcast Advertisements</option>
                <option value="Billboard Advertisements" ${isBillboardTopic ? 'selected' : ''}>Billboard Advertisements</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Service Package &amp; Rate Category *</label>
              <input type="text" class="form-control" id="lsnnBillPackage" placeholder="e.g. Bulk Ads (Public) / Medium Billboard" required />
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-3">
              <label class="form-label fw-semibold">Quantity *</label>
              <input type="number" min="1" class="form-control" id="lsnnBillQty" value="${isBillboardTopic ? '1' : '10'}" required />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Unit Label *</label>
              <input type="text" class="form-control" id="lsnnBillUnit" value="${isBillboardTopic ? 'Package (2 Weeks)' : 'Runs'}" required />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Interval / Location</label>
              <input type="text" class="form-control" id="lsnnBillInterval" placeholder="e.g. Every 15 Minutes" value="${isBillboardTopic ? '' : 'Every 15 Minutes'}" />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Rate / Unit ($) *</label>
              <input type="number" min="0" class="form-control" id="lsnnBillRate" value="${isBillboardTopic ? '4000' : '150'}" required />
            </div>
          </div>

          <div class="lsnn-billing-preview-box mb-3">
            <span class="fw-bold text-uppercase">Calculated Total Amount Due:</span>
            <span class="fs-5 fw-bolder" style="color: #15803d;" id="lsnnBillTotalPreview">$${isBillboardTopic ? '4,000' : '1,500'}</span>
          </div>

          <div class="row g-3 mb-2">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Account Number *</label>
              <input type="text" class="form-control" id="lsnnBillAccNum" value="${escapeHtml(savedBank.accountNumber)}" placeholder="e.g. 1002938475" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Account Name *</label>
              <input type="text" class="form-control" id="lsnnBillAccName" value="${escapeHtml(savedBank.accountName)}" placeholder="e.g. LSNN Treasury" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Staff Name (PR &amp; Marketing) *</label>
              <input type="text" class="form-control" id="lsnnBillStaffName" value="${escapeHtml(window.app?.user?.username || '')}" required />
            </div>
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="lsnnRememberBank" checked />
            <label class="form-check-label small text-muted" for="lsnnRememberBank">
              Simpan nomor &amp; nama rekening ini di browser saya untuk billing berikutnya
            </label>
          </div>

          ${utils.renderSignatureField({
            idPrefix: 'lsnnStaffSig',
            label: 'Staff Digital Signature *',
            helpText: 'Gambar tanda tangan di kanvas atau unggah gambar tanda tangan Anda.'
          })}
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <button type="button" class="btn btn-primary" id="lsnnSubmitBillingBtn">
          <i class="fa fa-check-circle"></i> Post Official Billing Notice
        </button>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnBillingModal');
    const sigField = utils.initSignatureField('lsnnStaffSig');

    const qtyEl = document.getElementById('lsnnBillQty');
    const rateEl = document.getElementById('lsnnBillRate');
    const previewEl = document.getElementById('lsnnBillTotalPreview');

    function updateTotal() {
      const total = Number(qtyEl.value || 0) * Number(rateEl.value || 0);
      previewEl.textContent = `$${formatMoney(total)}`;
    }
    qtyEl.addEventListener('input', updateTotal);
    rateEl.addEventListener('input', updateTotal);

    document.getElementById('lsnnSubmitBillingBtn').addEventListener('click', async () => {
      const form = document.getElementById('lsnnBillingForm');
      if (!form.reportValidity()) return;

      const submitBtn = document.getElementById('lsnnSubmitBillingBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Posting Invoice...';

      try {
        const accountNumber = document.getElementById('lsnnBillAccNum').value.trim();
        const accountName = document.getElementById('lsnnBillAccName').value.trim();

        if (document.getElementById('lsnnRememberBank').checked) {
          localStorage.setItem(storageKey, JSON.stringify({ accountNumber, accountName }));
        } else {
          localStorage.removeItem(storageKey);
        }

        const signatureUrl = await sigField.getSignatureUrl('sig-staff');

        const replyContent = templates.billingNotice({
          clientName: document.getElementById('lsnnBillClientName').value.trim(),
          serviceCategory: document.getElementById('lsnnBillServiceCategory').value,
          servicePackage: document.getElementById('lsnnBillPackage').value.trim(),
          quantity: qtyEl.value,
          unitLabel: document.getElementById('lsnnBillUnit').value.trim(),
          intervalText: document.getElementById('lsnnBillInterval').value.trim(),
          unitRate: rateEl.value,
          accountNumber,
          accountName,
          staffName: document.getElementById('lsnnBillStaffName').value.trim(),
          signatureUrl
        });

        await utils.replyTopic({ tid, content: replyContent });

        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Commercial Billing & Payment Notice berhasil diterbitkan!');
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-check-circle"></i> Post Official Billing Notice';
      }
    });
  }

  // =========================================================================
  // 3. PAGE INJECTION HOOK
  // =========================================================================
  async function injectCommercialButtons() {
    if (!window.ajaxify || !ajaxify.data) return;

    const cid = Number(ajaxify.data.cid);
    const tid = Number(ajaxify.data.tid);
    const path = window.location.pathname || '';
    const commCfg = config.commercial;

    const isTargetCategory = commCfg.categoryIds.includes(cid);
    const isRateCardTopic =
      tid === commCfg.rateCardTopicId ||
      new RegExp(`^/topic/${commCfg.rateCardTopicId}(/|$)`).test(path);

    if (!isTargetCategory && !isRateCardTopic) return;

    const isTopicPage = Boolean(ajaxify.data.template?.topic || /^\/topic\//.test(path));
    const isCategoryPage = Boolean(ajaxify.data.template?.category || /^\/category\//.test(path));

    if ((isCategoryPage && isTargetCategory) || isRateCardTopic) {
      if (window.app?.user?.uid) {
        utils.injectButtonOnce({
          btnId: 'lsnnOpenClientFormBtn',
          anchorSelectors: '#new_topic, [component="category/post"], [component="topic/reply"], [component="topic/reply/locked"]',
          html: '<i class="fa fa-file-text-o"></i> Commercial Service Form',
          onClick: () => openClientRequestModal(cid || commCfg.categoryIds[0])
        });
      }
    }

    if (isTopicPage && isTargetCategory && !isRateCardTopic) {
      const isStaff = await utils.checkUserInGroups(commCfg.staffGroupSlugs);
      if (!isStaff) return;

      utils.injectButtonOnce({
        btnId: 'lsnnOpenBillingBtn',
        anchorSelectors: '[component="topic/reply"]',
        html: '<i class="fa fa-money"></i> Issue Billing Notice',
        onClick: () => openStaffBillingModal(tid, ajaxify.data.titleRaw || ajaxify.data.title)
      });
    }
  }

  $(window).on('action:ajaxify.end', injectCommercialButtons);
  if (document.readyState !== 'loading') {
    injectCommercialButtons();
  } else {
    document.addEventListener('DOMContentLoaded', injectCommercialButtons);
  }
})();
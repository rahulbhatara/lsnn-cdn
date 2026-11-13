(function () {
  'use strict';

  if (!window.LSNN || !LSNN.utils || !LSNN.templates) return;

  const { utils, templates, config } = LSNN;
  const { escapeHtml, notifySuccess, notifyError } = utils;

  const RECRUITMENT_CIDS = (config.recruitment.categoryIds && config.recruitment.categoryIds.length)
    ? config.recruitment.categoryIds
    : [12];
  const GUIDELINES_TID = Number(config.recruitment.guidelinesTopicId || 30);

  // =========================================================================
  // 1. MODAL UI: EMPLOYMENT APPLICATION FORM (4-STEP MULTI-STEP WIZARD)
  // =========================================================================
  function openRecruitmentApplicationModal(cid) {
    const uid = window.app?.user?.uid || 'guest';
    const draftKey = `lsnn_draft_recruitment_${uid}`;

    const modalHtml = `
<div class="modal fade" id="lsnnRecruitmentModal" tabindex="-1">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h5 class="modal-title fw-bold mb-0">LSNN Employment Application Form</h5>
          <small class="text-muted">Human Resources Development Division &bull; Auto-save draft aktif</small>
        </div>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>

      <div class="modal-body" id="lsnnRecModalBody">
        <!-- Stepper Navigation -->
        <div class="lsnn-stepper" id="lsnnRecStepper">
          <button type="button" class="lsnn-step-pill active" data-step-target="1">
            <span class="lsnn-step-num">1</span> Personal & Photo
          </button>
          <button type="button" class="lsnn-step-pill" data-step-target="2">
            <span class="lsnn-step-num">2</span> Role & Documents
          </button>
          <button type="button" class="lsnn-step-pill" data-step-target="3">
            <span class="lsnn-step-num">3</span> Essay Assessment
          </button>
          <button type="button" class="lsnn-step-pill" data-step-target="4">
            <span class="lsnn-step-num">4</span> OOC & Signature
          </button>
        </div>

        <form id="lsnnRecruitmentForm">
          <!-- =============================================================
               STEP 1: PERSONAL INFORMATION & 3:4 PHOTO
               ============================================================= -->
          <div data-lsnn-step="1">
            <div class="row g-3 align-items-start">
              <div class="col-md-3 text-center">
                <label class="form-label fw-semibold d-block">Applicant 3:4 Photo *</label>
                <div class="lsnn-photo-preview-box mx-auto mb-2">
                  <img id="lsnnAppPhotoPreview" src="${config.assets.photoFallback}" alt="3:4 Preview" />
                </div>
                <label class="btn btn-sm btn-outline-primary w-100 mb-1" style="cursor:pointer;">
                  <i class="fa fa-upload me-1"></i> Upload Photo
                  <input type="file" accept="image/png,image/jpeg,image/webp"
                    data-lsnn-upload-target="#lsnnAppPhotoUrl"
                    data-lsnn-preview-target="#lsnnAppPhotoPreview" hidden />
                </label>
                <input type="url" class="form-control form-control-sm" id="lsnnAppPhotoUrl"
                  data-lsnn-preview-target="#lsnnAppPhotoPreview"
                  placeholder="Or paste direct URL..." required />
              </div>

              <div class="col-md-9">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.1 Full Legal Name (Topic Title) *</label>
                    <input type="text" class="form-control" id="lsnnAppFullName" placeholder="Firstname Lastname (No underscores/tags)" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.2 Gender *</label>
                    <select class="form-select" id="lsnnAppGender" required>
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label fw-semibold">1.3 Place & Date of Birth *</label>
                    <input type="text" class="form-control" id="lsnnAppPobDob" placeholder="e.g. Los Santos, USA — 14 May 1998" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">1.4 Age (21–40) *</label>
                    <input type="number" min="21" max="40" class="form-control" id="lsnnAppAge" placeholder="e.g. 26" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.5 Citizenship / Work Status *</label>
                    <select class="form-select" id="lsnnAppCitizenship" required>
                      <option value="United States Citizen">United States Citizen</option>
                      <option value="Permanent Legal Resident">Permanent Legal Resident</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.6 Residential Address *</label>
                    <input type="text" class="form-control" id="lsnnAppAddress" placeholder="House/Unit No., Street Name, District" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.7 Phone Number (IC) *</label>
                    <input type="text" class="form-control" id="lsnnAppPhone" placeholder="e.g. 555-0148" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.8 Email Address *</label>
                    <input type="text" class="form-control" id="lsnnAppEmail" placeholder="firstname.lastname@mail.sa" required />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================================
               STEP 2: DIVISION, EXPERIENCE & OFFICIAL DOCUMENTS
               ============================================================= -->
          <div data-lsnn-step="2" class="d-none">
            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 02 — Division & Role Preference</h6>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">2.1 Primary Division & Role *</label>
                <select class="form-select" id="lsnnAppPrimaryRole" required>
                  <option value="">-- Select Primary Division & Role --</option>
                  <option value="Journalism & Editorial — News Reporter & Feature Columnist">Journalism & Editorial — News Reporter & Feature Columnist</option>
                  <option value="Broadcasting & Media Production — On-Air Host & Production Specialist">Broadcasting & Media Production — On-Air Host & Production Specialist</option>
                  <option value="IT & Software Development — Systems Engineer & Web Developer">IT & Software Development — Systems Engineer & Web Developer</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">2.2 Secondary Division & Role (Optional)</label>
                <select class="form-select" id="lsnnAppSecondaryRole">
                  <option value="N/A">N/A (No Secondary Preference)</option>
                  <option value="Journalism & Editorial — News Reporter & Feature Columnist">Journalism & Editorial — News Reporter & Feature Columnist</option>
                  <option value="Broadcasting & Media Production — On-Air Host & Production Specialist">Broadcasting & Media Production — On-Air Host & Production Specialist</option>
                  <option value="IT & Software Development — Systems Engineer & Web Developer">IT & Software Development — Systems Engineer & Web Developer</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">2.3 Preferred Working Hours *</label>
                <input type="text" class="form-control" id="lsnnAppWorkingHours" placeholder="e.g. 14:00 - 20:00 State Time" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">2.4 Weekly Availability *</label>
                <input type="text" class="form-control" id="lsnnAppWeeklyAvail" placeholder="e.g. 12 - 15 Hours / Week" required />
              </div>
            </div>

            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 03 — Education, Experience & Skills</h6>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.1 Highest Education & Field of Study (Major) *</label>
                <input type="text" class="form-control" id="lsnnAppEducation" placeholder="e.g. Bachelor of Arts in Journalism" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.2 School / University & Graduation Year *</label>
                <input type="text" class="form-control" id="lsnnAppSchoolYear" placeholder="e.g. University of San Andreas, Los Santos — 2021" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.3 Most Recent Employment History (or N/A)</label>
                <input type="text" class="form-control" id="lsnnAppEmpHistory" placeholder="Company/Agency | Role | Duration — or N/A" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.4 Reason for Leaving Previous Position (or N/A)</label>
                <input type="text" class="form-control" id="lsnnAppLeavingReason" placeholder="Reason for leaving, or N/A" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.5 Relevant Technical, Editorial, or Special Skills & Licenses *</label>
                <input type="text" class="form-control" id="lsnnAppSkills" placeholder="e.g. News Writing, Live Hosting, Video Editing, Pilot License" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.6 Portfolio / Work Samples (or N/A)</label>
                <input type="text" class="form-control" id="lsnnAppPortfolio" placeholder="Link to Articles, Broadcasts, Projects, or N/A" />
              </div>
            </div>

            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 05 — Official Documents & Background Check</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">5.1 State Identification Card *</label>
                <div class="input-group">
                  <input type="url" class="form-control" id="lsnnAppIdCardUrl" placeholder="https://..." required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnAppIdCardUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">5.2 State Driver's License *</label>
                <div class="input-group">
                  <input type="url" class="form-control" id="lsnnAppDriverUrl" placeholder="https://..." required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnAppDriverUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">5.3 LSPD Criminal Record Clearance Link *</label>
                <input type="url" class="form-control" id="lsnnAppCrimRecordUrl" placeholder="https://police.los-santos.net/..." required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">5.4 Ever been convicted of any criminal offense? *</label>
                <input type="text" class="form-control" id="lsnnAppConviction" value="No" placeholder="No / Yes — If Yes, state full details" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">5.5 Ever been dismissed from a public agency? *</label>
                <input type="text" class="form-control" id="lsnnAppDismissal" value="No" placeholder="No / Yes — If Yes, state full details" required />
              </div>
            </div>
          </div>

          <!-- =============================================================
               STEP 3: ASSESSMENT & MOTIVATION ESSAYS (4.1 - 4.5)
               ============================================================= -->
          <div data-lsnn-step="3" class="d-none">
            <div class="alert alert-light border small mb-3">
              <strong>Text-Heavy Standard:</strong> Jawab seluruh pertanyaan berikut dalam Bahasa Inggris (In-Character) minimal 1 paragraf per pertanyaan. Dilarang melakukan plagiarisme.
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.1 What motivated you to apply for a career at the Los Santos News Network? *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnAppQ1">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnAppQ1" rows="3" required></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.2 What specific strengths or experience make you a strong fit for your chosen primary division? *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnAppQ2">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnAppQ2" rows="3" required></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.3 How do you maintain neutrality and accuracy when covering sensitive or fast-moving public events? *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnAppQ3">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnAppQ3" rows="3" required></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.4 Describe a past situation where you successfully delivered a project under a tight deadline. *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnAppQ4">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnAppQ4" rows="3" required></textarea>
            </div>

            <div class="mb-1">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.5 What fresh ideas or improvements would you like to contribute to LSNN after completing the academy? *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnAppQ5">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnAppQ5" rows="3" required></textarea>
            </div>
          </div>

          <!-- =============================================================
               STEP 4: (( OUT OF CHARACTER )) & SIGNATURE
               ============================================================= -->
          <div data-lsnn-step="4" class="d-none">
            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 06 — (( Out of Character (OOC) Information ))</h6>
            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.1 Nama Akun UCP *</label>
                <input type="text" class="form-control" id="lsnnAppUcpName" required />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.2 Nama & Level Karakter Utama *</label>
                <input type="text" class="form-control" id="lsnnAppMainChar" placeholder="Firstname_Lastname — Level X" required />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.3 Berusia minimal 16 tahun di dunia nyata? *</label>
                <select class="form-select" id="lsnnAppOocAge" required>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.4 Karakter utama (Main) & lulus RP-Quiz? *</label>
                <select class="form-select" id="lsnnAppMainQuiz" required>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.5 Bergabung Discord & punya WhatsApp aktif? *</label>
                <select class="form-select" id="lsnnAppDiscordWa" required>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.6 Terinstal TeamSpeak 3 & mic jernih? *</label>
                <select class="form-select" id="lsnnAppTs3Mic" required>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.7 Riwayat Faksi / Gang Sebelumnya *</label>
                <input type="text" class="form-control" id="lsnnAppPastFaction" value="Tidak Pernah" placeholder="Tidak Pernah / Nama Faksi — Tgl Keluar" required />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.8 Sudah cooldown 1 bulan & no double faction? *</label>
                <select class="form-select" id="lsnnAppCooldown" required>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.9 Bebas blacklist instansi resmi lain? *</label>
                <select class="form-select" id="lsnnAppBlacklist" required>
                  <option value="Ya, Bersih">Ya, Bersih</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.10 Screenshot /stats (Unedited) *</label>
                <div class="input-group">
                  <input type="url" class="form-control" id="lsnnAppStatsUrl" placeholder="https://..." required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnAppStatsUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.11 Screenshot /mywarns (Unedited) *</label>
                <div class="input-group">
                  <input type="url" class="form-control" id="lsnnAppWarnsUrl" placeholder="https://..." required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnAppWarnsUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.12 Screenshot Forum Association UCP *</label>
                <div class="input-group">
                  <input type="url" class="form-control" id="lsnnAppForumAssocUrl" placeholder="https://..." required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnAppForumAssocUrl" hidden />
                  </label>
                </div>
              </div>
            </div>

            <div class="mb-2">
              <label class="form-label fw-semibold d-flex justify-content-between align-items-center">
                <span>07 Applicant Digital Signature *</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="lsnnClearAppSig">Clear</button>
              </label>
              <div class="lsnn-sig-pad-wrap">
                <canvas id="lsnnAppSigCanvas"></canvas>
              </div>
              <small class="text-muted">Dengan menandatangani formulir ini, saya menyatakan seluruh data IC & OOC adalah benar dan siap didiskualifikasi apabila ditemukan pemalsuan atau plagiarisme.</small>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer justify-content-between">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary d-none" id="lsnnRecPrevBtn">
            <i class="fa fa-arrow-left"></i> Previous
          </button>
          <button type="button" class="btn btn-primary" id="lsnnRecNextBtn">
            Next <i class="fa fa-arrow-right"></i>
          </button>
          <button type="button" class="btn btn-primary d-none" id="lsnnRecSubmitBtn">
            <i class="fa fa-paper-plane"></i> Submit Application
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnRecruitmentModal');
    const modalEl = modalCtrl.el;
    const formEl = document.getElementById('lsnnRecruitmentForm');
    const draft = utils.createDraftManager(draftKey, formEl);
    const sigPad = utils.initSignaturePad('lsnnAppSigCanvas', 'lsnnClearAppSig');

    let currentStep = 1;
    const totalSteps = 4;

    function validateStep(stepNum) {
      const stepContainer = modalEl.querySelector(`[data-lsnn-step="${stepNum}"]`);
      if (!stepContainer) return true;
      const fields = stepContainer.querySelectorAll('input, select, textarea');
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    }

    function goToStep(targetStep) {
      if (targetStep > currentStep && !validateStep(currentStep)) return;
      currentStep = Math.max(1, Math.min(totalSteps, targetStep));

      modalEl.querySelectorAll('[data-lsnn-step]').forEach(el => {
        el.classList.toggle('d-none', Number(el.dataset.lsnnStep) !== currentStep);
      });

      modalEl.querySelectorAll('[data-step-target]').forEach(pill => {
        const s = Number(pill.dataset.stepTarget);
        pill.classList.toggle('active', s === currentStep);
        pill.classList.toggle('completed', s < currentStep);
      });

      document.getElementById('lsnnRecPrevBtn').classList.toggle('d-none', currentStep === 1);
      document.getElementById('lsnnRecNextBtn').classList.toggle('d-none', currentStep === totalSteps);
      document.getElementById('lsnnRecSubmitBtn').classList.toggle('d-none', currentStep !== totalSteps);

      const bodyEl = document.getElementById('lsnnRecModalBody');
      if (bodyEl) bodyEl.scrollTop = 0;
    }

    document.getElementById('lsnnRecPrevBtn').addEventListener('click', () => goToStep(currentStep - 1));
    document.getElementById('lsnnRecNextBtn').addEventListener('click', () => goToStep(currentStep + 1));

    modalEl.querySelectorAll('[data-step-target]').forEach(pill => {
      pill.addEventListener('click', () => {
        const target = Number(pill.dataset.stepTarget);
        if (target <= currentStep) {
          goToStep(target);
        } else if (target === currentStep + 1) {
          goToStep(target);
        }
      });
    });

    // Live preview saat URL photo 3:4 ditempel manual
    const photoInput = document.getElementById('lsnnAppPhotoUrl');
    const photoPreview = document.getElementById('lsnnAppPhotoPreview');
    photoInput.addEventListener('input', () => {
      const val = photoInput.value.trim();
      photoPreview.src = /^https?:\/\//i.test(val) ? val : config.assets.photoFallback;
    });

    // Live character counter untuk 5 pertanyaan esai
    ['lsnnAppQ1', 'lsnnAppQ2', 'lsnnAppQ3', 'lsnnAppQ4', 'lsnnAppQ5'].forEach(id => {
      const ta = document.getElementById(id);
      const counter = modalEl.querySelector(`[data-lsnn-charcount="${id}"]`);
      if (!ta || !counter) return;
      const sync = () => { counter.textContent = ta.value.length; };
      ta.addEventListener('input', sync);
      sync();
    });

    // Submit Application
    document.getElementById('lsnnRecSubmitBtn').addEventListener('click', async () => {
      if (!validateStep(4)) return;

      const submitBtn = document.getElementById('lsnnRecSubmitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting...';

      try {
        let signatureUrl = config.assets.sigFallback;
        if (sigPad && !sigPad.isEmpty()) {
          const blob = await sigPad.toBlob();
          signatureUrl = await utils.uploadFileToNodeBB(blob, `sig-applicant-${Date.now()}.png`);
        }

        const fullName = document.getElementById('lsnnAppFullName').value.trim();
        const topicContent = templates.recruitmentApplication({
          photoUrl: photoInput.value.trim(),
          fullName,
          gender: document.getElementById('lsnnAppGender').value,
          pobDob: document.getElementById('lsnnAppPobDob').value.trim(),
          age: document.getElementById('lsnnAppAge').value.trim(),
          citizenship: document.getElementById('lsnnAppCitizenship').value,
          address: document.getElementById('lsnnAppAddress').value.trim(),
          phone: document.getElementById('lsnnAppPhone').value.trim(),
          email: document.getElementById('lsnnAppEmail').value.trim(),
          primaryRole: document.getElementById('lsnnAppPrimaryRole').value,
          secondaryRole: document.getElementById('lsnnAppSecondaryRole').value,
          workingHours: document.getElementById('lsnnAppWorkingHours').value.trim(),
          weeklyAvailability: document.getElementById('lsnnAppWeeklyAvail').value.trim(),
          education: document.getElementById('lsnnAppEducation').value.trim(),
          schoolYear: document.getElementById('lsnnAppSchoolYear').value.trim(),
          employmentHistory: document.getElementById('lsnnAppEmpHistory').value.trim() || 'N/A',
          leavingReason: document.getElementById('lsnnAppLeavingReason').value.trim() || 'N/A',
          skills: document.getElementById('lsnnAppSkills').value.trim(),
          portfolio: document.getElementById('lsnnAppPortfolio').value.trim() || 'N/A',
          q1Motivation: document.getElementById('lsnnAppQ1').value.trim(),
          q2Strengths: document.getElementById('lsnnAppQ2').value.trim(),
          q3Neutrality: document.getElementById('lsnnAppQ3').value.trim(),
          q4Deadline: document.getElementById('lsnnAppQ4').value.trim(),
          q5Ideas: document.getElementById('lsnnAppQ5').value.trim(),
          idCardUrl: document.getElementById('lsnnAppIdCardUrl').value.trim(),
          driverLicenseUrl: document.getElementById('lsnnAppDriverUrl').value.trim(),
          criminalRecordUrl: document.getElementById('lsnnAppCrimRecordUrl').value.trim(),
          criminalConviction: document.getElementById('lsnnAppConviction').value.trim(),
          agencyDismissal: document.getElementById('lsnnAppDismissal').value.trim(),
          ucpName: document.getElementById('lsnnAppUcpName').value.trim(),
          mainCharLevel: document.getElementById('lsnnAppMainChar').value.trim(),
          oocAge16: document.getElementById('lsnnAppOocAge').value,
          isMainAndQuiz: document.getElementById('lsnnAppMainQuiz').value,
          hasDiscordWa: document.getElementById('lsnnAppDiscordWa').value,
          hasTs3Mic: document.getElementById('lsnnAppTs3Mic').value,
          pastFaction: document.getElementById('lsnnAppPastFaction').value.trim(),
          passedCooldown: document.getElementById('lsnnAppCooldown').value,
          cleanBlacklist: document.getElementById('lsnnAppBlacklist').value,
          statsUrl: document.getElementById('lsnnAppStatsUrl').value.trim(),
          mywarnsUrl: document.getElementById('lsnnAppWarnsUrl').value.trim(),
          forumAssocUrl: document.getElementById('lsnnAppForumAssocUrl').value.trim(),
          signatureUrl
        });

        const created = await utils.createTopic({
          cid,
          title: fullName,
          content: topicContent
        });

        draft.clear();
        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Lamaran pekerjaan berhasil dikirim ke Human Resources Development!');

        if (created?.slug && window.ajaxify) {
          ajaxify.go(`topic/${created.slug}`);
        }
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Application';
      }
    });
  }

  // =========================================================================
  // 2. MODAL UI: HRD EVALUATION & STATUS NOTICE (STAFF ONLY)
  // =========================================================================
  function openHrdEvaluationModal(tid, rawTopicTitle) {
    const applicantName = (rawTopicTitle || '').trim();

    const PRESET_REMARKS = {
      'ACCEPTED TO INTERVIEW': 'Congratulations! Your application has passed preliminary screening. Please reply to this thread using the Interview Booking format to schedule your in-person interview at LSNN Media Centre (12:00 - 21:00 State Time).',
      'PENDING': 'Your application requires minor corrections (formatting/broken links/missing details). Please edit your original post within 24 hours and reply once updated.',
      'DENIED': 'Thank you for applying to LSNN. Unfortunately, your application does not meet our current selection criteria. You may reapply in the next recruitment batch.',
      'BANNED / BLACKLIST': 'Your application has been permanently rejected due to severe rule violations (plagiarism / forgery / OOC dishonesty).'
    };

    const modalHtml = `
<div class="modal fade" id="lsnnHrdEvalModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold">HRD Application Evaluation & Status Notice</h5>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="lsnnHrdEvalForm">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Applicant Name *</label>
              <input type="text" class="form-control" id="lsnnHrdApplicantName" value="${escapeHtml(applicantName)}" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Evaluation Decision Status *</label>
              <select class="form-select" id="lsnnHrdStatus" required>
                <option value="ACCEPTED TO INTERVIEW">ACCEPTED TO INTERVIEW</option>
                <option value="PENDING">PENDING (24-Hour Revision)</option>
                <option value="DENIED">DENIED</option>
                <option value="BANNED / BLACKLIST">BANNED / BLACKLIST</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>HRD Remarks & Instructions *</span>
                <button type="button" class="btn btn-sm btn-link p-0 text-decoration-none" id="lsnnFillPresetRemark">Use Default Template Text</button>
              </label>
              <textarea class="form-control" id="lsnnHrdRemarks" rows="4" required>${escapeHtml(PRESET_REMARKS['ACCEPTED TO INTERVIEW'])}</textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">HRD Officer Name *</label>
              <input type="text" class="form-control" id="lsnnHrdStaffName" value="${escapeHtml(window.app?.user?.username || '')}" required />
            </div>
          </div>

          <div class="mb-2">
            <label class="form-label fw-semibold d-flex justify-content-between align-items-center">
              <span>HRD Digital Signature *</span>
              <button type="button" class="btn btn-sm btn-outline-secondary" id="lsnnClearHrdSig">Clear</button>
            </label>
            <div class="lsnn-sig-pad-wrap">
              <canvas id="lsnnHrdSigCanvas"></canvas>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <button type="button" class="btn btn-primary" id="lsnnSubmitHrdEvalBtn">
          <i class="fa fa-gavel"></i> Post Official Evaluation
        </button>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnHrdEvalModal');
    const sigPad = utils.initSignaturePad('lsnnHrdSigCanvas', 'lsnnClearHrdSig');

    const statusEl = document.getElementById('lsnnHrdStatus');
    const remarksEl = document.getElementById('lsnnHrdRemarks');

    statusEl.addEventListener('change', () => {
      if (PRESET_REMARKS[statusEl.value]) {
        remarksEl.value = PRESET_REMARKS[statusEl.value];
      }
    });

    document.getElementById('lsnnFillPresetRemark').addEventListener('click', () => {
      if (PRESET_REMARKS[statusEl.value]) {
        remarksEl.value = PRESET_REMARKS[statusEl.value];
      }
    });

    document.getElementById('lsnnSubmitHrdEvalBtn').addEventListener('click', async () => {
      const form = document.getElementById('lsnnHrdEvalForm');
      if (!form.reportValidity()) return;

      const submitBtn = document.getElementById('lsnnSubmitHrdEvalBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Posting...';

      try {
        let signatureUrl = config.assets.sigFallback;
        if (sigPad && !sigPad.isEmpty()) {
          const blob = await sigPad.toBlob();
          signatureUrl = await utils.uploadFileToNodeBB(blob, `sig-hrd-${Date.now()}.png`);
        }

        const content = templates.hrdDecision({
          applicantName: document.getElementById('lsnnHrdApplicantName').value.trim(),
          status: statusEl.value,
          remarks: remarksEl.value.trim(),
          staffName: document.getElementById('lsnnHrdStaffName').value.trim(),
          signatureUrl
        });

        await utils.replyTopic({ tid, content });

        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Keputusan evaluasi HRD berhasil dipublikasikan!');
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-gavel"></i> Post Official Evaluation';
      }
    });
  }

  // =========================================================================
  // 3. MODAL UI: CANDIDATE INTERVIEW BOOKING (APPLICANT SELF-SERVICE)
  // =========================================================================
  function openInterviewBookingModal(tid, rawTopicTitle) {
    const candidateName = (rawTopicTitle || '').trim();

    const modalHtml = `
<div class="modal fade" id="lsnnBookingModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold">Formal Interview Schedule Booking</h5>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-light border small mb-3">
          <strong>Scheduling Rules:</strong> Interviews run daily from <strong>12:00 to 21:00 State Time</strong> (excluding 17:00–18:00) and must be booked at least <strong>3 hours in advance</strong>.
        </div>
        <form id="lsnnBookingForm">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Candidate Name *</label>
              <input type="text" class="form-control" id="lsnnBookName" value="${escapeHtml(candidateName)}" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Request Type *</label>
              <select class="form-select" id="lsnnBookType" required>
                <option value="NEW REQUEST">NEW REQUEST</option>
                <option value="RESCHEDULE">RESCHEDULE (Max 1x)</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Preferred Date *</label>
              <input type="date" class="form-control" id="lsnnBookDate" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Preferred Time (State Time) *</label>
              <input type="time" class="form-control" id="lsnnBookTime" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Interviewer Code</label>
              <input type="text" class="form-control" id="lsnnBookInterviewer" value="First Available" />
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Reason for Reschedule (Required if Reschedule)</label>
              <input type="text" class="form-control" id="lsnnBookReason" placeholder="Leave blank or N/A if New Request" />
            </div>
          </div>

          <div class="mb-2">
            <label class="form-label fw-semibold d-flex justify-content-between align-items-center">
              <span>Candidate Digital Signature *</span>
              <button type="button" class="btn btn-sm btn-outline-secondary" id="lsnnClearBookSig">Clear</button>
            </label>
            <div class="lsnn-sig-pad-wrap">
              <canvas id="lsnnBookSigCanvas"></canvas>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <button type="button" class="btn btn-primary" id="lsnnSubmitBookBtn">
          <i class="fa fa-calendar-check-o"></i> Post Interview Booking
        </button>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnBookingModal');
    const sigPad = utils.initSignaturePad('lsnnBookSigCanvas', 'lsnnClearBookSig');

    document.getElementById('lsnnSubmitBookBtn').addEventListener('click', async () => {
      const form = document.getElementById('lsnnBookingForm');
      if (!form.reportValidity()) return;

      const submitBtn = document.getElementById('lsnnSubmitBookBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Booking...';

      try {
        let signatureUrl = config.assets.sigFallback;
        if (sigPad && !sigPad.isEmpty()) {
          const blob = await sigPad.toBlob();
          signatureUrl = await utils.uploadFileToNodeBB(blob, `sig-booking-${Date.now()}.png`);
        }

        const content = templates.interviewBooking({
          candidateName: document.getElementById('lsnnBookName').value.trim(),
          requestType: document.getElementById('lsnnBookType').value,
          preferredDate: document.getElementById('lsnnBookDate').value,
          preferredTime: document.getElementById('lsnnBookTime').value,
          interviewerCode: document.getElementById('lsnnBookInterviewer').value.trim() || 'First Available',
          rescheduleReason: document.getElementById('lsnnBookReason').value.trim() || 'N/A',
          signatureUrl
        });

        await utils.replyTopic({ tid, content });

        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Jadwal interview berhasil diajukan!');
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-calendar-check-o"></i> Post Interview Booking';
      }
    });
  }

  // =========================================================================
  // 4. PAGE INJECTION HOOK
  // =========================================================================
  async function injectRecruitmentButtons() {
    if (!window.ajaxify || !ajaxify.data) return;

    const cid = Number(ajaxify.data.cid);
    const tid = Number(ajaxify.data.tid);
    const path = window.location.pathname || '';
    const recCfg = config.recruitment;

    const isRecruitmentCat = RECRUITMENT_CIDS.includes(cid);
    const isGuidelinesTopic =
      tid === GUIDELINES_TID ||
      new RegExp(`^/topic/${GUIDELINES_TID}(/|$)`).test(path);

    if (!isRecruitmentCat && !isGuidelinesTopic) return;

    const isTopicPage = Boolean(ajaxify.data.template?.topic || /^\/topic\//.test(path));
    const isCategoryPage = Boolean(ajaxify.data.template?.category || /^\/category\//.test(path));

    // 1. Tombol Form Lamaran -> Muncul di Category #12 & Topic #30 (Guidelines)
    if ((isCategoryPage && isRecruitmentCat) || isGuidelinesTopic) {
      if (window.app?.user?.uid) {
        utils.injectButtonOnce({
          btnId: 'lsnnOpenApplyFormBtn',
          anchorSelectors: '#new_topic, [component="category/post"], [component="topic/reply"], [component="topic/reply/locked"]',
          html: '<i class="fa fa-id-card-o"></i> Apply for LSNN',
          onClick: () => openRecruitmentApplicationModal(cid || RECRUITMENT_CIDS[0])
        });
      }
    }

    // 2. Di dalam Topic Lamaran Pelamar (Category #12, bukan Topic #30)
    if (isTopicPage && isRecruitmentCat && !isGuidelinesTopic && window.app?.user?.uid) {
      const topicTitle = ajaxify.data.titleRaw || ajaxify.data.title;

      // Tombol Booking Interview khusus pemilik thread lamaran
      if (Number(ajaxify.data.uid) === Number(app.user.uid)) {
        utils.injectButtonOnce({
          btnId: 'lsnnOpenBookInterviewBtn',
          anchorSelectors: '[component="topic/reply"]',
          html: '<i class="fa fa-calendar-check-o"></i> Book Interview',
          onClick: () => openInterviewBookingModal(tid, topicTitle)
        });
      }

      // Tombol HRD Evaluation khusus staf grup LSNN / HRD
      const isStaff = await utils.checkUserInGroups(recCfg.staffGroupSlugs);
      if (isStaff) {
        utils.injectButtonOnce({
          btnId: 'lsnnOpenHrdEvalBtn',
          anchorSelectors: '[component="topic/reply"]',
          html: '<i class="fa fa-gavel"></i> HRD Evaluation',
          onClick: () => openHrdEvaluationModal(tid, topicTitle)
        });
      }
    }
  }

  $(window).on('action:ajaxify.end', injectRecruitmentButtons);
  if (document.readyState !== 'loading') {
    injectRecruitmentButtons();
  } else {
    document.addEventListener('DOMContentLoaded', injectRecruitmentButtons);
  }
})();
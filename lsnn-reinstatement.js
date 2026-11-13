(function () {
  'use strict';

  if (!window.LSNN || !LSNN.utils || !LSNN.templates) return;

  const { utils, templates, config } = LSNN;
  const { escapeHtml, notifySuccess, notifyError } = utils;

  const REIN_CFG = config.reinstatement || {
    categoryIds: [13],
    guidelinesTopicId: null,
    staffGroupSlugs: ['lsnn']
  };
  const REIN_CIDS = (REIN_CFG.categoryIds && REIN_CFG.categoryIds.length)
    ? REIN_CFG.categoryIds
    : [13];
  const GUIDELINES_TID = REIN_CFG.guidelinesTopicId ? Number(REIN_CFG.guidelinesTopicId) : null;

  // =========================================================================
  // 1. MODAL UI: REINSTATEMENT & EXTERNAL MEDIA TRANSFER DOSSIER (4-STEP)
  // =========================================================================
  function openReinstatementModal(cid) {
    const uid = window.app?.user?.uid || 'guest';
    const draftKey = `lsnn_draft_reinstatement_${uid}`;

    const modalHtml = `
<div class="modal fade" id="lsnnReinstatementModal" tabindex="-1">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h5 class="modal-title fw-bold mb-0">LSNN Reinstatement &amp; External Media Transfer Dossier</h5>
          <small class="text-muted">Human Resources Development Division &bull; Auto-save draft aktif</small>
        </div>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>

      <div class="modal-body" id="lsnnReinModalBody">
        <!-- Stepper Navigation -->
        <div class="lsnn-stepper" id="lsnnReinStepper">
          <button type="button" class="lsnn-step-pill active" data-step-target="1">
            <span class="lsnn-step-num">1</span> Pathway &amp; Personal
          </button>
          <button type="button" class="lsnn-step-pill" data-step-target="2">
            <span class="lsnn-step-num">2</span> Service Record &amp; Division
          </button>
          <button type="button" class="lsnn-step-pill" data-step-target="3">
            <span class="lsnn-step-num">3</span> Competency &amp; Clearances
          </button>
          <button type="button" class="lsnn-step-pill" data-step-target="4">
            <span class="lsnn-step-num">4</span> OOC &amp; 14-Day Covenant
          </button>
        </div>

        <form id="lsnnReinstatementForm">
          <input type="hidden" id="lsnnReinPathway" value="reinstatement" />

          <!-- =============================================================
               STEP 1: PATHWAY SELECTION, PERSONAL INFORMATION & 3:4 PHOTO
               ============================================================= -->
          <div data-lsnn-step="1">
            <label class="form-label fw-semibold d-block mb-2">Select Executive Application Pathway *</label>
            <div class="lsnn-form-tabs mb-3">
              <button type="button" class="lsnn-form-tab-btn active" data-pathway="reinstatement">
                <i class="fa fa-history me-1"></i> Category A: LSNN Reinstatement ([REINSTATEMENT])
              </button>
              <button type="button" class="lsnn-form-tab-btn" data-pathway="transfer">
                <i class="fa fa-exchange me-1"></i> Category B: External Media Transfer ([TRANSFER])
              </button>
            </div>

            <div class="row g-3 align-items-start">
              <div class="col-md-3 text-center">
                <label class="form-label fw-semibold d-block">Applicant 3:4 Photo *</label>
                <div class="lsnn-photo-preview-box mx-auto mb-2">
                  <img id="lsnnReinPhotoPreview" src="${config.assets.photoFallback}" alt="3:4 Preview" />
                </div>
                <label class="btn btn-sm btn-outline-primary w-100 mb-1" style="cursor:pointer;">
                  <i class="fa fa-upload me-1"></i> Upload Photo
                  <input type="file" accept="image/png,image/jpeg,image/webp"
                    data-lsnn-upload-target="#lsnnReinPhotoUrl"
                    data-lsnn-preview-target="#lsnnReinPhotoPreview" hidden />
                </label>
                <input type="text" class="form-control form-control-sm" id="lsnnReinPhotoUrl"
                  data-lsnn-preview-target="#lsnnReinPhotoPreview"
                  pattern="^(https?://|/).+"
                  placeholder="Or paste direct URL..." required />
              </div>

              <div class="col-md-9">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.2 Full Legal Name *</label>
                    <input type="text" class="form-control" id="lsnnReinFullName" placeholder="Firstname Lastname (No underscores/tags)" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.3 Gender *</label>
                    <select class="form-select" id="lsnnReinGender" required>
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label fw-semibold">1.4 Place &amp; Date of Birth *</label>
                    <input type="text" class="form-control" id="lsnnReinPobDob" placeholder="e.g. Los Santos, USA — 18 August 1995" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">1.5 Age (21–45) *</label>
                    <input type="number" min="21" max="45" class="form-control" id="lsnnReinAge" placeholder="e.g. 30" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.6 Citizenship / Work Status *</label>
                    <select class="form-select" id="lsnnReinCitizenship" required>
                      <option value="United States Citizen">United States Citizen</option>
                      <option value="Permanent Legal Resident">Permanent Legal Resident</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.7 Residential Address *</label>
                    <input type="text" class="form-control" id="lsnnReinAddress" placeholder="House/Unit No., Street Name, District" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.8a Phone Number (IC) *</label>
                    <input type="text" class="form-control" id="lsnnReinPhone" placeholder="e.g. 555-0184" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">1.8b Email Address *</label>
                    <input type="text" class="form-control" id="lsnnReinEmail" placeholder="firstname.lastname@mail.sa" required />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================================
               STEP 2: PRIOR MEDIA SERVICE RECORD & DIVISIONAL PLACEMENT
               ============================================================= -->
          <div data-lsnn-step="2" class="d-none">
            <!-- Fields khusus Category A: Reinstatement -->
            <div id="lsnnReinFieldsCatA">
              <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 02 — Former LSNN Service Record (Category A)</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.1 Former LSNN Division &amp; Peak Rank Held *</label>
                  <input type="text" class="form-control" id="lsnnReinFormerRankDiv" placeholder="e.g. Journalism Division — Senior Reporter" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.2 Approximate Service Tenure at LSNN *</label>
                  <input type="text" class="form-control" id="lsnnReinFormerTenure" placeholder="e.g. 4 Months (June 2026 – October 2026)" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.3 Separation Status &amp; Date *</label>
                  <input type="text" class="form-control" id="lsnnReinSepStatus" placeholder="e.g. Honorable Resignation — 12 October 2026" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.4 Former Supervisor / Executive Reference (Optional)</label>
                  <input type="text" class="form-control" id="lsnnReinFormerRef" placeholder="Name & Rank, or N/A" />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">2.5 Verifiable LSNN Service / Resignation Archive Link *</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="lsnnReinServiceProofUrl" pattern="^(https?://|/).+" placeholder="https://portal.lsnn.fun/... or upload screenshot" required />
                    <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                      <i class="fa fa-upload"></i>
                      <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinServiceProofUrl" hidden />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fields khusus Category B: External Media Transfer -->
            <div id="lsnnReinFieldsCatB" class="d-none">
              <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 02 — External Media Agency Record (Category B)</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.1 Previous / Current Media Agency Name *</label>
                  <input type="text" class="form-control" id="lsnnReinExtAgency" placeholder="e.g. San Andreas Network (SAN) / Weazel News" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.2 Current / Last Held Rank &amp; Divisional Role *</label>
                  <input type="text" class="form-control" id="lsnnReinExtRankRole" placeholder="e.g. Senior Broadcast Producer" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.3 Total Active Service Tenure *</label>
                  <input type="text" class="form-control" id="lsnnReinExtTenure" placeholder="e.g. 6 Months" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.4 Current Service Standing *</label>
                  <select class="form-select" id="lsnnReinExtStanding">
                    <option value="Honorably Separated Alumni">Honorably Separated Alumni</option>
                    <option value="Active Personnel Seeking Inter-Agency Transfer">Active Personnel Seeking Inter-Agency Transfer</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.5 Transfer Authorization / Honorable Discharge Proof *</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="lsnnReinTransferAuthUrl" pattern="^(https?://|/).+" placeholder="https://... or upload image" />
                    <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                      <i class="fa fa-upload"></i>
                      <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinTransferAuthUrl" hidden />
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">2.6 Roster Archive / Forum Profile Verification Link *</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="lsnnReinRosterProofUrl" pattern="^(https?://|/).+" placeholder="https://... or upload screenshot" />
                    <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                      <i class="fa fa-upload"></i>
                      <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinRosterProofUrl" hidden />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-12">
                <label class="form-label fw-semibold">Reason for Departure, Relocation, or Return to LSNN *</label>
                <input type="text" class="form-control" id="lsnnReinReturnReason" placeholder="State your clear reason for returning or transferring to LSNN" required />
              </div>
            </div>

            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 03 — Proposed Divisional Placement &amp; Availability</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.1 Primary Requested Division *</label>
                <select class="form-select" id="lsnnReinPrimaryDiv" required>
                  <option value="">-- Select Primary Division --</option>
                  <option value="Journalism & Field Editorial">Journalism &amp; Field Editorial</option>
                  <option value="Broadcasting & Media Production">Broadcasting &amp; Media Production</option>
                  <option value="IT & Software Development">IT &amp; Software Development</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.2 Secondary Requested Division (Optional)</label>
                <select class="form-select" id="lsnnReinSecondaryDiv">
                  <option value="N/A">N/A (No Secondary Preference)</option>
                  <option value="Journalism & Field Editorial">Journalism &amp; Field Editorial</option>
                  <option value="Broadcasting & Media Production">Broadcasting &amp; Media Production</option>
                  <option value="IT & Software Development">IT &amp; Software Development</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.3a Preferred Working Hours (State Time) *</label>
                <input type="text" class="form-control" id="lsnnReinWorkingHours" placeholder="e.g. 14:00 - 21:00 State Time" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.3b Weekly Availability *</label>
                <input type="text" class="form-control" id="lsnnReinWeeklyAvail" placeholder="e.g. 14 - 20 Hours / Week" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.4 Core Editorial, Broadcast, Technical Skills &amp; Licenses *</label>
                <input type="text" class="form-control" id="lsnnReinSkills" placeholder="e.g. Investigative Reporting, Live Anchoring, Helicopter Pilot License" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">3.5 Verified Portfolio / Published Works / Broadcast Archives *</label>
                <input type="text" class="form-control" id="lsnnReinPortfolioUrl" placeholder="https://... (Mandatory for External Transfer, or N/A if internal archive)" required />
              </div>
            </div>
          </div>

          <!-- =============================================================
               STEP 3: COMPETENCY STATEMENTS & STATUTORY CLEARANCES
               ============================================================= -->
          <div data-lsnn-step="3" class="d-none">
            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 04 — Executive Competency &amp; Integration Statements</h6>
            <div class="mb-3">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.1 Summarize your key operational contributions, leadership roles, or media productions from your prior service. *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnReinQ1">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnReinQ1" rows="3" required></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.2 How does your prior experience enable you to integrate immediately into your requested LSNN division? *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnReinQ2">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnReinQ2" rows="3" required></textarea>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>4.3 How do you uphold editorial neutrality, factual verification, and corporate ethics in fast-moving coverage? *</span>
                <small class="text-muted"><span data-lsnn-charcount="lsnnReinQ3">0</span> chars</small>
              </label>
              <textarea class="form-control" id="lsnnReinQ3" rows="3" required></textarea>
            </div>

            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 05 — Statutory Clearances &amp; Background Declaration</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">5.1 State Identification Card *</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="lsnnReinIdCardUrl" pattern="^(https?://|/).+" placeholder="https://... or upload" required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinIdCardUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">5.2 Valid State Driver's License *</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="lsnnReinDriverUrl" pattern="^(https?://|/).+" placeholder="https://... or upload" required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinDriverUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">5.3 LSPD Criminal Record Clearance Link *</label>
                <input type="url" class="form-control" id="lsnnReinCrimRecordUrl" placeholder="https://police.los-santos.net/..." required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">5.4 Ever been convicted of any criminal offense? *</label>
                <input type="text" class="form-control" id="lsnnReinConviction" value="No" placeholder="No / Yes — State full details" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">5.5 Prior Dishonorable Discharge or administrative disqualification? *</label>
                <input type="text" class="form-control" id="lsnnReinDisqual" value="No" placeholder="No / Yes — State full details" required />
              </div>
            </div>
          </div>

          <!-- =============================================================
               STEP 4: (( OUT OF CHARACTER )) & 14-DAY COVENANT SIGNATURE
               ============================================================= -->
          <div data-lsnn-step="4" class="d-none">
            <h6 class="fw-bold text-uppercase mb-2" style="color: var(--lsnn-purple-mid);">Section 06 — (( Out of Character (OOC) Verification ))</h6>
            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.1 Nama Akun UCP Jogjagamers *</label>
                <input type="text" class="form-control" id="lsnnReinUcpName" required />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.2 Nama &amp; Level Karakter Utama (Min. Lv 4/5) *</label>
                <input type="text" class="form-control" id="lsnnReinMainChar" placeholder="Firstname_Lastname — Level X" required />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.3 Karakter Utama (Main) &amp; Lulus RP-Quiz? *</label>
                <select class="form-select" id="lsnnReinMainQuiz" required>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.4 Discord, WhatsApp Aktif &amp; TS3 + Mic Jernih? *</label>
                <select class="form-select" id="lsnnReinCommsReady" required>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.5 Bukti Rekam Jejak Faksi Media / Roster / Resign *</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="lsnnReinOocMediaUrl" pattern="^(https?://|/).+" placeholder="https://... or upload" required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinOocMediaUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.6 Tidak Double Faction &amp; Bebas Blacklist? *</label>
                <select class="form-select" id="lsnnReinCleanOoc" required>
                  <option value="Ya, Bersih">Ya, Bersih</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.7 Screenshot /stats (Unedited) *</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="lsnnReinStatsUrl" pattern="^(https?://|/).+" placeholder="https://... or upload" required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinStatsUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.8 Screenshot /mywarns (Unedited, Maks. 5) *</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="lsnnReinWarnsUrl" pattern="^(https?://|/).+" placeholder="https://... or upload" required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinWarnsUrl" hidden />
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">6.9 Screenshot Forum Association UCP *</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="lsnnReinForumAssocUrl" pattern="^(https?://|/).+" placeholder="https://... or upload" required />
                  <label class="btn btn-outline-secondary mb-0" style="cursor:pointer;">
                    <i class="fa fa-upload"></i>
                    <input type="file" accept="image/*" data-lsnn-upload-target="#lsnnReinForumAssocUrl" hidden />
                  </label>
                </div>
              </div>
            </div>

            <div class="alert alert-light border small mb-3">
              <div class="form-check mb-0">
                <input class="form-check-input" type="checkbox" id="lsnnRein14DayAgree" required />
                <label class="form-check-label fw-semibold" for="lsnnRein14DayAgree">
                  Saya menyetujui <strong>14-Day Mandatory Service Commitment</strong>: wajib aktif bertugas minimal 14 hari berturut-turut setelah pelantikan, dan siap menerima sanksi <strong>Dishonorable Discharge</strong> serta pencabutan hak reinstatement permanen apabila mengundurkan diri atau inaktif sebelum 14 hari. *
                </label>
              </div>
            </div>

            ${utils.renderSignatureField({
              idPrefix: 'lsnnReinSig',
              label: '07 Applicant Digital Signature *',
              helpText: 'Gambar tanda tangan di kanvas atau unggah gambar tanda tangan Anda sendiri.'
            })}
          </div>
        </form>
      </div>

      <div class="modal-footer justify-content-between">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary d-none" id="lsnnReinPrevBtn">
            <i class="fa fa-arrow-left"></i> Previous
          </button>
          <button type="button" class="btn btn-primary" id="lsnnReinNextBtn">
            Next <i class="fa fa-arrow-right"></i>
          </button>
          <button type="button" class="btn btn-primary d-none" id="lsnnReinSubmitBtn">
            <i class="fa fa-paper-plane"></i> Submit Dossier
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnReinstatementModal');
    const modalEl = modalCtrl.el;
    const formEl = document.getElementById('lsnnReinstatementForm');
    const draft = utils.createDraftManager(draftKey, formEl);
    const sigField = utils.initSignatureField('lsnnReinSig');

    // Pathway toggle handler (Category A vs Category B)
    function setPathway(pathway) {
      const isRein = pathway !== 'transfer';
      document.getElementById('lsnnReinPathway').value = isRein ? 'reinstatement' : 'transfer';

      modalEl.querySelectorAll('[data-pathway]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pathway === (isRein ? 'reinstatement' : 'transfer'));
      });

      document.getElementById('lsnnReinFieldsCatA').classList.toggle('d-none', !isRein);
      document.getElementById('lsnnReinFieldsCatB').classList.toggle('d-none', isRein);

      document.getElementById('lsnnReinFormerRankDiv').required = isRein;
      document.getElementById('lsnnReinFormerTenure').required = isRein;
      document.getElementById('lsnnReinSepStatus').required = isRein;
      document.getElementById('lsnnReinServiceProofUrl').required = isRein;

      document.getElementById('lsnnReinExtAgency').required = !isRein;
      document.getElementById('lsnnReinExtRankRole').required = !isRein;
      document.getElementById('lsnnReinExtTenure').required = !isRein;
      document.getElementById('lsnnReinTransferAuthUrl').required = !isRein;
      document.getElementById('lsnnReinRosterProofUrl').required = !isRein;
    }

    modalEl.querySelectorAll('[data-pathway]').forEach(btn => {
      btn.addEventListener('click', () => setPathway(btn.dataset.pathway));
    });
    setPathway('reinstatement');

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

      document.getElementById('lsnnReinPrevBtn').classList.toggle('d-none', currentStep === 1);
      document.getElementById('lsnnReinNextBtn').classList.toggle('d-none', currentStep === totalSteps);
      document.getElementById('lsnnReinSubmitBtn').classList.toggle('d-none', currentStep !== totalSteps);

      const bodyEl = document.getElementById('lsnnReinModalBody');
      if (bodyEl) bodyEl.scrollTop = 0;
    }

    document.getElementById('lsnnReinPrevBtn').addEventListener('click', () => goToStep(currentStep - 1));
    document.getElementById('lsnnReinNextBtn').addEventListener('click', () => goToStep(currentStep + 1));

    modalEl.querySelectorAll('[data-step-target]').forEach(pill => {
      pill.addEventListener('click', () => {
        const target = Number(pill.dataset.stepTarget);
        if (target <= currentStep || target === currentStep + 1) {
          goToStep(target);
        }
      });
    });

    // Live preview foto 3:4
    const photoInput = document.getElementById('lsnnReinPhotoUrl');
    const photoPreview = document.getElementById('lsnnReinPhotoPreview');
    photoInput.addEventListener('input', () => {
      const val = photoInput.value.trim();
      photoPreview.src = /^(https?:\/\/|\/)/i.test(val) ? val : config.assets.photoFallback;
    });

    // Live character counter
    ['lsnnReinQ1', 'lsnnReinQ2', 'lsnnReinQ3'].forEach(id => {
      const ta = document.getElementById(id);
      const counter = modalEl.querySelector(`[data-lsnn-charcount="${id}"]`);
      if (!ta || !counter) return;
      const sync = () => { counter.textContent = ta.value.length; };
      ta.addEventListener('input', sync);
      sync();
    });

    // Submit Dossier
    document.getElementById('lsnnReinSubmitBtn').addEventListener('click', async () => {
      if (!validateStep(4)) return;

      const submitBtn = document.getElementById('lsnnReinSubmitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting Dossier...';

      try {
        const signatureUrl = await sigField.getSignatureUrl('sig-reinstatement');
        const pathway = document.getElementById('lsnnReinPathway').value;
        const fullName = document.getElementById('lsnnReinFullName').value.trim();
        const topicPrefix = pathway === 'transfer' ? '[TRANSFER]' : '[REINSTATEMENT]';

        const topicContent = templates.reinstatementApplication({
          pathway,
          photoUrl: photoInput.value.trim(),
          fullName,
          gender: document.getElementById('lsnnReinGender').value,
          pobDob: document.getElementById('lsnnReinPobDob').value.trim(),
          age: document.getElementById('lsnnReinAge').value.trim(),
          citizenship: document.getElementById('lsnnReinCitizenship').value,
          address: document.getElementById('lsnnReinAddress').value.trim(),
          phone: document.getElementById('lsnnReinPhone').value.trim(),
          email: document.getElementById('lsnnReinEmail').value.trim(),
          formerRankDivision: document.getElementById('lsnnReinFormerRankDiv').value.trim(),
          formerTenure: document.getElementById('lsnnReinFormerTenure').value.trim(),
          separationStatus: document.getElementById('lsnnReinSepStatus').value.trim(),
          formerReference: document.getElementById('lsnnReinFormerRef').value.trim() || 'N/A',
          serviceProofUrl: document.getElementById('lsnnReinServiceProofUrl').value.trim(),
          externalAgencyName: document.getElementById('lsnnReinExtAgency').value.trim(),
          externalRankRole: document.getElementById('lsnnReinExtRankRole').value.trim(),
          externalTenure: document.getElementById('lsnnReinExtTenure').value.trim(),
          externalStanding: document.getElementById('lsnnReinExtStanding').value,
          transferAuthUrl: document.getElementById('lsnnReinTransferAuthUrl').value.trim(),
          rosterProofUrl: document.getElementById('lsnnReinRosterProofUrl').value.trim(),
          relocationOrReturnReason: document.getElementById('lsnnReinReturnReason').value.trim(),
          primaryDivision: document.getElementById('lsnnReinPrimaryDiv').value,
          secondaryDivision: document.getElementById('lsnnReinSecondaryDiv').value,
          workingHours: document.getElementById('lsnnReinWorkingHours').value.trim(),
          weeklyAvailability: document.getElementById('lsnnReinWeeklyAvail').value.trim(),
          skills: document.getElementById('lsnnReinSkills').value.trim(),
          portfolioUrl: document.getElementById('lsnnReinPortfolioUrl').value.trim(),
          q1TrackRecord: document.getElementById('lsnnReinQ1').value.trim(),
          q2ImmediateValue: document.getElementById('lsnnReinQ2').value.trim(),
          q3Integrity: document.getElementById('lsnnReinQ3').value.trim(),
          idCardUrl: document.getElementById('lsnnReinIdCardUrl').value.trim(),
          driverLicenseUrl: document.getElementById('lsnnReinDriverUrl').value.trim(),
          criminalRecordUrl: document.getElementById('lsnnReinCrimRecordUrl').value.trim(),
          criminalConviction: document.getElementById('lsnnReinConviction').value.trim(),
          priorDisqualification: document.getElementById('lsnnReinDisqual').value.trim(),
          ucpName: document.getElementById('lsnnReinUcpName').value.trim(),
          mainCharLevel: document.getElementById('lsnnReinMainChar').value.trim(),
          isMainAndQuiz: document.getElementById('lsnnReinMainQuiz').value,
          hasCommsReady: document.getElementById('lsnnReinCommsReady').value,
          oocMediaHistoryUrl: document.getElementById('lsnnReinOocMediaUrl').value.trim(),
          cleanStandingOoc: document.getElementById('lsnnReinCleanOoc').value,
          statsUrl: document.getElementById('lsnnReinStatsUrl').value.trim(),
          mywarnsUrl: document.getElementById('lsnnReinWarnsUrl').value.trim(),
          forumAssocUrl: document.getElementById('lsnnReinForumAssocUrl').value.trim(),
          signatureUrl
        });

        const created = await utils.createTopic({
          cid,
          title: `${topicPrefix} ${fullName}`,
          content: topicContent
        });

        draft.clear();
        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Dossier Reinstatement / Transfer berhasil dikirim ke HRD!');

        if (created?.slug && window.ajaxify) {
          ajaxify.go(`topic/${created.slug}`);
        }
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Dossier';
      }
    });
  }

  // =========================================================================
  // 2. MODAL UI: HRD DOSSIER EVALUATION & RANK PLACEMENT (STAFF ONLY)
  // =========================================================================
  function openReinstatementEvalModal(tid, rawTopicTitle) {
    const isTransfer = /^\[TRANSFER\]/i.test(rawTopicTitle || '');
    const cleanName = (rawTopicTitle || '').replace(/^\[(REINSTATEMENT|TRANSFER)\]\s*/i, '').trim();
    const defaultPathway = isTransfer
      ? 'Category B: External Media Transfer'
      : 'Category A: Internal LSNN Reinstatement';

    const PRESET_REMARKS = {
      'ACCEPTED FOR BRIEFING': 'Your service records and clearances have been verified. Your transfer/reinstatement is approved for the proposed division and rank above. Please use the Book Adaptation Briefing button on this thread to schedule your on-site induction at LSNN Media Centre (12:00 - 21:00 State Time).',
      'UNDER VERIFICATION': 'Your dossier is currently undergoing executive background cross-checking and rank placement assessment by HRD and the Board of Directors. Please stand by for further updates.',
      'PENDING': 'Your dossier requires minor corrections (missing service records, broken links, or incomplete clearances). Please edit your initial post within 24 hours and reply once updated.',
      'DENIED': 'Thank you for submitting your dossier. Unfortunately, your service records or eligibility criteria do not meet our current executive transfer/reinstatement requirements. You may alternatively apply via standard entry recruitment unless barred.',
      'BLACKLISTED': 'Your dossier has been permanently rejected due to forged service credentials, bad faith representation, or OOC dishonesty.'
    };

    const modalHtml = `
<div class="modal fade" id="lsnnReinEvalModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold">HRD Reinstatement / Transfer Evaluation</h5>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="lsnnReinEvalForm">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Applicant Name *</label>
              <input type="text" class="form-control" id="lsnnReinEvalName" value="${escapeHtml(cleanName)}" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Application Pathway *</label>
              <select class="form-select" id="lsnnReinEvalPathway" required>
                <option value="Category A: Internal LSNN Reinstatement" ${!isTransfer ? 'selected' : ''}>Category A: Internal LSNN Reinstatement</option>
                <option value="Category B: External Media Transfer" ${isTransfer ? 'selected' : ''}>Category B: External Media Transfer</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Evaluation Status *</label>
              <select class="form-select" id="lsnnReinEvalStatus" required>
                <option value="ACCEPTED FOR BRIEFING">ACCEPTED FOR BRIEFING</option>
                <option value="UNDER VERIFICATION">UNDER VERIFICATION</option>
                <option value="PENDING">PENDING (24-Hour Revision)</option>
                <option value="DENIED">DENIED</option>
                <option value="BLACKLISTED">BLACKLISTED</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Assigned Division</label>
              <input type="text" class="form-control" id="lsnnReinEvalDivision" placeholder="e.g. Journalism & Field Editorial" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Proposed / Approved Rank</label>
              <input type="text" class="form-control" id="lsnnReinEvalRank" placeholder="e.g. Senior Reporter" />
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold d-flex justify-content-between">
                <span>HRD Remarks &amp; Instructions *</span>
                <button type="button" class="btn btn-sm btn-link p-0 text-decoration-none" id="lsnnFillReinPreset">Use Default Template Text</button>
              </label>
              <textarea class="form-control" id="lsnnReinEvalRemarks" rows="4" required>${escapeHtml(PRESET_REMARKS['ACCEPTED FOR BRIEFING'])}</textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">HRD Officer Name *</label>
              <input type="text" class="form-control" id="lsnnReinEvalStaff" value="${escapeHtml(window.app?.user?.username || '')}" required />
            </div>
          </div>

          ${utils.renderSignatureField({
            idPrefix: 'lsnnReinEvalSig',
            label: 'HRD Digital Signature *',
            helpText: 'Gambar tanda tangan di kanvas atau unggah gambar tanda tangan Anda.'
          })}
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <button type="button" class="btn btn-primary" id="lsnnSubmitReinEvalBtn">
          <i class="fa fa-gavel"></i> Post Official Evaluation
        </button>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnReinEvalModal');
    const sigField = utils.initSignatureField('lsnnReinEvalSig');

    const statusEl = document.getElementById('lsnnReinEvalStatus');
    const remarksEl = document.getElementById('lsnnReinEvalRemarks');

    statusEl.addEventListener('change', () => {
      if (PRESET_REMARKS[statusEl.value]) {
        remarksEl.value = PRESET_REMARKS[statusEl.value];
      }
    });

    document.getElementById('lsnnFillReinPreset').addEventListener('click', () => {
      if (PRESET_REMARKS[statusEl.value]) {
        remarksEl.value = PRESET_REMARKS[statusEl.value];
      }
    });

    document.getElementById('lsnnSubmitReinEvalBtn').addEventListener('click', async () => {
      const form = document.getElementById('lsnnReinEvalForm');
      if (!form.reportValidity()) return;

      const submitBtn = document.getElementById('lsnnSubmitReinEvalBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Posting...';

      try {
        const signatureUrl = await sigField.getSignatureUrl('sig-hrd-rein');
        const content = templates.reinstatementDecision({
          applicantName: document.getElementById('lsnnReinEvalName').value.trim(),
          pathwayLabel: document.getElementById('lsnnReinEvalPathway').value || defaultPathway,
          status: statusEl.value,
          assignedDivision: document.getElementById('lsnnReinEvalDivision').value.trim() || 'Pending Review',
          approvedRank: document.getElementById('lsnnReinEvalRank').value.trim() || 'Pending Executive Determination',
          remarks: remarksEl.value.trim(),
          staffName: document.getElementById('lsnnReinEvalStaff').value.trim(),
          signatureUrl
        });

        await utils.replyTopic({ tid, content });

        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Evaluasi Reinstatement / Transfer berhasil dipublikasikan!');
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-gavel"></i> Post Official Evaluation';
      }
    });
  }

  // =========================================================================
  // 3. MODAL UI: EXECUTIVE ADAPTATION BRIEFING BOOKING (APPLICANT)
  // =========================================================================
  function openBriefingBookingModal(tid, rawTopicTitle) {
    const isTransfer = /^\[TRANSFER\]/i.test(rawTopicTitle || '');
    const candidateName = (rawTopicTitle || '').replace(/^\[(REINSTATEMENT|TRANSFER)\]\s*/i, '').trim();
    const dossierUrl = window.location.href;

    const modalHtml = `
<div class="modal fade" id="lsnnBriefingModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold">Executive Adaptation Briefing Booking</h5>
        <button type="button" class="btn-close" data-lsnn-close aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-light border small mb-3">
          <strong>Briefing Protocol:</strong> Sessions run daily between <strong>12:00 and 21:00 State Time</strong> (excluding 17:00–18:00) and must be requested at least <strong>3 hours prior</strong> to your preferred window. Business formal attire required.
        </div>
        <form id="lsnnBriefingForm">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Candidate Name *</label>
              <input type="text" class="form-control" id="lsnnBriefName" value="${escapeHtml(candidateName)}" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Pathway *</label>
              <select class="form-select" id="lsnnBriefPathway" required>
                <option value="REINSTATEMENT" ${!isTransfer ? 'selected' : ''}>REINSTATEMENT</option>
                <option value="MEDIA TRANSFER" ${isTransfer ? 'selected' : ''}>MEDIA TRANSFER</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Dossier Thread URL *</label>
              <input type="url" class="form-control" id="lsnnBriefThreadUrl" value="${escapeHtml(dossierUrl)}" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Preferred Date *</label>
              <input type="date" class="form-control" id="lsnnBriefDate" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Preferred Time (State Time) *</label>
              <input type="time" class="form-control" id="lsnnBriefTime" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Executive Officer</label>
              <input type="text" class="form-control" id="lsnnBriefOfficer" value="First Available" />
            </div>
            <div class="col-md-5">
              <label class="form-label fw-semibold">Request Type *</label>
              <select class="form-select" id="lsnnBriefType" required>
                <option value="NEW REQUEST">NEW REQUEST</option>
                <option value="RESCHEDULE">RESCHEDULE (Max 1x)</option>
              </select>
            </div>
            <div class="col-md-7">
              <label class="form-label fw-semibold">Reason for Reschedule (Required if Reschedule)</label>
              <input type="text" class="form-control" id="lsnnBriefReason" placeholder="Leave blank or N/A if New Request" />
            </div>
          </div>

          ${utils.renderSignatureField({
            idPrefix: 'lsnnBriefSig',
            label: 'Candidate Digital Signature *',
            helpText: 'Gambar tanda tangan di kanvas atau unggah gambar tanda tangan Anda.'
          })}
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-lsnn-close>Cancel</button>
        <button type="button" class="btn btn-primary" id="lsnnSubmitBriefBtn">
          <i class="fa fa-calendar-check-o"></i> Post Briefing Request
        </button>
      </div>
    </div>
  </div>
</div>`;

    const modalCtrl = utils.openModal(modalHtml, 'lsnnBriefingModal');
    const sigField = utils.initSignatureField('lsnnBriefSig');

    document.getElementById('lsnnSubmitBriefBtn').addEventListener('click', async () => {
      const form = document.getElementById('lsnnBriefingForm');
      if (!form.reportValidity()) return;

      const submitBtn = document.getElementById('lsnnSubmitBriefBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Booking...';

      try {
        const signatureUrl = await sigField.getSignatureUrl('sig-briefing');
        const content = templates.briefingBooking({
          candidateName: document.getElementById('lsnnBriefName').value.trim(),
          pathway: document.getElementById('lsnnBriefPathway').value,
          dossierUrl: document.getElementById('lsnnBriefThreadUrl').value.trim(),
          preferredDate: document.getElementById('lsnnBriefDate').value,
          preferredTime: document.getElementById('lsnnBriefTime').value,
          executiveOfficer: document.getElementById('lsnnBriefOfficer').value.trim() || 'First Available',
          requestType: document.getElementById('lsnnBriefType').value,
          rescheduleReason: document.getElementById('lsnnBriefReason').value.trim() || 'N/A',
          signatureUrl
        });

        await utils.replyTopic({ tid, content });

        modalCtrl.markClean();
        modalCtrl.close();
        notifySuccess('Jadwal Executive Adaptation Briefing berhasil diajukan!');
      } catch (err) {
        notifyError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-calendar-check-o"></i> Post Briefing Request';
      }
    });
  }

  // =========================================================================
  // 4. PAGE INJECTION HOOK
  // =========================================================================
  async function injectReinstatementButtons() {
    if (!window.ajaxify || !ajaxify.data) return;

    const cid = Number(ajaxify.data.cid);
    const tid = Number(ajaxify.data.tid);
    const path = window.location.pathname || '';
    const rawTitle = ajaxify.data.titleRaw || ajaxify.data.title || '';

    const isReinstatementCat = REIN_CIDS.includes(cid);
    const isGuidelinesByTid = GUIDELINES_TID && (
      tid === GUIDELINES_TID ||
      new RegExp(`^/topic/${GUIDELINES_TID}(/|$)`).test(path)
    );
    const isGuidelinesByHeuristic = isReinstatementCat && (
      Boolean(ajaxify.data.pinned) ||
      /guidelines/i.test(rawTitle) ||
      /guidelines/i.test(path)
    );
    const isGuidelinesTopic = Boolean(isGuidelinesByTid || isGuidelinesByHeuristic);

    if (!isReinstatementCat && !isGuidelinesTopic) return;

    const isTopicPage = Boolean(ajaxify.data.template?.topic || /^\/topic\//.test(path));
    const isCategoryPage = Boolean(ajaxify.data.template?.category || /^\/category\//.test(path));

    // 1. Tombol Form Dossier -> Muncul di Category #13 & Topic Guidelines
    if ((isCategoryPage && isReinstatementCat) || isGuidelinesTopic) {
      if (window.app?.user?.uid) {
        utils.injectButtonOnce({
          btnId: 'lsnnOpenReinFormBtn',
          anchorSelectors: '#new_topic, [component="category/post"], [component="topic/reply"], [component="topic/reply/locked"]',
          html: '<i class="fa fa-exchange"></i> Reinstatement / Transfer Form',
          onClick: () => openReinstatementModal(cid || REIN_CIDS[0])
        });
      }
    }

    // 2. Di dalam Topic Dossier Pelamar (Category #13, bukan Topic Guidelines)
    if (isTopicPage && isReinstatementCat && !isGuidelinesTopic && window.app?.user?.uid) {
      // Tombol Booking Adaptation Briefing khusus pemilik thread
      if (Number(ajaxify.data.uid) === Number(app.user.uid)) {
        utils.injectButtonOnce({
          btnId: 'lsnnOpenBriefingBtn',
          anchorSelectors: '[component="topic/reply"]',
          html: '<i class="fa fa-calendar-check-o"></i> Book Adaptation Briefing',
          onClick: () => openBriefingBookingModal(tid, rawTitle)
        });
      }

      // Tombol HRD Evaluation khusus staf grup LSNN
      const isStaff = await utils.checkUserInGroups(REIN_CFG.staffGroupSlugs);
      if (isStaff) {
        utils.injectButtonOnce({
          btnId: 'lsnnOpenReinEvalBtn',
          anchorSelectors: '[component="topic/reply"]',
          html: '<i class="fa fa-gavel"></i> Evaluate Dossier',
          onClick: () => openReinstatementEvalModal(tid, rawTitle)
        });
      }
    }
  }

  $(window).on('action:ajaxify.end', injectReinstatementButtons);
  if (document.readyState !== 'loading') {
    injectReinstatementButtons();
  } else {
    document.addEventListener('DOMContentLoaded', injectReinstatementButtons);
  }
})();
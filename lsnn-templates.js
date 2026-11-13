(function () {
  'use strict';

  window.LSNN = window.LSNN || {};

  const { escapeHtml, formatMultiline, formatDateLosSantos, formatMoney } = LSNN.utils;
  const { assets, recruitment } = LSNN.config;

  // =========================================================================
  // 1. PRIMITIVE DOCUMENT BUILDERS (DATA-DRIVEN)
  // =========================================================================
  function docWrapper(innerHtml) {
    return `<div style="background-color: #ffffff; color: #1e293b; padding: 16px; border: 1px solid #cbd5e1; max-width: 920px; margin: 0 auto; box-sizing: border-box; line-height: 1.6; font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif;">
${innerHtml}
</div>`;
  }

  function header({ titleHtml, divisionName, divisionLogo }) {
    return `<div style="background-color: #f8fafc; border: 1px solid #1c283d; border-bottom: none; padding: 18px 48px;">
<table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin: 0;">
<tbody>
<tr>
<td style="width: 160px; padding: 0; vertical-align: middle; text-align: left; border: none;">
<img src="${assets.logoMain}" alt="LSNN Logo" width="160" height="160" style="width: 160px; height: 160px; object-fit: contain; display: block;" />
</td>
<td style="padding: 0 16px; vertical-align: middle; text-align: center; border: none;">
<div style="font-size: 26px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1c283d; line-height: 1.2;">Los Santos News Network</div>
<div style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #7601ff; line-height: 1.25; margin: 5px 0 4px 0;">${titleHtml}</div>
<div style="font-size: 14.5px; font-weight: 700; color: #475569; line-height: 1.3;">${escapeHtml(divisionName)}</div>
</td>
<td style="width: 160px; padding: 0; vertical-align: middle; text-align: right; border: none;">
<img src="${divisionLogo}" alt="${escapeHtml(divisionName)} Logo" width="160" height="160" style="width: 160px; height: 160px; object-fit: contain; display: block; margin-left: auto; border: none;" />
</td>
</tr>
</tbody>
</table>
</div>
<table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin: 0 0 18px 0; background-color: #1c283d; color: #fefefe; font-size: 13.5px; border: 1px solid #1c283d; border-top: none;">
<tbody>
<tr>
<td style="width: 65%; padding: 8px 14px; text-align: left; border: none; font-weight: 700; letter-spacing: 0.3px;">LSNN Media Centre, Lindsay Circus, Little Seoul</td>
<td style="width: 35%; padding: 8px 14px; text-align: right; border: none;">Hotline: <strong style="color: #cc90fd;">1-2-3</strong></td>
</tr>
</tbody>
</table>`;
  }

  function section(num, title, bodyHtml, { bg = '#ffffff', mb = '18px' } = {}) {
    return `<table style="width: 100%; border-collapse: collapse; margin: 0; border: 1px solid #1c283d;">
<tbody>
<tr>
<td style="width: 46px; background-color: #7601ff; color: #fefefe; font-size: 15px; font-weight: 700; text-align: center; padding: 9px 0; border: none; border-right: 1px solid #1c283d;">${escapeHtml(num)}</td>
<td style="background-color: #1c283d; color: #fefefe; padding: 9px 14px; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; border: none;">${escapeHtml(title)}</td>
</tr>
</tbody>
</table>
<div style="border: 1px solid #cbd5e1; border-top: none; padding: 16px; margin-bottom: ${mb}; background-color: ${bg};">
${bodyHtml}
</div>`;
  }

  function kvTable(rows, { labelWidth = '34%' } = {}) {
    const trs = rows.map((row, idx) => {
      const rowBg = row.bg || (idx % 2 === 0 ? '#ffffff' : '#f8fafc');
      const numPrefix = row.num ? `<span style="color: #7601ff; margin-right: 6px;">${escapeHtml(row.num)}</span>` : '';
      const valHtml = row.rawHtml ? row.value : escapeHtml(row.value);
      const valStyle = row.valueStyle || 'color: #334155;';
      const labelStyle = row.labelStyle || 'font-weight: 700; color: #1c283d;';

      return `<tr style="background-color: ${rowBg};">
<td style="width: ${labelWidth}; padding: 10px 12px; border: 1px solid #cbd5e1; ${labelStyle}">${numPrefix}${escapeHtml(row.label)}</td>
<td style="padding: 10px 12px; border: 1px solid #cbd5e1; ${valStyle}">${valHtml}</td>
</tr>`;
    }).join('\n');

    return `<table style="width: 100%; border-collapse: collapse; margin: 0; font-size: 14.5px;">
<tbody>
${trs}
</tbody>
</table>`;
  }

  function metricCards(cards) {
    const items = cards.map(c => `<div style="flex: 1; min-width: 240px; background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 14px;">
<div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b;">${escapeHtml(c.label)}</div>
<div style="font-size: ${c.fontSize || '18px'}; font-weight: 800; color: ${c.color || '#1c283d'}; margin-top: 2px;">${c.rawHtml ? c.value : escapeHtml(c.value)}</div>
</div>`).join('\n');

    return `<div style="display: flex; gap: 12px; flex-wrap: wrap;">
${items}
</div>`;
  }

  function essayBlocks(items) {
    return items.map((item, idx) => {
      const mb = idx === items.length - 1 ? '0' : '14px';
      return `<div style="margin-bottom: ${mb};">
<div style="font-size: 14.5px; font-weight: 700; color: #1c283d; margin-bottom: 6px;"><span style="color: #7601ff; margin-right: 6px;">${escapeHtml(item.num)}</span> ${escapeHtml(item.question)}</div>
<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 14px; font-size: 14.5px; color: #334155;">
${formatMultiline(item.answer)}
</div>
</div>`;
    }).join('\n');
  }

  function signatureFooter({ declarationHtml, signerName, signerRole, signatureUrl, dateStr }) {
    const declPart = declarationHtml
      ? `<p style="margin: 0 0 16px 0; font-size: 13.5px; color: #475569;">${declarationHtml}</p>\n`
      : '';
    const rolePart = signerRole
      ? `<div style="font-size: 12.5px; color: #64748b; margin-top: 2px;">${escapeHtml(signerRole)}</div>`
      : '';

    return `<div style="border-top: 1px solid #cbd5e1; padding-top: 16px; margin-top: 6px;">
${declPart}<div style="text-align: right;">
<div style="display: inline-block; width: 260px; text-align: center;">
<div style="font-size: 13.5px; color: #475569; margin-bottom: 6px;">Los Santos, ${escapeHtml(dateStr || formatDateLosSantos())}</div>
<img src="${escapeHtml(signatureUrl || assets.sigFallback)}" alt="Signature" width="240" height="80" style="width: 240px; height: 80px; object-fit: contain; display: block; margin: 0 auto 4px auto;" />
<div style="font-size: 14px; font-weight: 700; color: #1c283d; padding-top: 4px; border-top: 1px solid #1c283d;">${escapeHtml(signerName)}</div>
${rolePart}
</div>
</div>
</div>`;
  }

  function linkHtml(url) {
    if (!url || url === 'N/A') return 'N/A';
    const safe = escapeHtml(url);
    return `<a href="${safe}" target="_blank" rel="noopener" style="color: #7601ff; font-weight: 700; text-decoration: underline; word-break: break-all;">${safe}</a>`;
  }

  // =========================================================================
  // 2. DOCUMENT GENERATORS: COMMERCIAL DIVISION
  // =========================================================================
  function bulkads(data) {
    return docWrapper([
      header({
        titleHtml: 'Broadcast Advertisements',
        divisionName: 'Public Relations & Marketing Division',
        divisionLogo: assets.logoPr
      }),
      section('01', 'Client Information', kvTable([
        { label: 'Client / Representative Name', value: data.clientName, valueStyle: 'color: #334155; font-weight: 700;' },
        { label: 'Service Requested', value: `<span style="color: #7601ff; font-weight: 700;">${escapeHtml(data.servicePackage)}</span>`, rawHtml: true },
        { label: 'Contact Phone', value: data.contactPhone, valueStyle: 'color: #334155; font-family: monospace; font-size: 15px; font-weight: 700;' }
      ], { labelWidth: '32%' })),
      section('02', 'Campaign Parameters', metricCards([
        { label: 'Total Quota', value: `${data.totalQuota} Runs`, fontSize: '19px' },
        { label: 'Airtime Interval', value: `${data.airtimeInterval} Minutes`, fontSize: '19px' }
      ])),
      section('03', 'Campaign Advertisement Content',
        `<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 14px; font-size: 14.5px; color: #1e293b; word-break: break-word;">${formatMultiline(data.adContent)}</div>`
      ),
      signatureFooter({
        declarationHtml: 'By signing below, we confirm that the submitted advertisement content complies with LSNN broadcasting regulations and agrees to settle the applicable campaign charges.',
        signerName: data.clientName,
        signatureUrl: data.signatureUrl
      })
    ].join('\n'));
  }

  function billboards(data) {
    const notes = data.additionalNotes && data.additionalNotes.trim() ? data.additionalNotes.trim() : 'N/A';
    return docWrapper([
      header({
        titleHtml: 'Billboard Advertisements',
        divisionName: 'Public Relations & Marketing Division',
        divisionLogo: assets.logoPr
      }),
      section('01', 'Client Information', kvTable([
        { label: 'Client / Representative Name', value: data.clientName, valueStyle: 'color: #334155; font-weight: 700;' },
        { label: 'Service Requested', value: `<span style="color: #7601ff; font-weight: 700;">${escapeHtml(data.servicePackage)}</span>`, rawHtml: true },
        { label: 'Contact Phone', value: data.contactPhone, valueStyle: 'color: #334155; font-family: monospace; font-size: 15px; font-weight: 700;' }
      ], { labelWidth: '32%' })),
      section('02', 'Placement & Duration Parameters', metricCards([
        { label: 'Preferred Location / Spot', value: data.preferredLocation, fontSize: '17px' },
        { label: 'Rental Duration', value: data.rentalDuration, fontSize: '17px' },
        { label: 'Preferred Start Date', value: formatDateLosSantos(data.preferredStartDate), fontSize: '17px' }
      ])),
      section('03', 'Billboard Artwork & Material', kvTable([
        { label: 'Artwork Direct Image URL', value: linkHtml(data.artworkUrl), rawHtml: true },
        { label: 'Additional Notes', value: notes }
      ], { labelWidth: '32%' })),
      signatureFooter({
        declarationHtml: 'By signing below, we confirm that the submitted billboard artwork complies with LSNN advertising standards and state regulations, and agree to settle the applicable rental charges.',
        signerName: data.clientName,
        signatureUrl: data.signatureUrl
      })
    ].join('\n'));
  }

  function billingNotice(data) {
    const qty = Number(data.quantity || 0);
    const rate = Number(data.unitRate || 0);
    const total = qty * rate;
    const unitLabel = data.unitLabel || 'Runs';
    const intervalText = data.intervalText && data.intervalText.trim()
      ? ` &mdash; ${escapeHtml(data.intervalText)}`
      : '';

    const memo = `<div style="border: 1px solid #cbd5e1; padding: 14px 16px; margin-bottom: 18px; background-color: #f8fafc; font-size: 15px; color: #334155; line-height: 1.65;">
Dear <strong>${escapeHtml(data.clientName)}</strong>,<br /><br />
Thank you for submitting your <strong>${escapeHtml(data.serviceCategory)}</strong> request to the <strong>Los Santos News Network (LSNN)</strong>. Your advertisement script and campaign parameters have been reviewed and approved. Please complete the invoice payment below to activate your broadcast schedule.
</div>`;

    return docWrapper([
      header({
        titleHtml: 'Commercial Billing &<br />Payment Notice',
        divisionName: 'Public Relations & Marketing Division',
        divisionLogo: assets.logoPr
      }),
      memo,
      section('01', 'Invoice & Billing Summary', kvTable([
        { label: 'Service Package', value: data.servicePackage },
        { label: 'Total Quota & Interval', value: `${qty} ${escapeHtml(unitLabel)}${intervalText}`, rawHtml: true },
        { label: 'Rate Calculation', value: `${qty} ${escapeHtml(unitLabel)} &times; $${formatMoney(rate)} / unit`, rawHtml: true },
        {
          bg: '#f1f5f9',
          label: 'Total Amount Due',
          labelStyle: 'font-weight: 800; color: #1c283d; text-transform: uppercase;',
          value: `<span style="color: #15803d;">$${formatMoney(total)}</span>`,
          valueStyle: 'font-size: 18px; font-weight: 800;',
          rawHtml: true
        }
      ])),
      section('02', 'Wire Transfer Instructions', kvTable([
        { label: 'Account Number', value: `<span style="color: #7601ff;">${escapeHtml(data.accountNumber)}</span>`, valueStyle: 'font-family: monospace; font-size: 16px; font-weight: 800;', rawHtml: true },
        { label: 'Account Name', value: data.accountName, valueStyle: 'color: #334155; font-weight: 700;' }
      ])),
      section('03', 'Payment Confirmation',
        'Once the transfer has been completed, please reply directly to this thread and attach an <strong>unedited screenshot/image of your transfer receipt</strong> as proof of payment. Your broadcast queue will be activated immediately upon payment verification.',
        { bg: '#f8fafc' }
      ),
      signatureFooter({
        signerName: data.staffName,
        signerRole: 'Public Relations & Marketing Division',
        signatureUrl: data.signatureUrl
      })
    ].join('\n'));
  }

  // =========================================================================
  // 3. DOCUMENT GENERATORS: HUMAN RESOURCES / RECRUITMENT DIVISION
  // =========================================================================
  function recruitmentApplication(data) {
    const photoUrl = data.photoUrl && data.photoUrl.trim() ? data.photoUrl.trim() : assets.photoFallback;
    const guidelinesUrl = `https://portal.lsnn.fun/topic/${recruitment.guidelinesTopicId}/career-opportunities-application-guidelines`;

    const photoBox = `<div style="text-align: center; margin: 0 0 18px 0;">
<div style="width: 150px; height: 200px; border: 1px solid #000000; margin: 0 auto; background-color: #f8fafc; overflow: hidden; box-sizing: border-box;">
<img src="${escapeHtml(photoUrl)}" alt="Applicant Photo" width="150" height="200" style="width: 150px; height: 200px; object-fit: cover; display: block;" />
</div>
</div>`;

    const sec2Banner = `<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; margin-bottom: 14px; font-size: 14px; color: #334155;">
Review the available divisions and departmental roles in our <a href="${escapeHtml(guidelinesUrl)}" target="_blank" style="color: #7601ff; font-weight: 700; text-decoration: underline;">Career Opportunities &amp; Application Guidelines</a> before filling out this section.
</div>`;

    return docWrapper([
      header({
        titleHtml: 'Employment Application Form',
        divisionName: 'Human Resources Development Division',
        divisionLogo: assets.logoHrd
      }),
      photoBox,
      section('01', 'Personal Information', kvTable([
        { num: '1.1', label: 'Full Legal Name', value: data.fullName },
        { num: '1.2', label: 'Gender', value: data.gender },
        { num: '1.3', label: 'Place & Date of Birth', value: data.pobDob },
        { num: '1.4', label: 'Age', value: data.age },
        { num: '1.5', label: 'Citizenship / Work Status', value: data.citizenship },
        { num: '1.6', label: 'Residential Address', value: data.address },
        { num: '1.7', label: 'Phone Number', value: data.phone },
        { num: '1.8', label: 'Email Address', value: data.email }
      ], { labelWidth: '38%' })),
      section('02', 'Division & Role Preference', sec2Banner + kvTable([
        { num: '2.1', label: 'Primary Division & Role', value: data.primaryRole },
        { num: '2.2', label: 'Secondary Division & Role', value: data.secondaryRole || 'N/A' },
        { num: '2.3', label: 'Preferred Working Hours', value: data.workingHours },
        { num: '2.4', label: 'Weekly Availability', value: data.weeklyAvailability }
      ], { labelWidth: '38%' })),
      section('03', 'Education, Experience & Skills', kvTable([
        { num: '3.1', label: 'What is your highest level of education and field of study (major)?', value: data.education },
        { num: '3.2', label: 'Which school or university did you graduate from, and in what year?', value: data.schoolYear },
        { num: '3.3', label: 'What is your most recent employment history (company/agency, role, and duration)?', value: data.employmentHistory || 'N/A' },
        { num: '3.4', label: 'What was your reason for leaving your previous position?', value: data.leavingReason || 'N/A' },
        { num: '3.5', label: 'What relevant technical, editorial, or special skills and licenses do you possess?', value: data.skills },
        { num: '3.6', label: 'Portfolio / Work Samples', value: data.portfolio || 'N/A' }
      ], { labelWidth: '44%' })),
      section('04', 'Assessment & Motivation Questions', essayBlocks([
        { num: '4.1', question: 'What motivated you to apply for a career at the Los Santos News Network?', answer: data.q1Motivation },
        { num: '4.2', question: 'What specific strengths or experience make you a strong fit for your chosen primary division?', answer: data.q2Strengths },
        { num: '4.3', question: 'How do you maintain neutrality and accuracy when covering sensitive or fast-moving public events?', answer: data.q3Neutrality },
        { num: '4.4', question: 'Describe a past situation where you successfully delivered a project under a tight deadline.', answer: data.q4Deadline },
        { num: '4.5', question: 'What fresh ideas or improvements would you like to contribute to LSNN after completing the academy?', answer: data.q5Ideas }
      ])),
      section('05', 'Official Documents & Background Check', kvTable([
        { num: '5.1', label: 'State Identification Card', value: linkHtml(data.idCardUrl), rawHtml: true },
        { num: '5.2', label: "State Driver's License", value: linkHtml(data.driverLicenseUrl), rawHtml: true },
        { num: '5.3', label: 'LSPD Criminal Record Clearance', value: linkHtml(data.criminalRecordUrl), rawHtml: true },
        { num: '5.4', label: 'Have you ever been convicted of any criminal offense?', value: data.criminalConviction },
        { num: '5.5', label: 'Have you ever been dismissed from a public agency?', value: data.agencyDismissal }
      ], { labelWidth: '46%' })),
      section('06', '(( Out of Character (OOC) Information ))', kvTable([
        { num: '6.1', label: 'Nama Akun UCP', value: data.ucpName },
        { num: '6.2', label: 'Nama & Level Karakter Utama', value: data.mainCharLevel },
        { num: '6.3', label: 'Apakah Anda sudah berusia minimal 16 tahun di dunia nyata?', value: data.oocAge16 },
        { num: '6.4', label: 'Apakah karakter ini adalah karakter utama (Main) dan sudah lulus tes RP-Quiz?', value: data.isMainAndQuiz },
        { num: '6.5', label: 'Apakah Anda sudah bergabung di Discord komunitas serta memiliki WhatsApp aktif?', value: data.hasDiscordWa },
        { num: '6.6', label: 'Apakah Anda sudah menginstal TeamSpeak 3 serta memiliki mikrofon yang berfungsi jernih?', value: data.hasTs3Mic },
        { num: '6.7', label: 'Apakah Anda pernah bergabung dengan faksi atau keluarga kriminal/gang sebelumnya?', value: data.pastFaction },
        { num: '6.8', label: 'Apakah Anda sudah melewati cooldown 1 bulan dan tidak sedang double faction?', value: data.passedCooldown },
        { num: '6.9', label: 'Apakah karakter Anda bebas dari status blacklist faksi instansi resmi lain?', value: data.cleanBlacklist },
        { num: '6.10', label: 'Screenshot /stats (Unedited)', value: linkHtml(data.statsUrl), rawHtml: true },
        { num: '6.11', label: 'Screenshot /mywarns (Unedited)', value: linkHtml(data.mywarnsUrl), rawHtml: true },
        { num: '6.12', label: 'Screenshot Forum Association UCP', value: linkHtml(data.forumAssocUrl), rawHtml: true }
      ], { labelWidth: '50%' }), { bg: '#f8fafc' }),
      section('07', 'Applicant Declaration', signatureFooter({
        declarationHtml: 'I confirm that all information, statements, and supporting documents provided in this application are true, accurate, and complete. I understand that any false statement, plagiarism, or omission will result in immediate disqualification or termination from the Los Santos News Network.',
        signerName: data.fullName,
        signatureUrl: data.signatureUrl
      }), { mb: '0' })
    ].join('\n'));
  }

  function hrdDecision(data) {
    const statusColors = {
      'PENDING': '#b45309',
      'ACCEPTED TO INTERVIEW': '#15803d',
      'DENIED': '#b91c1c',
      'BANNED / BLACKLIST': '#7f1d1d'
    };
    const color = statusColors[data.status] || '#1c283d';

    const memo = `<div style="border: 1px solid #cbd5e1; padding: 14px 16px; margin-bottom: 18px; background-color: #f8fafc; font-size: 15px; color: #334155; line-height: 1.65;">
Dear <strong>${escapeHtml(data.applicantName)}</strong>,<br /><br />
Thank you for your interest in joining the <strong>Los Santos News Network (LSNN)</strong>. The Human Resources Development Division has completed the preliminary review of your application. Please find your official evaluation notice below.
</div>`;

    return docWrapper([
      header({
        titleHtml: 'Recruitment Evaluation &<br />Status Notice',
        divisionName: 'Human Resources Development Division',
        divisionLogo: assets.logoHrd
      }),
      memo,
      section('01', 'Application Evaluation Summary', kvTable([
        { label: 'Applicant Name', value: data.applicantName, valueStyle: 'color: #1c283d; font-weight: 700;' },
        {
          label: 'Application Status',
          value: `<span style="color: ${color}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(data.status)}</span>`,
          rawHtml: true
        },
        { label: 'HRD Remarks / Instructions', value: formatMultiline(data.remarks), rawHtml: true }
      ])),
      signatureFooter({
        signerName: data.staffName,
        signerRole: 'Human Resources Development Division',
        signatureUrl: data.signatureUrl
      })
    ].join('\n'));
  }

  function interviewBooking(data) {
    return docWrapper([
      header({
        titleHtml: 'Formal Interview<br />Schedule Booking',
        divisionName: 'Human Resources Development Division',
        divisionLogo: assets.logoHrd
      }),
      section('01', 'Candidate Booking Details', kvTable([
        { label: 'Candidate Name', value: data.candidateName, valueStyle: 'font-weight: 700; color: #1c283d;' },
        { label: 'Request Type', value: data.requestType, valueStyle: 'font-weight: 700; color: #7601ff;' },
        { label: 'Preferred Date & Time', value: `${formatDateLosSantos(data.preferredDate)} | ${escapeHtml(data.preferredTime)} State Time`, rawHtml: true },
        { label: 'Interviewer Code', value: data.interviewerCode || 'First Available' },
        { label: 'Reason for Reschedule', value: data.rescheduleReason || 'N/A' }
      ])),
      signatureFooter({
        declarationHtml: 'I confirm my availability for the selected State Time slot at LSNN Media Centre (Lindsay Circus, Little Seoul) in business formal attire.',
        signerName: data.candidateName,
        signatureUrl: data.signatureUrl
      })
    ].join('\n'));
  }

  LSNN.templates = {
    docWrapper,
    header,
    section,
    kvTable,
    metricCards,
    essayBlocks,
    signatureFooter,
    bulkads,
    billboards,
    billingNotice,
    recruitmentApplication,
    hrdDecision,
    interviewBooking
  };
})();
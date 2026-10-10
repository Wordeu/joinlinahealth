import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

// Standalone partner document. Regenerate the downloadable PDF after changes.
const html = String.raw`<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>Lina | Shape a pharmacy metabolic care programme</title>
  <meta name="description" content="Help shape a metabolic care programme built around your pharmacy’s existing patients, from testing and treatment to ongoing monitoring.">
  <style>
    :root { color-scheme: light; --ink: #161719; --muted: #626772; --line: #e5e7ec; --blue: #13a861; --soft: #f7f8fa; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--soft); color: var(--ink); font: 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-underline-offset: 3px; }
    a:focus-visible { outline: 3px solid var(--blue); outline-offset: 5px; }
    p, h1, h2, h3 { margin: 0; }
    h2 { font-size: 20px; font-weight: 600; letter-spacing: -.4px; line-height: 1.35; }
    h3 { font-size: 14px; font-weight: 600; line-height: 1.4; }
    .toolbar { max-width: 960px; margin: 20px auto 14px; display: flex; justify-content: space-between; align-items: center; padding: 0 4px; color: var(--muted); font-size: 12px; }
    .download { text-decoration: none; border: 1px solid var(--line); background: white; border-radius: 6px; padding: 8px 12px; }
    .download:hover { border-color: #aaa; }
    .paper { max-width: 960px; margin: 0 auto 36px; padding: 32px 44px 22px; background: white; border: 1px solid var(--line); border-radius: 10px; }
    .masthead { display: flex; justify-content: space-between; align-items: center; padding-bottom: 23px; border-bottom: 1px solid var(--line); gap: 22px; }
    .logo { width: 72px; height: auto; display: block; filter: brightness(0); }
    .edition { color: var(--muted); font-size: 12px; text-align: right; }
    .intro { padding: 30px 0; }
    h1 { max-width: 760px; font-size: 44px; font-weight: 600; letter-spacing: -1.7px; line-height: 1.12; text-wrap: balance; }
    .lede { color: #4f545e; font-size: 16px; max-width: 680px; margin-top: 17px; line-height: 1.6; }
    .journey { padding: 22px 0 20px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .journey h2 { font-size: 17px; }
    .flow { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 22px; list-style: none; padding: 0; margin: 25px 0 22px; }
    .flow li { position: relative; }
    .flow li:not(:last-child)::after { content: '→'; position: absolute; right: -18px; top: 11px; color: #969da8; font-size: 17px; }
    .icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--line); background: var(--soft); margin-bottom: 12px; }
    .icon svg { width: 23px; height: 23px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    .flow h3 { font-size: 13px; }
    .flow p { margin-top: 5px; font-size: 12px; line-height: 1.5; color: var(--muted); }
    .outcome .icon { background: #eef3ff; border-color: #dbe5ff; color: #265aca; }
    .outcome h3 { color: #265aca; }
    .ownership { color: var(--muted); font-size: 12px; line-height: 1.6; }
    .ownership strong { font-weight: 500; color: var(--ink); }
    .invitation { margin-top: 26px; padding: 24px; background: #f7f9ff; border: 1px solid #e1e7f5; border-radius: 8px; }
    .invitation > p { color: #4f545e; font-size: 14px; line-height: 1.65; margin-top: 10px; max-width: 720px; }
    .conversation { display: flex; justify-content: space-between; align-items: center; gap: 28px; margin-top: 20px; }
    .benefit { font-size: 13px; line-height: 1.6; color: var(--muted); max-width: 430px; }
    .booking { flex-shrink: 0; text-align: center; }
    .cta { display: inline-block; background: var(--blue); color: white; text-decoration: none; border-radius: 6px; padding: 11px 17px; font-size: 13px; font-weight: 500; }
    .cta:hover { background: #0f8d51; }
    .booking small { display: block; color: var(--muted); font-size: 11px; margin-top: 6px; }
    .team { margin-top: 25px; }
    .team h2 { font-size: 17px; margin-bottom: 14px; }
    .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .profile { border: 1px solid var(--line); border-radius: 8px; background: var(--soft); overflow: hidden; }
    .profile summary { display: flex; align-items: center; justify-content: space-between; gap: 14px; cursor: pointer; list-style: none; padding: 13px 14px; }
    .profile summary::-webkit-details-marker { display: none; }
    .profile summary::after { content: '+'; display: grid; place-items: center; width: 21px; height: 21px; flex: 0 0 21px; border: 1px solid #d9dde5; border-radius: 50%; color: #717783; font-size: 17px; font-weight: 300; line-height: 1; transition: transform .3s ease, background .3s ease; }
    .profile[open] summary::after { transform: rotate(45deg); background: white; }
    .profile summary strong, .profile summary small { display: block; }
    .profile summary strong { font-size: 14px; font-weight: 600; }
    .profile summary small { margin-top: 3px; color: var(--muted); font-size: 11px; }
    .profile-copy { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .35s ease, opacity .25s ease; }
    .profile[open] .profile-copy { grid-template-rows: 1fr; opacity: 1; }
    .profile-copy-inner { overflow: hidden; padding: 0 14px; }
    .profile[open] .profile-copy-inner { padding-bottom: 14px; }
    .profile p { color: var(--muted); font-size: 12px; line-height: 1.65; }
    .footer { display: flex; justify-content: space-between; gap: 18px; margin-top: 25px; padding-top: 13px; border-top: 1px solid var(--line); font-size: 10px; color: var(--muted); }
    .footer a { text-decoration: none; }
    @media screen and (max-width: 700px) {
      .toolbar { margin: 14px 18px; }
      .paper { margin: 0 12px 20px; padding: 24px; }
      .edition { font-size: 11px; }
      h1 { font-size: 34px; letter-spacing: -1.2px; }
      .lede { font-size: 15px; }
      .intro { padding: 25px 0; }
      .flow { grid-template-columns: 1fr; gap: 23px; margin-top: 22px; }
      .flow li { display: grid; grid-template-columns: 44px 1fr; column-gap: 15px; align-items: start; }
      .icon { grid-row: span 2; margin: 0; }
      .flow h3 { font-size: 14px; }
      .flow p { grid-column: 2; font-size: 13px; margin-top: 2px; }
      .flow li:not(:last-child)::after { content: '↓'; left: 16px; right: auto; top: 43px; font-size: 15px; line-height: 23px; }
      .ownership { font-size: 13px; }
      .invitation { padding: 20px; }
      .conversation { display: block; }
      .booking { text-align: left; margin-top: 18px; }
      .team-grid { grid-template-columns: 1fr; gap: 14px; }
      .profile p { font-size: 13px; }
      .footer { flex-wrap: wrap; }
    }
    @page { size: A4; margin: 0; }
    @media print {
      body { background: white; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .toolbar { display: none; }
      .paper { width: 210mm; max-width: none; margin: 0; border: 0; border-radius: 0; padding: 9.5mm 12mm; }
      .masthead { padding-bottom: 18px; }
      .intro { padding: 26px 0; }
      h1 { font-size: 37px; }
      .lede { font-size: 14px; }
      .flow { gap: 19px; }
      .flow h3 { font-size: 12px; }
      .flow p { font-size: 11px; }
      .invitation { padding: 20px; margin-top: 23px; }
      .invitation > p { font-size: 13px; }
      .benefit { font-size: 12px; }
      .cta { font-size: 12px; padding: 10px 13px; }
      .team-grid { gap: 14px; }
      .profile { border: 0; border-radius: 0; background: transparent; }
      .profile summary { padding: 0; margin-bottom: 4px; }
      .profile summary strong { font-size: 12px; }
      .profile summary small { display: none; }
      .profile summary::after { display: none; }
      .profile-copy, .profile:not([open]) .profile-copy { display: block; grid-template-rows: 1fr; opacity: 1; }
      .profile-copy-inner, .profile[open] .profile-copy-inner { padding: 0; }
      .profile p { font-size: 9.5px; line-height: 1.35; }
      .journey, .invitation, .team { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <nav class="toolbar" aria-label="Document tools">
    <span>Pharmacy design partners</span>
    <a class="download" href="/partners/pharmacy/lina-pharmacy-design-partner.pdf" download>Download PDF <span aria-hidden="true">↓</span></a>
  </nav>
  <main class="paper">
    <header class="masthead">
      <img class="logo" src="/partners/pharmacy/lina-logo.png" width="72" alt="Lina">
      <p class="edition">An invitation to shape what we build</p>
    </header>
    <section class="intro" aria-labelledby="title">
      <h1 id="title">A metabolic care programme built around your existing patients.</h1>
      <p class="lede">We’re exploring how your pharmacy could turn its patient list into a profitable care programme under your own brand, with Lina coordinating testing, treatment follow up and ongoing monitoring.</p>
    </section>
    <section class="journey" aria-labelledby="journey">
      <h2 id="journey">How it could work</h2>
      <ol class="flow" aria-label="From your existing patient list to ongoing pharmacy revenue">
        <li>
          <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M21 20v-2a6 6 0 0 0-3-5"/></svg></span>
          <h3>Identify patients</h3><p>Find people at risk in your existing list.</p>
        </li>
        <li>
          <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 3 9 9M11 5 4 12a5 5 0 0 0 7 7l7-7M7 9l8 8M7 13l2 2"/></svg></span>
          <h3>Test</h3><p>At home or in your pharmacy.</p>
        </li>
        <li>
          <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM8 14l3 3 5-6"/></svg></span>
          <h3>Clinician review</h3><p>Understand results and agree a care plan.</p>
        </li>
        <li>
          <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 4-5 5a7 7 0 0 0 10 10l5-5A7 7 0 0 0 9 4ZM7 7l10 10"/></svg></span>
          <h3>Treat</h3><p>Start treatment where appropriate.</p>
        </li>
        <li>
          <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5M9 12h2l1-3 2 6 1-3h2"/></svg></span>
          <h3>Monitor</h3><p>Repeat testing and follow up as needed.</p>
        </li>
        <li class="outcome">
          <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 20h14M9 20V8a4 4 0 0 1 8-1M6 12h9M6 17l-1 3"/></svg></span>
          <h3>Ongoing revenue</h3><p>From patients returning for useful care.</p>
        </li>
      </ol>
      <p class="ownership"><strong>Your brand and clinical oversight, with Lina coordinating delivery.</strong> We would agree lawful use of patient data and contact permissions before inviting anyone.</p>
    </section>
    <section class="invitation" aria-labelledby="invitation">
      <h2 id="invitation">Help us decide whether this is worth building.</h2>
      <p>If you already dispense weight loss medication, we’d like to understand what would make this useful in your pharmacy. As a design partner, your input would shape the programme and a small pilot.</p>
      <div class="conversation">
        <p class="benefit">If we build it, design partners may receive free tests through the pilot. The proposed model is for Lina to be paid when patients enrol.</p>
        <div class="booking"><a class="cta" href="https://cal.com/linahealth/15-min-meeting">Explore the idea with us</a><small>15 minutes to share your perspective</small></div>
      </div>
    </section>
    <section class="team" aria-labelledby="team">
      <h2 id="team">Who you’ll be speaking with</h2>
      <div class="team-grid">
        <details class="profile person">
          <summary><span><strong>Johnny Wordsworth</strong><small>Growth, marketing and healthcare infrastructure</small></span></summary>
          <div class="profile-copy"><div class="profile-copy-inner"><p>Johnny built the growth and marketing function at Clarity, an AI customer experience startup, helping scale it from 4 to 45 people and from $0 to $2m ARR alongside a $12m raise and customers including OpenAI and Booking.com. He founded PromptStacks, grew it to 21,000 users and exited to Semrush. More recently, he founded Lina with a Johns Hopkins assistant professor, reaching more than 1,000 patients before moving into healthcare infrastructure.</p></div></div>
        </details>
        <details class="profile person">
          <summary><span><strong>Emilian</strong><small>Diagnostics, clinics and health software</small></span></summary>
          <div class="profile-copy"><div class="profile-copy-inner"><p>Emilian spent 7 years building Ilara Health after roles at Rocket Internet Asia, Jumia Africa, a Naspers backed startup and a growth stage tech fund. Ilara raised $12m and brought diagnostics to more than 1,000 clinics and pharmacies across Kenya. He has since built longevity clinics in Cape Town and Bucharest, as well as Expand Health AI, the software they run on, now used by paying clinics.</p></div></div>
        </details>
      </div>
    </section>
    <footer class="footer"><a href="https://findlina.com">findlina.com</a><a href="https://cal.com/linahealth/15-min-meeting">cal.com/linahealth/15-min-meeting</a></footer>
  </main>
</body>
</html>`;

export function GET() {
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

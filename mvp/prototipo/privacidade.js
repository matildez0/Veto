'use strict';

const privacyContent = document.getElementById('privacy-content');
const privacyPortuguese = privacyContent.innerHTML;
const privacyEnglish = `
    <h1 id="privacy-title">Privacy policy</h1>
    <p class="data" id="privacy-date">Last updated: 20 October 2026</p>

    <div class="resumo">
      <p>In short</p>
      <ul>
        <li>Emails downloaded by the app are analysed on your device. Veto does not receive or store your emails or exposure map on its servers.</li>
        <li>From Gmail we only read the sender, subject, date and unsubscribe link. Never the body or attachments.</li>
        <li>Each Gmail authorisation is requested only when needed and cancelled as soon as that action ends.</li>
        <li>Veto only sends requests or moves emails to Trash when you ask it to, after showing you what it will do.</li>
        <li>We only receive anonymous statistics if you accept them, and any feedback you choose to send.</li>
      </ul>
    </div>

    <h2>1. Who we are</h2>
    <p>Veto is a prototype developed by a team of Computer Engineering Master’s students at the University of Minho, as part of an academic project. For any privacy questions, write to <strong><a href="mailto:vetoadmin@gmail.com">vetoadmin@gmail.com</a></strong>.</p>

    <h2>2. What we do with your Gmail account</h2>
    <p>Veto asks Google for a different authorisation for each action, only when you use it, and cancels it as soon as the action ends.</p>
    <p><strong>Analysis (read-only authorisation).</strong> When you click “Connect Gmail and start”, Veto:</p>
    <ul>
      <li>reads the <strong>sender, subject, date and unsubscribe link</strong> (the <code>List-Unsubscribe</code> header) from your last 500 emails, excluding spam, trash, sent mail and drafts;</li>
      <li>counts how many emails you received from each company found and how many you sent to it, through searches that return numbers only;</li>
      <li>reads your account address, so requests can be opened in the correct account when you send them.</li>
    </ul>
    <p>Veto <strong>does not read the body or attachments</strong> of your emails.</p>
    <p><strong>Sending requests to several companies (authorisation to send emails).</strong> If you choose to send the same request to several companies, Veto first shows you everything that will be sent: the account, recipients, subject and text. Only after you accept does Google ask for permission to send emails on your behalf, and Veto sends one request to each company through Gmail. Copies remain in your Sent folder.</p>
    <p><strong>Deleting a company’s emails (authorisation to manage emails).</strong> If you choose to delete a company’s emails, Veto finds messages received from that company and moves them to Gmail’s <strong>Trash</strong>, where they remain for 30 days and can be recovered. It does not permanently delete anything or touch emails you sent. You can also do this manually: Veto opens the Gmail search.</p>
    <p>All of this happens in your browser. Gmail data is not sent to Veto servers or third parties. You can review or remove authorisations at any time at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.</p>

    <h2>3. What is stored on your device</h2>
    <p>So that you do not have to repeat the analysis, Veto stores in your browser (local storage):</p>
    <ul>
      <li>the list of companies found: name, domain, area, number of emails, dates and the service that sends emails on their behalf (for example, Mailchimp);</li>
      <li>the requests you prepare and the status of each one;</li>
      <li>when you moved a company’s emails to Trash, and how many;</li>
      <li>the address of the account analysed.</li>
    </ul>
    <p>Email subjects are not stored. None of this is sent to Veto. You can delete everything in <strong>Map › Delete everything from this device</strong>, or by clearing site data in your browser.</p>

    <h2>4. Requests to companies</h2>
    <p>GDPR requests are prepared in Veto. A request to one company is sent by you from your own email application (Gmail, Outlook or another). A request to several companies is sent by Veto through your Gmail, after you accept what will be sent. In both cases, Veto does not store copies of messages outside your device.</p>
    <p>Privacy contacts come from Veto’s catalogue: addresses and forms published by companies, verified by the team or recorded in the open Datenanfragen.de database (CC0 licence). The app shows the source and date of each contact. If a company is not in the catalogue, confirm its email in its privacy policy; we never guess addresses.</p>

    <h2>5. Anonymous statistics (only if you accept)</h2>
    <p>To learn whether Veto is useful, you can agree to let us count anonymously what you do in the app. If you accept, we send:</p>
    <ul>
      <li>a random identifier for this device, which does not identify you, the channel through which you arrived (for example, LinkedIn), and whether you use a touch screen or computer;</li>
      <li>when you open the app or one of its pages;</li>
      <li>when you run an analysis: how many emails and companies, by area, severity and type, how long it took, and the type of failure if it fails;</li>
      <li>when you prepare, send or record a response to a request: the request type, company area and severity, whether it used email or a form, contact source, time taken and response time;</li>
      <li>when you delete a company’s emails: the company area and number of emails moved to Trash;</li>
      <li>when you cancel a subscription, open a news item, guide or FAQ question, or show interest in Veto+.</li>
    </ul>
    <p><strong>We never</strong> send your email address, company names, subjects or email content.</p>
    <p>If you use the “Was Veto useful to you?” box, we send the rating and comment you write, even if you have not accepted statistics, because you decide to send them. Do not write personal data in the comment.</p>
    <p>These records are kept in a Google spreadsheet accessible only to the team and are deleted at the end of the 2026/27 academic year. You can stop participating at any time at the bottom of the Home page, on the <strong>“Anonymous statistics”</strong> line, by choosing <strong>“Turn off participation”</strong>; nothing else will be sent after that.</p>

    <h2>6. Requesting access to the test</h2>
    <p>While Veto is in testing, Google only allows accounts that the team adds manually to connect. If you use “Request access”, we send the Gmail address you enter to a spreadsheet accessible only to the team, solely to give you access. It is not linked to statistics and is deleted at the end of the 2026/27 academic year, or earlier if you ask us.</p>

    <h2>7. Limited use of Google data</h2>
    <p>Veto’s use and transfer of information received from Google APIs complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
    <p class="nota">Veto's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.</p>
    <p>We do not sell data, use it for advertising or share it with anyone.</p>

    <h2>8. Your rights</h2>
    <p>Gmail data and analysis results remain only on your device and you control them. Regarding the statistics and feedback we receive, you can ask us to access or delete them by writing to the email above. If you believe your rights have not been respected, you can complain to the <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">Portuguese Data Protection Authority</a>.</p>

    <h2>9. Changes</h2>
    <p>If we change how we process data, we will update this page and the date at the top.</p>`;

function renderPrivacyLanguage() {
  const english = state.lang === 'en';
  privacyContent.innerHTML = english ? privacyEnglish : privacyPortuguese;
  document.title = english ? 'Veto: privacy policy' : 'Veto: política de privacidade';
  document.documentElement.lang = english ? 'en' : 'pt-PT';
  document.getElementById('privacy-back-link').textContent = english ? '← Back to the app' : '← Voltar à app';
}

document.addEventListener('veto:languagechange', renderPrivacyLanguage);
renderPrivacyLanguage();

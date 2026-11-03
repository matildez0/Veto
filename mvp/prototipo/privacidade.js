'use strict';

const privacyContent = document.getElementById('privacy-content');
const privacyPortuguese = privacyContent.innerHTML;
const privacyEnglish = `
    <h1 id="privacy-title">Privacy policy</h1>
    <p class="data" id="privacy-date">Last updated: 19 October 2026</p>

    <div class="resumo">
      <p>In short</p>
      <ul>
        <li>Emails downloaded by the app are analysed on your device. Veto does not receive or store your emails or exposure map on its servers.</li>
        <li>From Gmail we only read the sender, subject, date and unsubscribe link. Never the body or attachments.</li>
        <li>Gmail access is cancelled as soon as the analysis ends.</li>
        <li>We only receive anonymous statistics if you accept them, and any feedback you choose to send.</li>
      </ul>
    </div>

    <h2>1. Who we are</h2>
    <p>Veto is a prototype developed by a team of Computer Engineering Master’s students at the University of Minho, as part of an academic project. For any privacy questions, write to <strong><a href="mailto:vetoadmin@gmail.com">vetoadmin@gmail.com</a></strong>.</p>

    <h2>2. What we do with your Gmail account</h2>
    <p>When you click “Connect Gmail and start”, Google asks you for read-only Gmail access. With that authorisation, Veto:</p>
    <ul>
      <li>reads the <strong>sender, subject, date and unsubscribe link</strong> (the <code>List-Unsubscribe</code> header) from your last 500 emails, excluding spam, trash, sent mail and drafts;</li>
      <li>counts how many emails you received from each company found and how many you sent to it, through searches that return numbers only;</li>
      <li>reads your account address, so requests can be opened in the correct account when you send them.</li>
    </ul>
    <p>Veto <strong>never reads the body or attachments</strong> of your emails and <strong>does not send emails</strong> for you. If you choose “Delete this company’s emails in Gmail”, Veto opens a filtered search and you select and manually move the messages to <strong>Trash</strong>. Veto does not have permission to change or delete your mailbox.</p>
    <p>The analysis takes place in your browser. Gmail data is not sent to Veto servers or third parties. Google access is used only during the analysis and is cancelled as soon as it ends. You can also review or remove access at any time at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.</p>

    <h2>3. What is stored on your device</h2>
    <p>So that you do not have to repeat the analysis, Veto stores in your browser (local storage):</p>
    <ul>
      <li>the list of companies found: name, domain, area, number of emails, dates and the service that sends emails on their behalf (for example, Mailchimp);</li>
      <li>the requests you prepare and the status of each one;</li>
      <li>the address of the account analysed.</li>
    </ul>
    <p>Email subjects are not stored. None of this is sent to Veto. You can delete everything in <strong>Map › Delete everything from this device</strong>, or by clearing site data in your browser.</p>

    <h2>4. Requests to companies</h2>
    <p>GDPR requests are prepared in Veto and sent by you, from your own email application (Gmail, Outlook or another). Veto does not send emails or store copies of messages. The companies’ privacy contacts have not all been verified yet: confirm the address before sending.</p>

    <h2>5. Anonymous statistics (only if you accept)</h2>
    <p>To learn whether Veto is useful, you can agree to let us count anonymously what you do in the app. If you accept, we send:</p>
    <ul>
      <li>a random identifier for this device, which does not identify you, and the channel through which you arrived (for example, LinkedIn);</li>
      <li>when you open the app and run an analysis: how many emails and companies, by area and severity;</li>
      <li>when you prepare, send or record a response to a request: the request type and the company’s area;</li>
      <li>when you cancel a subscription, open a news item or guide question, or show interest in Veto+.</li>
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

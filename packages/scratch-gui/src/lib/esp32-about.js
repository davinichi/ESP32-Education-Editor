import {defineMessages} from 'react-intl';

const escape = text => {
    const node = document.createElement('span');
    node.textContent = text;
    return node.innerHTML;
};

export const aboutMessages = defineMessages({
    title: {
        id: 'gui.esp32About.title',
        defaultMessage: 'About ESP32 Education Editor',
        description: 'ESP32 Education Editor About page'
    },
    intro: {
        id: 'gui.esp32About.intro',
        defaultMessage: ' is a web editor for teaching programming and electronics with ESP32.',
        description: 'ESP32 Education Editor About page'
    },
    development: {
        id: 'gui.esp32About.development',
        defaultMessage: 'Development and Copyright',
        description: 'ESP32 Education Editor About page'
    },
    credits: {
        id: 'gui.esp32About.credits',
        defaultMessage: 'The ESP32 extensions, integration code, firmware, documentation, and original ' +
            'brand assets added for ESP32 Education Editor are developed by Toshikazu Shimada ' +
            'under the Davinichi brand.',
        description: 'ESP32 Education Editor About page'
    },
    relationship: {
        id: 'gui.esp32About.relationship',
        defaultMessage: 'Relationship to Scratch Editor',
        description: 'ESP32 Education Editor About page'
    },
    independent: {
        id: 'gui.esp32About.independent',
        defaultMessage: 'This editor is an independent project based on the open-source Scratch Editor ' +
            'published by the Scratch Foundation. It is not an official Scratch Foundation ' +
            'product and does not imply approval, endorsement, or sponsorship by the ' +
            'Foundation.',
        description: 'ESP32 Education Editor About page'
    },
    trademarks: {
        id: 'gui.esp32About.trademarks',
        defaultMessage: 'The Scratch name, logo, Scratch Cat, and other trademarks belong to the Scratch ' +
            'Foundation. This project does not use them as the ESP32 Education Editor product ' +
            'logo or Davinichi branding.',
        description: 'ESP32 Education Editor About page'
    },
    license: {
        id: 'gui.esp32About.license',
        defaultMessage: 'Licenses and Notices',
        description: 'ESP32 Education Editor About page'
    },
    licenseIntro: {
        id: 'gui.esp32About.licenseIntro',
        defaultMessage: 'For the base Scratch Editor license, trademark terms, and information about this ' +
            'project’s additions, see ',
        description: 'ESP32 Education Editor About page'
    },
    licenseEnd: {
        id: 'gui.esp32About.licenseEnd',
        defaultMessage: ' in the public source repository.',
        description: 'ESP32 Education Editor About page'
    },
    links: {
        id: 'gui.esp32About.links',
        defaultMessage: 'Source Code and Related Information',
        description: 'ESP32 Education Editor About page'
    },
    source: {
        id: 'gui.esp32About.source',
        defaultMessage: 'ESP32 Education Editor source code',
        description: 'ESP32 Education Editor About page'
    },
    upstream: {
        id: 'gui.esp32About.upstream',
        defaultMessage: 'Upstream Scratch Editor',
        description: 'ESP32 Education Editor About page'
    }
});

export const createAboutHtml = intl => {
    const separator = intl.locale.startsWith('ja') ? '、' : ', ';
    const finalSeparator = intl.locale.startsWith('ja') ? '、' : ', and ';
    return `<!doctype html>
<html lang="${intl.locale.startsWith('ja') ? 'ja' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(intl.formatMessage(aboutMessages.title))}</title>
  <style>
    :root { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #263238; background: #f5f7fa; }
    body { margin: 0; }
    main { max-width: 880px; margin: 36px auto; padding: 0 20px 48px; }
    .card { background: #fff; border: 1px solid #dbe3ea; border-radius: 16px; padding: 28px;
      box-shadow: 0 4px 18px rgba(0,0,0,.06); }
    .brand { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
    .mark { width: 58px; height: 58px; border-radius: 14px; background: #1f6fb2; display: grid;
      place-items: center; color: #fff; font-weight: 800; font-size: 20px; }
    h1 { margin: 0; font-size: 2rem; color: #164f7f; }
    h2 { margin-top: 28px; font-size: 1.2rem; color: #245f42; }
    p, li { line-height: 1.75; }
    .meta { color: #51606d; margin-top: 4px; }
    .notice { background: #f0f7ff; border-left: 5px solid #1f6fb2; padding: 14px 16px; border-radius: 8px; }
    .footer { margin-top: 28px; font-size: .9rem; color: #66737f; }
    a { color: #1769aa; }
    code { background: #edf1f4; padding: 2px 5px; border-radius: 4px; }
  </style>
</head>
<body>
<main>
  <section class="card">
    <div class="brand">
      <div class="mark">E3</div>
      <div>
        <h1>ESP32 Education Editor</h1>
        <div class="meta">Davinichi / Version 0.4</div>
      </div>
    </div>

    <p><strong>ESP32 Education Editor</strong>${escape(intl.formatMessage(aboutMessages.intro))}</p>

    <h2>${escape(intl.formatMessage(aboutMessages.development))}</h2>
    <p>${escape(intl.formatMessage(aboutMessages.credits))}</p>
    <p><strong>Copyright &copy; 2026 Toshikazu Shimada</strong></p>

    <h2>${escape(intl.formatMessage(aboutMessages.relationship))}</h2>
    <div class="notice">
      <p>${escape(intl.formatMessage(aboutMessages.independent))}</p>
      <p>${escape(intl.formatMessage(aboutMessages.trademarks))}</p>
    </div>

    <h2>${escape(intl.formatMessage(aboutMessages.license))}</h2>
    <p>${escape(intl.formatMessage(aboutMessages.licenseIntro))}<code>LICENSE</code>${separator}
      <code>TRADEMARK</code>${finalSeparator}
      <code>NOTICE.md</code>
      ${escape(intl.formatMessage(aboutMessages.licenseEnd))}</p>

    <h2>${escape(intl.formatMessage(aboutMessages.links))}</h2>
    <ul>
      <li><a href="https://github.com/davinichi/ESP32-Education-Editor" target="_blank" rel="noopener noreferrer">${escape(intl.formatMessage(aboutMessages.source))}</a></li>
      <li><a href="https://github.com/scratchfoundation/scratch-editor" target="_blank" rel="noopener noreferrer">${escape(intl.formatMessage(aboutMessages.upstream))}</a></li>
      <li><a href="https://github.com/davinichi/ESP32-Education-Editor/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">LICENSE</a></li>
      <li><a href="https://github.com/davinichi/ESP32-Education-Editor/blob/main/NOTICE.md" target="_blank" rel="noopener noreferrer">NOTICE</a></li>
      <li><a href="https://github.com/davinichi/ESP32-Education-Editor/blob/main/TRADEMARK" target="_blank" rel="noopener noreferrer">TRADEMARK</a></li>
    </ul>

    <p class="footer">ESP32 Education Editor / Davinichi</p>
  </section>
</main>
</body>
</html>
`;
};

export const openAboutPage = intl => {
    const blob = new Blob([createAboutHtml(intl)], {type: 'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
};

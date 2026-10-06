import {createIntl} from 'react-intl';
import {aboutMessages, createAboutHtml, openAboutPage} from '../../../src/lib/esp32-about';
import ja from '../../../src/lib/esp32-messages/ja.json';

test('About content follows ja -> en -> ja and preserves source links', () => {
    const links = [];
    for (const locale of ['ja', 'en', 'ja']) {
        const intl = createIntl({locale, messages: locale === 'ja' ? ja : {}});
        const html = createAboutHtml(intl);
        const page = new DOMParser().parseFromString(html, 'text/html');
        expect(page.documentElement.lang).toBe(locale);
        expect(page.title).toBe(locale === 'ja' ?
            'ESP32 Education Editor について' : 'About ESP32 Education Editor');
        for (const message of Object.values(aboutMessages)) {
            expect(page.documentElement.textContent).toContain(intl.formatMessage(message));
        }
        links.push(Array.from(page.querySelectorAll('a'), link => link.href));
        expect(page.querySelectorAll('h2')).toHaveLength(4);
        expect(page.querySelectorAll('code')).toHaveLength(3);
        if (locale === 'en') expect(page.body.textContent).not.toMatch(/[\u3040-\u9fff]/);
    }
    expect(links[0]).toEqual(links[1]);
    expect(links[1]).toEqual(links[2]);
    expect(links[0]).toEqual([
        'https://github.com/davinichi/ESP32-Education-Editor',
        'https://github.com/scratchfoundation/scratch-editor',
        'https://github.com/davinichi/ESP32-Education-Editor/blob/main/LICENSE',
        'https://github.com/davinichi/ESP32-Education-Editor/blob/main/NOTICE.md',
        'https://github.com/davinichi/ESP32-Education-Editor/blob/main/TRADEMARK'
    ]);
});

test('About opens an HTML blob and releases its URL', () => {
    jest.useFakeTimers();
    const create = URL.createObjectURL;
    const revoke = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:about');
    URL.revokeObjectURL = jest.fn();
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    try {
        openAboutPage(createIntl({locale: 'en', messages: {}}));
        expect(URL.createObjectURL.mock.calls[0][0].type).toBe('text/html;charset=utf-8');
        expect(open).toHaveBeenCalledWith('blob:about', '_blank', 'noopener,noreferrer');
        jest.advanceTimersByTime(60000);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:about');
    } finally {
        open.mockRestore();
        URL.createObjectURL = create;
        URL.revokeObjectURL = revoke;
        jest.useRealTimers();
    }
});

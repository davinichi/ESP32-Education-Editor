import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server.node';
import {IntlProvider} from 'react-intl';
import reducer, {initLocale, localesInitialState, selectLocale, setLocales} from '../../../src/reducers/locales';
import extensions from '../../../src/lib/libraries/extensions/index.jsx';
import fixture from '../../../../scratch-vm/test/fixtures/esp32-i18n.json';

jest.mock('scratch-l10n/locales/editor-msgs', () => ({
    en: {core: 'English'},
    ja: {core: '日本語'}
}));

test('ESP32 cards follow Scratch locale changes with English defaults and Japanese translations', () => {
    let state = localesInitialState;
    for (const locale of ['ja', 'en', 'ja']) {
        state = reducer(state, selectLocale(locale));
        expect(state.messages.core).toBe(locale === 'ja' ? '日本語' : 'English');
        for (const [id, spec] of Object.entries(fixture.specs)) {
            const card = extensions.find(({extensionId}) => extensionId === id);
            for (const [kind, english] of [['name', spec.name], ['description', spec.card]]) {
                const messageId = `gui.extension.${id}.${kind}`;
                expect(card[kind].props.id).toBe(messageId);
                expect(card[kind].props.defaultMessage).toBe(english);
                const rendered = renderToStaticMarkup(
                    <IntlProvider
                        locale={locale}
                        messages={state.messages}
                    >
                        {card[kind]}
                    </IntlProvider>
                );
                expect(rendered).toContain(locale === 'ja' ? fixture.japanese[messageId] : english);
            }
        }
    }
});

test('Japanese messages include VM labels on initialization and custom locale updates', () => {
    const state = initLocale(localesInitialState, 'ja');
    expect(state.messages).toMatchObject({core: '日本語', ...fixture.japanese});
    const custom = {en: {core: 'custom English'}, ja: {core: 'カスタム'}};
    const updated = reducer(state, setLocales(custom));
    expect(updated.messages).toMatchObject({core: 'カスタム', ...fixture.japanese});
    expect(custom.ja).toEqual({core: 'カスタム'});
    expect(reducer(updated, selectLocale('en')).messages).toEqual(custom.en);
    const onlyEnglish = {en: {core: 'custom English'}};
    expect(reducer(localesInitialState, setLocales(onlyEnglish)).messagesByLocale).toEqual(onlyEnglish);
});

import React from 'react';
import {act, fireEvent, render} from '@testing-library/react';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import VM from '@scratch/scratch-vm';
import MenuBar from '../../../src/components/menu-bar/menu-bar';
import {MenuRefProvider} from '../../../src/contexts/menu-ref-context.jsx';
import {menuInitialState} from '../../../src/reducers/menus';
import {LoadingState} from '../../../src/reducers/project-state';
import {DEFAULT_MODE} from '../../../src/lib/settings/color-mode';
import {PLATFORM} from '../../../src/lib/platform';
import reducer, {localesInitialState, selectLocale} from '../../../src/reducers/locales';
import * as about from '../../../src/lib/esp32-about';

jest.mock('scratch-l10n/locales/editor-msgs', () => ({
    en: {},
    ja: {
        'gui.menuBar.file': 'ファイル',
        'gui.menuBar.new': '新規',
        'gui.menuBar.saveNow': '直ちに保存',
        'gui.menuBar.saveAsCopy': 'コピーを保存',
        'gui.menuBar.downloadToComputer': 'コンピューターに保存する'
    }
}));

test('open File menu and firmware button follow ja -> en -> ja without changing actions', async () => {
    const vm = new VM();
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    const openAbout = jest.spyOn(about, 'openAboutPage').mockImplementation(() => null);
    const confirm = jest.fn(() => false);
    const upload = jest.fn();
    const onIntlError = jest.fn();
    let locales = localesInitialState;
    const content = function (locale) {
        locales = reducer(locales, selectLocale(locale));
        const store = configureStore()({
            locales,
            scratchGui: {
                menus: menuInitialState,
                alerts: {alertsList: []},
                projectTitle: 'Test',
                projectState: {loadingState: LoadingState.NOT_LOADED},
                settings: {colorMode: DEFAULT_MODE},
                timeTravel: {year: 'NOW'},
                platform: {platform: PLATFORM.WEB},
                vm
            }
        });
        return (<IntlProvider
            locale={locale}
            messages={locales.messages}
            onError={onIntlError}
        >
            <Provider store={store}>
                <MenuRefProvider>
                    <MenuBar
                        showESP32About
                        canManageFiles
                        canSave
                        canCreateCopy
                        canRemix={false}
                        projectChanged
                        canCreateNew={false}
                        confirmWithMessage={confirm}
                        onStartSelectingFileUpload={upload}
                    />
                </MenuRefProvider>
            </Provider>
        </IntlProvider>);
    };
    const ui = render(content('ja'));
    try {
        fireEvent.click(ui.getByRole('button', {name: 'ファイルメニュー'}));
        for (const [index, locale] of ['ja', 'en', 'ja'].entries()) {
            ui.rerender(content(locale));
            await act(async () => {
                await new Promise((...args) => window.requestAnimationFrame(args[0]));
            });
            const japanese = locale === 'ja';
            expect(ui.getByRole('button', {name: japanese ?
                'ESP32 Education Editor について' : 'About ESP32 Education Editor'}).title).toBe(japanese ?
                'ESP32 Education Editor について' : 'About ESP32 Education Editor');
            fireEvent.click(ui.getByRole('button', {name: japanese ?
                'ESP32 Education Editor について' : 'About ESP32 Education Editor'}));
            expect(openAbout.mock.calls[index][0].locale).toBe(locale);
            const fileButton = ui.getByRole('button', {name: japanese ? 'ファイルメニュー' : 'File menu'});
            expect(fileButton.textContent).toContain(japanese ? 'ファイル' : 'File');
            expect(fileButton.getAttribute('aria-expanded')).toBe('true');
            const labels = japanese ?
                ['新規', '直ちに保存', 'コピーを保存', 'コンピューターから読み込む', 'コンピューターに保存する'] :
                ['New', 'Save now', 'Save as a copy', 'Load from your computer', 'Save to your computer'];
            for (const label of labels) expect(ui.getByText(label)).toBeTruthy();
            fireEvent.click(ui.getByText(labels[0]));
            expect(confirm).toHaveBeenLastCalledWith(japanese ?
                '現在のプロジェクトの内容を置き換えますか？' : 'Replace contents of the current project?');
            fireEvent.click(fileButton);
            fireEvent.click(ui.getByText(labels[3]));
            expect(upload).toHaveBeenCalledTimes(index + 1);
            fireEvent.click(ui.getByRole('button', {name: japanese ? 'ファームウェア書き込み' : 'Install Firmware'}));
            expect(open).toHaveBeenLastCalledWith(
                `https://davinichi.github.io/firmware/?lang=${locale}`, '_blank', 'noopener,noreferrer');
            fireEvent.click(fileButton);
        }
    } finally {
        open.mockRestore();
        openAbout.mockRestore();
        vm.quit();
    }
});

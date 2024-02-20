import browser from 'webextension-polyfill';

import * as Store from '../common/store.js';
import * as Tab from '../common/tab.js';
import _catch from '../common/catch.js';

import './popup.css';
import { prepareDownload } from '../common/download.js';

/**
 * 
 * @param {HTMLElement} element 
 * @param {boolean} disabled 
 */
const setDisabled = (element, disabled) => {
    if (disabled) {
        element.setAttribute('disabled', '');
    } else {
        element.removeAttribute('disabled');
    }
}

async function downloadAll(media, originURL) {
    const downloads = media.map((media) => {
        return {
            filename: media.download,
            url: media.href
        }
    });

    const preparedDownloads = await prepareDownload(downloads, originURL);

    await browser.runtime.sendMessage({
        'download': preparedDownloads
    });
}

async function updateBody() {
    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    const originURL = tabs[0].url;

    const data = await Store.get(originURL) ?? {};
    const media = data['media'] ?? [];
    
    const downloadAllButton = document.getElementById('download-all-button');

    setDisabled(downloadAllButton, !(media.length > 0));
    downloadAllButton.onclick = _catch(async () => {
        const disabled = downloadAllButton.hasAttribute('disabled');
    
        setDisabled(downloadAllButton, true);
    
        await downloadAll(media, originURL);
    
        setDisabled(downloadAllButton, disabled);
    });

    const donwloadAllButtonDescription = downloadAllButton.getElementsByClassName('description')[0];
    donwloadAllButtonDescription.textContent = `Total ${media.length} ${media.length == 1 ? 'file' : 'files'}`;
}

Store.onChanged.addListener(() => updateBody);
updateBody();

_catch(async () => {
    await Tab.sendMessage(
        {
            active: true,
            currentWindow: true
        },
        {
            'refresh': null
        }
    );
})();

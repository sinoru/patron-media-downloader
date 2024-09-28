import browser from 'webextension-polyfill';

import _catch from '../common/catch.js';
import { fetchCurrentTab } from '../common/browser.js';

import './popup.css';

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
    await browser.runtime.sendMessage({
        'download': {
            'downloads': media,
            originURL
        }
    });
}

async function updateBody(_media, senderURL) {
    const downloadAllButton = document.getElementById('download-all-button');

    const media = _media ?? [];

    setDisabled(downloadAllButton, !(media.length > 0));
    downloadAllButton.onclick = _catch(async () => {
        const disabled = downloadAllButton.hasAttribute('disabled');

        setDisabled(downloadAllButton, true);

        await downloadAll(media, senderURL);

        setDisabled(downloadAllButton, disabled);
    });

    const donwloadAllButtonDescription = downloadAllButton.getElementsByClassName('description')[0];
    donwloadAllButtonDescription.textContent = `Total ${media.length} ${media.length == 1 ? 'file' : 'files'}`;
}

_catch(async () => {
    updateBody();

    const currentTab = await fetchCurrentTab();

    let fetchPort = browser.tabs.connect(currentTab.id, { name: 'fetch' });
    fetchPort.onMessage.addListener((message) => {
        console.log("Received request: ", message);
        updateBody(message.media, currentTab.url);
    });
    fetchPort.onDisconnect.addListener((port) => {
        if (port.error) {
            console.error(port.error);
        }
    });
})();

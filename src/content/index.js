import getFanboxMedia from './fanbox.js';
import getPatreonMedia from './patreon.js';

browser.runtime.onMessage.addListener(async (message, sender) => {
    console.log("Received request: ", message, sender);

    let download = message.download;
    let href = message.href;

    let link = document.createElement("a");
    link.download = download;
    link.href = href;
    link.style = 'display: none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

async function main() {
    const href = document.location.href;

    let media = null;
    if (/.+:\/\/www\.fanbox\.cc\/@.+\/posts\/.+/.test(href) || /.+:\/\/.+\.fanbox\.cc\/posts\/.+/.test(href)) {
        if (!window.domObserver) {
            window.domObserver = new MutationObserver(main);
            domObserver.observe(document, { childList: true, subtree: true });
        }

        media = getFanboxMedia();
    } else if (/.+:\/\/www\.patreon\.com\/posts\/.+/.test(href)) {
        media = getPatreonMedia();
    }

    await browser.runtime.sendMessage({
        'store': {'media': media}
    });
}

main();

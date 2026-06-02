function setBadge(text) { chrome.action.setBadgeText({ text }); }

chrome.runtime.onInstalled.addListener(() =>
{
    setBadge("");

    chrome.storage.local.set({
        lastEvent: null,
        lastDetectedAt: null,
        refreshCount: 0,
        adRefreshes: 0,
        warningRefreshes: 0
    });
});

chrome.runtime.onMessage.addListener((msg) =>
{
    if (msg?.type !== "EVENT_DETECTED")
        return;

    switch (msg.event)
    {
        case "ad":
            setBadge("AD");
            break;

        case "adblock":
            setBadge("FIX");
            break;
    }
});
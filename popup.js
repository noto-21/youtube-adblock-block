function updateUI(data)
{
    const statusBox = document.getElementById("statusBox");
    const details = document.getElementById("details");

    const refreshCount = data.refreshCount || 0;
    const adRefreshes = data.adRefreshes || 0;
    const warningRefreshes = data.warningRefreshes || 0;

    if (!data.lastEvent)
    {
        statusBox.textContent = "Protection active.  No refreshes needed yet.";

        details.innerHTML = `Total refreshes: ${refreshCount}`;
		
        return;
    }

    switch (data.lastEvent)
    {
        case "ad":
            statusBox.textContent =
                "An ad was intercepted and the page was refreshed.";
            break;

        case "adblock":
            statusBox.textContent =
                "An adblock warning was intercepted and the page was refreshed.";
            break;

        default:
            statusBox.textContent = "Protection active.";
            break;
    }

    details.innerHTML = `
        Total refreshes: ${refreshCount}<br>
        Ads bypassed: ${adRefreshes}<br>
        Warnings bypassed: ${warningRefreshes}<br><br>
        Last action:<br>
        ${data.lastDetectedAt || "Never"}
    `;
}

function refresh()
{
    chrome.storage.local.get(
        [
            "lastEvent",
            "lastDetectedAt",
            "refreshCount",
            "adRefreshes",
            "warningRefreshes"
        ],
        updateUI
    );
}

document.getElementById("resetBtn").addEventListener("click", () =>
{
    chrome.storage.local.set({
        lastEvent: null,
        lastDetectedAt: null,
        refreshCount: 0,
        adRefreshes: 0,
        warningRefreshes: 0
    });

    chrome.action.setBadgeText({ text: "" });

    refresh();
});

refresh();

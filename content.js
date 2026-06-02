const ADBLOCK_TEXT = "Ad blockers violate YouTube's Terms of Service";

let anyDetection = false;
let reloadTriggered = false;

const RELOAD_COOLDOWN_MS = 5000;
const RELOAD_KEY = "yt_reload_cooldown_until";

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Check if the actual content is ready (even if paused)
function isContentReady()
{
    const video = document.querySelector("video");
    const player = document.querySelector("#movie_player");

    if (!video || !player)
        return false;
    
    // If the player itself says it's in an ad, content is NOT ready
    if (player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting"))
        return false;

    // If the video has loaded enough data and hasn't ended, it's "ready"
    return video.readyState >= 2 && !video.ended;
}

function isAdShowing()
{
    const player = document.querySelector("#movie_player");
    if (player && (player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting")))
        return true;

    // Check for specific UI elements that only appear during ads
    const hasSkipButton = !!document.querySelector(".ytp-ad-skip-button, .ytp-ad-preview-container");
    const hasAdOverlay = !!document.querySelector(".ytp-ad-player-overlay, .ytd-ad-slot-renderer");

    return hasSkipButton || hasAdOverlay;
}

function hasAdblockWarning()
{
    // Only trigger if the warning text is actually visible on screen
    const text = document.body?.innerText || "";
    if (text.includes(ADBLOCK_TEXT))
    {
        const dialog = document.querySelector("tp-yt-paper-dialog, ytd-enforcement-message-view-model");
        
        return !!(dialog && dialog.offsetHeight > 0);
    }

    return false;
}

function isWatchContext()
{
    // Must actually be on a watch page
    if (location.pathname !== "/watch")
        return false;

    // Must have a real player
    const player = document.querySelector("#movie_player");
    if (!player)
        return false;

    // Must have an actual HTML5 video element
    const video = player.querySelector("video");
    if (!video)
        return false;

    return true;
}

async function triggerReload(type)
{
    // Only allow ad-triggered reloads on actual watch pages with video players
    if (type === "ad" && !isWatchContext())
        return;

    // If content is ready and this is only an ad detection, do nothing
    if (isContentReady() && type === "ad")
        return;

    anyDetection = true;

    if (type === "adblock" || type === "ad")
    {
        const now = Date.now();
        const cooldownUntil = Number(sessionStorage.getItem(RELOAD_KEY) || "0");

        if (now < cooldownUntil)
            return;

        sessionStorage.setItem(
            RELOAD_KEY,
            String(now + RELOAD_COOLDOWN_MS)
        );
    }

    if ((type === "adblock" || type === "ad") && !reloadTriggered)
    {
        reloadTriggered = true;

        const storage = await chrome.storage.local.get([
            "refreshCount",
            "adRefreshes",
            "warningRefreshes"
        ]);

        const refreshCount = storage.refreshCount || 0;
        const adRefreshes = storage.adRefreshes || 0;
        const warningRefreshes = storage.warningRefreshes || 0;

        await chrome.storage.local.set({
            lastEvent: type,
            lastDetectedAt: new Date().toLocaleString(),
            refreshCount: refreshCount + 1,
            adRefreshes: type === "ad"
                ? adRefreshes + 1
                : adRefreshes,
            warningRefreshes: type === "adblock"
                ? warningRefreshes + 1
                : warningRefreshes
        });

        chrome.runtime.sendMessage({
            type: "EVENT_DETECTED",
            event: type
        });

        await sleep(350);

        location.reload();
    }
}

let adStableTimer = null;
let adblockStableTimer = null;

function scheduleAdReload()
{
    if (adStableTimer) return;

    adStableTimer = setTimeout(() => {
        adStableTimer = null;
        if (isWatchContext() && isAdShowing()) triggerReload("ad");
    }, 800);
}

function scheduleAdblockReload()
{
    if (adblockStableTimer) return;

    adblockStableTimer = setTimeout(() => {
        adblockStableTimer = null;
        if (hasAdblockWarning()) triggerReload("adblock");
    }, 500);
}

function startObserver()
{
    const observer = new MutationObserver(() => {
        // If content is ready and no ad is obstructing it, stay quiet
        if (isContentReady() && !isAdShowing() && !hasAdblockWarning())
            return;

        if (hasAdblockWarning())
            scheduleAdblockReload();

        if (isWatchContext() && isAdShowing())
            scheduleAdReload();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
    });
}

startObserver();

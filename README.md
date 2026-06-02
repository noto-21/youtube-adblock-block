<hr>

# youtube-adblock-block

Automatically refreshes YouTube pages when an ad or anti-adblock warning prevents video playback.

## Background

The YouTube corporate empire is locked in an eternal struggle for dominance with the noble army of adblocking rebel forces.

Every now and then, YouTube's adblock team manages to prevent your adblocker from working  on their site, causing ads or anti-adblocker warnings to pop up in place of your video.  If you want to get rid of the visual barf and watch your video, you'll need to manually refresh the page until the video eventually queues up, which can be very tedious and time-consuming.

This extension solves that problem by automatically refreshing the page whenever either an ad or an anti-adblock message pops up in place of your video.  The extension popup shows extension statistics; the service worker runs in the background and the extension automatically fires whenever an ad or adblock message pops up while browsing YouTube.

## Notes

This extension relies on detecting YouTube’s player state through DOM indicators.  As a result, its effectiveness depends on the current structure of YouTube’s interface, which may change without notice.

It performs best under the following conditions:

* A developer edition of either a modern Chromium-based browser or Firefox
* uBlock Origin enabled with standard configuration
* YouTube’s default video player layout (non-embedded, non-lite modes)

The extension does not modify or block ads directly.  Instead, it reacts to observable playback states and triggers a page refresh when an advertisement or anti-adblock interruption is detected.

### Limitations

* Detection is heuristic and may not capture every ad scenario.
* YouTube interface updates may temporarily reduce accuracy until the extension is adjusted.
* In some cases, multiple rapid refreshes may occur if YouTube repeatedly re-inserts ad states during page load.
* Embedded videos or non-standard player environments may not be fully supported.

### Behaviour expectations

The extension is designed to be reactive rather than preventative.  It improves playback continuity by recovering from interrupted states, but it does not guarantee uninterrupted viewing in all cases.

<hr>

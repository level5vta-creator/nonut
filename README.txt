My Journey — local personal tracker

Open index.html in the same browser and at the same address as before to retain
access to your existing saved data. No installation or build is required.

The unlimited counter uses the saved starting timestamp and current device time.
Initial fallback: 2026-10-31T23:55:19+05:30. Existing start times take priority.
The previous storage format is migrated automatically: the exact start timestamp
and all streak history are preserved. Retired goal records and labels are removed.
The old storage entry is removed only after the new entry is successfully saved.
Existing backups can also be imported through Settings.

The counter recalculates every second, on focus, and when returning to the page.
There is no day limit. Settings date inputs use Sri Lanka time (UTC+05:30).
Reset asks for confirmation and saves the previous streak in history.
Reflections and rotation preferences are saved locally. Download a backup before
clearing browser storage. There is no account or cloud synchronization.

24 original motivational lines and four locally saved photographs rotate every
30 seconds. Next advances manually; Pause stops rotation. Reduced-motion mode
disables automatic rotation and crossfades, while Next remains available.
Photographs are local, so the complete website also works offline.
Photo sources (Unsplash image CDN):
Mountains: https://images.unsplash.com/photo-1506905925346-21bda4d32df4
Forest: https://images.unsplash.com/photo-1448375240586-882707db888b
Ocean: https://images.unsplash.com/photo-1475924156734-496f6cac6ec1
Night: https://images.unsplash.com/photo-1462331940025-496dfbfc7564

No screenshot was available in the conversation; design follows the written brief.

REWARDS
Each completed 24-hour period earns a star on its Sri Lanka completion date.
Weekly chests unlock every seven completed days, indefinitely. Milestone chests
unlock at 30, 50, 100, 180, 365, 500 and 1,000 days. Returning after time away
backfills all stars and gifts into the unopened tray, without autoplaying reveals.

Weekly items are drawn on opening from a shuffled 14-item collection. No item
repeats until all 14 have been revealed, even when chests are opened out of order.
A new shuffled cycle then begins. Milestones award exclusive commemorative badges.
Contents are cosmetic and free; there are no purchases, odds, or expiring gifts.

The gallery supports downloadable SVG illustrations and badges, four exclusive
1440x2560 PNG quote wallpapers, Home artwork, equipped badges, and theme colours.
Use Classic theme, Clear featured artwork, or Remove badge to restore defaults.
Stars, unopened gifts, and opened collectibles survive resets. A reset starts a new
journey with its own day awards. Editing a start time never removes rewards and
never re-awards a previously credited journey day. Backups include the collection.
The calendar can be browsed back to see stars from earlier journeys.

Disable animations in Settings for a still experience. System reduced motion is
always respected. Confetti and glow effects are brief, with no looping animations.
Keep the same browser and page location to preserve access to local storage.

Validation: node tests/rewards.test.cjs
Browser checks cover migration, backfill, chest opening, equipping, reload,
reset retention, mobile width, and reduced-motion settings.

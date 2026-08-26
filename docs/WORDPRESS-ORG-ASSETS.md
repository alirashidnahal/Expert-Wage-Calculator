# WordPress.org assets

Directory artwork is recommended but not required for the initial plugin review. Store finished files in `.wordpress-org/`; the deployment workflow moves them to the top-level WordPress.org SVN `assets` directory.

Available icon files:

- `icon-128x128.png`
- `icon-256x256.png`

The editable high-resolution raster master is stored at `docs/artwork/tarifexa-icon-master.png`. The published icon uses a transparent background, contains no text, and is designed to remain recognizable at thumbnail size.

Remaining recommended files:

- `banner-772x250.png`
- `banner-1544x500.png`
- `screenshot-1.png` — quick calculator on a WordPress page
- `screenshot-2.png` — full subject-based calculator
- `screenshot-3.png` — calculation result with panel details

Add a `== Screenshots ==` section to `readme.txt` only when the matching screenshot files exist. Keep filenames lowercase and optimize images before committing.

Suggested visual direction:

- Deep blue `#005a8d`
- Dark blue `#003f64`
- Gold `#f6aa04`
- White background
- Simple calculator or scales motif
- Minimal text so artwork remains readable at small sizes

Do not place these directory assets inside the distributable plugin `assets` directory; WordPress.org directory artwork belongs beside SVN `trunk`, not inside it.

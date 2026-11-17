# Editing the ClearSign website

Run the commands from the review folder, which contains this `website/` directory and its generated `site/` sibling.

```sh
node website/build.mjs
node website/check.mjs
python3 -m http.server 3210 --bind 127.0.0.1 --directory site
```

Edit the service copy and examples in `content/`. The opening, navigation and shared page layouts live in `build.mjs`. The original C lives in `static/assets/js/hero-3d.js`. Its presentation is in `static/assets/css/hero-finish.css`. Shared button sizes and spacing are at the top of `static/assets/css/clarity.css`.

The two pictures in `static/assets/images/` show the actual homepage on the Websites service page. Refresh them when the homepage appearance changes.

Build once after checking out the review, before editing. The builder records the files it generated locally so subsequent builds can safely replace them. It stops if it sees an unfamiliar or hand-edited file in the generated folder. The optional vendor build and its licences are described in [vendor provenance](static/assets/vendor/PROVENANCE.md).

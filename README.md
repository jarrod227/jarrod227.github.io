# Jarrod Yang personal website

A responsive, dependency-free portfolio for Jiayu (Jarrod) Yang. Static HTML,
CSS, and JavaScript are served directly from the repository root by GitHub Pages.

## Update content

Project narratives and shared page markup live in `build.py`. The on-page resume is generated from `resume-content.json`, with the original PDF available for download. Run:

```bash
python build.py
```

Edit `style.css` and `script.js` directly for visual and interaction
changes. They are preserved by the generator. Static assets are in
`assets/`.

## Content provenance

- Profile photo and ColdLab mark: supplied by Jarrod in this conversation.
- Resume PDF: converted from `Jiayu Yang resume v3.docx` (v2 with the HD-EMG lead length, flex construction and fabrication status corrected, 2026-11-19).
- Shared-autonomy project and measured boundaries: the project's public README,
  https://github.com/jarrod227/emg-shared-autonomy-arm (reviewed 2026-11-17).
- EMG band image: the same repository, `docs/images/band_worn.jpg` (Apache-2.0).
- Cursor project: supplied resume, public README, and measured performance at
  https://github.com/jarrod227/capstone_project/blob/main/docs/performance.md.
- Cursor video thumbnail: the project's linked YouTube demo, H4pCKZaqN2I.
- Laika, HD-EMG, and speech decoding contributions: supplied resume v2.
- SVGs are conceptual diagrams, not captured measurements or PCB manufacturing
  drawings. No fabricated test results, real-arm results, or lab endorsements.

Live website: https://jarrod227.github.io

GitHub Pages publishes the `main` branch from the repository root.

## Night studio design

The illustrated room and glasses-wearing anime portrait are based on the author’s supplied photograph. The final studio asset is `assets/night-studio-v2.webp`. Stars are animated inside the window with Canvas, with a pause control and reduced-motion support. Layout and typography overrides live in `night.css`.

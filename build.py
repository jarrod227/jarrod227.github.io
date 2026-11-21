"""Build Jarrod's dependency-free portfolio from reviewed project content."""
from pathlib import Path
from html import escape
import json
import re
from hashlib import sha256
from urllib.parse import urlsplit

ROOT = Path(__file__).parent
DIST = ROOT
ASSET_VERSION = sha256((ROOT / 'night.css').read_bytes() + (ROOT / 'script.js').read_bytes()).hexdigest()[:12]
RESUME_PDF_VERSION = sha256((ROOT / 'assets/jiayu-yang-resume.pdf').read_bytes()).hexdigest()[:12]
ORIGIN = 'https://jarrod227.github.io'
ARROW = ''
GITHUB = 'https://github.com/jarrod227'
LINKEDIN = 'https://www.linkedin.com/in/jiayuyang227/'
EMAIL = 'jarrodyang227@gmail.com'
INSTAGRAM = 'https://www.instagram.com/jarrodyang227/'
XIAOHONGSHU = 'https://www.xiaohongshu.com/user/profile/61d6fb76000000001000f3a0'
SOCIAL_ICONS = json.loads((ROOT / 'assets/social-icons.json').read_text())

projects = [
    {
        'slug': 'shared-autonomy', 'number': '01', 'category': 'BIOSIGNALS × ROBOTICS',
        'title': 'A little muscle. A lot of possibility.',
        'name': 'Biosignal-driven shared autonomy',
        'summary': 'Three muscle-sensing channels turn user intent into commands for a ROS 2 manipulation system, with perception and planning handling the next steps.',
        'tags': ['STM32', 'ROS 2', 'MoveIt 2', 'EMG'],
        'period': 'Jun 2026 — present', 'role': 'Independent project',
        'status': 'Real EMG hardware · simulated arm',
        'repo': GITHUB + '/emg-shared-autonomy-arm',
        'metrics': [('3', 'surface EMG channels'), ('20 Hz', 'embedded decision rate'), ('93.3–95.1%', 'offline cross-donning accuracy')],
        'lead': 'Let the person choose the goal. Let the robot handle the motion.',
        'overview': 'I am building a research prototype that connects a wearable EMG interface to shared-autonomy manipulation. The wearer selects, confirms, or aborts a task; the robot side manages target selection, motion planning, and handoff conditions. The intent interface runs on a real STM32, while arm motion has been verified on a simulated Panda.',
        'contributions': [
            ('Embedded intent decoding', 'Implemented filtering, feature extraction, and fixed-point Q18 LDA on an STM32F103. Three EMG channels feed a 20 Hz decision pipeline that emits NEXT_TARGET, CONFIRM, and ABORT events.'),
            ('A bridge from signals to behavior', 'Built the ROS 2 interface and event gating between noisy physiological signals and the handoff state machine. REST emits no discrete event; stale inputs are gated before the controller acts.'),
            ('Perception and planning', 'Integrated object perception and passive-stereo localization with target selection. The shared controller supports a timer backend for logic checks and a MoveIt backend for the simulated Panda.')
        ],
        'challenge_title': 'Evaluate transfer across electrode applications',
        'challenge': 'A model can look accurate when training and evaluation share the same electrode placement. I evaluated by holding out an entire donning—one electrode application—rather than just a recording session. Across five donnings from one wearer, offline window accuracy was 93.3–95.1%. This tests a useful source of variability, while leaving cross-person and longer-term transfer open.',
        'results': [
            ('Embedded decoding', 'Three channels; fixed-point LDA; 20 Hz decisions on STM32F103.'),
            ('Cross-donning evaluation', '93.3–95.1% offline window accuracy, one wearer and five electrode applications.'),
            ('Ordinary-activity trial', 'Zero discrete-intent false triggers in 10 minutes. The separate proportional view stream had six unintended direction excursions.'),
            ('Perception', 'The ArUco pose baseline stays within about 1 cm of tape-measured distance up to 0.5 m. The markerless stereo path has bounded bench checks, not an absolute-accuracy figure.'),
            ('Motion integration', 'MoveIt backend verified separately on a simulated Panda; synthetic integration also runs with a timer backend.')
        ],
        'limits': 'Physical grasping and handoff on the SO-ARM101 have not been validated. Light contractions remain unreliable, and the reported classification results are from one wearer. The discrete-intent false-trigger result does not establish zero unintended motion in the proportional view stream.',
        'source_label': 'Read the design and evaluation logs',
        'source': GITHUB + '/emg-shared-autonomy-arm#measured-results-and-limits',
    },
    {
        'slug': 'laika-firmware', 'number': '02', 'category': 'EMBEDDED × CONTROL',
        'title': 'Making the control loop count.', 'name': 'Laika quadruped firmware',
        'summary': 'Motor-control firmware for CMU Robotics Club’s quadruped: four CAN buses, a FreeRTOS control loop, and PD torque control tested on a two-joint leg.',
        'tags': ['STM32H7', 'FreeRTOS', 'CAN FD', 'C/C++'],
        'period': 'Oct 2026 — present', 'role': 'Firmware team member · CMU Robotics Club',
        'status': 'Validated on a two-joint test leg',
        'repo': 'https://github.com/CMU-Robotics-Club/quads_firmware',
        'metrics': [('1 kHz', 'PD control loop'), ('4', 'CAN buses'), ('2', 'joints in bench validation')],
        'lead': 'Predictable timing, reliable communication, and a controlled first movement.',
        'overview': 'As a member of CMU Robotics Club’s Laika firmware team, I work on the embedded path between an STM32H723 and ODrive motor controllers. My contribution covers CAN bring-up and integration of the joint torque controller into FreeRTOS, with validation on a two-joint test leg.',
        'contributions': [
            ('Four CAN buses', 'Brought up three on-chip FDCAN peripherals and an SPI-attached MCP2518FD. Configured the clock tree and 1 Mbps bit timing to match the ODrive’s 87.5% sample point.'),
            ('A 1 kHz joint controller', 'Integrated a PD joint torque controller into the FreeRTOS loop, linking joint feedback to motor torque commands.'),
            ('Deliberate bring-up behavior', 'Added bumpless start, an ODrive watchdog feed, and a zero-torque dry-run mode, then checked the integrated controller on a two-joint leg.')
        ],
        'challenge_title': 'Make the first control cycle predictable',
        'challenge': 'A controller needs more than the right gain values. Communication settings, feedback, startup behavior, and watchdog timing all affect the physical result. I treated bring-up as a system task: establish the CAN links, exercise the zero-torque path, and validate the PD loop on the test leg.',
        'results': [('Communication', 'Four buses configured for ODrive communication at 1 Mbps.'), ('Control', '1 kHz PD joint torque controller integrated into FreeRTOS.'), ('Bench validation', 'Two-joint test leg; bumpless start, watchdog feed, and dry-run path.')],
        'limits': 'The validation described here is on a two-joint test leg. It does not establish full-quadruped walking performance. This is a team project; the contributions above describe my firmware work.',
        'source_label': 'Explore the team firmware repository', 'source': 'https://github.com/CMU-Robotics-Club/quads_firmware',
    },
    {
        'slug': 'hd-emg', 'number': '03', 'category': 'NEURAL INTERFACES × HARDWARE',
        'title': 'Closer to the signal.', 'name': '32-channel HD-EMG interface',
        'summary': 'A high-density flex electrode interface for neuromuscular recording research in CMU’s Neuromechatronics Lab.',
        'tags': ['KiCad', 'Flex PCB', 'Python', 'HD-EMG'],
        'period': 'Sep 2026 — present', 'role': 'Graduate researcher · Neuromechatronics Lab',
        'status': 'Boards received · not yet tested', 'repo': None,
        'metrics': [('32', 'electrode channels'), ('8 × 4', 'electrode array'), ('300 mm', 'flex lead')],
        'lead': 'Build the recording interface that the experiment needs.',
        'overview': 'In the Neuromechatronics Lab at Carnegie Mellon University, advised by Douglas Weber, I designed a 32-channel high-density EMG flex PCB with polyimide and FR-4 stiffeners. The design combines an 8 × 4 electrode array at 8 mm pitch, a 300 mm flex lead, and an Omnetics connector.',
        'contributions': [
            ('Electrode interface design', 'Developed the flex PCB in KiCad around the array, flex lead, connector, and channel mapping requirements.'),
            ('Design automation', 'Used Python to automate component and layout generation, making repeated geometry and channel assignments easier to manage.'),
            ('Verification and manufacturing', 'Verified channel connectivity in the design files, worked through the fabricator’s DFM/DFA review, prepared the assembly drawing, and approved the production Gerbers.')
        ],
        'challenge_title': 'Keep geometry and channel identity consistent',
        'challenge': 'For an electrode array, spatial arrangement and electrical mapping must agree. My work combines layout automation with connectivity checks so the design can be reviewed as a recording interface, with a clear mapping from electrode locations to connector channels.',
        'results': [('Array', '32 channels in an 8 × 4 array at 8 mm pitch, with 4.22 mm electrode pads.'), ('Interconnect', '300 mm flex lead at 0.10 mm trace and space, ending in an Omnetics connector.'), ('Design checks', 'Zero DRC and ERC violations in KiCad; fabricator DFM/DFA review completed; 16 units ordered and boards received.')],
        'limits': 'The boards have been received but not yet tested. Fabrication yield, recording quality, and in-use performance are not claimed here. The illustration on this page is a conceptual array diagram, not a manufacturing drawing.',
        'source_label': 'Ask about my research', 'source': '/#contact',
    },
    {
        'slug': 'eog-cursor', 'number': '04', 'category': 'HUMAN–COMPUTER INTERACTION',
        'title': 'A hands-free way in.', 'name': 'Head- and eye-controlled cursor',
        'summary': 'A complete sensing-to-interaction system: head motion moves the cursor; eye movements handle clicks and scrolling.',
        'tags': ['EOG + IMU', 'STM32', 'Kalman filter', 'SVM'],
        'period': 'Sep 2025 — May 2026', 'role': 'Firmware and signal processing · 5-person capstone team',
        'status': 'Real-hardware demonstration', 'repo': GITHUB + '/capstone_project',
        'metrics': [('200 Hz', 'sensor acquisition'), ('87.0%', 'six-class CV accuracy'), ('≈77%', 'mean tested action success')],
        'lead': 'Separate continuous movement from discrete intent.',
        'overview': 'For my Rutgers senior capstone, our five-person team built a hands-free cursor using dual-channel EOG and head-motion sensing. I owned firmware and signal processing, including the analog front end, sensor acquisition, drift correction, and the eye-event classification pipeline. Our mentor was Simiao Niu.',
        'contributions': [
            ('Sensing and acquisition', 'Designed a dual-channel AD8232 analog front end for EOG and implemented STM32 acquisition at approximately 200 Hz, with IMU input and serial streaming to the host.'),
            ('Drift correction', 'Applied Kalman filtering to estimate gyroscope bias. This separates slowly changing sensor offset from intended head motion before the cursor controller accumulates it.'),
            ('Intent and interaction', 'Trained an RBF SVM on six recorded eye states. Combined eye events with head motion for clicking and scrolling, and evaluated action success using real hardware.')
        ],
        'challenge_title': 'Find the bias behind the drifting cursor',
        'challenge': 'The cursor’s state-space dynamics can accumulate a small gyroscope bias into visible drift. The useful fix was to estimate the changing bias with a Kalman filter and correct the motion input. This addressed the sensor-and-controller interaction directly, rather than treating drift as an eye-classification error.',
        'results': [('Classification', '87.0% ± 0.9% five-fold CV accuracy over 2,347 feature windows and six classes.'), ('Interaction', 'Approximately 77% mean success across the tested actions, with 20 attempts per action.'), ('Idle behavior', 'Eight unintended actions in a 10-minute idle trial (approximately 0.8 per minute).'), ('Runtime', 'Continuous hardware sessions of more than 10 minutes without restart.')],
        'limits': 'Window-level cross-validation accuracy is different from end-to-end interaction success. Left/right gaze classes were not included in the evaluated ML dataset; navigation and centering actions requiring those classes were not evaluated in that mode.',
        'source_label': 'Read the measured performance', 'source': GITHUB + '/capstone_project/blob/main/docs/performance.md',
        'video': 'https://www.youtube.com/watch?v=H4pCKZaqN2I',
    },
    {
        'slug': 'brain-to-text', 'number': '05', 'category': 'NEURAL DECODING × MACHINE LEARNING',
        'title': 'From neural activity to language.', 'name': 'Brain-to-text speech decoding',
        'summary': 'An intracortical speech-decoding pipeline and ablation study connecting phoneme modeling to word-level outcomes.',
        'tags': ['PyTorch', 'GRU / CTC', 'Kaldi', 'Neural decoding'],
        'period': 'Apr — May 2026', 'role': 'Deep learning course project · Rutgers University',
        'status': 'Benchmark and ablation study', 'repo': GITHUB + '/brain2text-skipdiphone',
        'metrics': [('5', 'ablation variants'), ('19.75%', 'best variant phoneme error rate'), ('20.48%', 'baseline phoneme error rate')],
        'lead': 'A better intermediate metric needs an end-to-end check.',
        'overview': 'I built a PyTorch pipeline for intracortical speech decoding on the Brain-to-Text ’24 benchmark. A bidirectional GRU encoder feeds a diphone CTC decoder, with skip-diphone and smoothness-loss variants evaluated through a five-variant ablation study and Kaldi WFST decoding.',
        'contributions': [('Sequence modeling', 'Implemented the GRU encoder and diphone CTC pipeline, then explored skip-diphone and smoothness objectives.'), ('Controlled comparisons', 'Ran five ablation variants to examine phoneme-level changes against the baseline.'), ('Word-level diagnosis', 'Compared phoneme and word error rates and found that the phoneme-level gain did not carry over to word error after WFST decoding.')],
        'challenge_title': 'Check whether phoneme gains survive decoding',
        'challenge': 'The best variant reduced phoneme error rate from 20.48% to 19.75%, but this gain did not translate to lower word error. The baseline retained the best reported word error rate, 18.07%, with a 5-gram language model. The result made the decoding interface as important to examine as the neural model itself.',
        'results': [('Phoneme error rate', '19.75% for the best variant, compared with 20.48% for the baseline.'), ('Word error rate', 'The baseline remained best at 18.07% with a 5-gram language model.'), ('Experiment scope', 'Five model/loss variants evaluated in the course-project ablation study.')],
        'limits': 'These are offline benchmark experiments. The lower phoneme error rate is not a claim of improved word-level performance or a live BCI demonstration.',
        'source_label': 'Explore the decoding experiments', 'source': GITHUB + '/brain2text-skipdiphone',
    }
]

def ext(url, label, cls='text-link'):
    outside = not url.startswith(('/', '#'))
    attrs = ' target="_blank" rel="noopener noreferrer"' if outside else ''
    hostname = (urlsplit(url).hostname or '').removeprefix('www.')
    brand = {'github.com': 'github', 'linkedin.com': 'linkedin',
             'instagram.com': 'instagram', 'xiaohongshu.com': 'xiaohongshu'}.get(hostname)
    if label == 'Email' or url.startswith('mailto:'):
        brand = 'email'
    icon = ''
    if brand:
        cls += ' social-link'
        icon = f'<svg class="social-icon social-icon-{brand}" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="{SOCIAL_ICONS[brand]}"/></svg>'
    return f'<a class="{cls}" href="{escape(url, quote=True)}"{attrs}>{icon}<span>{label}</span></a>'

def svg_shell(content, label):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="720" height="430" viewBox="0 0 720 430" role="img" aria-label="{label}">
    <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#36516b" stroke-opacity=".2"/></pattern><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#10253b"/><stop offset="1" stop-color="#0b1424"/></linearGradient></defs>
    <rect width="720" height="430" fill="url(#bg)"/><rect width="720" height="430" fill="url(#grid)"/>
    <g font-family="Arial,sans-serif" fill="#c6d3df">{content}</g></svg>'''

def write_visuals():
    a = DIST / 'assets'
    # These are conceptual diagrams; they do not stand in for measured waveforms or CAD.
    electrodes=''.join(f'<circle cx="{122+x*47}" cy="{130+y*47}" r="11" fill="#b5c9b6" stroke="#dbe9dc" stroke-width="2"/>' for y in range(4) for x in range(8))
    traces=''.join(f'<path d="M{122+x*47} 292V{314+x*3}H568" fill="none" stroke="#4cb8ae" stroke-opacity=".35"/>' for x in range(8))
    board=f'''<text x="40" y="43" font-size="12" letter-spacing="3">ELECTRODE INTERFACE / CONCEPT</text><rect x="86" y="90" width="398" height="230" rx="16" fill="#143e40" stroke="#5aaca2"/>{traces}{electrodes}<path d="M484 165H575V245H484" fill="#66573b" stroke="#b89d60"/><rect x="575" y="150" width="57" height="108" rx="5" fill="#242b35" stroke="#95a4b2"/>'''
    board+=''.join(f'<rect x="586" y="{160+i*9}" width="34" height="3" fill="#a9b9be"/>' for i in range(10))
    board+='<text x="90" y="369" font-size="15">8 × 4 array</text><text x="348" y="369" font-size="15">32 channels</text><text x="540" y="369" font-size="15">Flex PCB</text>'
    (a/'hd-emg.svg').write_text(svg_shell(board,'Conceptual 32-channel electrode interface with an 8 by 4 array and connector'))
    fw='''<text x="40" y="43" font-size="12" letter-spacing="3">MOTOR CONTROL / ARCHITECTURE</text><rect x="270" y="106" width="180" height="142" rx="12" fill="#182f48" stroke="#6ca4cf"/><text x="360" y="150" text-anchor="middle" font-size="24" fill="#eef4fa">STM32H723</text><text x="360" y="180" text-anchor="middle" font-size="14">FreeRTOS · PD control</text><text x="360" y="214" text-anchor="middle" fill="#73e0cc" font-size="26">1 kHz</text>'''
    for i,(x,y) in enumerate([(50,102),(50,224),(527,102),(527,224)]):
        xx = x+143 if x==50 else x
        sx=270 if x==50 else 450
        fw+=f'<path d="M{sx} 177H{(sx+xx)/2}V{y+30}H{xx}" fill="none" stroke="#4fcdb9" stroke-width="2"/><rect x="{x}" y="{y}" width="143" height="60" rx="7" fill="#0d1b2b" stroke="#3a5971"/><text x="{x+71}" y="{y+25}" text-anchor="middle" font-size="14">CAN {i+1}</text><text x="{x+71}" y="{y+45}" text-anchor="middle" font-size="12" fill="#849bad">ODrive</text>'
    fw+='<path d="M360 248V316" stroke="#5b7e9a" stroke-width="2"/><rect x="229" y="316" width="262" height="50" rx="25" fill="#133e3e" stroke="#4b958b"/><text x="360" y="347" font-size="16" text-anchor="middle" fill="#a5e6d9">Two-joint bench validation</text>'
    (a/'laika.svg').write_text(svg_shell(fw,'High-level control architecture: STM32H723 FreeRTOS PD control with four CAN buses to ODrive controllers'))
    cursor='''<text x="40" y="43" font-size="12" letter-spacing="3">EOG + IMU / INTERACTION CONCEPT</text><rect x="292" y="86" width="350" height="236" rx="12" fill="#101d2c" stroke="#567b97"/><rect x="310" y="103" width="314" height="200" rx="5" fill="#16283b"/><path d="M455 164L455 235L475 218L491 249L509 240L493 210H520Z" fill="#73e0cc" stroke="#c4fff5" stroke-width="2"/><path d="M421 191H363" stroke="#70bfb5" stroke-dasharray="5 6"/><circle cx="351" cy="191" r="8" fill="none" stroke="#70bfb5"/><path d="M467 322V350M416 350H518" stroke="#567b97" stroke-width="5"/><text x="69" y="113" font-size="14" fill="#90a6b8">EYE EVENTS</text><path d="M58 150H93L105 119L119 181L134 150H239" fill="none" stroke="#73e0cc" stroke-width="3"/><text x="69" y="223" font-size="14" fill="#90a6b8">HEAD MOTION</text><path d="M58 260C95 260 88 230 122 230S158 288 189 268S211 254 239 254" fill="none" stroke="#7ba7ee" stroke-width="3"/><text x="40" y="391" font-size="14" fill="#91a9bc">Move with your head. Click with your eyes.</text>'''
    (a/'cursor.svg').write_text(svg_shell(cursor,'Conceptual illustration of eye events and head motion controlling a computer cursor; waveforms are illustrative'))
    brain='''<text x="40" y="43" font-size="12" letter-spacing="3">NEURAL DECODING / PIPELINE</text>'''
    for i in range(5):
        y=114+i*35
        brain+=f'<path d="M48 {y}L76 {y}L83 {y-12}L89 {y+14}L98 {y-19}L106 {y+7}L116 {y}H151" fill="none" stroke="#73e0cc" stroke-opacity="{1-i*.12}" stroke-width="2"/>'
    brain+='''<path d="M161 184H210M402 184H457" fill="none" stroke="#648099" stroke-width="2"/><rect x="210" y="115" width="192" height="138" rx="12" fill="#18324b" stroke="#608eaf"/><text x="306" y="171" font-size="25" text-anchor="middle" fill="#eef4fa">GRU + CTC</text><text x="306" y="205" font-size="14" text-anchor="middle">Neural → phoneme</text><rect x="457" y="140" width="215" height="88" rx="9" fill="#123936" stroke="#5abfae"/><text x="564" y="178" font-size="20" text-anchor="middle" fill="#9aebd9">Language decoding</text><text x="564" y="204" font-size="13" text-anchor="middle">WFST + language model</text><text x="48" y="350" font-size="29" fill="#eef4fa">Measure the whole pipeline.</text><text x="48" y="382" font-size="15" fill="#8ca6ba">Phoneme gains do not guarantee word-level gains.</text>'''
    (a/'brain.svg').write_text(svg_shell(brain,'Conceptual pipeline from neural activity through GRU CTC phoneme modeling to language decoding'))

def night_scene():
    return '''<div class="night-backdrop" aria-hidden="true"><div class="night-stage"><canvas id="night-sky" class="night-sky"></canvas><canvas id="code-screen" class="code-screen" width="1280" height="880"></canvas><div class="scope-wiring-art"></div><canvas id="scope-screen" class="scope-screen" width="640" height="440"></canvas><canvas id="pc-fans" class="pc-fans" width="480" height="960"></canvas><div class="desk-pet-rest"></div><div class="desk-pet-head"><canvas id="desk-pet-screen" class="desk-pet-screen" width="600" height="400"></canvas></div><div class="typing-hands"></div></div><div class="night-veil"></div></div>'''

def head(title, description, path='/'):
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#090f1b"><title>{escape(title)}</title><meta name="description" content="{escape(description,quote=True)}"><meta property="og:type" content="website"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:image" content="{ORIGIN}/assets/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta property="og:url" content="{ORIGIN}{path}"><link rel="canonical" href="{ORIGIN}{path}"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/night.css?v={ASSET_VERSION}"><script defer src="/script.js?v={ASSET_VERSION}"></script></head><body class="{'home-page' if path == '/' else 'inner-page'}">{night_scene()}<a href="#main" class="skip-link">Skip to content</a>'''

def header():
    return f'''<header class="site-header"><div class="container nav-wrap"><a href="/" class="brand" aria-label="Jarrod Yang home"><span class="brand-avatar"><img src="/assets/jarrod-yang.webp" alt="" width="44" height="44" decoding="async"></span><span>JARROD YANG</span></a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="navigation"><span></span><span></span></button><nav id="navigation" aria-label="Main navigation"><a href="/#about">About</a><a href="/#work">Work</a><a href="/#research">Research</a><a href="/#contact">Contact</a><a href="/resume.html" class="nav-resume">Resume {ARROW}</a></nav></div></header>'''

def footer():
    return f'''<footer><div class="container footer-inner"><a href="/" class="footer-name">Jiayu (Jarrod) Yang</a><span>Pittsburgh, PA</span><a href="#top">Back to top</a></div></footer><div class="toast" role="status" aria-live="polite"></div></body></html>'''

def tags(p):
    return '<div class="tags">'+''.join(f'<span>{escape(t)}</span>' for t in p['tags'])+'</div>'

def visual(p, extra=''):
    if p['slug']=='shared-autonomy':
        return f'<div class="project-visual emg-photo {extra}"><img src="/assets/emg-band.jpg" alt="The project’s three-channel EMG band worn on a forearm" width="700" height="610" loading="lazy"><span class="visual-caption">THE WEARABLE INTERFACE · REAL HARDWARE</span></div>'
    photos={'laika-firmware':('laika-rig.webp','Two-joint Laika test leg with ODrive motors on the bench rig'),
            'eog-cursor':('eog-worn.webp','Wearing the cursor prototype: head-mounted sensor box and EOG electrodes on the face')}
    if p['slug'] in photos:
        f,alt=photos[p['slug']]
        return f'<div class="project-visual photo-visual {extra}"><img src="/assets/{f}" alt="{escape(alt)}" width="720" height="430" loading="lazy"></div>'
    file={'laika-firmware':'laika.svg','hd-emg':'hd-emg.svg','eog-cursor':'cursor.svg','brain-to-text':'brain.svg'}[p['slug']]
    return f'<div class="project-visual {extra}"><img src="/assets/{file}" alt="{escape(p["name"])} conceptual diagram" width="720" height="430" loading="lazy"></div>'

def card(p, featured=False):
    return f'''<article class="project-card {'featured' if featured else ''}"><a class="visual-link" href="/projects/{p['slug']}.html" aria-label="Explore {escape(p['name'])}">{visual(p)}</a><div class="project-copy"><div class="project-eyebrow"><span>{p['category']}</span><span class="project-arrow" aria-hidden="true">{ARROW}</span></div><h3><a href="/projects/{p['slug']}.html">{p['name']}</a></h3><p>{p['summary']}</p>{tags(p)}<div class="project-bottom"><span>{p['status']}</span><a href="/projects/{p['slug']}.html" class="text-link">Explore project </a></div></div></article>'''

def home():
    desc='Jiayu (Jarrod) Yang is a CMU graduate researcher working across biosignal sensing, embedded systems, and robotics. Explore selected projects and research.'
    html=head('Jiayu (Jarrod) Yang — Biosignal Interfaces & Embedded Systems · CMU',desc)+header()
    html+=f'''<main id="main"><section class="hero container" id="top"><div class="hero-copy"><h1 class="name-heading">Jiayu (Jarrod) Yang</h1><p class="affiliation">Graduate Researcher · Neuromechatronics Lab<br>Carnegie Mellon University</p><p class="hero-description">I develop biosignal interfaces, embedded firmware, and robotic systems.</p><div class="hero-actions"><a href="#work" class="button button-primary">Explore my work </a><a href="/resume.html" class="button button-secondary">Resume {ARROW}</a></div><div class="quick-links" aria-label="Profile links">{ext(GITHUB,'GitHub')}{ext(LINKEDIN,'LinkedIn')}{ext('mailto:'+EMAIL,'Email')}</div></div></section>
    <section id="about" class="container about-section">
      <div class="about-heading"><div><p class="eyebrow">ABOUT</p><h2>About me</h2></div></div>
      <div class="about-profile">
        <img class="about-portrait" src="/assets/jarrod-yang.webp" alt="Jiayu (Jarrod) Yang" width="240" height="300" loading="lazy">
        <div class="about-copy"><p class="large-copy">My background is in electrical and computer engineering. I’m interested in building biosignal interfaces and embedded systems that help people interact with and control robots.</p><p>I earned my B.S. in ECE with a mathematics minor at Rutgers, and I’m now pursuing an M.S. in Biomedical Engineering on the research track at CMU, with graduation expected in May 2028.</p><p>Alongside research, I contribute motor-control firmware to CMU Robotics Club’s Laika quadruped, connecting my interests in embedded systems and robotics.</p><p>Outside the lab, I enjoy cooking, playing soccer, and playing guitar. Japanese curry and katsudon are two of my favorite dishes.</p><div class="about-social-links" aria-label="Social profiles">{ext(LINKEDIN,'LinkedIn')}{ext(INSTAGRAM,'Instagram')}{ext(XIAOHONGSHU,'小红书')}</div></div>
      </div>
    </section>
    <section id="work" class="container work-section"><div class="section-heading"><div><p class="eyebrow">SELECTED WORK</p><h2>Selected projects</h2></div><p>Real signals, real constraints.<br> A few systems I’ve been working on.</p></div><div class="projects-grid">'''
    for i,p in enumerate(projects[:4]): html+=card(p,i==0)
    html+=f'''</div><a class="more-project" href="/projects/brain-to-text.html"><div><span class="eyebrow">ALSO EXPLORING / NEURAL DECODING</span><h3>Brain-to-text speech decoding</h3><p>A PyTorch sequence-modeling pipeline, five ablation variants, and an end-to-end lesson about decoding.</p></div><span class="more-arrow" aria-hidden="true">{ARROW}</span></a></section>
    <section id="research" class="research-section"><div class="container research-layout"><div><p class="eyebrow">CURRENT RESEARCH</p><h2>Neuromuscular recording<br> <span>hardware</span></h2><p class="research-affiliation">Neuromechatronics Lab<br>Carnegie Mellon University</p></div><div class="research-copy"><p class="large-copy">I’m a graduate researcher working on high-density EMG recording hardware, advised by Douglas Weber.</p><p>My current work centers on a 32-channel flex electrode interface: turning experimental needs into a PCB design, automating repeated layout work, checking channel connectivity, and taking the board through fabrication.</p><div class="research-specs"><div><strong>32</strong><span>channels</span></div><div><strong>8 × 4</strong><span>electrode array</span></div><div><strong>300 <small>mm</small></strong><span>flex lead</span></div></div><a href="/projects/hd-emg.html" class="text-link">Inside the research </a></div></div></section>
    <section id="contact" class="contact-section"><div class="container contact-layout"><div><p class="eyebrow">CONTACT</p><h2>Let’s connect.</h2><p>Let’s talk about biosignal interfaces, embedded systems, and robotics.</p></div><div class="contact-links"><div class="email-link"><a class="email-address" href="mailto:{EMAIL}" target="_blank" rel="noopener noreferrer">{EMAIL}</a></div><div class="contact-actions"><button class="copy-email" data-copy-email="{EMAIL}">Copy email</button>{ext("mailto:"+EMAIL,"Send email")}</div><div class="quick-links">{ext(GITHUB,'GitHub')}{ext(LINKEDIN,'LinkedIn')}<a href="/resume.html" class="text-link">Resume {ARROW}</a></div></div></div></section></main>'''
    html+=footer()
    (DIST/'index.html').write_text(html)


def resume_rich_text(text):
    # Link the visible URLs, email addresses, and GitHub owner/repository labels.
    pattern = re.compile(r'https?://[^\s|<>]+|(?:www\.)?(?:github\.com|linkedin\.com)/[^\s|<>]+|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}|(?<=GitHub: )[\w.-]+/[\w.-]+')
    parts = []
    cursor = 0
    for match in pattern.finditer(text):
        parts.append(escape(text[cursor:match.start()]))
        label = match.group().rstrip('.,;')
        if '@' in label and '://' not in label:
            url = 'mailto:' + label
        elif label.startswith(('http://', 'https://')):
            url = label
        elif label.startswith(('github.com/', 'linkedin.com/', 'www.')):
            url = 'https://' + label
        else:
            url = 'https://github.com/' + label
        attrs = ' target="_blank" rel="noopener noreferrer"'
        parts.append(f'<a class="resume-inline-link" href="{escape(url, quote=True)}"{attrs}>{escape(label)}</a>')
        cursor = match.start() + len(label)
    parts.append(escape(text[cursor:]))
    return ''.join(parts)


def resume():
    html=head('Resume — Jiayu (Jarrod) Yang','Read or download Jiayu Yang’s resume: CMU research, embedded systems, robotics, and biosignal projects.','/resume.html')+header()
    html+=f'''<main id="main"><section class="container resume-hero" id="top"><a href="/" class="back-link">Home</a><p class="eyebrow">RESUME</p><div class="resume-title-row"><div><h1>Jiayu (Jarrod) Yang</h1><p>Graduate Researcher · Carnegie Mellon University</p></div><a class="button button-primary" href="/assets/jiayu-yang-resume.pdf?v={RESUME_PDF_VERSION}" download="Jiayu-Yang-Resume.pdf">Download PDF </a></div><div class="resume-contact">{ext('mailto:'+EMAIL,'Email')}{ext(GITHUB,'GitHub')}{ext(LINKEDIN,'LinkedIn')}</div></section><article class="container resume-document" aria-label="Resume content">'''
    sections={'Education','Skills','Research Experience','Projects'}
    titles={
        'Carnegie Mellon University | Pittsburgh, PA, USA',
        'Rutgers University | New Brunswick, NJ, USA',
        'Neuromuscular Recording Hardware',
        'Laika Quadruped Robot: Motor-Control Firmware',
        'Biosignal-Driven Shared-Autonomy Assistive Manipulation',
        'Head- and Eye-Controlled Cursor via Electrooculography (EOG) and IMU',
        'Brain-to-Text Speech Decoding for Brain-Computer Interfaces',
    }
    opened=False
    in_list=False
    for p in json.loads((ROOT/'resume-content.json').read_text())[2:]:
        text=p['text']
        if in_list and not p['bullet']:
            html+='</ul>';in_list=False
        if text in sections:
            if opened:html+='</section>'
            html+=f'<section><h2>{escape(text)}</h2>';opened=True
        elif text in titles:
            html+=f'<h3>{escape(text)}</h3>'
        elif p['bullet']:
            if not in_list:html+='<ul>';in_list=True
            html+=f'<li>{resume_rich_text(text)}</li>'
        else:
            html+=f'<p>{resume_rich_text(text)}</p>'
    if in_list:html+='</ul>'
    if opened:html+='</section>'
    html+='</article></main>'+footer()
    (DIST/'resume.html').write_text(html)

def detail(p,idx):
    path=f'/projects/{p["slug"]}.html'
    html=head(p['name']+' — Jarrod Yang',p['summary'],path)+header()
    html+=f'''<main id="main"><section class="container detail-hero" id="top"><a href="/#work" class="back-link">All work</a><p class="eyebrow">{p['category']}</p><h1>{p['name']}</h1><p class="detail-lead">{p['lead']}</p>{tags(p)}<div class="detail-meta"><div><span>ROLE</span><p>{p['role']}</p></div><div><span>WHEN</span><p>{p['period']}</p></div><div><span>STATUS</span><p>{p['status']}</p></div></div></section><div class="container detail-visual">{visual(p)}</div><section class="container detail-body"><aside class="detail-sidebar"><p class="eyebrow">IN THIS PROJECT</p><a href="#overview">Overview</a><a href="#contribution">My contribution</a><a href="#challenge">Engineering challenge</a><a href="#results">Results & scope</a>'''
    if p['repo']: html+=ext(p['repo'],'View repository','button button-secondary')
    html+='</aside><div class="detail-content">'
    html+=f'<section id="overview"><p class="eyebrow">THE IDEA</p><h2>{p["title"]}</h2><p>{p["overview"]}</p></section><section id="contribution"><p class="eyebrow">MY CONTRIBUTION</p><h2>What I worked on</h2><div class="contribution-list">'
    for i,(title,body) in enumerate(p['contributions']):
        html+=f'<article><span class="contribution-number">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></article>'
    html+=f'</div></section><section id="challenge"><p class="eyebrow">ENGINEERING CHALLENGE</p><h2>{p["challenge_title"]}</h2><p>{p["challenge"]}</p></section><section id="results"><p class="eyebrow">RESULTS & SCOPE</p><h2>What the work shows</h2><div class="result-list">'
    for label,result in p['results']: html+=f'<div><h3>{label}</h3><p>{result}</p></div>'
    html+=f'</div><h3 class="limits-title">Current boundaries</h3><p>{p["limits"]}</p>{ext(p["source"],p["source_label"])}</section>'
    if p.get('video'):
        html+=f'''<section class="video-section"><p class="eyebrow">SEE IT IN ACTION</p><h2>Capstone demonstration</h2><a class="video-preview" href="{p['video']}" target="_blank" rel="noopener noreferrer"><img src="/assets/capstone-demo.jpg" alt="Watch the team’s head- and eye-controlled cursor demonstration on YouTube" width="480" height="360" loading="lazy"><span class="play-button" aria-hidden="true">▶</span></a>{ext(p['video'],'Watch the demo on YouTube')}</section>'''
    nxt=projects[(idx+1)%len(projects)]
    html+=f'</div></section><section class="container next-project"><p class="eyebrow">KEEP EXPLORING</p><a href="/projects/{nxt["slug"]}.html">{nxt["name"]} <span aria-hidden="true">{ARROW}</span></a></section></main>'
    html+=footer()
    (DIST/'projects'/f'{p["slug"]}.html').write_text(html)

if __name__=='__main__':
    (DIST/'projects').mkdir(parents=True,exist_ok=True)
    write_visuals()
    home()
    for i,p in enumerate(projects): detail(p,i)
    resume()
    (DIST/'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {ORIGIN}/sitemap.xml\n')
    urls=['/','/resume.html']+[f'/projects/{p["slug"]}.html' for p in projects]
    (DIST/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{ORIGIN}{p}</loc></url>' for p in urls)+'</urlset>')
    print(f'Built {len(projects)+2} pages.')

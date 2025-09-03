// Structured data extracted / summarized from Internship_Progress_Report.txt
// This central module feeds all pages (summary, assignments, technologies, patterns)

export const summary = {
  period: 'First 3 Months',
  company: 'IMI Games',
  role: 'Software Engineer Intern',
  totalAssignments: 61,
  introduction: `Completed 61 incremental React / Web Engineering assignments spanning state management, real-time features, media processing, ML powered face detection, canvas tooling, mini games, UX patterns and performance‑aware DOM logic.`,
  goalsAchieved: [
    'Progressive mastery of React hooks & component patterns',
    'Hands-on practice with DOM, Canvas, MediaRecorder, Drag & Drop, WebSocket, OCR, Face Detection, pointer events',
    'Implemented key algorithms: shuffle, debounced updates, geometry, collision/matching, grid validation, head pose heuristic, scaling math',
    'Applied CSS 2D/3D transforms, animations, perspective & layering',
    'Used async programming (Promises, fetch, async/await, streaming, event-driven flows)',
    'Consumed REST APIs with axios + token persistence; built reusable auth slice',
    'Designed micro interactive games with time-based state & rAF loops',
    'Managed binary & dynamic resources (models, JSON, media) in structured UI'
  ],
  methodologicalThemes: [
    'Decomposition of UI into state + pure transformations',
    'Safe immutable state updates',
    'Temporal logic (timers, rAF, event sequencing)',
    'Algorithmic correctness & edge-case handling',
    'Performance: refs for mutable data, off-main rendering where possible'
  ],
  coreCompetencies: [
    'React & State Management',
    'Algorithmic / Geometry Reasoning',
    'Browser & Media APIs',
    'Real-Time Systems (WebSocket, rAF)',
    'Data & ML Integration (face-api.js, tesseract.js)',
    'UX & Interaction Design',
    'Robustness & Defensive Coding'
  ],
  challenges: [
    { challenge: 'Real-Time Performance (face detection & animation)', resolution: 'Shifted rapid mutation into refs + rAF scheduling; minimized React re-renders.' },
    { challenge: 'Accurate image cropping', resolution: 'Calculated natural/displayed scale factors for precise pixel mapping.' },
    { challenge: 'Preventing invalid word selections', resolution: 'Implemented forward/reverse prefix validation for early pruning.' },
    { challenge: 'Timed interaction cleanup', resolution: 'Stored interval / timeout handles in refs & cleared in effects.' },
    { challenge: 'Binary data handling (OCR & recording)', resolution: 'Used toBlob / MediaRecorder with object URL lifecycle management.' },
    { challenge: 'Filtering protocol noise in chat', resolution: 'JSON frame type filtering (ping/pong) before UI append.' }
  ],
  nextSteps: [
    'Extend auth slice to protected routes',
    'Add unit tests (shuffle, prefix validation, collision)',
    'Performance profiling & possible worker offloading',
    'Accessibility enhancements (ARIA & keyboard flows)',
    'Persist high scores & puzzle state',
    'Introduce error boundaries for ML features'
  ]
};

// Assignments data (condensed). For grouped ranges not explicitly detailed in the source, a synthesized summary is provided.
export const assignments = [
  {
    id: 1,
    title: 'Toggle Multi-Section Visibility',
    file: 'ASG_1.jsx',
    concepts: ['useState object', 'conditional rendering', 'effect logging'],
    logic: 'Maintain keyed boolean flags; update via shallow merge; hide DOM until active.',
    code: 'setVisible(prev => ({ ...prev, [section]: !prev[section] }));',
    learning: 'Immutable object updates & effect dependency awareness.'
  },
  {
    id: 2,
    title: 'Simple Calculator',
    file: 'ASG_2.jsx',
    concepts: ['form handling', 'validation', 'switch operations'],
    logic: 'Parse floats; guard NaN; switch on operator; protect division by zero.',
    code: 'switch(op){case \'/\': r=b!==0?a/b:\'Cannot divide by zero\';}',
    learning: 'Defensive parsing & controlled inputs.'
  },
  {
    id: 3,
    title: 'Running Total & Average',
    file: 'ASG_3.jsx',
    concepts: ['aggregation', 'Array.reduce'],
    logic: 'Push parsed value; recompute sum & average derived from list length.',
    code: 'const sum = updated.reduce((a,c)=>a+c,0);',
    learning: 'Derived state from canonical list.'
  },
  {
    id: 4,
    title: 'List Add/Delete + Ref Focus',
    file: 'ASG_4.jsx',
    concepts: ['refs', 'list immutability'],
    logic: 'Append numeric entry then refocus input; remove by index filter.',
    code: 'setNumbers(numbers.filter((_,i)=>i!==idx));',
    learning: 'UX improvement via focus management.'
  },
  {
    id: 5,
    title: 'Dynamic Number List Manager',
    file: 'ASG_5.jsx',
    concepts: ['sorting', 'swap', 'reorder'],
    logic: 'Clone then sort; swap adjacent indexes; guard boundaries.',
    code: '[a[i-1],a[i]]=[a[i],a[i-1]];',
    learning: 'Safe in-place style operations through copied array.'
  },
  {
    id: 6,
    title: 'Dynamic Style Builder',
    file: 'ASG_6.jsx',
    concepts: ['reduce to object', 'live styling'],
    logic: 'Accumulate name/value pairs; reduce into an inline style object.',
    code: 'style.reduce((o,it)=>({...o,[it.name]:it.value}),{});',
    learning: 'Transform list to object for direct UI binding.'
  },
  {
    id: 7,
    title: 'Fetch Colors API',
    file: 'ASG_7.jsx',
    concepts: ['axios', 'useEffect one-shot'],
    logic: 'Fetch list on mount; map to list items.',
    code: 'useEffect(()=>{axios.get(url).then(r=>setColor(r.data));},[]);',
    learning: 'Remote data hydration pattern.'
  },
  {
    id: 8,
    title: 'Filtered Search',
    file: 'ASG_8.jsx',
    concepts: ['case-insensitive filter'],
    logic: 'Filter colors where name includes normalized search term.',
    code: 'color.filter(c=>c.name.toLowerCase().includes(q));',
    learning: 'Derived filtered subset without mutating source.'
  },
  {
    id: 9,
    title: 'Pagination Logic',
    file: 'ASG_9.jsx',
    concepts: ['page calc', 'clamping'],
    logic: 'Ceil(total/limit) for pages; clamp prev/next within [1,pages].',
    code: 'Math.ceil(totalItems/responseData.limit);',
    learning: 'Boundary safe navigation.'
  },
  {
    id: 10,
    title: 'Basic Authentication Form',
    file: 'ASG_10.jsx',
    concepts: ['axios POST', 'form submit preventDefault'],
    logic: 'Submit credentials; set success or error; disable invalid.',
    code: 'axios.post(loginUrl,{email,password})',
    learning: 'Promise chain UI feedback.'
  },
  {
    id: 11,
    title: 'JWT Auth + Profile Fetch',
    file: 'ASG_11.jsx',
    concepts: ['token storage', 'authorized GET'],
    logic: 'Store token; use bearer header to fetch profile.',
    code: 'Authorization: `Bearer ${token}`',
    learning: 'Chained API calls with persistence.'
  },
  {
    id: 12,
    title: 'Session vs Persistent Auth',
    file: 'ASG_12.jsx',
    concepts: ['conditional storage'],
    logic: 'Choose localStorage or sessionStorage by user preference.',
    code: 'keep ? localStorage.setItem(...) : sessionStorage.setItem(...)',
    learning: 'Configurable persistence layer.'
  },
  { id: 13, title: 'Auth Composition', file: 'ASG_13.jsx', concepts: ['conditional composition'], logic: 'Render login or profile components based on auth state.', code: '{!logged ? <Login/> : <Profile/>}', learning: 'UI flow gating.' },
  { id: 14, title: 'Profile Update + Modal', file: 'ASG_14.jsx', concepts: ['PUT update', 'SweetAlert2'], logic: 'Submit profile changes then show success modal.', code: 'axios.put(userUrl,{ name, description })', learning: 'Feedback after mutation.' },
  { id: 15, title: 'Enhanced Forms / Validation', file: 'ASG_15.jsx', concepts: ['field validation'], logic: 'Progressive form refinement (inferred).', code: '', learning: 'Incremental form maturity.' },
  { id: 16, title: 'Multi-Phase Interaction', file: 'ASG_16.jsx', concepts: ['state flags'], logic: 'Control flow with started / finished flags (inferred).', code: '', learning: 'Phase-based UI gating.' },
  { id: 17, title: 'Temporal State Prep', file: 'ASG_17.jsx', concepts: ['timers setup'], logic: 'Setup patterns for upcoming timed game (inferred).', code: '', learning: 'Preparation for interval game logic.' },
  {
    id: 18,
    title: 'Color Clicker Game',
    file: 'ASG_18.jsx',
    concepts: ['interval', 'stack logic', 'event scoring'],
    logic: 'Push random colors each second; click must match last; overflow or mismatch ends game.',
    code: 'setInterval(()=>setColors(p=>{...}),1000);',
    learning: 'Temporal evolution & cleanup.'
  },
  { id: 19, title: 'Progressive UX Feature', file: 'ASG_19.jsx', concepts: ['layout'], logic: 'Enhancement iteration (inferred).', code: '', learning: 'Design refinement.' },
  { id: 20, title: 'Progressive UX Feature', file: 'ASG_20.jsx', concepts: ['pattern reuse'], logic: 'Further enhancements (inferred).', code: '', learning: 'Consistency.' },
  { id: 21, title: 'Data Handling Variant', file: 'ASG_21.jsx', concepts: ['data transform'], logic: 'Variant data manipulation (inferred).', code: '', learning: 'Repeatable abstraction.' },
  { id: 22, title: 'Data Handling Variant', file: 'ASG_22.jsx', concepts: ['state derivation'], logic: 'Derived computation pattern (inferred).', code: '', learning: 'Efficiency.' },
  { id: 23, title: 'Data Handling Variant', file: 'ASG_23.jsx', concepts: ['effect chaining'], logic: 'Multi-effect interplay (inferred).', code: '', learning: 'Lifecycle control.' },
  {
    id: 24,
    title: 'Canvas Drawing + OCR',
    file: 'ASG_24.jsx',
    concepts: ['canvas', 'tesseract.js', 'async pipeline'],
    logic: 'Upscale canvas, toBlob, recognize via worker, output text.',
    code: 'const blob=await new Promise(r=> canvas.toBlob(r));',
    learning: 'Media preprocessing for ML.'
  },
  { id: 25, title: 'CSS 3D Transforms Showcase', file: 'ASG_25.jsx', concepts: ['3D transforms', 'perspective'], logic: 'Demonstrate rotate/translate/perspective effects.', code: '<div className="card rotateX"/>', learning: 'Spatial reasoning.' },
  { id: 26, title: 'Advanced Transform Demos', file: 'ASG_26.jsx', concepts: ['animations'], logic: 'Additional transformation patterns (inferred).', code: '', learning: 'Layered animation.' },
  { id: 27, title: 'Transform Interaction', file: 'ASG_27.jsx', concepts: ['user input'], logic: 'Interactive transform controls (inferred).', code: '', learning: 'Direct manipulation.' },
  { id: 28, title: 'Transition Timing Experiments', file: 'ASG_28.jsx', concepts: ['timing'], logic: 'Easing / delay studies (inferred).', code: '', learning: 'Perceived motion quality.' },
  {
    id: 29,
    title: 'Face Detection & Pose Approx',
    file: 'ASG_29.jsx',
    concepts: ['face-api.js', 'landmarks', 'geometry'],
    logic: 'Detect faces; scale landmarks; estimate pose via ratios.',
    code: 'const detections=await faceapi.detectAllFaces(...).withFaceLandmarks();',
    learning: 'ML inference + canvas overlay.'
  },
  { id: 30, title: 'Media/Scroll Prep', file: 'ASG_30.jsx', concepts: ['media setup'], logic: 'Foundation for scroll sync (inferred).', code: '', learning: 'Progressive build.' },
  { id: 31, title: 'Media Interaction Variant', file: 'ASG_31.jsx', concepts: ['sync'], logic: 'Supplement to scroll/time mapping (inferred).', code: '', learning: 'Temporal mapping.' },
  { id: 32, title: 'Drag & Drop Reorder List', file: 'ASG_32.jsx', concepts: ['drag events', 'index math'], logic: 'Determine insert via pointer Y relative midpoint; splice reorder.', code: 'updated.splice(insertIndex,0,dragged);', learning: 'Precise reordering.' },
  { id: 33, title: 'Interactive Control Pattern', file: 'ASG_33.jsx', concepts: ['selection'], logic: 'Refined selection UI (inferred).', code: '', learning: 'Micro interaction.' },
  { id: 34, title: 'Preview Overlay', file: 'ASG_34.jsx', concepts: ['overlay'], logic: 'Layered preview system (inferred).', code: '', learning: 'Z-index strategy.' },
  { id: 35, title: 'Enhanced Control Variant', file: 'ASG_35.jsx', concepts: ['refinement'], logic: 'Optimisation pass (inferred).', code: '', learning: 'Iteration loop.' },
  { id: 36, title: 'Image Fragment Selection', file: 'ASG_36.jsx', concepts: ['canvas crop', 'coordinate scaling'], logic: 'Translate cursor to natural pixels; crop via offscreen canvas.', code: 'ctx.drawImage(img, sx, sy, sw, sh, 0,0,size,size);', learning: 'Precision cropping.' },
  { id: 37, title: 'Interaction Variant', file: 'ASG_37.jsx', concepts: ['timing'], logic: 'Further interaction extension (inferred).', code: '', learning: 'Pattern reinforcement.' },
  { id: 38, title: 'Interaction Variant', file: 'ASG_38.jsx', concepts: ['animation'], logic: 'Extended motion pattern (inferred).', code: '', learning: 'Consistency.' },
  { id: 39, title: 'Interaction Variant', file: 'ASG_39.jsx', concepts: ['state sync'], logic: 'Sync states across components (inferred).', code: '', learning: 'State orchestration.' },
  { id: 40, title: 'Interaction Variant', file: 'ASG_40.jsx', concepts: ['composition'], logic: 'Composed interactive widgets (inferred).', code: '', learning: 'Component synergy.' },
  { id: 41, title: 'Scroll-Synced Video', file: 'ASG_41.jsx', concepts: ['scroll mapping', 'media time'], logic: 'Map scroll percent to video.currentTime.', code: 'video.currentTime = percent * video.duration;', learning: 'Normalized progression.' },
  { id: 42, title: 'Scroll Effect Enhancement', file: 'ASG_42.jsx', concepts: ['scroll effect'], logic: 'Supplementary visual layering (inferred).', code: '', learning: 'Scroll UX.' },
  { id: 43, title: 'Scroll Effect Variant', file: 'ASG_43.jsx', concepts: ['progress indicator'], logic: 'Indicator refinement (inferred).', code: '', learning: 'Feedback clarity.' },
  { id: 44, title: 'Rotating Knife Hit Game', file: 'ASG_44.jsx', concepts: ['rAF loop', 'angular collision'], logic: 'Rotate base; compute hit angle; detect collision by modular diff.', code: 'const diff=Math.abs((deg-hitAngle+360)%360);', learning: 'Circular math.' },
  { id: 45, title: 'Game Feature Bridge', file: 'ASG_45.jsx', concepts: ['animation'], logic: 'Additional game mechanic scaffolding (inferred).', code: '', learning: 'Complexity layering.' },
  { id: 46, title: 'Game Feature Bridge', file: 'ASG_46.jsx', concepts: ['state gating'], logic: 'Intermediary enhancements (inferred).', code: '', learning: 'Maintainability.' },
  { id: 47, title: 'Game Feature Bridge', file: 'ASG_47.jsx', concepts: ['timers'], logic: 'Timing nuance (inferred).', code: '', learning: 'Cadence control.' },
  { id: 48, title: 'Game Feature Bridge', file: 'ASG_48.jsx', concepts: ['physics lite'], logic: 'Minor collision/position logic (inferred).', code: '', learning: 'Incremental physics.' },
  { id: 49, title: 'Game Feature Bridge', file: 'ASG_49.jsx', concepts: ['difficulty'], logic: 'Difficulty modulation (inferred).', code: '', learning: 'Balancing.' },
  { id: 50, title: 'Flip & Match Memory Game', file: 'ASG_50.jsx', concepts: ['Fisher–Yates', 'delayed reveal'], logic: 'Duplicate + shuffle deck; flip; match or conceal after timeout.', code: 'for(let i=a.length-1;i>0;i--){...}', learning: 'Uniform random permutation.' },
  { id: 51, title: 'Scroll Step Animation', file: 'ASG_51.jsx', concepts: ['step indicator'], logic: 'Segmented progress (inferred).', code: '', learning: 'User progression.' },
  { id: 52, title: 'Scroll Step Variant', file: 'ASG_52.jsx', concepts: ['progress sync'], logic: 'Refinement of scroll indicator (inferred).', code: '', learning: 'Visual cohesion.' },
  { id: 53, title: 'Word Jumble / Search Puzzle', file: 'ASG_53.jsx', concepts: ['grid gen', 'prefix validation'], logic: 'Place words; track coords; validate selection forward/reverse.', code: 'selectionIsPrefix(selection)', learning: 'Early pruning algorithm.' },
  { id: 54, title: 'Custom Console UI', file: 'ASG_54.jsx', concepts: ['event log'], logic: 'Capture and display interactions (inferred).', code: '', learning: 'Debug tooling.' },
  { id: 55, title: 'Console Enhancement', file: 'ASG_55.jsx', concepts: ['virtualization'], logic: 'Efficient render for many events (inferred).', code: '', learning: 'Performance list.' },
  { id: 56, title: 'Sliding Puzzle', file: 'ASG_56.jsx', concepts: ['grid math', 'adjacency'], logic: 'Swap blank with neighbor; track solvable state.', code: '', learning: '2D indexing.' },
  { id: 57, title: 'Zoomable List', file: 'ASG_57.jsx', concepts: ['transform origin'], logic: 'Zoom focus on selected element (inferred).', code: '', learning: 'Spatial scaling.' },
  { id: 58, title: 'Zoom Interaction Variant', file: 'ASG_58.jsx', concepts: ['layering'], logic: 'Refine z-order & transitions (inferred).', code: '', learning: 'Perceptual depth.' },
  { id: 59, title: 'Zoom Interaction Variant', file: 'ASG_59.jsx', concepts: ['JSON driven UI'], logic: 'Load list from JSON (inferred).', code: '', learning: 'Data-driven rendering.' },
  { id: 60, title: 'Canvas Drawing + Recording', file: 'ASG_60.jsx', concepts: ['MediaRecorder', 'pointer events'], logic: 'Capture drawing at 30fps; export WebM on stop.', code: 'const stream=canvas.captureStream(30);', learning: 'Media capture pipeline.' },
  { id: 61, title: 'Real-Time Chat (WebSocket)', file: 'ASG_61.jsx', concepts: ['ws client/server', 'broadcast filtering'], logic: 'Broadcast messages excluding sender; filter control frames.', code: 'if(parsed.type===\'ping\') return;', learning: 'Event-driven networking.' },
  { id: 62, title: 'Post-Milestone Enhancement', file: 'ASG_62.jsx', concepts: ['refinement'], logic: 'Further polish / extension (inferred).', code: '', learning: 'Continuous improvement.' },
  { id: 63, title: 'Post-Milestone Enhancement', file: 'ASG_63.jsx', concepts: ['pattern scaling'], logic: 'Architecture scalability (inferred).', code: '', learning: 'Sustainable growth.' }
];

export const technologies = {
  language: ['JavaScript (ES6+)', 'JSX'],
  framework: ['React (functional components & hooks)'],
  state: ['Local Component State', 'Redux Toolkit (authSlice)'],
  networking: ['fetch API', 'axios', 'WebSocket (ws)'],
  browserApis: ['DOM Events', 'Drag & Drop', 'Canvas 2D', 'MediaRecorder', 'getUserMedia', 'FileReader', 'URL.createObjectURL', 'requestAnimationFrame', 'Storage APIs'],
  mlVision: ['face-api.js (TinyFaceDetector, Landmarks)', 'tesseract.js (OCR)'],
  dataHandling: ['JSON driven UI', 'Randomization algorithms'],
  uiUxCss: ['2D/3D transforms', 'Perspective', 'Transitions', 'Layering', 'Animations'],
  tooling: ['Vite Dev Server', 'Modular asset structure']
};

export const patterns = [
  {
    name: 'Fisher–Yates Shuffle',
    description: 'Uniform random permutation for deck / answer ordering (memory & word games).',
    snippet: 'for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}'
  },
  {
    name: 'Prefix Validation (Word Grid)',
    description: 'Early pruning of invalid selections by checking both forward and reverse coordinate sequences.',
    snippet: 'selectionIsPrefix(selection)'
  },
  {
    name: 'Angular Collision Detection',
    description: 'Compare minimal modular distance on a circular metric for knife hit detection.',
    snippet: 'diff = Math.abs((a-b+360)%360); if(diff<15||360-diff<15) collision();'
  },
  {
    name: 'Coordinate Scaling',
    description: 'Map UI cursor positions to natural image or video pixels for precise cropping & overlays.',
    snippet: 'scaleX = naturalWidth/displayedWidth;'
  },
  {
    name: 'OCR Upscaling Preprocess',
    description: 'Upscale canvas with white fill to improve text recognition fidelity.',
    snippet: 'temp.drawImage(canvas,0,0,w2,h2);'
  },
  {
    name: 'Canvas Stream Recording',
    description: 'Capture canvas at 30fps, aggregate chunks, emit downloadable WebM.',
    snippet: 'const mr=new MediaRecorder(canvas.captureStream(30));'
  },
  {
    name: 'WebSocket Broadcast Filtering',
    description: 'Ignore ping/pong control frames before appending user-visible chat messages.',
    snippet: 'if(parsed.type===\'ping\') return;'
  },
  {
    name: 'Pose Approximation Heuristic',
    description: 'Estimate head orientation via relative landmark distance ratios & arcsine.',
    snippet: 'rot_x = Math.asin((0.5 - b/(a+b))*2)'
  },
  {
    name: 'Drag & Drop Reordering',
    description: 'Insert index determined by mouse midpoint comparison; adjust for pre-removal shift.',
    snippet: 'updated.splice(insertIndex,0,dragged);'
  },
  {
    name: 'Temporal State Orchestration',
    description: 'Intervals & rAF loops paired with refs to avoid excessive re-renders.',
    snippet: 'requestAnimationFrame(loop);'
  }
];

// Helper accessors
export const getAssignmentById = (id) => assignments.find(a => a.id === Number(id));

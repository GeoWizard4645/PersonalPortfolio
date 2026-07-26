/* Resume + projects data. Single source of truth for all copy. */
const PORTFOLIO_DATA = {
  hero: {
    role: "Student · Builder · Debater · DJ",
    location: "Scarsdale, NY",
  },
  about: {
    body: [
      "I'm a rising junior at Edgemont Jr./Sr. High, building things since 6th grade, when I shipped a tiny lemonade-stand game and never really stopped. Today that means serving as COO of FitFo, founding Debate101, writing on Medium, performing as a DJ, and self-teaching whatever the next project needs.",
      "",
    ],
    stats: [
      { num: "4.00", unit: "GPA UW", label: "Academic standing: straight A's, AP CS + AP Euro" },
      { num: "15K", unit: "+ reads", label: "Journalism and essays published on Medium" },
      { num: "5", unit: "ventures", label: "FitFo, Debate101, Solarflare, Math Monkey, Barky Bites" },
      { num: "Q-finals", unit: "", label: "Woodward National Debate Tournament, Atlanta" },
    ],
  },
  resume: {
    summary:
      "High-achieving 10th-grade student (rising junior) with a 4.00 GPA UW. Competitive debater, self-taught engineer, startup COO, and serial founder. Disciplined fast-learner with strong communication and analytical skills, seeking a summer opportunity to contribute to team goals while gaining exposure to a fast-paced work environment.",
    tabs: [
      {
        id: "education",
        label: "Education",
        entries: [
          {
            period: "2024 to 2028",
            org: "Edgemont Jr./Sr. High School",
            place: "Scarsdale, NY",
            title: "High School Diploma, Expected '28",
            blurb:
              "Straight A's. Honors in Math, English, and Latin. Enrolled in AP Computer Science and AP European History.",
          },
          {
            period: "Graduate",
            org: "Kumon Math",
            place: "Program Graduate",
            title: "Math Curriculum: College-Level Calculus by 9th Grade",
            blurb:
              "Completed the full Kumon curriculum through advanced college-level calculus before high school.",
          },
        ],
      },
      {
        id: "experience",
        label: "Experience",
        entries: [
          {
            period: "2026 to Present",
            org: "FitFo",
            place: "COO",
            title: "Chief Operating Officer, FitFo (fitfo.app)",
            bullets: [
              "Manage and assist the company's legal foundations: established the C-Corp, drove IP assignment agreements, and handle ongoing corporate and legal work.",
              "Run the operational service stack: SMS APIs, email infrastructure, backend services, and vendor management.",
              "Engineer on the product itself: ship features and resolve bugs on the Play Store (Android) app and the watchOS app.",
              "Own leads and payments; run cold outreach to potential clients and handle front-line customer support.",
            ],
          },
          {
            period: "Jan 2026 to Present",
            org: "debate101.org",
            place: "Co-Founder",
            title: "Co-Founder, Non-Profit Debate Platform",
            bullets: [
              "Co-founded a non-profit debate organization; manage its launch and online brand identity.",
              "Spearheaded all website development and design: front-end, content, and curriculum scaffolding.",
              "Owned positioning and community outreach from day zero.",
            ],
          },
          {
            period: "Apr 2025 to Present",
            org: "Chinese School at Edgemont",
            place: "Volunteer Instructor",
            title: "3D Printing & CAD Instructor",
            bullets: [
              "Run weekly Sunday sessions teaching children the fundamentals of 3D modeling and CAD.",
              "Translate complex engineering concepts into hands-on, age-appropriate workshops.",
            ],
          },
          {
            period: "2022 to 2024",
            org: "Solarflare",
            place: "Co-Founder",
            title: "Independent Robotics Team & YouTube Channel",
            bullets: [
              "Managed end-to-end team operations: fundraising, sponsorship, and community outreach.",
              "Led all software coding and hardware assembly for competition builds.",
              "Created a YouTube channel teaching coding fundamentals and robotics logic.",
            ],
          },
          {
            period: "2020 to Present",
            org: "Math Monkey · Barky Bites",
            place: "Co-Founder",
            title: "Two Small Ventures",
            bullets: [
              "Math Monkey: launched a math tutoring business for younger students; manage curriculum and scheduling.",
              "Barky Bites: co-founded a dog-treat company at age 10; handled production and neighborhood sales.",
            ],
          },
        ],
      },
      {
        id: "debate",
        label: "Debate",
        entries: [
          {
            period: "2023 to Present",
            org: "Edgemont Speech & Debate",
            place: "Co-Captain · Varsity",
            title: "Co-Captain, Edgemont Speech & Debate (Lincoln-Douglas)",
            bullets: [
              "Co-Captain of the varsity team: lead practices, run case-prep sessions, and mentor underclassmen.",
              "Quarterfinalist, Woodward National Debate Tournament (Atlanta).",
              "Quarterfinalist, Ridge Debates (Ridge High School, NJ).",
              "Competitor, Science Park High School Invitational (Newark, NJ).",
              "Multiple Top Speaker awards across regional and national circuits.",
              "Invited to elite, invitation-only round-robin tournaments.",
            ],
          },
          {
            period: "Summers '24 & '25",
            org: "Harvard Debate Council",
            place: "Cambridge, MA",
            title: "Harvard University Debate Summer Workshop",
            bullets: [
              "Two consecutive summers at Harvard's flagship debate program, Lincoln-Douglas track.",
              "Studied advanced framework, theory, and high-level case construction with elite coaches.",
              "Sparred against top national circuit competitors in daily round practice.",
            ],
          },
          {
            period: "Ongoing",
            org: "Skill set",
            place: "Lincoln-Douglas Format",
            title: "Format & Methodology",
            blurb:
              "Expert in Lincoln-Douglas value debate, complex evidence analysis, real-time cross-examination, and persuasive on-the-fly communication under judge constraints.",
          },
        ],
      },
      {
        id: "skills",
        label: "Skills",
        skills: [
          { name: "Python", cat: "Code" },
          { name: "Java", cat: "Code" },
          { name: "HTML / CSS / JS", cat: "Web" },
          { name: "React", cat: "Web" },
          { name: "Swift · watchOS", cat: "Code" },
          { name: "MicroPython · Embedded", cat: "Code" },
          { name: "Cursor · Claude Code · Codex", cat: "AI Tooling" },
          { name: "AI-Assisted Engineering Workflows", cat: "AI Tooling" },
          { name: "Excel · Data Analysis", cat: "Analytics" },
          { name: "Paper Trading", cat: "Finance" },
          { name: "Macroeconomic Theory", cat: "Finance" },
          { name: "3D Modeling (CAD)", cat: "Design" },
          { name: "Video / Audio Editing", cat: "Media" },
          { name: "Saxophone · Jazz Ensembles", cat: "Music" },
          { name: "Professional DJ", cat: "Music" },
          { name: "Varsity Lacrosse", cat: "Athletics" },
          { name: "Junior Black Belt · KUKKIWON 1st Poom", cat: "Athletics" },
          { name: "Independent Journalist · 15K+ reads", cat: "Writing" },
          { name: "English · Hindi", cat: "Language" },
        ],
      },
    ],
  },
  projects: [
    {
      num: "01",
      title: "FitFo",
      role: "COO. Legal, operations, payments, and hands-on engineering.",
      tags: ["Startup", "Operations", "Mobile", "watchOS"],
      year: "2026 →",
      href: "https://fitfo.app",
      preview: "pulse",
      what:
        "A fitness startup shipping a workout-tracking app across Android, iOS, and Apple Watch. Real company, real users, real paperwork.",
      did:
        "Serve as COO. Managed the legal transformation and foundations: establishing the C-Corp, IP assignments, and ongoing corporate work. Run the service stack (SMS APIs, email, backend). Engineer on the product too: features and bug fixes on the Play Store app and the watchOS app. Also own leads and payments, cold outreach to potential clients, and customer support.",
      learned:
        "The code is maybe a third of a company. Incorporation, IP assignments, payment flows, and answering support emails ship the product just as much as the features do.",
      tools: ["Swift", "watchOS", "Android", "SMS / Email APIs", "Backend Ops", "Legal Ops"],
    },
    {
      num: "02",
      title: "Caduceus",
      role: "Creator. Designed and shipped a macOS command centre end to end.",
      tags: ["macOS", "Desktop", "Tauri", "Local-first"],
      year: "2026 →",
      href: "https://caduceus.vivaanshahani.com",
      preview: "caduceus",
      what:
        "A fast, local-first command centre for your Mac: a floating pixel staff, a palette that launches apps and does maths, clipboard history with optional encryption, on-device voice, and an AI layer that can drive your machine through Hermes Agent.",
      did:
        "Built the whole product with Tauri — Rust on the backend, TypeScript in the webview. Implemented the staff overlay, command palette and result providers, installed-app index, calculator, clipboard watcher and SQLite store, push-to-talk routing through Apple's Speech framework, and Hermes/OpenAI-compatible agent backends. Shipped releases, a one-line install script, and caduceus.vivaanshahani.com.",
      learned:
        "On desktop, security is the product shape: named IPC commands instead of a open shell, API keys that never leave the keychain, and no always-on microphone when the same app can control the screen.",
      tools: ["Tauri", "Rust", "TypeScript", "SQLite", "Hermes Agent", "Apple Speech"],
    },
    {
      num: "03",
      title: "Debate101",
      role: "Co-founded and built. Curriculum, design, and platform.",
      tags: ["Product", "Community", "Curriculum"],
      year: "2026 →",
      href: "https://debate101.org",
      preview: "balance",
      what:
        "A non-profit debate organization built to lower the barrier-to-entry for new competitors. Open curriculum, prep materials, and a public-facing platform for kids who don't have $5k summer-camp budgets.",
      did:
        "Co-founded the org with my partner. Designed and shipped the website end-to-end (front-end, IA, brand). Wrote the foundational curriculum drawing on personal national-circuit experience. Owned positioning, outreach, and the first wave of recruiting.",
      learned:
        "How much harder distribution is than building, and that voice and brand are the actual product when the artifact is information.",
      tools: ["HTML", "CSS", "JS", "Figma", "Notion"],
    },
    {
      num: "04",
      title: "Sprig Dashboard",
      role: "Built my own multi-app system for Hack Club's Sprig handheld.",
      tags: ["Embedded", "Hardware", "MicroPython"],
      year: "2026",
      href: "https://github.com/GeoWizard4645/sprig-dashboard",
      preview: "dashboard",
      what:
        "My own system for Hack Club's Sprig, a mini machine built on a Raspberry Pi. It lives on my desk as a mini LED screen, controlled entirely through the Sprig's eight buttons: check the weather, monitor my favorite stocks, view scores for the teams I follow, and watch statistics for my personal internet.",
      did:
        "Wrote the whole system in MicroPython with a non-blocking async UI. Four apps switched from the D-pad: weather with a 3-day chart, a scrolling stock ticker with drill-down price charts, live scores and standings across F1 / NFL / NBA / MLB, and a Wi-Fi analyzer plus system monitor. All data pulled from free public APIs with retrying fetches.",
      learned:
        "Working inside real constraints: kilobytes of RAM, eight buttons, a palm-sized screen. Every feature has to earn its memory.",
      tools: ["MicroPython", "Raspberry Pi Pico", "uasyncio", "Public APIs"],
    },
    {
      num: "05",
      title: "BlotInator",
      role: "Open-source contribution to Hack Club's Blot drawing robot.",
      tags: ["Open Source", "Generative Art", "Hack Club"],
      year: "2024",
      href: "https://github.com/GeoWizard4645/BlotInator",
      preview: "plotter",
      what:
        "A tool that turns images into Blot code: machine drawing instructions for Hack Club's Blot, a pen-plotting robot that physically draws generated art. Feed it a photo, get back line art the bot can put on paper.",
      did:
        "Built on an existing open-source converter (credited in the README) and extended it into my own image-to-Blot pipeline. This is where I honed my JavaScript: contributing to open-source code that generated art for a Hack Club project, and learning to read, extend, and credit someone else's codebase.",
      learned:
        "Reading other people's code is its own skill. Open source taught me to extend rather than rewrite, and to ship something others can actually use.",
      tools: ["JavaScript", "Node", "Hack Club Blot"],
    },
    {
      num: "06",
      title: "DJ · Live Set",
      role: "Designed and shipped a personal DJ landing page from scratch.",
      tags: ["Web", "Audio", "Design"],
      year: "2024 →",
      href: "https://dj.vivaanshahani.com",
      preview: "equalizer",
      what:
        "A personal DJ identity and booking surface: landing page, set list, contact, and a sandbox for audio-driven web experiments.",
      did:
        "Solo designer + developer. Built it in vanilla HTML/CSS/JS, designed the visual identity, picked the typography, and shipped on GitHub Pages. Performed at school and community events using it as my front door.",
      learned:
        "Designing professional websites to land gigs. How to DJ. Check out the website to book me.",
      tools: ["HTML", "CSS", "JS", "GitHub Pages", "Rekordbox", "Music Skills"],
    },
    {
      num: "07",
      title: "Medium · Journalism",
      role: "Long-form essays and journalism · 15K+ reads.",
      tags: ["Writing", "Editorial"],
      year: "2023 →",
      href: "https://vivshahani.medium.com/",
      preview: "lines",
      what:
        "Independent journalism on current events, international affairs, and the messy middle of growing up online. Self-drafted, self-edited, self-published.",
      did:
        "Every piece: research, drafting, editing, headlining, and publishing. Over 15,000 cumulative reads across the catalog, with several pieces crossing into wider circulation.",
      learned:
        "Writing keeps engineering grounded in why. The hardest sentence to write is the first one, so I just always write a bad one and fix it later.",
      tools: ["Notion", "Medium", "Research"],
    },
    {
      num: "08",
      title: "Lemonade Stand",
      role: "The first thing I ever coded. Kept on purpose, for the through-line.",
      tags: ["Archive", "Origin"],
      year: "2020",
      href: "https://github.com/GeoWizard4645/Viv-Lemonade-Stand",
      preview: "pixel",
      what:
        "A 6th-grade text-based business simulator where you set prices, manage inventory, and try not to go broke. Kept publicly on GitHub because the through-line matters.",
      did:
        "Wrote every line of code. Designed the game loop, balanced the economy, learned about conditionals and state, all for the first time.",
      learned:
        "If 11-year-old me could ship a working program, the only thing that's ever stopped me since has been me.",
      tools: ["Python", "Basic CLI"],
    },
  ],
};

export default PORTFOLIO_DATA;

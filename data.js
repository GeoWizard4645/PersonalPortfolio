/* Resume + projects data — read by app.jsx */
window.PORTFOLIO_DATA = {
  hero: {
    role: "Student · Builder · Debater · DJ",
    location: "Scarsdale, NY",
    available: "Available for Summer '26",
  },
  about: {
    body: [
      "I'm a rising junior at Edgemont Jr./Sr. High, building things since 6th grade — when I shipped a tiny lemonade-stand game and never really stopped. Today, that means founding Debate101, writing on Medium, performing as a DJ, and self-teaching whatever the next project needs.",
      "",
    ],
    stats: [
      { num: "4.00", unit: "GPA UW", label: "Academic standing — straight A's, AP CS + AP Euro" },
      { num: "15K", unit: "+ reads", label: "Journalism and essays published on Medium" },
      { num: "4", unit: "ventures", label: "Debate101, Solarflare, Math Monkey, Barky Bites" },
      { num: "Q-finals", unit: "", label: "Woodward National Debate Tournament, Atlanta" },
    ],
  },
  resume: {
    summary:
      "High-achieving 10th-grade student (Rising Junior) with a 4.00 GPA UW — competitive debater, self-taught engineer, four-time founder. Disciplined fast-learner with strong communication and analytical skills, seeking a summer opportunity to contribute to team goals while gaining exposure to a fast-paced work environment.",
    tabs: [
      {
        id: "education",
        label: "Education",
        entries: [
          {
            period: "2024 — 2028",
            org: "Edgemont Jr./Sr. High School",
            place: "Scarsdale, NY",
            title: "High School Diploma — Expected '28",
            blurb:
              "Straight A's. Honors in Math, English, and Latin. Enrolled in AP Computer Science and AP European History.",
          },
          {
            period: "—",
            org: "Kumon Math",
            place: "Program Graduate",
            title: "Math Curriculum — College-Level Calculus by 9th Grade",
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
            period: "Jan 2026 — Present",
            org: "debate101.org",
            place: "Co-Founder",
            title: "Co-Founder — Non-Profit Debate Platform",
            bullets: [
              "Co-founded a non-profit debate organization; manage its launch and online brand identity.",
              "Spearheaded all website development and design — front-end, content, and curriculum scaffolding.",
              "Owned positioning and community outreach from day zero.",
            ],
          },
          {
            period: "Apr 2025 — Present",
            org: "Chinese School at Edgemont",
            place: "Volunteer Instructor",
            title: "3D Printing & CAD Instructor",
            bullets: [
              "Run weekly Sunday sessions teaching children the fundamentals of 3D modeling and CAD.",
              "Translate complex engineering concepts into hands-on, age-appropriate workshops.",
            ],
          },
          {
            period: "2022 — 2024",
            org: "Solarflare",
            place: "Co-Founder",
            title: "Independent Robotics Team & YouTube Channel",
            bullets: [
              "Managed end-to-end team operations — fundraising, sponsorship, and community outreach.",
              "Led all software coding and hardware assembly for competition builds.",
              "Created a YouTube channel teaching coding fundamentals and robotics logic.",
            ],
          },
          {
            period: "2020 — Present",
            org: "Math Monkey · Barky Bites",
            place: "Co-Founder",
            title: "Two Small Ventures",
            bullets: [
              "Math Monkey — launched a math tutoring business for younger students; manage curriculum and scheduling.",
              "Barky Bites — co-founded a dog-treat company at age 10; handled production and neighborhood sales.",
            ],
          },
        ],
      },
      {
        id: "debate",
        label: "Debate",
        entries: [
          {
            period: "2023 — Present",
            org: "Edgemont Speech & Debate",
            place: "Co-Captain · Varsity",
            title: "Co-Captain — Edgemont Speech & Debate (Lincoln-Douglas)",
            bullets: [
              "Co-Captain of the varsity team — lead practices, run case-prep sessions, and mentor underclassmen.",
              "Quarterfinalist — Woodward National Debate Tournament (Atlanta).",
              "Quarterfinalist — Ridge Debates (Ridge High School, NJ).",
              "Competitor — Science Park High School Invitational (Newark, NJ).",
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
              "Two consecutive summers at Harvard's flagship debate program — Lincoln-Douglas track.",
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
          { name: "Excel — Data Analysis", cat: "Analytics" },
          { name: "Paper Trading", cat: "Finance" },
          { name: "Macroeconomic Theory", cat: "Finance" },
          { name: "3D Modeling (CAD)", cat: "Design" },
          { name: "Video / Audio Editing", cat: "Media" },
          { name: "Saxophone — Jazz Ensembles", cat: "Music" },
          { name: "Professional DJ", cat: "Music" },
          { name: "Varsity Lacrosse", cat: "Athletics" },
          { name: "Junior Black Belt — KUKKIWON 1st Poom", cat: "Athletics" },
          { name: "Independent Journalist — 15K+ reads", cat: "Writing" },
          { name: "English · Hindi", cat: "Language" },
        ],
      },
    ],
  },
  projects: [
    {
      num: "01",
      title: "Debate101",
      role: "Co-founded and built. Curriculum, design, and platform.",
      tags: ["Product", "Community", "Curriculum"],
      year: "2026 —",
      href: "https://debate101.org",
      preview: "balance",
      what:
        "A non-profit debate organization built to lower the barrier-to-entry for new competitors. Open curriculum, prep materials, and a public-facing platform for kids who don't have $5k summer-camp budgets.",
      did:
        "Co-founded the org with my partner. Designed and shipped the website end-to-end (front-end, IA, brand). Wrote the foundational curriculum drawing on personal national-circuit experience. Owned positioning, outreach, and the first wave of recruiting.",
      learned:
        "How much harder distribution is than building — and that voice and brand are the actual product when the artifact is information.",
      tools: ["HTML", "CSS", "JS", "Figma", "Notion"],
    },
    {
      num: "02",
      title: "DJ — Live Set",
      role: "Designed and shipped a personal DJ landing page from scratch.",
      tags: ["Web", "Audio", "Design"],
      year: "2024 —",
      href: "dj.vivaanshahani.com",
      preview: "equalizer",
      what:
        "A personal DJ identity and booking surface — landing page, set list, contact, and a sandbox for audio-driven web experiments.",
      did:
        "Solo designer + developer. Built it in vanilla HTML/CSS/JS, designed the visual identity, picked the typography, and shipped on GitHub Pages. Performed at school and community events using it as my front door.",
      learned:
        "Desigining proffessional websites to land gigs. How to DJ. Check out the website to book me.",
      tools: ["HTML", "CSS", "JS", "GitHub Pages","Rekordbox","Music Skills"],
    },
    {
      num: "03",
      title: "Medium — Journalism",
      role: "Long-form essays and journalism · 15K+ reads.",
      tags: ["Writing", "Editorial"],
      year: "2023 —",
      href: "https://vivshahani.medium.com/",
      preview: "lines",
      what:
        "Independent journalism on current events, international affairs, and the messy middle of growing up online. Self-drafted, self-edited, self-published.",
      did:
        "Every piece — research, drafting, editing, headlining, and publishing. Over 15,000 cumulative reads across the catalog, with several pieces crossing into wider circulation.",
      learned:
        "Writing keeps engineering grounded in why. The hardest sentence to write is the first one — so I just always write a bad one and fix it later.",
      tools: ["Notion", "Medium", "Research"],
    },
    {
      num: "04",
      title: "Lemonade Stand",
      role: "The first thing I ever coded. Kept on purpose, for the through-line.",
      tags: ["Archive", "Origin"],
      year: "2020",
      href: "https://github.com/GeoWizard4645/Viv-Lemonade-Stand",
      preview: "pixel",
      what:
        "A 6th-grade text-based business simulator where you set prices, manage inventory, and try not to go broke. Kept publicly on GitHub because the through-line matters.",
      did:
        "Wrote every line of code. Designed the game loop, balanced the economy, learned about conditionals and state — for the first time.",
      learned:
        "If 11-year-old me could ship a working program, the only thing that's ever stopped me since has been me.",
      tools: ["Python", "Basic CLI"],
    },
  ],
};

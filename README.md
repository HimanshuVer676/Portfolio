# Himanshu Verma — Developer Portfolio

A sleek, dark-themed, and highly interactive developer portfolio built using **React**, **Vite**, and custom **HTML5 Canvas 2D** animations. This project showcases Himanshu's credentials, technical skills, and web development projects.

---

## 🚀 Live Demo & Links

- **TripNest (Travel Platform):** [Live Site](https://trip-nest-vucv.vercel.app/)
- **Contact Email:** [himanshuver326@gmail.com](mailto:himanshuver326@gmail.com)
- **LinkedIn Profile:** [Himanshu Verma](https://www.linkedin.com/in/himanshu-verma-5b617b3a7)

---

## 🎨 Features & Highlights

1. **Seeded Organic Tree Animation (Canvas 2D)**
   - Powered by a custom PRNG (Mulberry32) in [TreeBackground.jsx](file:///d:/My%20Projects/portfolio/src/components/TreeBackground.jsx) to ensure an identical, mathematically beautiful tree structure on every page load.
   - Growth animation draws sequentially from trunk to branches and leaves using quadratic bezier curves.
   - Dynamic scroll-based retraction uses a reverse-depth interpolation algorithm (leaves disappear first, followed by branches and the trunk).
2. **Premium Styling & Typography**
   - Rich dark mode styling using HSL colors, smooth transitions, and subtle hover animations.
   - Clean font pairing using **Inter** (body text) and **JetBrains Mono** (code elements).
   - Glassmorphic floating resume button fixed to the viewport.
3. **Scroll Reveal Effects**
   - Uses a React `IntersectionObserver` hook in [App.jsx](file:///d:/My%20Projects/portfolio/src/App.jsx) to automatically fade and slide sections into view as the user scrolls.
4. **Responsive Design**
   - Fully optimized layout and canvas resizing logic for mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack

- **Core Framework:** React 19 & Vite 8
- **Styling:** Vanilla CSS (Custom Design System with CSS variables)
- **Graphics/Animation:** HTML5 Canvas API (No heavy external WebGL libraries required)
- **Iconography:** Font Awesome 6 (loaded via CDN)

---

## 📁 Project Directory Layout

```text
portfolio/
├── .cursor/            # Cursor editor configurations
├── dist/               # Compiled build for production
├── public/             # Public static assets (images, icons)
│   ├── tripnest/       # TripNest project screenshots
│   └── wealthify/      # Wealthify project screenshots
├── src/
│   ├── components/     # React UI and Canvas components
│   │   ├── About.jsx         # Profile summary / bio
│   │   ├── Certificates.jsx  # Oracle & HP Life credentials
│   │   ├── Contact.jsx       # Email & social connection details
│   │   ├── Footer.jsx        # Simple copyright footer
│   │   ├── Hero.jsx          # Landing section with Canvas tree background
│   │   ├── Navbar.jsx        # Sticky navigation with mobile menu toggle
│   │   ├── Projects.jsx      # Collage cards showcasing projects
│   │   ├── Skills.jsx        # Dynamic skill chips
│   │   ├── TreeBackground.jsx# Seeded realistic tree component (quadratic curves)
│   │   └── TreeCanvas.jsx    # Alternate linear tree canvas component
│   ├── App.jsx         # Root component with Intersection Observer reveal logic
│   ├── index.css       # Design tokens, resets, component layouts, and keyframes
│   └── main.jsx        # Application entry point
├── index.html          # Shell template with pre-connected Google fonts & meta tags
├── package.json        # Dependencies and build scripts
└── vite.config.js      # Vite configuration
```

---

## 💻 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (recommended version 18+).

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local URL (usually `http://localhost:5173`).

### Production Build

To bundle the application for production hosting:
```bash
npm run build
```
This outputs compiled, optimized assets to the `dist/` directory.

To preview the production bundle locally:
```bash
npm run preview
```

---

## 📄 Sections & Components Breakdown

- **Hero Section ([Hero.jsx](file:///d:/My%20Projects/portfolio/src/components/Hero.jsx)):** Serves as the landing point, rendering the organic Canvas-based tree behind the title text.
- **Projects ([Projects.jsx](file:///d:/My%20Projects/portfolio/src/components/Projects.jsx)):** Highlights MERN Stack applications:
  - *TripNest:* A travel community platform utilizing Node.js, Express, MongoDB, Cloudinary, Passport, and Joi.
  - *Wealthify:* A stock trading platform clone featuring real-time data visualisations using React, Chart.js, Socket.io, Node.js, and MongoDB.
- **Certificates ([Certificates.jsx](file:///d:/My%20Projects/portfolio/src/components/Certificates.jsx)):** Displays credential links such as Oracle's *AI Foundation Associate* and HP Life certificates.
- **Skills ([Skills.jsx](file:///d:/My%20Projects/portfolio/src/components/Skills.jsx)):** Showcases the core tech stack in a grid of hoverable chips.

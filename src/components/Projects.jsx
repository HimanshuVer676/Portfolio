const projects = [
  {
    icon: <i className="fa-solid fa-wand-magic-sparkles"></i>,
    name: "TripNest (Travel Exploration Platform)",
    status: "Completed",
    description:
      "A dynamic travel community hub for discovering unique destinations, sharing experiences, and reading authentic peer reviews.",
    tech: ["Node.js", "Express.js", "MongoDB", "Cloudinary", "Joi", "Passport"],
    link: "https://trip-nest-vucv.vercel.app/",
    images: [
      "/tripnest/photo-1607441078533-77ba814b1e5d.avif",
      "/tripnest/photo-1635337136044-83e78752bc4a.jpg",
    ],
  },
  {
    icon: <i className="fa-solid fa-chart-line"></i>,
    name: "Wealthify (Stock Trading Platform)",
    status: "under Development",
    description:
      "A high-performance trading platform clone featuring interactive charts, real-time portfolio management, multi-asset watchlists, and secure transaction flows.",
    tech: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Chart.js",
      "Socket.io",
    ],
    link: "#",
    images: ["/wealthify/wealth1.png", "/wealthify/wealth2.png"],
  },
  {
    icon: <i className="fa-solid fa-circle-nodes"></i>,
    name: "CircleUp - A Social Networking platform",
    status: "Completed",
    description:
      "CircleUp is a modern, full-stack community web app where users can connect, share posts with cloud-hosted images, explore category feeds, and engage through interactive discussions. Built with React (Vite), Node.js, Express, MongoDB, and Cloudinary.",
    tech: ["React", "Node.js", "Express.js", "MongoDB", "multer", "cloudinary"],
    link: "https://circleup-chi.vercel.app/",
    images: ["/circleup/hero1.jpg", "/circleup/hero4.jpg"],
  },
];

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">Projects</p>
          <h2 className="section-title">Things I've Built</h2>
          <div className="section-divider" />
        </div>
        <div className="projects-grid">
          {projects.map((p, i) => {
            const Wrapper = p.link ? "a" : "div";
            return (
              <Wrapper
                className="project-card reveal"
                key={i}
                id={`project-${i}`}
                {...(p.link
                  ? {
                      href: p.link,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      },
                    }
                  : {})}
              >
                <div className="project-icon">{p.icon}</div>
                <span className="project-arrow">↗</span>
                <h3 className="project-name">
                  {p.name}
                  {p.status && <small className="project-status">{p.status}</small>}
                </h3>
                <p className="project-description">{p.description}</p>

                {p.images && p.images.length > 0 && (
                  <div className="project-images">
                    {p.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${p.name} screenshot ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="project-tech">
                  {p.tech.map((t) => (
                    <span className="tech-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

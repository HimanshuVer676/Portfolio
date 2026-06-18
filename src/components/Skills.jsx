const skills = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'GitHub',
];

export default function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">Skills</p>
          <h2 className="section-title">Tech Stack</h2>
          <div className="section-divider" />
        </div>
        <div className="skills-container reveal">
          <div className="skills-chips">
            {skills.map((s) => (
              <div className="skill-chip" key={s} id={`skill-${s.toLowerCase().replace('.', '')}`}>
                <span className="skill-dot" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

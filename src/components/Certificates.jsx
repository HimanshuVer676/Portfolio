const certs = [
  {
    emoji: '🎓',
    name: 'AI Foundation Associate',
    issuer: 'Oracle',
    link: 'https://drive.google.com/file/d/1_fX98V_9UVe1OOzBG32crrIryoC1kxAb/view?usp=drivesdk',
  },
  {
    emoji: '🤖',
    name: 'AI for Beginners',
    issuer: 'HP Life',
    link: 'https://drive.google.com/file/d/1iV5_tNumtnmvrDrgYQ7tYJuBlC3v1MnS/view?usp=drivesdk',
  },
  {
    emoji: '💼',
    name: 'Customer Experience (CX) for Business Success',
    issuer: 'HP Life',
    link: 'https://drive.google.com/file/d/197utVccQ1bTmedx_H4db6FN7jwvpSyU3/view?usp=drivesdk',
  },
];

export default function Certificates() {
  return (
    <section className="section" id="certificates">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">Certificates</p>
          <h2 className="section-title">Credentials</h2>
          <div className="section-divider" />
        </div>
        <div className="certs-grid">
          {certs.map((c, i) => {
            const Wrapper = c.link ? 'a' : 'div';
            return (
              <Wrapper 
                className="cert-card reveal" 
                key={i} 
                id={`cert-${i}`}
                {...(c.link ? { 
                  href: c.link, 
                  target: "_blank", 
                  rel: "noopener noreferrer",
                  style: { textDecoration: 'none', color: 'inherit', cursor: 'pointer' }
                } : {})}
              >
                <div className="cert-badge">{c.emoji}</div>
                <div className="cert-info">
                  <h3>{c.name}</h3>
                  <p>{c.issuer}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

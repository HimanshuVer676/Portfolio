export default function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-header reveal">
          <p className="section-label">Contact</p>
          <h2 className="section-title">Get in Touch</h2>
          <div className="section-divider" />
        </div>
        <div className="contact-layout reveal">
          <div className="contact-info">
            <h3>Let's connect</h3>
            <p>
              Have a project in mind or just want to say hello? Feel free to
              reach out — I'd love to hear from you.
            </p>
            <div className="contact-details-list">
              <div className="contact-detail">
                <span className="contact-detail-icon">✉</span>
                <a href="mailto:himanshuver326@gmail.com">himanshuver326@gmail.com</a>
              </div>
              <div className="contact-detail">
                <span className="contact-detail-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </span>
                <a href="https://www.linkedin.com/in/himanshu-verma-5b617b3a7" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

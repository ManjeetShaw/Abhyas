const FAQS = [
  {
    q: "How does Abhyas generate interview questions?",
    a: "Once you upload a resume, Abhyas reads it and generates an opening question tailored to your real projects and experience. Each answer you give shapes the next follow-up question, just like a real interview.",
  },
  {
    q: "What's the difference between interviewer personalities?",
    a: "Senior Engineer is calm and mentor-like, Friendly HR is warm and culture-focused, Strict FAANG Interviewer is rigorous and terse, and Startup Founder is fast-paced and pragmatic. Each shifts the tone of questions and feedback.",
  },
  {
    q: "How is my answer scored?",
    a: "Every answer is scored on four dimensions — clarity, technical accuracy, completeness, and confidence — each out of 10. Your overall interview score is an average across all questions, shown out of 100.",
  },
  {
    q: "What is the Coding Round?",
    a: "For Technical interviews, you can enable a Coding Round to get a real code editor instead of a text box, with a language switcher for JavaScript, Python, Java, and C++. Your code is evaluated for correctness and efficiency.",
  },
  {
    q: "How does the ATS Resume Score work?",
    a: "Paste in a job description on the ATS Score page, and Abhyas compares it against your uploaded resume — returning a match score, missing keywords, and suggestions to improve your resume for that specific role.",
  },
  {
    q: "Is my resume data private?",
    a: "Your resume and interview data are tied to your account only and are not shared with other users.",
  },
];

export default function Help() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Help</h1>
      </header>

      <div className="panel">
        {FAQS.map((item) => (
          <div key={item.q} className="faq-item">
            <h3>{item.q}</h3>
            <p className="muted">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

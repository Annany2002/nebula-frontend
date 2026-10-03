import { ArrowUpRight, Plus } from "lucide-react";
import Reveal from "./landing/Reveal";

const questions = [
  {
    question: "How are my databases isolated?",
    answer:
      "Each database has its own SQLite file under your workspace. Tables, records and schemas live in that file, rather than sharing tables with other projects. The API enforces access through your account or a key scoped to that database.",
  },
  {
    question: "Can I take my data with me?",
    answer:
      "Yes. Export a consistent SQLite snapshot or a SQL dump from Nebula. The SQLite file can be opened with standard tools such as DB Browser for SQLite, TablePlus or DBeaver.",
  },
  {
    question: "Can I self-host Nebula?",
    answer:
      "Yes. The backend is a Go binary with SQLite embedded through CGO. Build it for your server, configure the environment and run it. There is no separate database service to provision. Source code and setup instructions are available on GitHub.",
  },
  {
    question: "How does authentication work?",
    answer:
      "JWT Bearer tokens authenticate your account and Studio session. Database-scoped API keys authenticate programmatic data access. Key secrets are stored as hashes and are shown when generated, so save them somewhere secure.",
  },
  {
    question: "Is Nebula free to use?",
    answer:
      "Nebula is open source under the MIT license. You can inspect the code, use it in your applications and host it yourself. When self-hosting, you pay for the infrastructure you choose.",
  },
];

const Faq = () => (
  <section id="faq" className="nbl-section nbl-faq" aria-labelledby="faq-title">
    <div className="nbl-container nbl-faq-grid">
      <Reveal className="nbl-faq-heading">
        <h2 id="faq-title">Before you start.</h2>
        <a
          href="https://github.com/Annany2002/nebula-backend/issues"
          target="_blank"
          rel="noreferrer"
        >
          Ask us on GitHub <ArrowUpRight size={15} />
        </a>
      </Reveal>
      <div className="nbl-faq-list">
        {questions.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <Plus size={17} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default Faq;

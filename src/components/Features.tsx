import { Braces, Check, Database, Download, KeyRound, LockKeyhole, Table2 } from "lucide-react";
import Reveal from "./landing/Reveal";

const Features = () => (
  <section id="features" className="nbl-section nbl-features" aria-labelledby="features-title">
    <div className="nbl-container">
      <Reveal className="nbl-section-heading">
        <h2 id="features-title">A workspace for your entire backend.</h2>
      </Reveal>
      <div className="nbl-feature-layout">
        <Reveal className="nbl-feature-isolation">
          <div className="nbl-feature-copy">
            <span className="nbl-feature-number">01 / ISOLATED STORAGE</span>
            <h3>Separate by design.</h3>
            <p>
              Each project gets an independent SQLite file, with its own tables, schema and
              credentials.
            </p>
          </div>
          <div className="nbl-file-system" aria-label="Three independent SQLite databases">
            <div className="nbl-file-branch" aria-hidden="true" />
            {[
              { name: "ecommerce.db", label: "Storefront", color: "violet" },
              { name: "analytics.db", label: "Event analytics", color: "mint" },
              { name: "sideproject.db", label: "Prototype", color: "peach" },
            ].map((file) => (
              <div className={`nbl-db-file ${file.color}`} key={file.name}>
                <span className="nbl-file-icon">
                  <Database size={21} />
                </span>
                <span>
                  <strong>{file.name}</strong>
                  <small>{file.label}</small>
                </span>
                <LockKeyhole size={13} />
              </div>
            ))}
            <div className="nbl-file-base">
              <span />
              <code>data / your_workspace /</code>
            </div>
          </div>
        </Reveal>
        <Reveal className="nbl-feature-studio" delay={0.08}>
          <div className="nbl-mini-editor">
            <div className="nbl-mini-editor-title">
              <Table2 size={13} /> users <span>3 records</span>
            </div>
            <table>
              <caption className="sr-only">Example user records in the table editor</caption>
              <thead>
                <tr>
                  <th>id</th>
                  <th>name</th>
                  <th>role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Alex Morgan</td>
                  <td>
                    <span>admin</span>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Sam Rivera</td>
                  <td>member</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Jamie Chen</td>
                  <td>member</td>
                </tr>
              </tbody>
            </table>
            <div className="nbl-mini-editor-bottom">
              <Check size={11} /> Changes saved
            </div>
          </div>
          <div className="nbl-feature-copy">
            <span className="nbl-feature-number">02 / VISUAL STUDIO</span>
            <h3>Work directly with your data.</h3>
            <p>
              Browse records, edit fields, inspect database objects, and run SQL in one workspace.
            </p>
          </div>
        </Reveal>
        <Reveal className="nbl-feature-tools">
          <div className="nbl-tools-intro">
            <span className="nbl-feature-number">03 / BUILT IN</span>
            <h3>
              The essentials,
              <br />
              already connected.
            </h3>
          </div>
          <div className="nbl-tool-detail">
            <Braces size={21} />
            <h4>REST, ready to go</h4>
            <p>CRUD endpoints with filtering, sorting and pagination.</p>
            <code>
              <b>GET</b> /tables/orders/records
            </code>
          </div>
          <div className="nbl-tool-detail">
            <KeyRound size={21} />
            <h4>Access with intention</h4>
            <p>JWT sessions for your account. Scoped API keys for your database.</p>
            <span className="nbl-detail-note">
              <Check size={13} /> Hashed API keys
            </span>
          </div>
          <div className="nbl-tool-detail">
            <Download size={21} />
            <h4>Your exit is built in</h4>
            <p>Download a SQLite snapshot or SQL dump whenever you need it.</p>
            <span className="nbl-detail-note">
              .db <span> / </span> .sql
            </span>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default Features;

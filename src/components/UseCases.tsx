import { ArrowUpRight, Code2, Layers, Rocket } from "lucide-react";
import Reveal from "./landing/Reveal";

const useCases = [
  {
    icon: Rocket,
    number: "01",
    name: "Prototypes & side projects",
    description:
      "Go from an empty project to a working backend. Spend your weekend building the product, not provisioning infrastructure.",
  },
  {
    icon: Layers,
    number: "02",
    name: "Customer workspaces",
    description:
      "Keep customer data in separate SQLite databases. Manage each tenant's schema, credentials and exports independently.",
  },
  {
    icon: Code2,
    number: "03",
    name: "Internal tools & mobile apps",
    description:
      "Put a dependable REST API behind internal dashboards, automations and mobile apps. Use whichever HTTP client you already know.",
  },
];

const UseCases = () => (
  <section id="use-cases" className="nbl-section nbl-usecases" aria-labelledby="usecases-title">
    <div className="nbl-container">
      <Reveal className="nbl-usecases-heading">
        <h2 id="usecases-title">Where Nebula fits.</h2>
      </Reveal>
      <div className="nbl-usecase-list">
        {useCases.map((item) => (
          <Reveal className="nbl-usecase" key={item.number}>
            <span className="nbl-usecase-index">{item.number}</span>
            <div className="nbl-usecase-name">
              <item.icon size={22} />
              <h3>{item.name}</h3>
            </div>
            <div>
              <p>{item.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="nbl-selfhost">
        <div>
          <span className="nbl-selfhost-orbit" aria-hidden="true">
            <span />
          </span>
          <h3>
            Deploy on
            <br />
            your own server.
          </h3>
        </div>
        <p>
          Run a single Go binary with SQLite embedded. No separate database service to configure.
        </p>
        <a
          className="nbl-button nbl-button-secondary"
          href="https://github.com/Annany2002/nebula-backend#readme"
          target="_blank"
          rel="noreferrer"
        >
          Self-host Nebula <ArrowUpRight size={15} />
        </a>
      </Reveal>
    </div>
  </section>
);

export default UseCases;

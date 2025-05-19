import { Rocket, CheckCircle, Smartphone, Code, Server } from "lucide-react";

interface UseCaseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const UseCaseCard = ({ icon, title, description }: UseCaseCardProps) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="bg-primary/10 p-2 rounded-lg text-primary">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
};

const UseCases = () => {
  const useCases = [
    {
      icon: <Rocket size={24} />,
      title: "MVPs & Prototypes",
      description:
        "Rapidly validate your app ideas without building backend infrastructure from scratch.",
    },
    {
      icon: <Code size={24} />,
      title: "Indie Developers",
      description:
        "Focus on your product's unique features rather than reinventing auth and data storage.",
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Hackathons",
      description:
        "Build complete, functional applications in hours instead of days with ready-to-use backend services.",
    },
    {
      icon: <Smartphone size={24} />,
      title: "Mobile Apps",
      description:
        "Connect your iOS or Android app to a reliable backend API without managing servers.",
    },
    {
      icon: <Server size={24} />,
      title: "Internal Tools",
      description:
        "Quickly build data-driven internal tools with minimal backend development effort.",
    },
  ];

  return (
    <section id="use-cases" className="section">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Who is Nebula <span className="gradient-text">For?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Nebula is perfect for developers who want to build quickly, focus
              on their unique features, and avoid the complexity of setting up
              and managing backend infrastructure.
            </p>

            <div className="space-y-6">
              {useCases.map((useCase, index) => (
                <UseCaseCard
                  key={index}
                  icon={useCase.icon}
                  title={useCase.title}
                  description={useCase.description}
                />
              ))}
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-8">
            <h3 className="text-2xl font-semibold mb-6">Key Benefits</h3>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span>
                  <strong className="font-medium">Zero Setup Time</strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    No servers to provision, databases to install, or auth
                    systems to configure.
                  </p>
                </span>
              </li>

              <li className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span>
                  <strong className="font-medium">
                    Developer-Friendly API
                  </strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Clean, consistent, and RESTful API that's easy to understand
                    and integrate with.
                  </p>
                </span>
              </li>

              <li className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span>
                  <strong className="font-medium">
                    Flexible Data Modeling
                  </strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Define your own tables and columns exactly as needed, with
                    no predefined limitations.
                  </p>
                </span>
              </li>

              <li className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span>
                  <strong className="font-medium">
                    Built-in Authentication
                  </strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Stop reinventing user auth flows – use the built-in
                    JWT-based auth system instead.
                  </p>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;

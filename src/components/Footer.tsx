
import NebulaLogo from '@/assets/nebula-logo';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Documentation", href: "#docs" },
        { label: "Changelog", href: "#changelog" },
        { label: "Roadmap", href: "#roadmap" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "#blog" },
        { label: "Tutorials", href: "#tutorials" },
        { label: "Case Studies", href: "#case-studies" },
        { label: "Community", href: "#community" },
        { label: "Status", href: "#status" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Careers", href: "#careers" },
        { label: "Contact", href: "#contact" },
        { label: "Privacy", href: "#privacy" },
        { label: "Terms", href: "#terms" }
      ]
    }
  ];
  
  const socialLinks = [
    { icon: <Twitter size={18} />, label: "Twitter", href: "https://x.com/annanyvishwaka1" },
    { icon: <Github size={18} />, label: "GitHub", href: "https://github.com/Annany2002/nebula-backend" },
    { icon: <Linkedin size={18} />, label: "LinkedIn", href: "https://www.linkedin.com/in/annany-vishwakarma-29b727232" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <NebulaLogo className="mb-6" />
            <p className="text-gray-600 mb-6 max-w-md dark:text-gray-300">
              Nebula is the modern backend as a service platform built for developers who want to focus on creating amazing user experiences instead of managing infrastructure.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((link, i) => (
                <a 
                  key={i}
                  href={link.href} 
                  className="text-gray-500 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20" 
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          {footerSections.map((section, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-800 mb-4 dark:text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a 
                      href={link.href} 
                      className="text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center dark:border-gray-800"
        >
          <p className="text-gray-500 text-sm mb-4 md:mb-0 dark:text-gray-400">
            © {currentYear} Nebula. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-gray-500 hover:text-purple-600 text-sm transition-colors dark:text-gray-400 dark:hover:text-purple-400">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-purple-600 text-sm transition-colors dark:text-gray-400 dark:hover:text-purple-400">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-purple-600 text-sm transition-colors dark:text-gray-400 dark:hover:text-purple-400">Security</a>
            <a href="#" className="text-gray-500 hover:text-purple-600 text-sm transition-colors dark:text-gray-400 dark:hover:text-purple-400">Sitemap</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

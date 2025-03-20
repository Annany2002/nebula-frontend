import { useIntersectionObserver } from '@/lib/animations';
import { Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const Pricing = () => {
  const titleRef = useIntersectionObserver();
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: "Free",
      description: "For personal projects and experiments",
      price: isAnnual ? "0" : "0",
      period: "/month",
      cta: "Start Free",
      highlighted: false,
      features: [
        "1,000 API requests/day",
        "512MB database storage",
        "2 serverless functions",
        "Shared compute resources",
        "Community support"
      ]
    },
    {
      name: "Pro",
      description: "For production applications and teams",
      price: isAnnual ? "49" : "59",
      period: "/month",
      cta: "Start Pro Trial",
      highlighted: true,
      features: [
        "100,000 API requests/day",
        "10GB database storage",
        "Unlimited serverless functions",
        "Dedicated compute resources",
        "Priority support (24-48h)",
        "Custom domains",
        "Monitoring & analytics",
        "Advanced security features"
      ]
    },
    {
      name: "Enterprise",
      description: "For large-scale applications",
      price: "Custom",
      period: "",
      cta: "Contact Sales",
      highlighted: false,
      features: [
        "Unlimited API requests",
        "Unlimited database storage",
        "Dedicated infrastructure",
        "24/7 priority support",
        "SLA guarantees",
        "Advanced security features",
        "Custom integrations",
        "On-premise deployment option",
        "Dedicated account manager"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 relative z-10">
      <div className="container max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100/50 backdrop-blur-sm text-purple-700 text-sm font-medium mb-6 dark:bg-purple-900/40 dark:text-purple-300"
          >
            <span className="mr-2">💎</span>
            Simple Pricing
          </motion.div>
          
          <motion.h2 
            ref={titleRef as React.RefObject<HTMLHeadingElement>}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-300 dark:to-purple-500 animate-gradient-flow"
          >
            Choose the perfect plan for your needs
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg dark:text-gray-300 animate-fade-in"
          >
            Start with our generous free tier and scale as your application grows. No surprise fees or hidden costs.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8 inline-flex p-1 bg-purple-100/50 backdrop-blur-sm rounded-full dark:bg-purple-900/40"
          >
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                isAnnual 
                  ? 'bg-white/70 backdrop-blur-sm text-purple-700 shadow-sm dark:bg-purple-700 dark:text-white' 
                  : 'text-purple-600 dark:text-purple-300'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annual (Save 20%)
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual 
                  ? 'bg-white/70 backdrop-blur-sm text-purple-700 shadow-sm dark:bg-purple-700 dark:text-white' 
                  : 'text-purple-600 dark:text-purple-300'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className={`rounded-2xl overflow-hidden ${
                plan.highlighted 
                  ? 'glass ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 dark:ring-purple-600 shadow-xl animate-pulse-subtle' 
                  : 'glass border border-purple-100/20 dark:border-purple-800/30'
              }`}
            >
              <div className="p-8">
                <div className="min-h-[120px]">
                  {plan.highlighted && (
                    <Badge className="bg-purple-100/70 backdrop-blur-sm text-purple-700 hover:bg-purple-200 mb-4 dark:bg-purple-900/70 dark:text-purple-300 dark:hover:bg-purple-800 animate-pulse-subtle">
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 dark:text-white animate-fade-in">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 dark:text-gray-300 animate-fade-in" style={{animationDelay: "0.1s"}}>{plan.description}</p>
                  
                  <div className="flex items-baseline mb-6 animate-fade-in" style={{animationDelay: "0.2s"}}>
                    {plan.price === "Custom" ? (
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">Custom</span>
                    ) : (
                      <>
                        <span className="text-gray-800 mr-1 dark:text-white">$</span>
                        <span className="text-4xl font-bold text-gray-800 dark:text-white">{plan.price}</span>
                        <span className="text-gray-600 ml-2 dark:text-gray-300">{plan.period}</span>
                      </>
                    )}
                  </div>
                  
                  <button 
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all animate-fade-in ${
                      plan.highlighted 
                        ? 'bg-purple-600/90 backdrop-blur-sm hover:bg-purple-700 text-white shadow-md shadow-purple-200 dark:shadow-purple-900/20' 
                        : 'bg-white/30 backdrop-blur-sm border border-purple-300/50 text-purple-700 hover:bg-purple-50/50 dark:bg-transparent dark:border-purple-700/50 dark:text-purple-300 dark:hover:bg-purple-900/20'
                    }`}
                    style={{animationDelay: "0.3s"}}
                  >
                    {plan.cta}
                  </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-purple-100/30 dark:border-purple-800/30">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start animate-slide-in-left" style={{animationDelay: `${i * 0.05 + 0.4}s`}}>
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 ml-3 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 glass rounded-xl p-8 flex flex-col md:flex-row items-center justify-between border border-purple-100/20 dark:border-purple-800/30"
        >
          <div className="flex items-start md:items-center mb-6 md:mb-0">
            <div className="bg-amber-100/70 backdrop-blur-sm p-3 rounded-lg text-amber-600 mr-4 dark:bg-amber-900/30 dark:text-amber-300 animate-pulse-subtle">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 dark:text-white">Not sure which plan is right?</h3>
              <p className="text-gray-600 max-w-lg dark:text-gray-300">
                Our team can help you choose the perfect plan for your specific needs and provide a custom demo.
              </p>
            </div>
          </div>
          <button className="bg-gray-100/70 backdrop-blur-sm hover:bg-gray-200/70 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap dark:bg-gray-700/70 dark:hover:bg-gray-600/70 dark:text-white animate-fade-in">
            Contact Sales
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;

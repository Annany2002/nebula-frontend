import { useEffect, useRef } from "react";

export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    const element = elementRef.current;
    if (element) {
      element.classList.add("opacity-100");
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return elementRef;
};

// export const useSequentialAnimation = (delay = 100, options = {}) => {
//   const containerRef = useRef<HTMLElement | null>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           const container = entry.target;
//           const items = Array.from(container.children);

//           items.forEach((item, index) => {
//             setTimeout(() => {
//               (item as HTMLElement).style.opacity = "1";
//               (item as HTMLElement).style.transform = "translateY(0)";
//             }, delay * index);
//           });

//           observer.unobserve(container);
//         }
//       },
//       {
//         threshold: 0.1,
//         ...options,
//       }
//     );

//     const container = containerRef.current;
//     if (container) {
//       Array.from(container.children).forEach((item) => {
//         (item as HTMLElement).style.opacity = "0";
//         (item as HTMLElement).style.transform = "translateY(20px)";
//         (
//           item as HTMLElement
//         ).style.transition = `opacity 0.5s ease, transform 0.5s ease`;
//       });

//       observer.observe(container);
//     }

//     return () => {
//       if (container) {
//         observer.unobserve(container);
//       }
//     };
//   }, [delay, options]);

//   return containerRef;
// };

export const useSequentialAnimation = (delay = 100, options = {}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const items = Array.from(container.children);

          items.forEach((item, index) => {
            setTimeout(() => {
              (item as HTMLElement).style.opacity = "1";
              (item as HTMLElement).style.transform = "translateY(0)";
            }, delay * index);
          });

          observer.unobserve(container);
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    const container = containerRef.current;
    if (container) {
      // Immediately hide elements via inline style
      Array.from(container.children).forEach((item) => {
        const el = item as HTMLElement;
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
      });

      observer.observe(container);
    }

    return () => {
      if (container) observer.unobserve(container);
    };
  }, [delay, options]);

  return containerRef;
};

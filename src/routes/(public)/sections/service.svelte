<script lang="ts">
  import AnimatedCard from '$lib/components/animatedCards.svelte';
  
    // All service data with modal content
    const servicesData = [
      {
        // Card data
        title: 'Cross Platform Development',
        description: 'Using Flutter, your Ideas reach the world.',
        buttonText: 'Know about more',
        animationColor: '#4285F4',
        shapeType: 'blob',
        // Modal data
        modalData: {
          title: 'Cross Platform Development',
          subtitle: 'Deliver apps that work everywhere with Flutter.',
          description: 'I specialize in building beautiful, performant mobile applications using Flutter, Google\'s cross-platform UI toolkit. With a single codebase, I deploy apps to both Android and iOS—reducing development time and cost, while ensuring native performance and pixel-perfect design.',
          tools: [
            'Flutter & Dart – Core for UI and logic',
            'Firebase – For backend, auth, and real-time database',
            'Hive – Local storage to support offline functionality',
            'Riverpod / Provider – State management solutions',
            'CI/CD – Fastlane, GitHub Actions for continuous delivery',
            'Play Store / App Store – Publishing and update workflows'
          ],
          icon: '📱'
        }
      },
      {
        title: 'Web Development',
        description: 'Build dynamic and engaging web experiences that shine.',
        buttonText: 'Know about more',
        animationColor: '#EA4335',
        shapeType: 'hexagon',
        modalData: {
          title: 'Web Development',
          subtitle: 'Scalable, responsive websites that grow with you.',
          description: 'Whether it\'s a dynamic dashboard, a SaaS platform, or a marketing site, I build web apps that combine aesthetic excellence with high performance. Using frameworks like SvelteKit and backend services like Supabase, I ensure smooth interactivity and blazing speed.',
          tools: [
            'Svelte / SvelteKit – Lightweight, reactive frontend development',
            'Supabase – Postgres-based backend with auth, storage, and real-time features',
            'Tailwind CSS – Fast UI styling with utility-first CSS',
            'Vercel / Netlify – Seamless deployment & CDN optimization',
            'Progressive Web App (PWA) – Offline-ready, mobile-friendly design'
          ],
          icon: '💻'
        }
      },
      {
        title: 'UI/UX Design',
        description: 'Craft beautiful and intuitive user experiences.',
        buttonText: 'Know about more',
        animationColor: '#34A853',
        shapeType: 'circle',
        modalData: {
          title: 'UI/UX Design',
          subtitle: 'Intuitive design that delights users and drives results.',
          description: 'From wireframes to fully responsive mockups, I prioritize user empathy and clean design. Whether building mobile apps or web interfaces, I use tools and patterns that ensure clarity, consistency, and conversion.',
          philosophy: [
            'Mobile-first and accessible',
            'Clear navigation and consistent components',
            'Feedback loops like loading states, error handling, and animations'
          ],
          tools: [
            'Figma – Rapid prototyping and collaboration',
            'Material 3 / Cupertino Widgets – For platform-adaptive UI in Flutter',
            'Tailwind CSS + Component Libraries – Scalable web design'
          ],
          icon: '🎨'
        }
      },
      {
        title: 'Deployment Services',
        description: 'Seamlessly launch your apps, from concept to app stores.',
        buttonText: 'Know about more',
        animationColor: '#FBBC05',
        shapeType: 'wave',
        modalData: {
          title: 'Deployment Services',
          subtitle: 'From dev to store—fast, smooth, and secure.',
          description: 'I take care of deployment pipelines, app store submissions, web hosting, and release automation. Whether you\'re launching your first MVP or pushing weekly updates, I streamline the journey from build to production.',
          services: [
            'Mobile Deployments: Play Store & App Store (including signing, versioning, A/B tests)',
            'Web Hosting: Vercel, Netlify, Firebase Hosting',
            'CI/CD: Automated testing, builds, and releases via GitHub Actions or Codemagic',
            'Error Reporting & Analytics: Integration with Sentry, Firebase Crashlytics, and Google Analytics'
          ],
          icon: '🚀'
        }
      },
      {
        title: 'Backend Development',
        description: 'Node.js & MongoDB: Power your apps with robust cloud storage.',
        buttonText: 'Know about more',
        animationColor: '#9C27B0',
        shapeType: 'triangle',
        modalData: {
          title: 'Backend Development',
          subtitle: 'Secure and scalable infrastructure that just works.',
          description: 'I build robust backend systems to power your apps using lightweight, scalable stacks. Whether it\'s authentication, data APIs, or cloud storage, I design clean and reliable backend services that grow with your user base.',
          tools: [
            'Node.js + Express – RESTful APIs, business logic',
            'MongoDB – Flexible NoSQL storage',
            'Firebase – Auth, Firestore, Functions',
            'Supabase – Postgres with realtime and storage',
            'JWT & Role-based Access – Secure user flows',
            'Socket.io – Real-time communication'
          ],
          icon: '⚙️'
        }
      },
      {
        title: 'System Design',
        description: 'Everything from system architecture to database design.',
        buttonText: 'Know about more',
        animationColor: '#00BCD4',
        shapeType: 'tree',
        modalData: {
          title: 'System Design',
          subtitle: 'Architecting digital systems from the ground up.',
          description: 'I design scalable architectures that ensure your systems remain fast, reliable, and secure—even as your product grows. From defining clean API contracts to optimizing database schemas, I approach every system like a long-term investment.',
          offerings: [
            'Database Design: Normalized, scalable schemas (Postgres, MongoDB, Firestore)',
            'Cloud Architecture: Firebase, Supabase, or custom servers',
            'Microservices Planning: Separation of concerns, modular services',
            'Security: Auth layers, input validation, and secure deployments',
            'Performance: Caching, pagination, load balancing considerations'
          ],
          icon: '🏗️'
        }
      }
    ];
  </script>
  
  <!-- Services section with relative positioning for modal -->
  <div class="services-page-section">
    <section class="services-main-header-section">
      <div class="section-content-wrapper">
        <h2 class="section-title centered-title">MY SERVICES</h2>
      </div>
    </section>
  
    <section class="services-grid-section">
      <div class="section-content-wrapper">
        <div class="card-grid">
          {#each servicesData as service}
            <AnimatedCard
              title={service.title}
              description={service.description}
              buttonText={service.buttonText}
              animationColor={service.animationColor}
              shapeType={service.shapeType}
              modalData={service.modalData}
            />
          {/each}
        </div>
      </div>
    </section>
  </div>
  
  <style>
    .services-page-section {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      width: 100%;
      overflow-x: hidden;
      color: var(--text-color);
      line-height: 1.6;
      padding: 0;
      background-color: var(--bg-primary);
      position: relative; /* Important: This makes the modal position relative to this section */
    }
  
    .section-content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem;
        box-sizing: border-box;
    }
  
    .services-main-header-section {
        padding-top: 2rem;
        padding-bottom: 1rem;
        background-color: var(--bg-primary);
    }
  
    .section-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--text-dark);
      text-align: center;
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding-bottom: 0.5rem;
    }
  
    .centered-title {
      font-size: 1.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1.5rem;
      color: var(--text-dark);
      position: relative;
      display: block;
      margin: 0 auto 1.5rem auto;
      padding-bottom: 0.5rem;
      width: fit-content;
    }
  
    .centered-title::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background-color: var(--svelte-orange);
        border-radius: 2px;
    }
  
    .services-grid-section {
      padding: 1.5rem 0 3rem 0;
      background-color: var(--bg-primary);
    }
  
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      place-items: center;
      max-width: 100%;
    }
  
    /* Responsive adjustments */
    @media (min-width: 768px) {
      .section-content-wrapper {
            padding: 0 2rem;
       }
  
      .services-main-header-section {
          padding-top: 3rem;
          padding-bottom: 1.5rem;
      }
      .centered-title {
          font-size: 1.8rem;
          margin-bottom: 2rem;
      }
  
      .services-grid-section {
          padding: 2.5rem 0;
      }
      .card-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 2.5rem;
      }
    }
  
    @media (min-width: 1300px) {
         .section-content-wrapper {
              padding: 0 0rem;
         }
  
        .services-main-header-section {
            padding-top: 4rem;
            padding-bottom: 2rem;
        }
        .centered-title {
            font-size: 2.5rem;
            margin-bottom: 2.5rem;
        }
  
        .services-grid-section {
            padding: 3.5rem 0;
        }
        .card-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 3rem;
        }
    }
  
     @media (min-width: 1400px) {
         .section-content-wrapper {
             max-width: 1300px;
         }
         .centered-title {
            font-size: 2.5rem;
            margin-bottom: 2.5rem;
        }
  }
  </style>
  
import { PageTransition } from '../components/layout/PageTransition';
import { Hero } from '../components/landing/Hero';
import { ServiceTicker } from '../components/landing/ServiceTicker';
import { CategoryGrid } from '../components/landing/CategoryGrid';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FeaturedWorkers } from '../components/landing/FeaturedWorkers';
import { RecentJobs } from '../components/landing/RecentJobs';
import { CTABanner } from '../components/landing/CTABanner';

export default function Landing() {
  return (
    <PageTransition>
      <Hero />
      <ServiceTicker />
      <CategoryGrid />
      <HowItWorks />
      <FeaturedWorkers />
      <RecentJobs />
      <CTABanner />
    </PageTransition>
  );
}

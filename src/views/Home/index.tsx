import HeroCta from "./mains/HeroCta";
import RecentMatches from "./mains/RecentMatches";
import StatCards from "./mains/StatCards";

/**
 * Home dashboard — hero CTA into the wizard, stat cards, recent match
 * history. Mock: docs/ui-designs/home-dashboard-library/home.html.
 */
const Home = () => (
  <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
    <HeroCta />
    <StatCards />
    <RecentMatches />
  </div>
);

export default Home;

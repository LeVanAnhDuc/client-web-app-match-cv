import PageContainer from "#/components/PageContainer";
import HeroCta from "./mains/HeroCta";
import RecentMatches from "./mains/RecentMatches";
import StatCards from "./mains/StatCards";

/**
 * Home dashboard — hero CTA into the wizard, stat cards, recent match
 * history. Mock: docs/ui-designs/home-dashboard-library/home.html.
 */
const Home = () => (
  <PageContainer className="space-y-6">
    <HeroCta />
    <StatCards />
    <RecentMatches />
  </PageContainer>
);

export default Home;

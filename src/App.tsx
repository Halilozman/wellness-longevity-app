import { Routes, Route, useLocation } from 'react-router-dom';
import { BottomNav, StatusBar } from './components/Layout';
import { ToastProvider } from './components/ui';

import ALZHome from './screens/ALZHome';
import Discover from './screens/Discover';
import Consent from './screens/Consent';
import Assessment from './screens/Assessment';
import ConfirmNeeds from './screens/ConfirmNeeds';
import NeedMap from './screens/NeedMap';
import Recommend from './screens/Recommend';
import ServiceDetail from './screens/ServiceDetail';
import ModuleBuilder from './screens/ModuleBuilder';
import Packages from './screens/Packages';
import Checkout from './screens/Checkout';
import MyNeeds from './screens/MyNeeds';
import MyPlan from './screens/MyPlan';
import Progress from './screens/Progress';
import Profile from './screens/Profile';
import Catalog from './screens/Catalog';
import LifeData from './screens/LifeData';
import Scores from './screens/Scores';
import Permissions from './screens/Permissions';
import SupportTier from './screens/SupportTier';
import HealthOverview from './screens/HealthOverview';
import Fitness from './screens/Fitness';
import Rewards from './screens/Rewards';
import MovementStudio from './screens/studios/MovementStudio';
import MindSleepStudio from './screens/studios/MindSleepStudio';
import FoodStudio from './screens/studios/FoodStudio';
import Community from './screens/studios/Community';

const NO_NAV = [
  '/wl/assessment', '/wl/consent', '/wl/needs/confirm', '/wl/needs/map',
  '/wl/recommend', '/wl/service', '/wl/module-builder', '/wl/packages', '/wl/checkout',
];

export default function App() {
  const loc = useLocation();
  const path = loc.pathname;
  const showNav = path.startsWith('/wl') && !NO_NAV.some((p) => path.startsWith(p));

  return (
    <div className="app-root">
      <div className="phone">
        <StatusBar />
        <ToastProvider>
          <div className={`screen ${showNav ? 'has-nav' : ''}`} key={path.startsWith('/wl/assessment') ? 'assess' : path}>
            <Routes>
              <Route path="/" element={<ALZHome />} />
              <Route path="/wl" element={<Discover />} />
              <Route path="/wl/consent" element={<Consent />} />
              <Route path="/wl/assessment" element={<Assessment />} />
              <Route path="/wl/needs" element={<MyNeeds />} />
              <Route path="/wl/needs/confirm" element={<ConfirmNeeds />} />
              <Route path="/wl/needs/map" element={<NeedMap />} />
              <Route path="/wl/recommend" element={<Recommend />} />
              <Route path="/wl/service/:id" element={<ServiceDetail />} />
              <Route path="/wl/module-builder" element={<ModuleBuilder />} />
              <Route path="/wl/packages" element={<Packages />} />
              <Route path="/wl/checkout/:kind/:id" element={<Checkout />} />
              <Route path="/wl/plan" element={<MyPlan />} />
              <Route path="/wl/progress" element={<Progress />} />
              <Route path="/wl/profile" element={<Profile />} />
              <Route path="/wl/catalog" element={<Catalog />} />
              <Route path="/wl/life-data" element={<LifeData />} />
              <Route path="/wl/scores" element={<Scores />} />
              <Route path="/wl/permissions" element={<Permissions />} />
              <Route path="/wl/support-tier" element={<SupportTier />} />
              <Route path="/wl/health-overview" element={<HealthOverview />} />
              <Route path="/wl/fitness" element={<Fitness />} />
              <Route path="/wl/rewards" element={<Rewards />} />
              <Route path="/wl/studio/movement" element={<MovementStudio />} />
              <Route path="/wl/studio/mind" element={<MindSleepStudio />} />
              <Route path="/wl/studio/food" element={<FoodStudio />} />
              <Route path="/wl/community" element={<Community />} />
              <Route path="*" element={<ALZHome />} />
            </Routes>
          </div>
          {showNav && <BottomNav />}
        </ToastProvider>
      </div>
    </div>
  );
}

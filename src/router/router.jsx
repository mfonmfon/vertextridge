import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from '../page/landingpage/LandingPage';
import Placeholder from '../page/Placeholder';
import Login from '../page/auth/Login';
import Signup from '../page/auth/Signup';
import KYCOnboarding from '../page/onboarding/KYCOnboarding';
import Dashboard from '../page/dashboard/Dashboard';
import DashboardLayout from '../component/DashboardLayout';
import AdminLayout from '../component/AdminLayout';
import Deposit from '../page/finance/Deposit';
import Withdraw from '../page/finance/Withdraw';
import Funds from '../page/finance/Funds';
import Trade from '../page/trade/Trade';
import Markets from '../page/markets/Markets';
import Profile from '../page/profile/Profile';
import CopyTrading from '../page/copytrading/CopyTrading';
import TraderDetail from '../page/copytrading/TraderDetail';
import MyCopies from '../page/copytrading/MyCopies';
import Settings from '../page/settings/Settings';
import AdminDashboard from '../page/admin/AdminDashboard';
import AdminLogin from '../page/admin/AdminLogin';
import AdminUsers from '../page/admin/AdminUsers';
import AdminSettings from '../page/admin/AdminSettings';
import AdminLogs from '../page/admin/AdminLogs';
import AdminDebug from '../page/admin/AdminDebug';
import ProtectedRoute from './ProtectedRoute';

const VERTEX_RIDGE_MARKET_ROUTER = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Signup />,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <KYCOnboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // ═══ Markets ═══
  {
    path: "/markets",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Markets />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // ═══ Copy Trading ═══
  {
    path: "/copy-trading",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <CopyTrading />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/copy-trading/my-copies",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <MyCopies />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/copy-trading/:id",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <TraderDetail />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // ═══ Trade ═══
  {
    path: "/trade",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Trade />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/trade/:assetId",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Trade />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // ═══ Funds / Finance ═══
  {
    path: "/funds",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Funds />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/finance",
    element: <Navigate to="/funds" replace />,
  },
  {
    path: "/finance/deposit",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Deposit />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/finance/withdraw",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Withdraw />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // ═══ Profile / Settings ═══
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // ═══ Admin Routes (No ProtectedRoute - handles auth internally) ═══
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/debug",
    element: <AdminDebug />,
  },
  {
    path: "/admin",
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminLayout>
        <AdminUsers />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <AdminLayout>
        <AdminSettings />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/logs",
    element: (
      <AdminLayout>
        <AdminLogs />
      </AdminLayout>
    ),
  },
  // ═══ Static Pages ═══
  {
    path: "/features",
    element: <Placeholder title="Features" />,
  },
  {
    path: "/about-us",
    element: <Placeholder title="About Us" />,
  },
  {
    path: "/product",
    element: <Placeholder title="Product" />,
  },
  {
    path: "/pricing",
    element: <Placeholder title="Pricing" />,
  },
  {
    path: "/contact",
    element: <Placeholder title="Contact" />,
  },
  {
    path: "/blog",
    element: <Placeholder title="Blog" />,
  },
  {
    path: "/blog/:id",
    element: <Placeholder title="Blog Detail" />,
  },
  {
    path: "/terms-of-service",
    element: <Placeholder title="Terms of Service" />,
  },
  {
    path: "/privacy-policy",
    element: <Placeholder title="Privacy Policy" />,
  },
  {
    path: "/faq",
    element: <Placeholder title="FAQ" />,
  },
  {
    path: "/support",
    element: <Placeholder title="Support" />,
  },
  {
    path: "/careers",
    element: <Placeholder title="Careers" />,
  },
  {
    path: "/press",
    element: <Placeholder title="Press" />,
  },
  {
    path: "/investors",
    element: <Placeholder title="Investors" />,
  },
  {
    path: "/partners",
    element: <Placeholder title="Partners" />,
  },
  {
    path: "/affiliates",
    element: <Placeholder title="Affiliates" />,
  },
]);

export default VERTEX_RIDGE_MARKET_ROUTER;
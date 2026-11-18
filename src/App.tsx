import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import HomePage from './pages/Home'
import { Header } from './components/site/Header'
import { Footer } from './components/site/Footer'
import { WishlistProvider } from './components/WishlistProvider'
import { Loader2 } from 'lucide-react'
import { Toaster } from './components/ui/sonner'
import ProtectedRoute from './lib/ProtectedRoute'
import ScrollToTop from './lib/ScrollToTop'
import { ROUTES, LEGACY_REDIRECTS } from './lib/routes'

// Route-level code splitting: each page is downloaded only when it is visited.
const SearchPage = lazy(() => import('./pages/Search'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Signup = lazy(() => import('./pages/Signup'))
const PackagePage = lazy(() => import('./pages/Package'))
const BookPackagePage = lazy(() => import('./pages/BookPackage'))
const BookingInvoicePage = lazy(() => import('./pages/BookingInvoice'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const BecomeAgent = lazy(() => import('./pages/BecomeAgent'))
const Contact = lazy(() => import('./pages/Contact'))
const About = lazy(() => import('./pages/About'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const PricingPolicy = lazy(() => import('./pages/PricingPolicy'))
const AgentRegistration = lazy(() => import('./pages/AgentRegistration'))
const DigiLockerCallback = lazy(() => import('./pages/DigiLockerCallback'))
const Agent = lazy(() => import('./pages/Agent'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminBookings = lazy(() => import('./pages/admin/Bookings'))
const AdminMyPackages = lazy(() => import('./pages/admin/MyPackages'))
const AdminAddListing = lazy(() => import('./pages/admin/AddListing'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminFaqs = lazy(() => import('./pages/admin/Faqs'))
const AdminContacts = lazy(() => import('./pages/admin/Contacts'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminAgents = lazy(() => import('./pages/admin/Agents'))
const AdminPackages = lazy(() => import('./pages/admin/Packages'))
// Named export, so map it to the default export that React.lazy expects.
const ChatBot = lazy(() => import('./components/ChatBot').then((m) => ({ default: m.ChatBot })))
const ReviewPromptDialog = lazy(() =>
  import('./components/reviews/ReviewPromptDialog').then((m) => ({ default: m.ReviewPromptDialog })),
)
const PartnerPromoPopup = lazy(() =>
  import('./components/site/PartnerPromoPopup').then((m) => ({ default: m.PartnerPromoPopup })),
)

// The chatbot is not needed for first paint, so it is mounted (and downloaded) once the browser is idle.
function useAfterIdle(timeoutMs = 3000) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => setReady(true), { timeout: timeoutMs })
      return () => window.cancelIdleCallback(handle)
    }
    const timer = setTimeout(() => setReady(true), timeoutMs)
    return () => clearTimeout(timer)
  }, [timeoutMs])
  return ready
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  const chatReady = useAfterIdle()
  const { pathname } = useLocation()
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/")

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/agent/:id" element={<Agent />} />
          <Route path="/package/:id" element={<PackagePage />} />
          <Route
            path="/package/:id/book"
            element={
              <ProtectedRoute>
                <BookPackagePage />
              </ProtectedRoute>
            }
          />
          <Route path="/wishlist" element={<Navigate to="/profile?tab=wishlist" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/booking/:id/invoice" element={<BookingInvoicePage />}/>
          <Route path={ROUTES.PARTNER} element={<BecomeAgent />} />
          <Route path="/agent-registration" element={<AgentRegistration />} />
          <Route
            path="/agent-registration/digilocker/callback"
            element={
              <ProtectedRoute>
                <DigiLockerCallback />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path={ROUTES.REFUND_POLICY} element={<RefundPolicy />} />
          {LEGACY_REDIRECTS.map(({ from, to }) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="/pricing-policy" element={<PricingPolicy />} />
          <Route path="/admin"
            element={
              <ProtectedRoute roles={["admin", "agent"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={["admin", "agent"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute roles={["admin", "agent"]}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="mypackages"
              element={
                <ProtectedRoute roles={["agent"]}>
                  <AdminMyPackages />
                </ProtectedRoute>
              }
            />
            <Route
              path="packages"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminPackages />
                </ProtectedRoute>
              }
            />
            <Route
              path="add-listing"
              element={
                <ProtectedRoute roles={["admin", "agent"]}>
                  <AdminAddListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit-listing/:id"
              element={
                <ProtectedRoute roles={["admin", "agent"]}>
                  <AdminAddListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute roles={["admin", "agent"]}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="faqs"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminFaqs />
                </ProtectedRoute>
              }
            />
            <Route
              path="contacts"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminContacts />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="agents"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminAgents />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      {chatReady && (
        <div className="print:hidden">
          <Suspense fallback={null}>
            {!isAdminPath && <ChatBot />}
            <ReviewPromptDialog />
            <PartnerPromoPopup />
          </Suspense>
        </div>
      )}
      <WishlistProvider />
      <Toaster position="top-center" />
    </div>
  )
}

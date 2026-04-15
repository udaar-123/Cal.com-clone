import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AvailabilityPage from "./pages/AvailabilityPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import DashboardPage from "./pages/DashboardPage";
import EventTypesPage from "./pages/EventTypesPage";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <DashboardPage />
          </Layout>
        }
      />
      <Route
        path="/event-types"
        element={
          <Layout>
            <EventTypesPage />
          </Layout>
        }
      />
      <Route
        path="/availability"
        element={
          <Layout>
            <AvailabilityPage />
          </Layout>
        }
      />
      <Route path="/book/:slug" element={<BookingPage />} />
      <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
    </Routes>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Home from '../pages/Home'
import Tavlingar from '../pages/Tavlingar'
import VaraAktiviteter from '../pages/VaraAktiviteter'
import Bilder from '../pages/Bilder'
import Dokument from '../pages/Dokument'
import Ovrigt from '../pages/Ovrigt'
import Kontakt from '../pages/Kontakt'
import LoggaIn from '../pages/LoggaIn'
import Medlem from '../pages/Medlem'
import Admin from '../pages/Admin'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tavlingar" element={<Tavlingar />} />
          <Route path="/vara-aktiviteter" element={<VaraAktiviteter />} />
          <Route path="/bilder" element={<Bilder />} />
          <Route path="/dokument" element={<Dokument />} />
          <Route path="/ovrigt" element={<Ovrigt />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/logga-in" element={<LoggaIn />} />
          <Route
            path="/medlem"
            element={
              <ProtectedRoute>
                <Medlem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

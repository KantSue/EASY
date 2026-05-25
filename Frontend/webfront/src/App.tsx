import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login             from './pages/login';
import FileAttente       from './pages/agents/file_attente';
import Detail            from './pages/agents/Detail';
import Profil            from './pages/Profil';
import Archives          from './pages/Archives';
import DetailActe        from './pages/DetailActe';
import MotDePasseOublie  from './pages/MotDePasseOublier';
import Historique from './pages/agents/Historiques'
import AdminDashboard from './pages/admin/dashboard';
import AdminCitoyens  from './pages/admin/Citoyens';
import AdminAgents    from './pages/admin/Agents';
import AdminCommunes  from './pages/admin/Communes';
import CitoyenAccueil       from './pages/citoyens/Accueil';
import CitoyenDemande       from './pages/citoyens/Demande';
import CitoyenSuivi         from './pages/citoyens/Suivi';
import CitoyenArrondissements from './pages/citoyens/Arrondissement';
import Register from './pages/register';

// Dans Routes :
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Navigate to="/login" />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/register"             element={<Register />} />
        <Route path="/agent/file-attente"  element={<FileAttente />} />
        <Route path="/agent/detail"        element={<Detail />} />
        <Route path="/profil"              element={<Profil />} />
        <Route path="/archives"            element={<Archives />} />
        <Route path="/archives/:id"        element={<DetailActe />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/agent/historique" element={<Historique />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/citoyens"  element={<AdminCitoyens />} />
        <Route path="/admin/agents"    element={<AdminAgents />} />
        <Route path="/admin/communes"  element={<AdminCommunes />} />


        <Route path="/citoyen/accueil"         element={<CitoyenAccueil />} />
        <Route path="/citoyen/demande"         element={<CitoyenDemande />} />
        <Route path="/citoyen/suivi"           element={<CitoyenSuivi />} />
        <Route path="/citoyen/arrondissements" element={<CitoyenArrondissements />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
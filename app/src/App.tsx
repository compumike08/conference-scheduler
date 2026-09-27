import { BrowserRouter, Routes, Route } from "react-router";
import { SnackbarProvider } from 'notistack';
import Home from './features/home/Home.tsx'
import Header from './shared/Header.tsx';
import About from './features/about/About.tsx';
import Register from './features/register/Register.tsx';
import Login from './features/login/Login.tsx';
import Logout from "./features/logout/Logout.tsx";
import Member from "./features/member/Member.tsx";

import "./App.css";
import { useAppSelector, type RootState } from "./app/store.ts";
import { UserRole } from "./constants/userConstants.ts";
import { ProtectedRoute } from "./shared/ProtectedRoute.tsx";
import AdminDashboard from "./features/admin/AdminDashboard.tsx";
import EditUserRoles from "./features/admin/user/EditUserRoles.tsx";

const App = () => {
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const { roles = [] } = currentUser ?? {};
  const isAdminUser = roles.includes(UserRole.ROLE_ADMIN);

  return (
    <BrowserRouter>
      <SnackbarProvider maxSnack={3} classes={{
        root: 'notification-font'
      }}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/member" element={<Member />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAdminUser}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user/:userUuid"
            element={
              <ProtectedRoute isAuthenticated={isAdminUser}>
                <EditUserRoles />
              </ProtectedRoute>
            }
          />
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  )
};

export default App;

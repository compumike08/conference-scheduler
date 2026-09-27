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

const App = () => {
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
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  )
};

export default App;

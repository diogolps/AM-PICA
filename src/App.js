import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import { auth, firestore } from "./firebase";
import RegisterPage from "./pages/RegisterPage";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { email } = user;
        const adminEmail = "admin@admin.pt";

        setIsAdmin(email === adminEmail);
        setLoggedIn(true);
      } else {
        setIsAdmin(false);
        setLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={
              loggedIn ? (
                isAdmin ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/user" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={<LoginPage setLoggedIn={setLoggedIn} />}
          />
          <Route
            path="/user"
            element={<UserPage setLoggedIn={setLoggedIn} />}
          />
          <Route
            path="/admin"
            element={<AdminPage setLoggedIn={setLoggedIn} />}
          />
          <Route path="/registo" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

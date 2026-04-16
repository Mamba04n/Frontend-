import { useState, useEffect, lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fee' }}>
          <h2>React crashed!</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import AppLayout from './layouts/AppLayout';

// Lazy loading para optimizar drásticamente el peso de la página
const Login = lazy(() => import('./pages/Login'));
const Feed = lazy(() => import('./pages/Feed'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Search = lazy(() => import('./pages/Search'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Reports = lazy(() => import('./pages/Reports'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const JoinGroup = lazy(() => import('./pages/JoinGroup'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const Groups = lazy(() => import('./pages/Groups'));

const FallbackLoader = () => (
    <div className="flex justify-center items-center py-20 w-full h-full">
       <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token && !user) {
      setLoadingUser(true);
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/user');
      setUser(data);
    } catch (err) {
      console.error(err);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoadingUser(false);
    }
  };

  if (!token) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <FallbackLoader />
        </div>
      }>
        <Login setToken={setToken} />
      </Suspense>
    );
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <FallbackLoader />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <FallbackLoader />
          </div>
        }>
          <Routes>
            <Route path="/admin/*" element={<AdminDashboard user={user} setToken={setToken} setUser={setUser} />} />
            <Route path="/join/:code" element={<JoinGroup />} />

            <Route path="/" element={<AppLayout user={user} setToken={setToken} setUser={setUser} />}>
              <Route index element={<Feed user={user} />} />
              <Route path="search" element={<Search />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="groups" element={<Groups user={user} />} />            <Route path="groups/:id" element={<GroupDetail user={user} />} />              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
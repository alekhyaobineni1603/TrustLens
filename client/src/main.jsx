import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Landing, AuthPage, Dashboard, NewAnalysis, Report, HistoryPage, Profile, AdminPage } from './pages';
import { Loading } from './components';
import './styles.css';

function Protected({children,admin=false}) {
 const {user,loading}=useAuth();
 if(loading)return <Loading/>;
 if(!user)return <Navigate to="/login" replace/>;
 if(admin&&user.role!=='ADMIN')return <Navigate to="/app" replace/>;
 return children;
}
function App() {
 return <BrowserRouter><AuthProvider><Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/login" element={<AuthPage mode="login"/>}/>
  <Route path="/register" element={<AuthPage mode="register"/>}/>
  <Route path="/app" element={<Protected><Dashboard/></Protected>}/>
  <Route path="/app/new" element={<Protected><NewAnalysis/></Protected>}/>
  <Route path="/app/report/:id" element={<Protected><Report/></Protected>}/>
  <Route path="/app/history" element={<Protected><HistoryPage/></Protected>}/>
  <Route path="/app/profile" element={<Protected><Profile/></Protected>}/>
  <Route path="/app/admin" element={<Protected admin><AdminPage/></Protected>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></AuthProvider></BrowserRouter>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);

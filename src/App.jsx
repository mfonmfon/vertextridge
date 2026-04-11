import { RouterProvider } from 'react-router-dom';
import VERTEX_RIDGE_MARKET_ROUTER from './router/router';
import CustomCursor from './component/CustomCursor';
import { UserProvider } from './context/UserContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <CustomCursor />
        <RouterProvider router={VERTEX_RIDGE_MARKET_ROUTER} />
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

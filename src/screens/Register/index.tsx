import { Navigate } from 'react-router-dom'

// Registration via email+password replaced by OTP — new users complete
// their profile in ProfileScreen after first login.
export function RegisterScreen() {
  return <Navigate to="/login" replace />
}

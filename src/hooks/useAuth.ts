import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  email: string;
}

export function useAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userData: UserData = {
        id: session.user.id as string,
        email: session.user.email as string,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('userData');
    }
  }, [session, status]);

  const getUserData = (): UserData | null => {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  };

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    userData: getUserData(),
  };
} 
import { auth } from '@/auth'; // Ensure you import auth
import { redirect } from 'next/navigation'; // Ensure you import redirect

const Home = async () => {
  const session = await auth(); // Fetch the session
  // console.log('Session:', session); // Log the session value
  if (!session) {
    return redirect('/sign-in'); // Redirect to sign-in if no session
  } else {
    return redirect('./dashboard'); // Redirect to dashboard if session exists
  }
};

export default Home;
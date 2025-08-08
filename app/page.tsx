import { redirect } from 'next/navigation'; // Ensure you import redirect

const Home = async () => {
    return redirect('./dashboard');
};
export default Home;
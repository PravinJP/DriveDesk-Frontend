import Navbar from "../components/Navbar";
import "../index.css";
const Home = () => {
  return (
    <div className="home-bg overflow-x-hidden">
      <Navbar />

      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1
          className="font-bold
 text-6xl text-[#3e4753]"
        >
          Welcome to DriveDesk
        </h1>
        <p className=" text-[#303a46] text-[22px]">
          A Unified Placement Management Platform
        </p>
        <p className="text-[16px] text-[#303a46] max-w-2xl text-center">
          Empowering students and coordinators, our platform simplifies place{" "}
          <br />
          ment processes, assists in job opportunities, and enables <br />{" "}
          online tests with proctoring services.
        </p>
        <button className="bg-[#fbd9b2] text-[#1F1F1F] px-6 py-3 rounded-md text-lg font-semibold hover:bg-[#3e4753] hover:text-white transition duration-300">
  Get Started
</button>

      </div>
    </div>
  );
};

export default Home;

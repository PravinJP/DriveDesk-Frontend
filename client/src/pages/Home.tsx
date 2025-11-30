import { motion } from "framer-motion";
import { 
  FaRocket, FaUsers, FaClipboardCheck, FaShieldAlt, 
  FaArrowRight, FaBriefcase, FaLaptopCode, FaChartLine,
  FaBell, FaCheckCircle, FaUserGraduate, FaChalkboardTeacher,
  FaFileAlt, FaVideo, FaLock
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../index.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #3b82f6 1px, transparent 1px),
              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Animated Dots */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * 1000,
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * 1000],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-blue-500 rounded-full"
          />
        ))}

        {/* Floating Shapes */}
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-20 h-20 border-4 border-blue-300/30 rounded-lg"
        />

        <motion.div
          animate={{ y: [0, 40, 0], rotate: [0, -180, -360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-16 h-16 border-4 border-indigo-300/30 rounded-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-blue-200 bg-white/80 backdrop-blur-sm shadow-lg"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-700">
                🎓 Your Complete Placement Solution
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Transform Your Campus
              </span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Placement Process
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="absolute -bottom-2 left-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl font-semibold text-slate-700"
            >
              Streamline Placements | Conduct Tests | Track Progress - All in One Platform
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              Say goodbye to endless WhatsApp chats and scattered information. DriveDesk brings 
              coordinators, students, and companies together on a unified platform with real-time 
              updates, online assessments, and proctored testing.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-blue-500/50 hover:shadow-2xl transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Register Now
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <FaArrowRight />
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white/80 backdrop-blur-sm rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 hover:border-blue-300 text-slate-700"
              >
                Login
              </motion.button>
            </motion.div>

            {/* Key Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-16"
            >
              {[
                { 
                  icon: FaBriefcase, 
                  title: "Easy Registration", 
                  description: "One-click interest registration",
                  gradient: "from-blue-400 to-blue-600" 
                },
                { 
                  icon: FaBell, 
                  title: "Real-time Updates", 
                  description: "No more endless WhatsApp scrolling",
                  gradient: "from-indigo-400 to-indigo-600" 
                },
                { 
                  icon: FaLaptopCode, 
                  title: "Online Tests", 
                  description: "Conduct coding assessments",
                  gradient: "from-purple-400 to-purple-600" 
                },
                { 
                  icon: FaVideo, 
                  title: "Proctored Testing", 
                  description: "Secure exam environment",
                  gradient: "from-pink-400 to-pink-600" 
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-lg"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}
                    >
                      <feature.icon className="text-2xl" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-slate-800">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  How DriveDesk Works
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Simple, efficient, and designed for your campus placement needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  icon: FaChalkboardTeacher,
                  title: "Coordinator Posts Drive",
                  description: "Placement coordinator uploads company details and creates a registration form. Students get instant notifications.",
                  color: "blue"
                },
                {
                  step: "2",
                  icon: FaUserGraduate,
                  title: "Students Register",
                  description: "Students view company details and register their interest with one click. All data organized in one place.",
                  color: "indigo"
                },
                {
                  step: "3",
                  icon: FaClipboardCheck,
                  title: "Conduct Assessments",
                  description: "Create coding tests, MCQs, or custom assessments. Students take tests with built-in proctoring for authenticity.",
                  color: "purple"
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-300 transition-all shadow-lg"
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {item.step}
                  </div>

                  <div className={`w-16 h-16 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                    <item.icon className="text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features for Different Users */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent to-blue-50/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Built For Everyone
                </span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Coordinators */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-200 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <FaChalkboardTeacher className="text-3xl" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800">For Coordinators</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Post placement drives with company details",
                    "View registered students instantly",
                    "Create and manage online assessments",
                    "Track student progress and results",
                    "Generate reports and analytics",
                    "Manage multiple drives simultaneously"
                  ].map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* For Students */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-indigo-200 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <FaUserGraduate className="text-3xl" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800">For Students</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Browse all placement opportunities",
                    "Register interest with one click",
                    "View detailed company information",
                    "Get real-time notifications",
                    "Take online tests with proctoring",
                    "Track your application status"
                  ].map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Security & Authentication */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl p-12 text-white shadow-2xl"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                  <FaLock className="text-4xl text-blue-300" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Secure & Authenticated</h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Every user is authenticated with unique IDs. Admins control access for coordinators and students.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: FaShieldAlt,
                    title: "Role-Based Access",
                    description: "Separate portals for admin, coordinators, and students"
                  },
                  {
                    icon: FaLock,
                    title: "Secure Login",
                    description: "Unique IDs for teachers and students"
                  },
                  {
                    icon: FaVideo,
                    title: "Proctored Tests",
                    description: "AI-powered monitoring during assessments"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl mb-4">
                      <item.icon className="text-3xl text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-slate-300">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "100%", label: "Organized Data" },
                { number: "0", label: "WhatsApp Chaos" },
                { number: "Real-time", label: "Updates" },
                { number: "Secure", label: "Testing" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg"
                >
                  <h4 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </h4>
                  <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Revolutionize Your Placements?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join the future of campus recruitment. No more WhatsApp chaos, just organized excellence.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-blue-600 rounded-2xl text-lg font-bold shadow-lg hover:shadow-2xl transition-all"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Home;

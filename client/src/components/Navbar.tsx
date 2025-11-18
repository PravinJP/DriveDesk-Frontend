import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <div className="absolute top-4 left-4 w-full flex items-center justify-between pr-8">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/logo-final.svg"
          alt="DriveDesk Logo"
          className="w-50 h-auto object-contain"
        />
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-6">
        <div
          className="relative group text-lg font-medium cursor-pointer"
          onClick={() => navigate('/')}
        >
          Home
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
        </div>

        <button
          onClick={() => navigate('/signin')}
          className="px-4 py-2 text-lg font-medium border border-[#3e4753] rounded-md hover:bg-[#3e4753] hover:text-white transition duration-300"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}

export default Navbar

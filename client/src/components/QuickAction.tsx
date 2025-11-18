const QuickActions = ({ onCreateTeacher, onCreateStudent }) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 className="text-xl font-semibold mb-4 text-[#1E3A8A]">Quick Actions</h2>
    <div className="flex gap-4">
      <button onClick={onCreateTeacher} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        Create Teacher
      </button>
      <button onClick={onCreateStudent} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
        Create Student
      </button>
    </div>
  </div>
)
export default QuickActions;

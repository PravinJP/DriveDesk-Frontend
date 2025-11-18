const RecentActivity = ({ activity }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4 text-[#1E3A8A]">Recent Activity</h2>
    <ul className="list-disc pl-5 space-y-2 text-gray-700">
      {activity.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
)
export default RecentActivity;

const SummaryCards = ({ stats }) => (
  <div className="grid grid-cols-3 gap-6 mb-8">
    {Object.entries(stats).map(([label, count]) => (
      <div key={label} className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
        <p className="text-2xl font-bold text-[#1E3A8A] mt-2">{count}</p>
      </div>
    ))}
  </div>
)
export default SummaryCards;

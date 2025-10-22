const DashboardCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-700',
        green: 'from-green-500 to-green-700'
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-lg shadow-lg text-white`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <i className={`fas ${icon} text-4xl opacity-30`}></i>
            </div>
        </div>
    );
};

export default DashboardCard;
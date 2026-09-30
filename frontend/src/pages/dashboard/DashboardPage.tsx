function DashboardPage() {
    const stats = [
        {
            title: 'Total Products',
            value: '0',
        },
        {
            title: 'Total Customers',
            value: '0',
        },
        {
            title: 'Total Suppliers',
            value: '0',
        },
        {
            title: 'Total Sales',
            value: '₹0',
        },
        {
            title: 'Total Purchases',
            value: '₹0',
        },
        {
            title: 'Total Expenses',
            value: '₹0',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

                <p className="mt-1 text-sm text-gray-500">Overview of your business performance</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>

                    <p className="mt-4 text-sm text-gray-500">No recent sales available.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Low Stock Products</h2>

                    <p className="mt-4 text-sm text-gray-500">No low stock products available.</p>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
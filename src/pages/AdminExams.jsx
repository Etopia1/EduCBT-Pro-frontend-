import AdminLayout from '../components/AdminLayout';

const AdminExams = () => {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Monitoring</h1>
                    <p className="text-gray-500">View active and scheduled exams.</p>
                </div>

                <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500">Exam monitoring features coming soon.</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminExams;

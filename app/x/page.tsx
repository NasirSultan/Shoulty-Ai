export default function XChannelPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center text-lg font-bold">
            X
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">X (Twitter) Channel</h1>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Your X channel page is available at this route now. You can extend this page with connect, publish,
          and analytics actions just like your Facebook flow.
        </p>
      </div>
    </div>
  );
}

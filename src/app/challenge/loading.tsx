export default function ChallengeLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded mx-auto" />
        <div className="h-4 w-80 bg-gray-200 rounded mx-auto" />
        <div className="mt-8 w-full max-w-lg mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm h-48" />
        </div>
      </div>
    </div>
  );
}

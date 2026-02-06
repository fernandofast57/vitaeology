export default function AssessmentLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto" />
        <div className="h-4 w-72 bg-gray-200 rounded mx-auto" />
        <div className="mt-8 space-y-3 max-w-md mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

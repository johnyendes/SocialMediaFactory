export default function SimplePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Market Intelligence</h1>
      <p className="text-lg mb-6">This is a working version without complex components.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-600">Market data and insights dashboard</p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Research</h2>
          <p className="text-gray-600">AI-powered market research tools</p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Integration</h2>
          <p className="text-gray-600">Connect your data sources</p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Personalization</h2>
          <p className="text-gray-600">Customized market intelligence</p>
        </div>
      </div>
    </div>
  )
}
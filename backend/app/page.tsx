export default function RootPage() {
  return Response.json({
    message: 'Social Media Factory API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      agent: '/api/agent/*',
      admin: '/api/admin/*',
    },
    status: 'operational'
  });
}
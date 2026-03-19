import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  
  // Generate SAML auth request URL
  const authRequestUrl = `${process.env.NEXTAUTH_URL}/api/auth/saml/${provider}`;
  
  // Create HTML form for SAML POST
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to ${provider.toUpperCase()} SSO...</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; }
        .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .spinner { border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>Redirecting to ${provider.toUpperCase()} SSO...</h2>
        <p>You will be automatically redirected to authenticate.</p>
        <form id="samlForm" method="POST" action="${authRequestUrl}">
          <input type="hidden" name="SAMLRequest" value="" />
          <input type="hidden" name="RelayState" value="${request.nextUrl.searchParams.get('callbackUrl') || '/dashboard'}" />
        </form>
      </div>
      <script>
        // Auto-submit the form
        setTimeout(() => {
          document.getElementById('samlForm').submit();
        }, 1000);
      </script>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    }
  });
}
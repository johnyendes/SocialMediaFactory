import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Health check endpoints
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      services: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        external_apis: await checkExternalAPIs()
      }
    }

    // Check if any service is unhealthy
    const isHealthy = Object.values(checks.services).every(
      service => service.status === 'healthy'
    )

    return NextResponse.json(checks, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    )
  }
}

async function checkDatabase() {
  try {
    // In production, this would check actual database connection
    // For now, simulate database check
    return {
      status: 'healthy',
      responseTime: '5ms',
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkRedis() {
  try {
    // In production, this would check actual Redis connection
    // For now, simulate Redis check
    return {
      status: 'healthy',
      responseTime: '2ms',
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkExternalAPIs() {
  try {
    // Check critical external APIs
    const apiChecks = {
      openai: await checkAPI('https://api.openai.com/v1/models'),
      alphaVantage: await checkAPI('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT')
    }

    const allHealthy = Object.values(apiChecks).every(
      api => api.status === 'healthy'
    )

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      apis: apiChecks,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkAPI(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      responseTime: response.headers.get('x-response-time') || 'N/A'
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
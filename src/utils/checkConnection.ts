import { projectId, publicAnonKey } from './supabase/info';

interface ConnectionStatus {
  success: boolean;
  message: string;
  details?: {
    projectId: string;
    hasAnonKey: boolean;
    healthCheckPassed: boolean;
    responseTime?: number;
  };
}

/**
 * Перевіряє з'єднання з Edge Function
 */
export async function checkConnection(): Promise<ConnectionStatus> {
  // Check environment variables
  if (!projectId || !publicAnonKey) {
    return {
      success: false,
      message: 'Missing Supabase configuration. Please check /utils/supabase/info.tsx',
      details: {
        projectId: projectId || 'MISSING',
        hasAnonKey: !!publicAnonKey,
        healthCheckPassed: false,
      },
    };
  }

  // Try health check
  const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/health`;
  const startTime = Date.now();

  try {
    console.log('🔍 Checking connection to:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check passed:', data);
      
      return {
        success: true,
        message: 'Connection successful',
        details: {
          projectId,
          hasAnonKey: true,
          healthCheckPassed: true,
          responseTime,
        },
      };
    } else {
      console.error('❌ Health check failed:', response.status, response.statusText);
      
      return {
        success: false,
        message: `Edge Function responded with ${response.status}: ${response.statusText}`,
        details: {
          projectId,
          hasAnonKey: true,
          healthCheckPassed: false,
          responseTime,
        },
      };
    }
  } catch (error) {
    console.error('❌ Connection check failed:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Cannot reach Edge Function. It may not be deployed yet. Please wait 15-30 seconds and try again, or check Supabase Dashboard → Edge Functions.',
        details: {
          projectId,
          hasAnonKey: true,
          healthCheckPassed: false,
        },
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        projectId,
        hasAnonKey: true,
        healthCheckPassed: false,
      },
    };
  }
}

/**
 * Викликає callback коли з'єднання встановлене
 * Автоматично повторює спробу кожні 2 секунди
 */
export async function waitForConnection(
  onSuccess: () => void,
  onError: (message: string) => void,
  maxAttempts: number = 5
): Promise<void> {
  let attempts = 0;

  const tryConnect = async () => {
    attempts++;
    console.log(`🔄 Connection attempt ${attempts}/${maxAttempts}`);

    const status = await checkConnection();

    if (status.success) {
      console.log('✅ Connection established');
      onSuccess();
      return true;
    } else {
      console.log(`❌ Attempt ${attempts} failed:`, status.message);
      
      if (attempts >= maxAttempts) {
        onError(status.message);
        return false;
      }

      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return tryConnect();
    }
  };

  await tryConnect();
}

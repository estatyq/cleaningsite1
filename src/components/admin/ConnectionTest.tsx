import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { checkConnection } from '../../utils/checkConnection';
import { toast } from 'sonner@2.0.3';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Check environment variables
    testResults.push({
      name: 'Змінні середовища',
      status: projectId && publicAnonKey ? 'success' : 'error',
      message: projectId && publicAnonKey 
        ? `✅ Project ID: ${projectId.substring(0, 8)}...`
        : '❌ Project ID або Anon Key відсутні'
    });

    // Test 2: Connection check using utility
    const connectionStatus = await checkConnection();
    testResults.push({
      name: 'З\'єднання з Edge Function',
      status: connectionStatus.success ? 'success' : 'error',
      message: connectionStatus.success 
        ? `✅ Відповідь отримано за ${connectionStatus.details?.responseTime}ms`
        : `❌ ${connectionStatus.message}`
    });

    // Only continue if connection is successful
    if (!connectionStatus.success) {
      setResults(testResults);
      setTesting(false);
      toast.error('Edge Function недоступна. Перевірте Supabase Dashboard.');
      return;
    }

    // Test 3: Orders endpoint (without password - should fail)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/orders`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 401) {
        testResults.push({
          name: 'Авторизація',
          status: 'success',
          message: '✅ Захист паролем працює (401 Unauthorized)'
        });
      } else {
        testResults.push({
          name: 'Авторизація',
          status: 'error',
          message: `⚠️ Неочікуваний статус: ${response.status}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Авторизація',
        status: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Невідома помилка'}`
      });
    }

    // Test 4: Orders with password
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/orders`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
            'X-Admin-Password': 'admin123'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'Orders API',
          status: 'success',
          message: `✅ API працює (замовлень: ${data.data?.length || 0})`
        });
      } else {
        testResults.push({
          name: 'Orders API',
          status: 'error',
          message: `❌ HTTP ${response.status}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Orders API',
        status: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Невідома помилка'}`
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border">
      <CardHeader>
        <CardTitle>Тест з'єднання</CardTitle>
        <CardDescription>
          Перевірте підключення до Edge Function та API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Тестування...
            </>
          ) : (
            'Запустити тести'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2 pt-4">
            {results.map((result, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border"
              >
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{result.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Результат:</span>
              <Badge variant={
                results.every(r => r.status === 'success') ? 'default' : 'destructive'
              }>
                {results.every(r => r.status === 'success') 
                  ? '✅ Всі тести пройдені'
                  : '⚠️ Є помилки'
                }
              </Badge>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2">
          <p>💡 Підказки:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Всі тести мають бути зеленими ✅</li>
            <li>Якщо є помилки - перегляньте консоль (F12)</li>
            <li>Переконайтесь що Edge Function запущена</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

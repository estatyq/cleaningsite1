import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ShoppingCart, 
  Loader2, 
  Trash2, 
  Search,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Filter,
  RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getOrders, updateOrderStatus, deleteOrder } from '../../utils/api';
import { checkConnection } from '../../utils/checkConnection';
import { PasswordResetBanner } from './PasswordResetBanner';

interface OrdersManagerProps {
  password: string;
}

interface Order {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: 'new' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

const STATUS_LABELS = {
  'new': 'Нове',
  'in-progress': 'В роботі',
  'completed': 'Виконано'
};

const STATUS_COLORS = {
  'new': 'bg-accent/20 text-accent border-accent/30',
  'in-progress': 'bg-primary/20 text-primary border-primary/30',
  'completed': 'bg-green-500/20 text-green-500 border-green-500/30'
};

export function OrdersManager({ password }: OrdersManagerProps) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Log password on mount and when it changes
  useEffect(() => {
    console.log('👤 OrdersManager received password:', password ? `"${password}" (length: ${password.length})` : 'EMPTY');
  }, [password]);

  // Load orders when password becomes available
  useEffect(() => {
    console.log('🚀 OrdersManager password effect triggered, password:', password ? `"${password}"` : 'EMPTY');
    if (password) {
      console.log('✅ Password available, loading orders...');
      loadOrders();
    } else {
      console.warn('⚠️ Password not available, skipping loadOrders');
    }
  }, [password]); // Reload when password changes

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading orders...');
      console.log('🔐 Password present:', !!password);
      console.log('🔐 Password value:', password ? `"${password}"` : 'EMPTY');
      console.log('🔐 Password length:', password?.length || 0);
      
      if (!password) {
        console.error('❌ Load orders failed: password is empty');
        throw new Error('Пароль відсутній. Вийдіть та увійдіть знову.');
      }
      
      console.log('✅ Password validated, proceeding...');

      // Check connection first
      console.log('🔍 Checking connection to Edge Function...');
      const connectionStatus = await checkConnection();
      
      if (!connectionStatus.success) {
        throw new Error(
          `Edge Function недоступна: ${connectionStatus.message}\n\n` +
          `Перевірте:\n` +
          `1. Supabase Dashboard → Edge Functions → server\n` +
          `2. Статус має бути "Active"\n` +
          `3. Якщо функція відсутня, вона створюється автоматично - зачекайте 30 секунд`
        );
      }

      console.log('✅ Connection OK, fetching orders...');
      const effectivePassword = password || sessionStorage.getItem('adminPassword') || '';
      console.log('🔐 Using password:', effectivePassword ? `"${effectivePassword}"` : 'EMPTY');
      const response = await getOrders(effectivePassword);
      console.log('📦 Orders response:', response);
      
      if (response.data) {
        setOrders(response.data);
        console.log(`Loaded ${response.data.length} orders`);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      
      // Check if it's an unauthorized error
      if (error instanceof Error && error.name === 'UnauthorizedError') {
        setError('UNAUTHORIZED');
        // Don't show duplicate toast - the error handler already showed one
        // Just trigger logout
        window.dispatchEvent(new Event('unauthorized'));
      } else {
        setError(errorMessage);
        toast.error(`Помилка завантаження: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [password]); // Add password as dependency

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.name.toLowerCase().includes(query) ||
        order.phone.includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.service.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(password, orderId, newStatus);
      toast.success('Статус оновлено!');
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Помилка оновлення статусу');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це замовлення?')) {
      return;
    }

    try {
      await deleteOrder(password, orderId);
      toast.success('Замовлення видалено!');
      loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Помилка видалення замовлення');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusStats = () => {
    return {
      total: orders.length,
      new: orders.filter(o => o.status === 'new').length,
      inProgress: orders.filter(o => o.status === 'in-progress').length,
      completed: orders.filter(o => o.status === 'completed').length
    };
  };

  const stats = getStatusStats();

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Завантаження замовлень...</p>
      </div>
    );
  }

  if (error && !loading) {
    // Special handling for unauthorized error
    if (error === 'UNAUTHORIZED') {
      return (
        <Card className="bg-card/50 backdrop-blur-sm border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto animate-pulse">
                <span className="text-4xl">🔒</span>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-destructive mb-3">
                  Доступ заборонено
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Ви ввели неправильний пароль адміністратора. 
                </p>
                <p className="text-sm text-foreground max-w-md mx-auto">
                  Будь ласка, зачекайте - ви будете автоматично переспрямовані на сторінку входу...
                </p>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-5 text-center max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  Використовуйте пароль адміністратора для доступу до панелі управління
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Переспрямування...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Regular error handling
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Не вдалося підключитися до Edge Function
              </h3>
              <div className="bg-background/50 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-line text-left">
                  {error}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={loadOrders} className="neon-glow" size="lg">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Спробувати ще раз
              </Button>

              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-left max-w-2xl mx-auto">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <span>💡</span>
                  Швидке виправлення:
                </h4>
                <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Перевірте Supabase Dashboard:</strong>
                    <br />
                    <span className="ml-5">Edge Functions → server → Має бути статус "Active"</span>
                  </li>
                  <li>
                    <strong>Якщо функція "Deploying":</strong>
                    <br />
                    <span className="ml-5">Зачекайте 15-30 секунд та спробуйте знову</span>
                  </li>
                  <li>
                    <strong>Якщо функції немає:</strong>
                    <br />
                    <span className="ml-5">Вона створюється автоматично - зачекайте 30 секунд</span>
                  </li>
                  <li>
                    <strong>Перевірте консоль (F12):</strong>
                    <br />
                    <span className="ml-5">Шукайте червоні помилки для додаткової інформації</span>
                  </li>
                  <li>
                    <strong>Використайте вкладку "Діагностика":</strong>
                    <br />
                    <span className="ml-5">Для детального тестування з'єднання</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всього</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Нових</p>
                  <p className="text-2xl font-bold text-accent">{stats.new}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">В роботі</p>
                  <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                </div>
                <Loader2 className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Виконано</p>
                  <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-500 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <CardTitle>Замовлення клієнтів</CardTitle>
            </div>
            <Button
              onClick={loadOrders}
              variant="outline"
              size="sm"
              className="border-primary/30"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Оновит��
            </Button>
          </div>
          <CardDescription>
            Управління та відстеження всіх замовлень
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Пошук за ім'ям, телефоном, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background/50">
                  <SelectValue placeholder="Фільтр за статусом" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі статуси</SelectItem>
                  <SelectItem value="new">Нові</SelectItem>
                  <SelectItem value="in-progress">В роботі</SelectItem>
                  <SelectItem value="completed">Виконано</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Замовлень не знайдено за вашими критеріями'
                  : 'Поки що немає замовлень'
                }
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background/50">
                    <TableHead>Дата</TableHead>
                    <TableHead>Клієнт</TableHead>
                    <TableHead>Контакти</TableHead>
                    <TableHead>Послуга</TableHead>
                    <TableHead>Повідомлення</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{order.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${order.phone}`} className="hover:text-primary">
                              {order.phone}
                            </a>
                          </div>
                          {order.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${order.email}`} className="hover:text-primary">
                                {order.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/30">
                          {order.service}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {order.message ? (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="w-3 h-3 mt-1 flex-shrink-0" />
                            <span className="line-clamp-2">{order.message}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className={`w-[140px] ${STATUS_COLORS[order.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">🆕 Нове</SelectItem>
                            <SelectItem value="in-progress">⏳ В роботі</SelectItem>
                            <SelectItem value="completed">✅ Виконано</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>💡 <strong>Підказки:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Замовлення автоматично зберігаються при відправці форми на сайті</li>
              <li>Змінюйте статус для відстеження прогресу</li>
              <li>Використовуйте пошук для швидкого знаходження замовлень</li>
              <li>Телефон та email клікабельні для швидкого зв'язку</li>
              <li>Нові замовлення відображаються зверху списку</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

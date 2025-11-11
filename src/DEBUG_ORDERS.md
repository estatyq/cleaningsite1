# Діагностика помилки "Failed to fetch" для замовлень 🔍

## Швидка перевірка

### 1. Перевірте консоль браузера (F12)

Відкрийте консоль і шукайте:

```
✅ Правильно:
Loading orders with password: ***
GET /orders - Request received
Password header present: true
Auth check successful
GET /orders - Found 0 orders

❌ Помилка авторизації:
Loading orders with password: EMPTY
→ Вийдіть і увійдіть знову з паролем admin123

❌ Помилка мережі:
Failed to fetch
→ Edge Function не запущена або недоступна
```

---

## Покрокове виправлення

### Крок 1: Перевірте пароль

**Дія**: Вийдіть з адмінки та увійдіть знову

**Пароль за замовчуванням**: `admin123`

**Перевірка**:
```
1. Адмінка → Вийти
2. Ввести пароль: admin123
3. Натиснути "Увійти"
4. Перевірити консоль: "Password state changed: ***"
```

---

### Крок 2: Перевірте Edge Function

**Симптом**: "Failed to fetch", "TypeError: Failed to fetch"

**Місце**: Supabase Dashboard → Edge Functions → server

**Статус функції**:
- ✅ **Active** - Функція працює
- ⚠️ **Deploying** - Зачекайте 10-15 секунд
- ❌ **Error** - Перегляньте логи

**Команди для перезапуску** (якщо потрібно):
```bash
# Якщо у вас є Supabase CLI
supabase functions deploy server
```

---

### Крок 3: Перевірте URL та змінні

**Перевірте файл**: `/utils/supabase/info.tsx`

```typescript
// Має бути заповнено:
export const projectId = 'your-project-id'
export const publicAnonKey = 'your-anon-key'
```

**Якщо порожнє**:
1. Знайдіть ваш Supabase Project ID
2. Знайдіть ваш Anon Key
3. Оновіть файл

---

### Крок 4: Перевірте CORS

**Симптом**: "CORS policy" error в консолі

**Перевірка** у `/supabase/functions/server/index.tsx`:

```typescript
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Password"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);
```

**Переконайтесь** що `X-Admin-Password` є в `allowHeaders`!

---

## Тестування API вручну

### Тест 1: Health Check

```bash
curl https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-4e0b1fee/health
```

**Очікується**:
```json
{"status":"ok"}
```

---

### Тест 2: Get Orders (з паролем)

```bash
curl -X GET \
  https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-4e0b1fee/orders \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "X-Admin-Password: admin123"
```

**Очікується**:
```json
{
  "success": true,
  "data": []
}
```

**Якщо помилка 401**:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```
→ Неправильний пароль

---

## Логи для відстеження

### На клієнті (консоль браузера):

```javascript
// OrdersManager.tsx
console.log('Loading orders with password:', password ? '***' : 'EMPTY');
console.log('Orders response:', response);
console.log(`Loaded ${response.data.length} orders`);
```

### На сервері (Edge Function logs):

```javascript
// index.tsx
console.log("GET /orders - Request received");
console.log("Password header present:", !!password);
console.log("Auth check successful");
console.log(`GET /orders - Found ${orders.length} orders`);
```

**Де дивитись логи сервера**:
1. Supabase Dashboard
2. Edge Functions → server
3. Вкладка "Logs"
4. Відфільтрувати за останні 15 хвилин

---

## Часті помилки та рішення

### 1. "Password state changed: EMPTY"
**Причина**: Не введений пароль при вході  
**Рішення**: Вийдіть, введіть admin123, увійдіть знову

### 2. "Failed to fetch"
**Причина**: Edge Function не доступна  
**Рішення**: Перевірте Supabase Dashboard, зачекайте 15 сек

### 3. "Unauthorized"
**Причина**: Неправильний пароль  
**Рішення**: Перевірте що ви вводите admin123

### 4. "CORS policy error"
**Причина**: Заголовок X-Admin-Password не дозволений  
**Рішення**: Оновіть allowHeaders на сервері

### 5. Замовлення не зберігаються
**Причина**: Форма на клієнті не відправляє правильно  
**Рішення**: Перевірте ContactForm.tsx → handleSubmit

---

## Контрольний список ✅

- [ ] Пароль правильний (admin123)
- [ ] Edge Function запущена (Supabase Dashboard)
- [ ] Project ID та Anon Key налаштовані
- [ ] CORS headers включають X-Admin-Password
- [ ] Консоль показує логи без помилок
- [ ] Тест curl повертає {"status":"ok"}

---

## Якщо нічого не допомагає

1. **Очистіть кеш браузера** (Ctrl+Shift+Delete)
2. **Перезавантажте Edge Function** (через Dashboard)
3. **Спробуйте в іншому браузері** (Chrome/Firefox)
4. **Перевірте Supabase статус** (https://status.supabase.com)
5. **Перегляньте всі логи** (клієнт + сервер)

**Остання надія**:
```bash
# Створіть тестове замовлення вручну через KV store
# В Supabase Dashboard → Database → SQL Editor:

# Це створить тестовий масив замовлень
# (але для KV store потрібно використати функції)
```

---

**Автор**: Debug Guide  
**Дата**: 10 листопада 2025  
**Версія**: 1.0

# Виправлення OrdersManager.tsx

## Проблема

Файл `/components/admin/OrdersManager.tsx` використовує `effectivePassword` який бере пароль з `sessionStorage` замість пароля з `props`.

Є **3 місця** де потрібно виправити:

## Місце 1: loadOrders (рядок 112-114)

### ПЕРЕД:
```typescript
const effectivePassword = password || sessionStorage.getItem('adminPassword') || '';
console.log('🔐 Using password:', effectivePassword ? `\"${effectivePassword}\"` : 'EMPTY');
const response = await getOrders(effectivePassword);
```

### ПІСЛЯ:
```typescript
console.log('🔐 Using password from props:', password ? `\"${password}\"` : 'EMPTY');
const response = await getOrders(password);
```

## Місце 2: handleStatusChange (рядок 166-167)

### ПЕРЕД:
```typescript
const effectivePassword = password || sessionStorage.getItem('adminPassword') || '';
await updateOrderStatus(effectivePassword, orderId, newStatus);
```

### ПІСЛЯ:
```typescript
await updateOrderStatus(password, orderId, newStatus);
```

## Місце 3: handleDelete (рядок 182-183)

### ПЕРЕД:
```typescript
const effectivePassword = password || sessionStorage.getItem('adminPassword') || '';
await deleteOrder(effectivePassword, orderId);
```

### ПІСЛЯ:
```typescript
await deleteOrder(password, orderId);
```

## Швидке виправлення

1. Відкрийте `/components/admin/OrdersManager.tsx`
2. Знайдіть всі входження `effectivePassword` (має бути 3)
3. Замініть кожен блок згідно з інструкціями вище
4. Збережіть файл
5. Очистіть браузер:
   ```javascript
   sessionStorage.clear();
   location.reload();
   ```
6. Увійдіть з паролем `admin123`

## Пошук і заміна (для редакторів коду)

### Заміна 1:
**Знайти:**
```
const effectivePassword = password || sessionStorage.getItem('adminPassword') || '';
      console.log('🔐 Using password:', effectivePassword ? `\"${effectivePassword}\"` : 'EMPTY');
      const response = await getOrders(effectivePassword);
```

**Замінити на:**
```
console.log('🔐 Using password from props:', password ? `\"${password}\"` : 'EMPTY');
      const response = await getOrders(password);
```

### Заміна 2:
**Знайти:**
```
const effectivePassword = password || sessionStorage.getItem('adminPassword') || '';
      await updateOrderStatus(effectivePassword, orderId, newStatus);
```

**Замінити на:**
```
await updateOrderStatus(password, orderId, newStatus);
```

### Заміна 3:
**Знайти:**
```
const effectivePassword = password || sessionStorage.getItem('adminPassword') || '';
      await deleteOrder(effectivePassword, orderId);
```

**Замінити на:**
```
await deleteOrder(password, orderId);
```

## Після виправлення

Файл має містити 0 входжень слова `effectivePassword`.

Перевірте:
```bash
grep -n "effectivePassword" /components/admin/OrdersManager.tsx
```

Має вивести: (порожній результат)

---

**Створено:** 2025-11-10  
**Статус:** Критичне виправлення

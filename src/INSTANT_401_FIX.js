/**
 * 🚨 МИ ТТЄВЕ ВИПРАВЛЕННЯ ПОМИЛКИ 401 
 * 
 * ІНСТРУКЦІЯ:
 * 1. Натисніть F12 (відкрити консоль браузера)
 * 2. Скопіюйте ВСЬ цей файл
 * 3. Вставте в консоль і натисніть Enter
 * 4. Слідуйте інструкціям на екрані
 */

(function() {
  'use strict';
  
  // Стилі для консолі
  const styles = {
    title: 'font-size: 24px; font-weight: bold; color: #ff3333; background: #000; padding: 10px;',
    success: 'color: #33cc33; font-weight: bold;',
    error: 'color: #ff3333; font-weight: bold;',
    warning: 'color: #ffaa33; font-weight: bold;',
    info: 'color: #3399ff; font-weight: bold;',
    code: 'background: #f0f0f0; padding: 2px 6px; border-radius: 3px; color: #333; font-family: monospace;',
  };
  
  console.log('%c🚨 МИТТЄВЕ ВИПРАВЛЕННЯ ПОМИЛКИ 401 UNAUTHORIZED', styles.title);
  console.log('');
  
  // Константи
  const CORRECT_PASSWORD = 'admin123';
  const SESSION_KEY = 'adminPassword';
  
  // Крок 1: Перевірка поточного стану
  console.log('%c═══════════════════════════════════════', styles.info);
  console.log('%cКрок 1: Діагностика', styles.info);
  console.log('%c═══════════════════════════════════════', styles.info);
  console.log('');
  
  const savedPassword = sessionStorage.getItem(SESSION_KEY);
  const localPassword = localStorage.getItem(SESSION_KEY);
  
  console.log('SessionStorage:', savedPassword || '%cВІДСУТНІЙ', styles.warning);
  console.log('LocalStorage:', localPassword || '%cВІДСУТНІЙ', styles.warning);
  console.log('Очікується:', '%c' + CORRECT_PASSWORD, styles.code);
  console.log('');
  
  let hasProblem = false;
  
  if (savedPassword && savedPassword !== CORRECT_PASSWORD) {
    console.log('%c❌ ПРОБЛЕМА: Неправильний пароль в SessionStorage!', styles.error);
    console.log('   Знайдено: "%c' + savedPassword + '%c"', '', styles.error, '');
    console.log('   Очікується: "%c' + CORRECT_PASSWORD + '%c"', '', styles.success, '');
    hasProblem = true;
  }
  
  if (localPassword && localPassword !== CORRECT_PASSWORD) {
    console.log('%c❌ ПРОБЛЕМА: Неправильний пароль в LocalStorage!', styles.error);
    console.log('   Знайдено: "%c' + localPassword + '%c"', '', styles.error, '');
    hasProblem = true;
  }
  
  if (!hasProblem && savedPassword === CORRECT_PASSWORD) {
    console.log('%c✅ Пароль правильний!', styles.success);
    console.log('');
    console.log('%cЯкщо ви все ще бачите помилку 401, проблема не в паролі.', styles.warning);
    console.log('Перевірте:');
    console.log('• Edge Function розгорнута і активна в Supabase');
    console.log('• Файл /components/admin/OrdersManager.tsx, рядок 112');
    console.log('• Логи в Network tab (F12 → Network)');
    return;
  }
  
  if (!hasProblem && !savedPassword) {
    console.log('%c⚠️  Пароль відсутній (це нормально після очищення)', styles.warning);
  }
  
  console.log('');
  
  // Крок 2: Виправлення
  console.log('%c═══════════════════════════════════════', styles.info);
  console.log('%cКрок 2: Автоматичне виправлення', styles.info);
  console.log('%c═══════════════════════════════════════', styles.info);
  console.log('');
  
  // Створюємо глобальну функцію для виправлення
  window.fix401Now = function() {
    console.log('%c🔧 Починаємо виправлення...', styles.info);
    console.log('');
    
    try {
      // Очищення
      const sessionBefore = sessionStorage.length;
      const localBefore = localStorage.length;
      
      sessionStorage.clear();
      localStorage.clear();
      
      console.log('%c✅ SessionStorage очищено (' + sessionBefore + ' елементів видалено)', styles.success);
      console.log('%c✅ LocalStorage очищено (' + localBefore + ' елементів видалено)', styles.success);
      console.log('');
      
      // Встановлюємо правильний пароль
      sessionStorage.setItem(SESSION_KEY, CORRECT_PASSWORD);
      console.log('%c✅ Встановлено правильний пароль: "' + CORRECT_PASSWORD + '"', styles.success);
      console.log('');
      
      // Перевірка
      const newPassword = sessionStorage.getItem(SESSION_KEY);
      if (newPassword === CORRECT_PASSWORD) {
        console.log('%c✅ ПЕРЕВІРКА ПРОЙДЕНА!', styles.success);
        console.log('');
        console.log('%c🎉 ВСЕ ГОТОВО! Перезавантажуємо через 3 секунди...', 'font-size: 16px; font-weight: bold; color: #33cc33;');
        console.log('');
        console.log('%cПісля перезавантаження:', styles.info);
        console.log('1. Відкрийте адмін панель');
        console.log('2. Якщо бачите форму входу - введіть: admin123');
        console.log('3. Якщо вже увійшли - перейдіть на вкладку "Замовлення"');
        console.log('4. Помилка 401 має зникнути');
        console.log('');
        
        let countdown = 3;
        const timer = setInterval(() => {
          console.log('%cПерезавантаження через ' + countdown + '...', styles.warning);
          countdown--;
          if (countdown < 0) {
            clearInterval(timer);
            window.location.reload();
          }
        }, 1000);
      } else {
        console.log('%c❌ ПОМИЛКА: Не вдалося встановити пароль', styles.error);
      }
    } catch (error) {
      console.log('%c❌ ПОМИЛКА:', styles.error, error.message);
      console.log('');
      console.log('%cСпробуйте ручне виправлення:', styles.warning);
      console.log('sessionStorage.clear();');
      console.log('localStorage.clear();');
      console.log('location.reload();');
    }
  };
  
  // Додаткова функція для повної очистки
  window.hardReset = function() {
    if (confirm('⚠️ Це видалить ВСІ дані сайту з браузера.\n\nПродовжити?')) {
      console.log('%c🔥 HARD RESET...', 'font-size: 18px; font-weight: bold; color: #ff3333;');
      
      // Очистити все
      sessionStorage.clear();
      localStorage.clear();
      
      // Очистити cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Очистити кеш
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      console.log('%c✅ ВСЕ ОЧИЩЕНО!', styles.success);
      console.log('Перезавантаження через 2 секунди...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };
  
  // Функція для тестування API
  window.testAPI401 = async function() {
    console.log('%c🧪 Тестування API з правильним паролем...', styles.info);
    console.log('');
    
    try {
      // Динамічний імпорт конфігурації
      const { projectId, publicAnonKey } = await import('/utils/supabase/info.tsx');
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/orders`;
      
      console.log('URL:', url);
      console.log('Password:', CORRECT_PASSWORD);
      console.log('Відправляємо запит...');
      console.log('');
      
      const response = await fetch(url, {
        headers: {
          'X-Admin-Password': CORRECT_PASSWORD,
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('HTTP Status:', response.status);
      const text = await response.text();
      console.log('Response Body:', text);
      console.log('');
      
      if (response.status === 401) {
        console.log('%c❌ UNAUTHORIZED (401)', styles.error);
        console.log('');
        console.log('%cПроблема НЕ в браузері, а на сервері!', styles.warning);
        console.log('');
        console.log('Перевірте:');
        console.log('1. Файл /supabase/functions/server/index.tsx, рядок 25');
        console.log('   Має бути: const ADMIN_PASSWORD = "admin123";');
        console.log('');
        console.log('2. Edge Function розгорнута в Supabase Dashboard');
        console.log('   Supabase → Edge Functions → server → має бути "Active"');
        console.log('');
        console.log('3. Логи Edge Function (в Supabase Dashboard)');
        console.log('   Шукайте рядок: "Auth check failed"');
      } else if (response.ok) {
        console.log('%c✅ SUCCESS! Пароль прийнятий сервером!', styles.success);
        console.log('');
        console.log('Якщо ви все ще бачите помилку 401 в адмін панелі:');
        console.log('1. Виконайте: window.fix401Now()');
        console.log('2. Перезавантажте сторінку');
        console.log('3. Увійдіть знову з паролем: admin123');
      } else {
        console.log('%c⚠️  HTTP ' + response.status, styles.warning);
        console.log('Response:', text);
      }
    } catch (error) {
      console.log('%c❌ Помилка:', styles.error, error.message);
      console.log('');
      console.log('Переконайтеся що:');
      console.log('• У вас є доступ до інтернету');
      console.log('• Edge Function розгорнута в Supabase');
      console.log('• Немає блокування CORS або Firewall');
    }
  };
  
  // Показати доступні команди
  console.log('');
  console.log('%c═══════════════════════════════════════', 'color: #9933ff;');
  console.log('%c📋 ДОСТУПНІ КОМАНДИ:', 'font-size: 16px; font-weight: bold; color: #9933ff;');
  console.log('%c═══════════════════════════════════════', 'color: #9933ff;');
  console.log('');
  console.log('%cwindow.fix401Now()     %c- Виправити помилку 401 (рекомендовано)', styles.code, styles.success);
  console.log('%cwindow.testAPI401()    %c- Протестувати API з правильним паролем', styles.code, '');
  console.log('%cwindow.hardReset()     %c- Повне очищення (якщо нічого не допомагає)', styles.code, styles.warning);
  console.log('');
  console.log('%c═══════════════════════════════════════', 'color: #9933ff;');
  console.log('');
  
  // Якщо є проблема - запропонувати виправлення
  if (hasProblem) {
    console.log('%c👉 ПОЧНІТЬ З ВИКОНАННЯ:', 'font-size: 18px; font-weight: bold; color: #ff3333; background: #ffe; padding: 10px;');
    console.log('');
    console.log('%cwindow.fix401Now()', 'font-size: 20px; font-weight: bold; color: #33cc33; background: #333; padding: 10px; border-radius: 5px;');
    console.log('');
    console.log('(Скопіюйте рядок вище, вставте в консоль і натисніть Enter)');
  } else if (!savedPassword) {
    console.log('%c👉 ВАШ НАСТУПНИЙ КРОК:', 'font-size: 18px; font-weight: bold; color: #3399ff; background: #eff; padding: 10px;');
    console.log('');
    console.log('1. Відкрийте адмін панель');
    console.log('2. Введіть пароль: %cadmin123', styles.code);
    console.log('3. Якщо бачите помилку 401, виконайте: %cwindow.testAPI401()', styles.code);
  }
  
  console.log('');
  
})();

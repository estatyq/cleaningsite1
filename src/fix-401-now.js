/**
 * 🚨 МИТТЄВЕ ВИПРАВЛЕННЯ ПОМИЛКИ 401 UNAUTHORIZED
 * 
 * Цей скрипт автоматично виправляє проблему з неправильним паролем.
 * 
 * ЯК ВИКОРИСТАТИ:
 * 1. Відкрийте консоль браузера (F12)
 * 2. Скопіюйте весь цей файл
 * 3. Вставте в консоль і натисніть Enter
 * 4. Слідуйте інструкціям
 */

(function() {
  console.log('%c🚨 ДІАГНОСТИКА ПОМИЛКИ 401 UNAUTHORIZED', 'font-size: 20px; font-weight: bold; color: #ff3333;');
  console.log('');
  
  // Константи
  const CORRECT_PASSWORD = 'admin123';
  const SESSION_KEY = 'adminPassword';
  
  // Функція для виводу кольорових логів
  const log = {
    success: (msg) => console.log(`%c✅ ${msg}`, 'color: #33cc33; font-weight: bold;'),
    error: (msg) => console.log(`%c❌ ${msg}`, 'color: #ff3333; font-weight: bold;'),
    warning: (msg) => console.log(`%c⚠️  ${msg}`, 'color: #ffaa33; font-weight: bold;'),
    info: (msg) => console.log(`%c💡 ${msg}`, 'color: #3399ff; font-weight: bold;'),
    step: (num, msg) => console.log(`%c📍 Крок ${num}: ${msg}`, 'color: #9933ff; font-weight: bold;')
  };
  
  // Крок 1: Перевірка sessionStorage
  log.step(1, 'Перевірка SessionStorage');
  const savedPassword = sessionStorage.getItem(SESSION_KEY);
  
  if (savedPassword) {
    console.log(`   Знайдено збережений пароль: "${savedPassword}"`);
    console.log(`   Довжина: ${savedPassword.length} символів`);
    console.log(`   Hex: ${Array.from(savedPassword).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')}`);
    
    if (savedPassword === CORRECT_PASSWORD) {
      log.success('Пароль в SessionStorage ПРАВИЛЬНИЙ');
    } else {
      log.error('Пароль в SessionStorage НЕПРАВИЛЬНИЙ!');
      console.log(`   Очікується: "${CORRECT_PASSWORD}"`);
      console.log(`   Знайдено: "${savedPassword}"`);
    }
  } else {
    log.warning('Пароль в SessionStorage відсутній');
  }
  
  console.log('');
  
  // Крок 2: Перевірка localStorage
  log.step(2, 'Перевірка LocalStorage');
  const localPassword = localStorage.getItem(SESSION_KEY);
  
  if (localPassword) {
    console.log(`   Знайдено пароль в LocalStorage: "${localPassword}"`);
    if (localPassword !== CORRECT_PASSWORD) {
      log.error('Пароль в LocalStorage НЕПРАВИЛЬНИЙ!');
    }
  } else {
    log.info('LocalStorage чистий (це добре)');
  }
  
  console.log('');
  
  // Крок 3: Правильний пароль
  log.step(3, 'Правильний пароль');
  console.log(`%c   ${CORRECT_PASSWORD}`, 'font-size: 24px; font-weight: bold; color: #33cc33; background: #f0f0f0; padding: 10px; border-radius: 5px;');
  console.log(`   Довжина: ${CORRECT_PASSWORD.length} символів`);
  console.log(`   Hex: ${Array.from(CORRECT_PASSWORD).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')}`);
  
  console.log('');
  
  // Крок 4: Автоматичне виправлення
  log.step(4, 'Автоматичне виправлення');
  
  if (!savedPassword || savedPassword !== CORRECT_PASSWORD) {
    log.warning('ВИЯВЛЕНО ПРОБЛЕМУ! Пропоную автоматичне виправлення...');
    console.log('');
    console.log('%c═══════════════════════════════════════════════', 'color: #9933ff;');
    console.log('%c   НАТИСНІТЬ CTRL+SHIFT+J (або CMD+OPTION+J на Mac)', 'font-size: 14px; font-weight: bold;');
    console.log('%c   Потім виконайте:  window.fixPassword401()', 'font-size: 14px; font-weight: bold; color: #33cc33;');
    console.log('%c═══════════════════════════════════════════════', 'color: #9933ff;');
    console.log('');
    
    // Створюємо глобальну функцію для виправлення
    window.fixPassword401 = function() {
      log.info('Починаємо автоматичне виправлення...');
      
      // Очищення
      sessionStorage.clear();
      localStorage.clear();
      log.success('SessionStorage очищено');
      log.success('LocalStorage очищено');
      
      // Опціонально: встановити правильний пароль
      sessionStorage.setItem(SESSION_KEY, CORRECT_PASSWORD);
      log.success(`Встановлено правильний пароль: "${CORRECT_PASSWORD}"`);
      
      console.log('');
      log.success('ГОТОВО! Перезавантажуємо сторінку через 2 секунди...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };
    
  } else {
    log.success('ВСЕ ДОБРЕ! Пароль правильний.');
    console.log('');
    log.info('Якщо ви все ще бачите помилку 401, проблема може бути в:');
    console.log('   1. Edge Function не розгорнута на Supabase');
    console.log('   2. ADMIN_PASSWORD на сервері відрізняється від admin123');
    console.log('   3. Проблеми з мережею або CORS');
    console.log('');
    console.log('Перевірте:');
    console.log('   • Supabase Dashboard → Edge Functions → server');
    console.log('   • Файл /supabase/functions/server/index.tsx, рядок 25');
  }
  
  console.log('');
  console.log('%c═══════════════════════════════════════════════', 'color: #3399ff;');
  console.log('%c   ДОДАТКОВІ КОМАНДИ:', 'font-size: 14px; font-weight: bold;');
  console.log('');
  console.log('   window.fixPassword401()      - Автоматичне виправлення');
  console.log('   window.checkPassword()       - Повторна діагностика');
  console.log('   window.clearAll()            - Очистити все (hard reset)');
  console.log('   window.testPasswordAPI()     - Тестувати API з паролем');
  console.log('%c═══════════════════════════════════════════════', 'color: #3399ff;');
  
  // Додаткові utility функції
  window.checkPassword = function() {
    const current = sessionStorage.getItem(SESSION_KEY);
    console.log('Поточний пароль:', current || 'ВІДСУТНІЙ');
    console.log('Очікується:', CORRECT_PASSWORD);
    console.log('Співпадає:', current === CORRECT_PASSWORD);
  };
  
  window.clearAll = function() {
    if (confirm('⚠️ Це видалить ВСІ дані сайту з браузера. Продовжити?')) {
      sessionStorage.clear();
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      log.success('Все очищено! Перезавантаження...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };
  
  window.testPasswordAPI = async function() {
    log.info('Тестування API з правильним паролем...');
    
    try {
      // Отримати конфігурацію з info.tsx
      const projectId = await import('/utils/supabase/info.tsx').then(m => m.projectId);
      const publicAnonKey = await import('/utils/supabase/info.tsx').then(m => m.publicAnonKey);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/orders`;
      
      console.log('URL:', url);
      console.log('Password:', CORRECT_PASSWORD);
      
      const response = await fetch(url, {
        headers: {
          'X-Admin-Password': CORRECT_PASSWORD,
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status:', response.status);
      const data = await response.text();
      console.log('Response:', data);
      
      if (response.status === 401) {
        log.error('UNAUTHORIZED! Сервер відхилив пароль.');
        log.warning('Перевірте ADMIN_PASSWORD в /supabase/functions/server/index.tsx');
      } else if (response.ok) {
        log.success('SUCCESS! Пароль прийнятий сервером.');
      } else {
        log.warning(`HTTP ${response.status}: ${data}`);
      }
    } catch (error) {
      log.error('Помилка: ' + error.message);
    }
  };
  
})();

console.log('');
console.log('%c👉 Почніть з виконання: window.fixPassword401()', 'font-size: 16px; font-weight: bold; color: #33cc33; background: #333; padding: 10px;');
console.log('');

'use strict';

(() => {
  const leadForm = document.querySelector('#lead-form');
  if (!leadForm) return;

  // 1. Чтение UTM-меток из адресной строки
  const params = new URLSearchParams(window.location.search);
  const defaults = {
    utm_source: 'direct',
    utm_medium: 'none',
    utm_campaign: 'not_set'
  };

  for (const [key, fallback] of Object.entries(defaults)) {
    const input = leadForm.elements.namedItem(key);
    if (input) {
      input.value = params.get(key)?.trim() || fallback;
    }
  }

  const requestId = leadForm.elements.namedItem('request_id');

  // 2. Обработчик отправки формы
  leadForm.addEventListener('submit', (event) => {
    // Проверка, что ссылка на Apps Script вставлена правильно
    const actionUrl = leadForm.getAttribute('action');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(actionUrl)) {
      event.preventDefault();
      document.querySelector('#form-status').textContent = 'Сначала укажите URL Apps Script в атрибуте action.';
      return;
    }

    // Генерация request_id (UUID)
    if (requestId && !requestId.value) {
      requestId.value = 'REQ-' + crypto.randomUUID().toUpperCase();
    }

    // Отправка события в GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        lead_source: params.get('utm_source') || 'direct'
      });
    }

    // Сообщение пользователю
    const status = document.querySelector('#form-status');
    if (status) {
      status.textContent = 'Отправляем заявку... Номер: ' + (requestId ? requestId.value : '');
    }
  });

  // 3. Обработчик кнопки "Новая заявка" (сброс)
  leadForm.addEventListener('reset', () => {
    setTimeout(() => {
      if (requestId) requestId.value = '';
      
      for (const [key, fallback] of Object.entries(defaults)) {
        const input = leadForm.elements.namedItem(key);
        if (input) input.value = params.get(key)?.trim() || fallback;
      }
      
      const status = document.querySelector('#form-status');
      if (status) status.textContent = 'Можно заполнить новую заявку.';
    }, 0);
  });
})();
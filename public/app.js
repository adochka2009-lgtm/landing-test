(() => {
  'use strict';

  const nav = document.querySelector('.header nav');
  if (nav) {
    nav.id = 'main-navigation';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-controls', nav.id);
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Закрыть меню ×' : 'Меню +';
      nav.classList.toggle('is-open', open);
    };
    setOpen(false);
    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.before(toggle);
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a[href^="#"]')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    const desktop = window.matchMedia('(min-width: 601px)');
    desktop.addEventListener('change', () => setOpen(false));
    nav.classList.add('enhanced-navigation');
  }

  document.querySelectorAll('a[href="#contact"]').forEach((link) => {
    link.addEventListener('click', () => {
      const direction = document.querySelector('#direction');
      if (link.dataset.direction && direction) {
        direction.value = link.dataset.direction;
        direction.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const field = document.querySelector('#contact-input');
      if (field) field.focus({ preventScroll: true });
    });
  });

  const demo = document.querySelector('#agent-demo details');
  if (demo) {
    const summary = demo.querySelector('summary');
    const result = demo.querySelector('p');
    if (!summary || !result) return;
    const container = document.createElement('div');
    const run = document.createElement('button');
    const reset = document.createElement('button');
    const status = document.createElement('div');
    run.type = reset.type = 'button';
    run.className = reset.className = 'text-link demo-control';
    run.textContent = 'Разобрать пример ↗';
    reset.textContent = 'Сбросить';
    reset.disabled = true;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    const preparedResult = result.cloneNode(true);
    run.addEventListener('click', () => {
      status.replaceChildren(preparedResult.cloneNode(true));
      reset.disabled = false;
      run.disabled = true;
    });
    reset.addEventListener('click', () => {
      status.textContent = 'Пример сброшен. Можно разобрать его снова.';
      run.disabled = false;
      reset.disabled = true;
      run.focus();
    });
    container.append(run, reset, status);
    demo.replaceWith(container);
  }
})();

// Contact delivery: success requires a confirmed server response.
(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.noValidate = true;
  const button = form.querySelector('button');
  const status = document.querySelector('#form-status');
  const messages = {contact:'Укажите контакт длиной от 3 до 200 символов.',task:'Опишите задачу: от 10 до 3000 символов.',direction:'Выберите направление из списка.'};
  const errors = {};
  for (const name of Object.keys(messages)) {
    const field = form.elements[name];
    const error = document.createElement('p');
    error.id = `${name}-error`;
    error.className = 'field-error';
    field.setAttribute('aria-describedby', error.id);
    field.after(error);
    errors[name] = error;
  }
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const data = Object.fromEntries(new FormData(form));
    let first;
    for (const name of Object.keys(messages)) {
      const value = data[name].trim();
      const invalid = name === 'direction' ? !['unknown','website','app','agent'].includes(value) : value.length < (name === 'contact' ? 3 : 10) || value.length > (name === 'contact' ? 200 : 3000);
      errors[name].textContent = invalid ? messages[name] : '';
      form.elements[name].setAttribute('aria-invalid', String(invalid));
      if (invalid && !first) first = form.elements[name];
    }
    if (first) {status.textContent = 'Проверьте отмеченные поля.'; first.focus(); return;}
    sending = true;
    button.disabled = true;
    button.textContent = 'Отправляем…';
    form.setAttribute('aria-busy','true');
    status.textContent = 'Отправляем задачу…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/contact', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
      if (response.status === 429) throw Error('rate_limited');
      const result = await response.json();
      if (response.status !== 200 || result.ok !== true) throw Error('delivery');
      status.textContent = 'Задача отправлена. Спасибо! Свяжусь с вами по указанному контакту';
      form.reset();
    } catch (error) {
      status.textContent = error.message === 'rate_limited' ? 'Слишком много попыток. Подождите минуту и попробуйте снова. Введённые данные остаются в форме.' : 'Не удалось подтвердить отправку. Введённые данные остаются в форме. Канал доставки пока не подключён или недоступен. Автоматического повтора не будет.';
    } finally {
      clearTimeout(timer);
      sending = false;
      button.disabled = false;
      button.textContent = 'Отправить задачу ↗';
      form.setAttribute('aria-busy','false');
    }
  });
  const fieldset = form.querySelector('fieldset');
  fieldset.disabled = false;
})();


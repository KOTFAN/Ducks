document.addEventListener('DOMContentLoaded', function () {
   // --- Обробка кліку на .burger ---
   const burgerElements = document.querySelectorAll('.burger');
   const burgerMenuElements = document.querySelectorAll('.burger__menu');
   const bodyElement = document.body;

   burgerElements.forEach(burger => {
      burger.addEventListener('click', function () {
         // Переключення класу "active" для всіх елементів .burger
         burgerElements.forEach(el => el.classList.toggle('active'));
         // Переключення класу "active" для всіх елементів .burger__menu
         burgerMenuElements.forEach(menu => menu.classList.toggle('active'));
         // Переключення класу "lock" для тега body
         bodyElement.classList.toggle('lock');
      });
   });

   // --- Обробка кліку на елементах .burger__menu__item ---
   const burgerMenuItems = document.querySelectorAll('.burger__menu__item');
   burgerMenuItems.forEach(item => {
      item.addEventListener('click', function () {
         burgerElements.forEach(el => el.classList.remove('active'));
         burgerMenuElements.forEach(menu => menu.classList.remove('active'));
         bodyElement.classList.remove('lock');
      });
   });

   // --- Фіксоване меню при скролі ---
   window.addEventListener('scroll', function () {
      const nav = document.querySelector('.nav');
      if (nav) {
         if (window.scrollY > 0) {
            // Якщо елемент ще не має класу "sticky", додаємо його
            if (!nav.classList.contains('sticky')) {
               nav.classList.add('sticky');
            }
         } else {
            // Видаляємо клас "sticky"
            nav.classList.remove('sticky');
         }
      }
   });

   // --- Скрол по якорях для .menu__link ---
   const menuLinks = document.querySelectorAll('.menu__link');
   menuLinks.forEach(link => {
      link.addEventListener('click', function (e) {
         e.preventDefault();
         const id = this.getAttribute('href');
         const target = document.querySelector(id);
         if (target) {
            // Отримуємо відстань від верхньої частини сторінки до цільового елемента
            const top = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
               top: top,
               behavior: "smooth" // Плавний скрол
            });
         }
      });
   });

   // --- Dynamic Adapt v.1 ---
   // HTML має містити data-атрибут, наприклад: data-da="item,2,992"
   'use strict';

   (function () {
      let originalPositions = [];
      let daElements = document.querySelectorAll('[data-da]');
      let daElementsArray = [];
      let daMatchMedia = [];

      // Заповнюємо масиви
      if (daElements.length > 0) {
         let number = 0;
         for (let index = 0; index < daElements.length; index++) {
            const daElement = daElements[index];
            const daMove = daElement.getAttribute('data-da');
            if (daMove !== '') {
               const daArray = daMove.split(',');
               const daPlace = daArray[1] ? daArray[1].trim() : 'last';
               const daBreakpoint = daArray[2] ? daArray[2].trim() : '767';
               const daType = daArray[3] === 'min' ? daArray[3].trim() : 'max';
               const daDestination = document.querySelector('.' + daArray[0].trim());
               if (daArray.length > 0 && daDestination) {
                  daElement.setAttribute('data-da-index', number);
                  // Заповнюємо масив початкових позицій
                  originalPositions[number] = {
                     parent: daElement.parentNode,
                     index: indexInParent(daElement)
                  };
                  // Заповнюємо масив елементів
                  daElementsArray[number] = {
                     element: daElement,
                     destination: daDestination,
                     place: daPlace,
                     breakpoint: daBreakpoint,
                     type: daType
                  }
                  number++;
               }
            }
         }
         dynamicAdaptSort(daElementsArray);

         // Створюємо події при зміні розміру вікна
         for (let index = 0; index < daElementsArray.length; index++) {
            const el = daElementsArray[index];
            const daBreakpoint = el.breakpoint;
            const daType = el.type;

            daMatchMedia.push(window.matchMedia('(' + daType + '-width: ' + daBreakpoint + 'px)'));
            daMatchMedia[index].addListener(dynamicAdapt);
         }
      }

      // Основна функція адаптації
      function dynamicAdapt(e) {
         for (let index = 0; index < daElementsArray.length; index++) {
            const el = daElementsArray[index];
            const daElement = el.element;
            const daDestination = el.destination;
            const daPlace = el.place;
            const daBreakpoint = el.breakpoint;
            const daClassname = '_dynamic_adapt_' + daBreakpoint;

            if (daMatchMedia[index].matches) {
               // Переміщення елемента
               if (!daElement.classList.contains(daClassname)) {
                  let actualIndex = indexOfElements(daDestination)[daPlace];
                  if (daPlace === 'first') {
                     actualIndex = indexOfElements(daDestination)[0];
                  } else if (daPlace === 'last') {
                     actualIndex = indexOfElements(daDestination)[indexOfElements(daDestination).length];
                  }
                  daDestination.insertBefore(daElement, daDestination.children[actualIndex]);
                  daElement.classList.add(daClassname);
               }
            } else {
               // Повертаємо елемент на початкове місце
               if (daElement.classList.contains(daClassname)) {
                  dynamicAdaptBack(daElement);
                  daElement.classList.remove(daClassname);
               }
            }
         }
         customAdapt();
      }

      // Викликаємо основну функцію
      dynamicAdapt();

      // Функція повернення елемента на початкову позицію
      function dynamicAdaptBack(el) {
         const daIndex = el.getAttribute('data-da-index');
         const originalPlace = originalPositions[daIndex];
         const parentPlace = originalPlace.parent;
         const indexPlace = originalPlace.index;
         const actualIndex = indexOfElements(parentPlace, true)[indexPlace];
         parentPlace.insertBefore(el, parentPlace.children[actualIndex]);
      }

      // Функція отримання індексу елемента всередині його батька
      function indexInParent(el) {
         const children = Array.prototype.slice.call(el.parentNode.children);
         return children.indexOf(el);
      }

      // Функція отримання масиву індексів елементів всередині батька
      function indexOfElements(parent, back) {
         const children = parent.children;
         const childrenArray = [];
         for (let i = 0; i < children.length; i++) {
            const childrenElement = children[i];
            if (back) {
               childrenArray.push(i);
            } else {
               // Виключаємо елементи, які мають data-da
               if (childrenElement.getAttribute('data-da') === null) {
                  childrenArray.push(i);
               }
            }
         }
         return childrenArray;
      }

      // Сортування об'єкта
      function dynamicAdaptSort(arr) {
         arr.sort(function (a, b) {
            return a.breakpoint > b.breakpoint ? -1 : 1;
         });
         arr.sort(function (a, b) {
            return a.place > b.place ? 1 : -1;
         });
      }

      // Додаткові сценарії адаптації
      function customAdapt() {
         // При необхідності можна реалізувати додаткову логіку
         // const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }
   }());

   /*
   // Приклад простої обробки кліку
   const block = document.querySelector('.click');
   block.addEventListener('click', function (e) {
     alert('Все ок ;)');
   });
   */
});

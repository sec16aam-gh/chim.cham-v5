(function (global) {
  'use strict';

  var controllersBySection = {};

  function createDeliveryAreaGate(root) {
    var doc = root.ownerDocument || global.document;
    var checkbox = root.querySelector('[data-delivery-area-checkbox]');
    var warning = root.querySelector('[data-delivery-area-warning]');
    var sectionId = root.getAttribute('data-section-id');
    var form = doc.getElementById('AddToCartForm-' + sectionId);
    var shakeTimer;
    var paymentWrappers = [];
    var paymentObservers = [];

    if (!checkbox || !warning) {
      return { destroy: function () {} };
    }

    checkbox.checked = false;

    if (!form) {
      return { destroy: function () {} };
    }

    function closest(target, selector) {
      return target && typeof target.closest === 'function' ? target.closest(selector) : null;
    }

    function isPurchaseTarget(target) {
      return !!(
        closest(target, '#AddToCart-' + sectionId) ||
        closest(target, '[data-delivery-payment-guard]') ||
        closest(target, '#js-sticky-btn[data-buttonid="AddToCart-' + sectionId + '"]')
      );
    }

    function setFocusableDisabled(element, disabled) {
      if (!element) return;
      if (!element.deliveryAreaOriginalTabindex) {
        element.deliveryAreaOriginalTabindex = {
          present: element.hasAttribute('tabindex'),
          value: element.getAttribute('tabindex')
        };
      }
      if (disabled) {
        element.setAttribute('tabindex', '-1');
      } else if (element.deliveryAreaOriginalTabindex.present) {
        element.setAttribute('tabindex', element.deliveryAreaOriginalTabindex.value);
      } else {
        element.removeAttribute('tabindex');
      }
    }

    function setPaymentControlDisabled(payment, disabled) {
      if (!payment) return;
      if (!payment.deliveryAreaOriginalState) {
        payment.deliveryAreaOriginalState = {
          inert: payment.hasAttribute('inert'),
          ariaHidden: payment.getAttribute('aria-hidden')
        };
      }

      if (disabled) {
        payment.setAttribute('inert', '');
        payment.setAttribute('aria-hidden', 'true');
      } else {
        if (!payment.deliveryAreaOriginalState.inert) payment.removeAttribute('inert');
        if (payment.deliveryAreaOriginalState.ariaHidden === null) payment.removeAttribute('aria-hidden');
        else payment.setAttribute('aria-hidden', payment.deliveryAreaOriginalState.ariaHidden);
      }

      if (typeof payment.querySelectorAll === 'function') {
        Array.prototype.forEach.call(
          payment.querySelectorAll('button, iframe, a, input, select, textarea, [tabindex]'),
          function (element) { setFocusableDisabled(element, disabled); }
        );
      }
    }

    function syncPaymentWrapper(wrapper) {
      var guard = wrapper.querySelector('[data-delivery-payment-guard]');
      var payment = wrapper.querySelector('.shopify-payment-button');
      if (guard) {
        guard.hidden = checkbox.checked;
        guard.setAttribute('aria-hidden', checkbox.checked ? 'true' : 'false');
        guard.tabIndex = checkbox.checked ? -1 : 0;
      }
      setPaymentControlDisabled(payment, !checkbox.checked);
    }

    function syncPaymentGuards() {
      paymentWrappers.forEach(syncPaymentWrapper);
    }

    function installPaymentGuards() {
      if (typeof doc.getElementById !== 'function' || typeof doc.createElement !== 'function') return;
      var section = doc.getElementById('ProductSection-' + sectionId);
      if (!section || typeof section.querySelectorAll !== 'function') return;

      Array.prototype.forEach.call(section.querySelectorAll('[data-delivery-buy-now]'), function (wrapper) {
        var guard = wrapper.querySelector('[data-delivery-payment-guard]');
        if (!guard) {
          guard = doc.createElement('button');
          guard.type = 'button';
          guard.className = 'delivery-area-confirmation__payment-guard';
          guard.setAttribute('data-delivery-payment-guard', '');
          guard.setAttribute('aria-label', root.getAttribute('data-warning-label') || 'Confirm the delivery area guide before buying now');
          wrapper.appendChild(guard);
        }
        paymentWrappers.push(wrapper);
        syncPaymentWrapper(wrapper);

        if (typeof global.MutationObserver === 'function') {
          var observer = new global.MutationObserver(function () { syncPaymentWrapper(wrapper); });
          observer.observe(wrapper, { childList: true, subtree: true });
          paymentObservers.push(observer);
        }
      });
    }

    function focusNotice() {
      var rect = typeof root.getBoundingClientRect === 'function' ? root.getBoundingClientRect() : null;
      var viewportHeight = doc.defaultView && doc.defaultView.innerHeight ? doc.defaultView.innerHeight : 0;
      var reduceMotion = !!(doc.defaultView && doc.defaultView.matchMedia && doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (rect && viewportHeight && (rect.top < 0 || rect.bottom > viewportHeight) && typeof root.scrollIntoView === 'function') {
        root.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      if (typeof root.focus === 'function') {
        try {
          root.focus({ preventScroll: true });
        } catch (error) {
          root.focus();
        }
      }
    }

    function showWarning(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      }

      warning.hidden = false;
      root.classList.add('is-warning');
      root.classList.remove('is-shaking');
      void root.offsetWidth;
      root.classList.add('is-shaking');
      global.clearTimeout(shakeTimer);
      shakeTimer = global.setTimeout(function () {
        root.classList.remove('is-shaking');
      }, 620);
      focusNotice();
    }

    function handleClick(event) {
      if (!checkbox.checked && isPurchaseTarget(event.target)) showWarning(event);
    }

    function handleSubmit(event) {
      if (!checkbox.checked) showWarning(event);
    }

    function handleChange() {
      syncPaymentGuards();
      if (checkbox.checked) {
        warning.hidden = true;
        root.classList.remove('is-warning', 'is-shaking');
      }
    }

    installPaymentGuards();
    doc.addEventListener('click', handleClick, true);
    checkbox.addEventListener('change', handleChange);
    if (form) form.addEventListener('submit', handleSubmit, true);

    return {
      destroy: function () {
        global.clearTimeout(shakeTimer);
        paymentObservers.forEach(function (observer) { observer.disconnect(); });
        paymentWrappers.forEach(function (wrapper) {
          var payment = wrapper.querySelector('.shopify-payment-button');
          var guard = wrapper.querySelector('[data-delivery-payment-guard]');
          setPaymentControlDisabled(payment, false);
          if (guard && guard.parentNode) guard.parentNode.removeChild(guard);
        });
        doc.removeEventListener('click', handleClick, true);
        checkbox.removeEventListener('change', handleChange);
        if (form) form.removeEventListener('submit', handleSubmit, true);
      }
    };
  }

  function initDeliveryAreaGates(scope) {
    var doc = global.document;
    var context = scope || doc;
    if (!context || typeof context.querySelectorAll !== 'function') return;

    Array.prototype.forEach.call(context.querySelectorAll('[data-delivery-area-gate]'), function (root) {
      var sectionId = root.getAttribute('data-section-id');
      if (controllersBySection[sectionId]) controllersBySection[sectionId].destroy();
      controllersBySection[sectionId] = createDeliveryAreaGate(root);
    });
  }

  function destroyDeliveryAreaGates(scope) {
    if (!scope || typeof scope.querySelectorAll !== 'function') return;
    Array.prototype.forEach.call(scope.querySelectorAll('[data-delivery-area-gate]'), function (root) {
      var sectionId = root.getAttribute('data-section-id');
      if (!controllersBySection[sectionId]) return;
      controllersBySection[sectionId].destroy();
      delete controllersBySection[sectionId];
    });
  }

  global.createDeliveryAreaGate = createDeliveryAreaGate;
  global.initDeliveryAreaGates = initDeliveryAreaGates;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createDeliveryAreaGate: createDeliveryAreaGate,
      initDeliveryAreaGates: initDeliveryAreaGates
    };
  }

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', function () { initDeliveryAreaGates(global.document); });
    } else {
      initDeliveryAreaGates(global.document);
    }
    global.document.addEventListener('shopify:section:load', function (event) { initDeliveryAreaGates(event.target); });
    global.document.addEventListener('shopify:section:unload', function (event) { destroyDeliveryAreaGates(event.target); });
  }
})(typeof window !== 'undefined' ? window : globalThis);

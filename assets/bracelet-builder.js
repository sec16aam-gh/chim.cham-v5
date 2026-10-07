/**
 * ============================================================================
 * BRACELET & WATCH BUILDER - ENGINE
 * ============================================================================
 */

(function () {
  'use strict';

  class BraceletBuilder {
    constructor(container) {
      this.container = container;
      this.sectionId = container.dataset.sectionId;

      // Load Config Data
      const dataEl = container.querySelector('#bracelet-builder-data-' + this.sectionId) ||
                     container.querySelector('.bb-data-json');
      if (!dataEl) {
        console.error('BraceletBuilder: Configuration data not found.');
        return;
      }

      try {
        this.config = JSON.parse(dataEl.textContent);
      } catch (e) {
        console.error('BraceletBuilder: Error parsing configuration JSON', e);
        console.warn('Raw JSON snippet:', (dataEl.textContent || '').substring(0, 300));
        this.config = {};
      }

      // Initial State
      this.models = (this.config && Array.isArray(this.config.models) && this.config.models.length > 0)
        ? this.config.models
        : [
            {
              id: 'original-bracelet',
              title: 'Original Bracelet',
              type: 'bracelet',
              slots: 16,
              price: 2499,
              defaultColor: 'silver',
              image: '',
              variants: [
                { id: 'var-silver', title: 'Silver', price: 2499, available: true },
                { id: 'var-gold', title: 'Gold', price: 2999, available: true },
                { id: 'var-rose', title: 'Rose Gold', price: 2999, available: true },
                { id: 'var-black', title: 'Black', price: 2699, available: true }
              ]
            }
          ];

      this.charms = (this.config && Array.isArray(this.config.charms)) ? this.config.charms : [];
      this.collectionInfo = (this.config && this.config.collection) || {};
      this.settings = (this.config && this.config.settings) || {};
      this.assetUrls = (this.config && this.config.assetUrls) || {};

      this.swatches = {
        gold: (this.settings.swatches && this.settings.swatches.gold) || 'linear-gradient(135deg, #fff3cf 0%, #ecd38a 35%, #cca54c 70%, #9b7226 100%)',
        silver: (this.settings.swatches && this.settings.swatches.silver) || 'linear-gradient(135deg, #f5f6f8 0%, #d8dade 40%, #b4b8be 70%, #90949a 100%)',
        mixed: (this.settings.swatches && this.settings.swatches.mixed) || 'linear-gradient(180deg, #ecd38a 0%, #cca54c 22%, #ffffff 24%, #d8dade 50%, #b4b8be 76%, #ecd38a 78%, #cca54c 100%)',
        purple: (this.settings.swatches && this.settings.swatches.purple) || 'linear-gradient(135deg, #f2ecf8 0%, #cfc0e2 40%, #b1a5c5 75%, #7e699c 100%)',
        black: (this.settings.swatches && this.settings.swatches.black) || 'linear-gradient(135deg, #4c4e52 0%, #2a2b2e 45%, #18191b 80%, #0c0d0e 100%)',
        red: (this.settings.swatches && this.settings.swatches.red) || 'linear-gradient(135deg, #ff8278 0%, #eb382c 40%, #d52b20 75%, #8a0e05 100%)',
        blue: (this.settings.swatches && this.settings.swatches.blue) || 'linear-gradient(135deg, #f0f7ff 0%, #bedcf8 40%, #b2cde6 75%, #598cb8 100%)',
        champagne: (this.settings.swatches && this.settings.swatches.champagne) || 'linear-gradient(135deg, #faf5ee 0%, #dfd3c3 40%, #c4b7a6 75%, #8f816d 100%)',
        neon: (this.settings.swatches && this.settings.swatches.neon) || 'linear-gradient(135deg, #ffffe0 0%, #eef17c 35%, #dccc64 70%, #969c18 100%)',
        rose: (this.settings.swatches && this.settings.swatches.rose) || 'linear-gradient(135deg, #fce5df 0%, #e8b2a5 40%, #c58677 75%, #9b5c4d 100%)'
      };

      this.selectedModel = this.models[0] || {
        id: 'original-bracelet',
        title: 'Original Bracelet',
        type: 'bracelet',
        slots: 16,
        price: 4000,
        image: ''
      };

      const defaultVariants = (this.selectedModel.variants && this.selectedModel.variants.length > 0)
        ? this.selectedModel.variants
        : [
            { id: 'var-gold-6-5', title: 'Gold / 6.5', color: 'Gold', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-silver-6-5', title: 'Silver / 6.5', color: 'Silver', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-mixed-6-5', title: 'Mixed Gold x Silver / 6.5', color: 'Mixed Gold x Silver', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-purple-6-5', title: 'Purple / 6.5', color: 'Purple', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-black-6-5', title: 'Black / 6.5', color: 'Black', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-red-6-5', title: 'Red / 6.5', color: 'Red', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-blue-6-5', title: 'Blue / 6.5', color: 'Blue', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-champagne-6-5', title: 'Champagne / 6.5', color: 'Champagne', size: '6.5', price: this.selectedModel.price || 4000, available: true },
            { id: 'var-neon-6-5', title: 'Neon / 6.5', color: 'Neon', size: '6.5', price: this.selectedModel.price || 4000, available: true }
          ];

      const initialModelDefault = this.getMetalHandle(this.selectedModel.defaultColor || this.selectedModel.default_color || 'silver');
      this.selectedSize = this.selectedModel.defaultSize || '6.5';
      const initialVariant = defaultVariants.find(v => {
        const h = this.getMetalHandle(v.color || v.title);
        const s = String(v.size || '').trim();
        return h === initialModelDefault && (!this.selectedSize || s === this.selectedSize);
      }) || defaultVariants.find(v => this.getMetalHandle(v.color || v.title) === initialModelDefault) || defaultVariants[0] || { id: 'var-silver-6-5', title: 'Silver / 6.5', color: 'Silver', size: '6.5', price: 4000 };

      this.selectedVariant = initialVariant;
      if (initialVariant.size) {
        this.selectedSize = String(initialVariant.size).trim();
      }
      const initialHandle = this.getMetalHandle(this.selectedVariant.color || this.selectedVariant.title || initialModelDefault);
      const initialColorTitle = this.selectedVariant.color || (this.selectedVariant.title ? this.selectedVariant.title.split('/')[0].trim() : 'Silver');
      this.selectedColor = {
        id: this.selectedVariant.id,
        title: initialColorTitle,
        handle: initialHandle,
        price: this.selectedVariant.price || 4000,
        swatch: this.swatches[initialHandle] || '#d9dcdb',
        image: this.selectedVariant.image || null
      };

      // State
      this.slotsCount = parseInt(this.selectedModel.slots, 10) || 16;
      if (this.selectedModel && this.selectedModel.type === 'watch' && this.slotsCount % 2 !== 0) {
        this.slotsCount = 14;
      }
      this.slots = new Array(this.slotsCount).fill(null);
      this.activeThemes = new Set();
      this.activeColors = new Set();
      this.searchQuery = '';
      this.activeDrawerCharm = null;
      this.dragSource = null; // 'catalog' | { slotIndex: number }
      this.draggedCharmData = null;
      this.transparentCache = {};
      this.charmMetaCache = {};
      this.calibratedCanvases = {};

      // DOM Elements Cache
      this.cacheDOMElements();

      // Preload metal link backgrounds for instantaneous drag avatars
      this.preloadedLinks = {};
      this.preloadMetalLinks();

      // Load saved state from localStorage if available (prevents losing design on refresh)
      this.loadPersistedState();

      // Initialize
      this.init();
    }

    cacheDOMElements() {
      const c = this.container;
      this.dom = {
        mobileExpandBtn: c.querySelector('[data-mobile-expand-btn]'),
        modelColorGroup: c.querySelector('[data-model-color-group]'),
        mobileSummaryIcon: c.querySelector('.bb-mobile-summary-icon'),
        mobileSummaryTitle: c.querySelector('.bb-mobile-summary-title'),
        modelBtn: c.querySelector('[data-model-btn]'),
        modelMenu: c.querySelector('[data-model-menu]'),
        colorBtn: c.querySelector('[data-color-btn]'),
        colorMenu: c.querySelector('[data-color-menu]'),
        colorSelectWrap: c.querySelector('[data-color-select-wrap]'),
        sizeBtn: c.querySelector('[data-size-btn]'),
        sizeMenu: c.querySelector('[data-size-menu]'),
        sizeSelectWrap: c.querySelector('[data-size-select-wrap]'),
        searchControl: c.querySelector('[data-search-control]'),
        searchToggleBtn: c.querySelector('[data-search-toggle-btn]'),
        searchInput: c.querySelector('[data-search-input]'),
        searchClear: c.querySelector('[data-search-clear]'),
        resetBtn: c.querySelector('[data-reset-btn]'),
        helpBtn: c.querySelector('[data-help-btn]'),
        howLink: c.querySelector('[data-how-link]'),
        themeFilterBtn: c.querySelector('[data-theme-filter-btn]'),
        themePopover: c.querySelector('[data-theme-popover]'),
        colorFilterBtn: c.querySelector('[data-color-filter-btn]'),
        colorPopover: c.querySelector('[data-color-popover]'),
        clearFiltersBtn: c.querySelector('[data-clear-filters-btn]'),
        catalogGrid: c.querySelector('[data-catalog-grid]'),
        catalogCount: c.querySelector('[data-catalog-count]'),
        canvasContainer: c.querySelector('.bb-canvas-container'),
        braceletScrollWrap: c.querySelector('.bb-bracelet-scroll-wrap'),
        braceletRow: c.querySelector('[data-bracelet-row]'),
        stageStatus: c.querySelector('[data-stage-status]'),
        summaryThumb: c.querySelector('[data-summary-thumb]'),
        summaryTitle: c.querySelector('[data-summary-title]'),
        summaryMeta: c.querySelector('[data-summary-meta]'),
        summaryPrice: c.querySelector('[data-summary-price]'),
        sidebarHeading: c.querySelector('[data-sidebar-heading]'),
        charmsCountBadge: c.querySelector('[data-charms-count-badge]'),
        charmsList: c.querySelector('[data-charms-list]'),
        totalAmount: c.querySelector('[data-total-amount]'),
        checkoutBtn: c.querySelector('[data-checkout-btn]'),
        copySummaryLink: c.querySelector('[data-copy-summary]'),
        headerCount: c.querySelector('[data-header-count]'),
        headerPrice: c.querySelector('[data-header-price]'),
        drawer: c.querySelector('[data-details-drawer]'),
        drawerOverlay: c.querySelector('[data-drawer-overlay]'),
        drawerClose: c.querySelector('[data-drawer-close]'),
        drawerBody: c.querySelector('[data-drawer-body]'),
        helpModal: c.querySelector('[data-help-modal]'),
        helpModalClose: c.querySelector('[data-help-modal-close]'),
        resetModal: c.querySelector('[data-reset-modal]'),
        resetModalClose: c.querySelector('[data-reset-modal-close]'),
        resetModalCancel: c.querySelector('[data-reset-modal-cancel]'),
        resetModalConfirm: c.querySelector('[data-reset-modal-confirm]'),
        toast: c.querySelector('[data-toast]'),
        sidebar: c.querySelector('.bb-sidebar'),
        sidebarOverlay: c.querySelector('[data-sidebar-overlay]'),
        sidebarClose: c.querySelector('[data-sidebar-close]'),
        floatingTrigger: c.querySelector('[data-mobile-summary-trigger]'),
        floatingCount: c.querySelector('[data-floating-count]'),
        floatingPrice: c.querySelector('[data-floating-price]'),
        orderNoteContainer: (c.querySelector('[data-order-note-container]') || (c.closest('.bracelet-builder-section-wrap') || c.parentElement || document).querySelector('[data-order-note-container]')),
        orderNoteToggle: (c.querySelector('[data-order-note-toggle]') || (c.closest('.bracelet-builder-section-wrap') || c.parentElement || document).querySelector('[data-order-note-toggle]')),
        orderNoteContent: (c.querySelector('[data-order-note-content]') || (c.closest('.bracelet-builder-section-wrap') || c.parentElement || document).querySelector('[data-order-note-content]')),
        orderNoteInput: (c.querySelector('[data-order-note-input]') || (c.closest('.bracelet-builder-section-wrap') || c.parentElement || document).querySelector('[data-order-note-input]')),
        orderNoteBadge: (c.querySelector('[data-order-note-badge]') || (c.closest('.bracelet-builder-section-wrap') || c.parentElement || document).querySelector('[data-order-note-badge]')),
        orderNoteCounter: (c.querySelector('[data-order-note-counter]') || (c.closest('.bracelet-builder-section-wrap') || c.parentElement || document).querySelector('[data-order-note-counter]'))
      };
    }

    getMetalHandle(title) {
      const t = (title || '').toLowerCase().trim();
      if (t.includes('mixed') || t.includes('mix') || (t.includes('gold') && t.includes('silver'))) return 'mixed';
      if (t.includes('champagne')) return 'champagne';
      if (t.includes('neon')) return 'neon';
      if (t.includes('purple') || t.includes('violet') || t.includes('lilac')) return 'purple';
      if (t.includes('red') || t.includes('ruby') || t.includes('fuchsia')) return 'red';
      if (t.includes('blue') || t.includes('cyan') || t.includes('sky')) return 'blue';
      if (t.includes('black')) return 'black';
      if (t.includes('rose')) return 'rose';
      if (t.includes('gold')) return 'gold';
      return 'silver';
    }

    getStorageKey() {
      return `chimcham_builder_state_${this.sectionId || 'main'}`;
    }

    savePersistedState() {
      try {
        const stateToSave = {
          modelId: this.selectedModel ? this.selectedModel.id : null,
          variantId: this.selectedVariant ? this.selectedVariant.id : null,
          colorTitle: this.selectedColor ? this.selectedColor.title : null,
          sizeVal: this.selectedSize,
          slotsCount: this.slotsCount,
          slots: this.slots.map(s => {
            if (!s || !s.charm) return null;
            return {
              charmId: s.charm.id,
              isChainStart: !!s.isChainStart,
              isChainEnd: !!s.isChainEnd,
              chainEndIndex: s.chainEndIndex,
              chainStartIndex: s.chainStartIndex,
              isDoubleStart: !!s.isDoubleStart,
              isDoubleEnd: !!s.isDoubleEnd,
              isHanging: !!s.isHanging,
              transUrl: (this.transparentCache && this.transparentCache[s.charm.image]) || null,
              charmMeta: (this.charmMetaCache && this.charmMetaCache[s.charm.image]) || null,
              charm: {
                id: s.charm.id,
                title: s.charm.title,
                price: s.charm.price,
                image: s.charm.image,
                theme: s.charm.theme,
                color: s.charm.color,
                type: s.charm.type,
                slots: s.charm.slots,
                variantId: s.charm.variantId
              }
            };
          }),
          updatedAt: Date.now()
        };
        try {
          localStorage.setItem(this.getStorageKey(), JSON.stringify(stateToSave));
        } catch (quotaErr) {
          // If storage quota exceeded, strip large transUrl strings and save core state
          stateToSave.slots.forEach(s => { if (s) { delete s.transUrl; } });
          localStorage.setItem(this.getStorageKey(), JSON.stringify(stateToSave));
        }
      } catch (err) {
        console.warn('BraceletBuilder: Unable to save state to localStorage', err);
      }
    }

    loadPersistedState() {
      try {
        const raw = localStorage.getItem(this.getStorageKey());
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return;

        // 1. Restore Model
        if (saved.modelId) {
          const matchedModel = this.models.find(m => String(m.id) === String(saved.modelId));
          if (matchedModel) {
            this.selectedModel = matchedModel;
            this.slotsCount = parseInt(matchedModel.slots, 10) || 16;
            if (matchedModel.type === 'watch' && this.slotsCount % 2 !== 0) {
              this.slotsCount = 14;
            }
          }
        }

        // 2. Restore Variant / Color / Size
        if (saved.sizeVal) {
          this.selectedSize = String(saved.sizeVal).trim();
        }

        const modelVariants = (this.selectedModel && Array.isArray(this.selectedModel.variants) && this.selectedModel.variants.length > 0)
          ? this.selectedModel.variants
          : [];

        let matchedVariant = null;
        if (saved.variantId && modelVariants.length > 0) {
          matchedVariant = modelVariants.find(v => String(v.id) === String(saved.variantId));
        }
        if (!matchedVariant && saved.colorTitle && modelVariants.length > 0) {
          matchedVariant = modelVariants.find(v => {
            const vColor = (v.color || v.title || '').toLowerCase();
            const sColor = saved.colorTitle.toLowerCase();
            const sMatches = !this.selectedSize || String(v.size || '').trim() === this.selectedSize;
            return (vColor.includes(sColor) || sColor.includes(vColor)) && sMatches;
          }) || modelVariants.find(v => (v.color || v.title || '').toLowerCase().includes(saved.colorTitle.toLowerCase()));
        }

        if (matchedVariant) {
          this.selectedVariant = matchedVariant;
          const finishHandle = this.getMetalHandle(matchedVariant.color || matchedVariant.title);
          const displayTitle = matchedVariant.color || (matchedVariant.title ? matchedVariant.title.split('/')[0].trim() : 'Silver');
          this.selectedColor = {
            id: matchedVariant.id,
            title: displayTitle,
            handle: finishHandle,
            price: matchedVariant.price,
            swatch: this.swatches[finishHandle] || '#d9dcdb',
            image: matchedVariant.image || null
          };
          if (matchedVariant.size) {
            this.selectedSize = String(matchedVariant.size).trim();
          }
        }

        // 3. Restore Slots
        if (Array.isArray(saved.slots)) {
          this.slots = new Array(this.slotsCount).fill(null);
          const limit = Math.min(saved.slots.length, this.slotsCount);
          for (let i = 0; i < limit; i++) {
            const savedItem = saved.slots[i];
            if (!savedItem) continue;

            const charmId = savedItem.charmId || (savedItem.charm && savedItem.charm.id);
            const matchedCharm = this.charms.find(ch => String(ch.id) === String(charmId)) || savedItem.charm;
            if (matchedCharm) {
              const reallyIsChain = this.isChainCharm(matchedCharm);
              const reallyIsDrop = this.isDropCharm(matchedCharm) || ((matchedCharm.title || '').toLowerCase().includes('lunar glow') && ((matchedCharm.color || '').toLowerCase().includes('silver') || (this.charmMetaCache && this.charmMetaCache[matchedCharm.image] && this.charmMetaCache[matchedCharm.image].aspectRatio > 1.22)));
              const titleL = (matchedCharm.title || '').toLowerCase();
              const isGoldHeart = titleL.includes('gold crystal heart') || (titleL.includes('crystal heart') && titleL.includes('gold'));
              // Invalidate stale localStorage cache if Crystal Heart was previously cached as freeform
              if (titleL.includes('crystal heart') && !isGoldHeart && this.charmMetaCache[matchedCharm.image] && this.charmMetaCache[matchedCharm.image].isFreeform) {
                delete this.charmMetaCache[matchedCharm.image];
                delete this.transparentCache[matchedCharm.image];
                if (this.calibratedCanvases) delete this.calibratedCanvases[matchedCharm.image];
                savedItem.transUrl = null;
                savedItem.charmMeta = null;
              }
              // Invalidate stale localStorage cache if silver Lunar Glow was previously cached as protruding
              if (titleL.includes('lunar glow') && reallyIsDrop && this.charmMetaCache[matchedCharm.image] && this.charmMetaCache[matchedCharm.image].isProtruding) {
                delete this.charmMetaCache[matchedCharm.image];
                delete this.transparentCache[matchedCharm.image];
                if (this.calibratedCanvases) delete this.calibratedCanvases[matchedCharm.image];
                savedItem.transUrl = null;
                savedItem.charmMeta = null;
              }
              if (reallyIsDrop && matchedCharm.type !== 'drop') {
                matchedCharm.type = 'drop';
              }
              if (savedItem.transUrl && matchedCharm.image) {
                this.transparentCache[matchedCharm.image] = savedItem.transUrl;
              }
              if (savedItem.charmMeta && matchedCharm.image) {
                this.charmMetaCache[matchedCharm.image] = savedItem.charmMeta;
                if (!reallyIsChain && this.charmMetaCache[matchedCharm.image]) {
                  this.charmMetaCache[matchedCharm.image].isChain = false;
                }
              }
              this.slots[i] = {
                charm: matchedCharm,
                isChainStart: reallyIsChain && !!savedItem.isChainStart,
                isChainEnd: reallyIsChain && !!savedItem.isChainEnd,
                chainEndIndex: reallyIsChain ? savedItem.chainEndIndex : undefined,
                chainStartIndex: reallyIsChain ? savedItem.chainStartIndex : undefined,
                isDoubleStart: !reallyIsChain && !!savedItem.isDoubleStart,
                isDoubleEnd: !reallyIsChain && !!savedItem.isDoubleEnd,
                isHanging: reallyIsDrop || !!savedItem.isHanging
              };
            }
          }
          if (this.selectedModel) {
            const isWatch = this.selectedModel.type === 'watch';
            this.reconcileSlotsForModelChange(isWatch, this.slotsCount);
          }
        }
      } catch (err) {
        console.warn('BraceletBuilder: Unable to restore state from localStorage', err);
      }
    }

    clearPersistedState() {
      try {
        localStorage.removeItem(this.getStorageKey());
      } catch (e) {
        console.warn('BraceletBuilder: Error clearing localStorage', e);
      }
    }

    updateModelToolbarUI() {
      const found = this.selectedModel;
      if (!found) return;

      // Update active highlight in model dropdown menu
      if (this.dom.modelMenu) {
        this.dom.modelMenu.querySelectorAll('[data-model-id]').forEach(item => {
          if (String(item.dataset.modelId) === String(found.id)) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });
      }

      // Update Toolbar Model Button Text
      if (this.dom.modelBtn) {
        const modelThumb = found.image || (found.type === 'watch' ? this.getWatchImageSrc(found) : this.getMetalLinkImageSrc(this.selectedColor?.handle || 'silver'));
        const iconHtml = modelThumb 
          ? `<span class="bb-pill-icon" style="background-image: url('${modelThumb}');"></span>`
          : `<span class="bb-swatch swatch-${this.selectedColor?.handle || 'silver'}"></span>`;
        this.dom.modelBtn.innerHTML = `
          ${iconHtml}
          <span>${found.title}</span>
          <svg class="bb-chevron" aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        `;
      }

      // Update Mobile Summary Bar
      this.updateMobileSummaryUI();
    }

    updateMobileSummaryUI() {
      const model = this.selectedModel;
      const color = this.selectedColor;
      if (!model || !this.dom.mobileSummaryTitle) return;

      const colorTitle = color ? color.title : 'Silver';
      this.dom.mobileSummaryTitle.textContent = `${model.title} · ${colorTitle}`;

      if (this.dom.mobileSummaryIcon) {
        const modelThumb = model.image || (model.type === 'watch' ? this.getWatchImageSrc(model) : this.getMetalLinkImageSrc(color?.handle || 'silver'));
        this.dom.mobileSummaryIcon.innerHTML = modelThumb 
          ? `<span class="bb-pill-icon" style="background-image: url('${modelThumb}');"></span>`
          : `<span class="bb-swatch swatch-${color?.handle || 'silver'}"></span>`;
      }
    }

    expandMobileToolbar() {
      if (this.dom.modelColorGroup) {
        this.dom.modelColorGroup.classList.add('is-expanded');
      }
      if (this.dom.mobileExpandBtn) {
        this.dom.mobileExpandBtn.setAttribute('aria-expanded', 'true');
      }
    }

    collapseMobileToolbar() {
      if (this.dom.modelColorGroup) {
        this.dom.modelColorGroup.classList.remove('is-expanded');
      }
      if (this.dom.mobileExpandBtn) {
        this.dom.mobileExpandBtn.setAttribute('aria-expanded', 'false');
      }
      this.closeAllDropdowns();
    }

    setupCanvasScrollOverflow() {
      this.checkCanvasOverflow();

      if (window.ResizeObserver && this.dom.canvasContainer) {
        this.resizeObserver = new ResizeObserver(() => {
          this.checkCanvasOverflow();
        });
        this.resizeObserver.observe(this.dom.canvasContainer);
      } else {
        window.addEventListener('resize', () => {
          this.checkCanvasOverflow();
        });
      }

      window.addEventListener('load', () => {
        this.checkCanvasOverflow();
      });
    }

    checkCanvasOverflow() {
      if (!this.dom || !this.dom.braceletScrollWrap || !this.dom.braceletRow) return;

      const wrap = this.dom.braceletScrollWrap;
      const row = this.dom.braceletRow;

      // When the bracelet row exceeds the visible container, align to start
      // so Slot 1 and Slot 16 are 100% visible on scroll with comfortable padding
      const isOverflowing = row.scrollWidth > wrap.clientWidth;
      if (isOverflowing) {
        wrap.classList.add('is-overflowing');
      } else {
        wrap.classList.remove('is-overflowing');
      }

      // Chain Charms vertical scrolling:
      // If chain charms are added to the bracelet, vertical scrolling both on desktop and mobile
      // is enabled automatically in the bracelet canvas without increasing its height.
      const hasChains = this.hasChainCharms();
      wrap.classList.toggle('has-chain-charms', hasChains);
      if (this.dom.canvasContainer) {
        this.dom.canvasContainer.classList.toggle('has-chain-charms', hasChains);
      }
      if (!hasChains) {
        wrap.scrollTop = 0;
      }
    }

    hasChainCharms() {
      return Array.isArray(this.slots) && this.slots.some(s => s && s.isChainStart);
    }

    isChainCharm(charm) {
      if (!charm) return false;
      let tags = [];
      if (Array.isArray(charm.tags)) {
        tags = charm.tags;
      } else if (typeof charm.tags === 'string' && charm.tags.length > 0) {
        tags = charm.tags.split(',');
      }
      if (tags.length > 0) {
        for (let i = 0; i < tags.length; i++) {
          const t = String(tags[i]).trim().toLowerCase();
          if (t === 'type:chain' || t === 'type: chain') return true;
        }
        return false;
      }
      return charm.type === 'chain';
    }

    isDropCharm(charm) {
      if (!charm) return false;
      if (this.isChainCharm(charm)) return false;
      if (charm.type === 'drop' || charm.type === 'hanging') return true;
      let tags = [];
      if (Array.isArray(charm.tags)) tags = charm.tags;
      else if (typeof charm.tags === 'string' && charm.tags.length > 0) tags = charm.tags.split(',');
      for (let i = 0; i < tags.length; i++) {
        const t = String(tags[i]).trim().toLowerCase();
        if (t === 'type:drop' || t === 'drop') return true;
      }
      const title = String(charm.title || '').toLowerCase();
      if (title.includes('letter ') || title.includes('melted heart') || title.includes('pink stone') || title.includes('cinderella')) return true;
      if (title.includes('crystal heart') && !title.includes('gold')) return true;
      if (title.includes('lunar glow')) {
        const color = String(charm.color || charm.variant || '').toLowerCase();
        const price = parseFloat(charm.price || 0);
        const meta = this.charmMetaCache && charm.image && this.charmMetaCache[charm.image];
        const ar = meta ? meta.aspectRatio : 0;
        let hasSilverTag = false;
        for (let i = 0; i < tags.length; i++) {
          if (String(tags[i]).toLowerCase().includes('silver')) { hasSilverTag = true; break; }
        }
        if (color.includes('silver') || hasSilverTag || price >= 1100 || (price >= 1.1 && price < 100) || ar > 1.22) {
          if (!color.includes('gold') || ar > 1.22) return true;
        }
      }
      return false;
    }

    isFreeformCharm(charm) {
      if (!charm) return false;
      if (this.isChainCharm(charm)) return false;
      if (this.isDropCharm(charm)) return false;
      const title = String(charm.title || '').toLowerCase();
      const isGoldCrystalHeart = title.includes('gold crystal heart') || (title.includes('crystal heart') && title.includes('gold'));
      return isGoldCrystalHeart || title.includes('pink crystal');
    }

    isProtrudingCharm(charm) {
      if (!charm) return false;
      if (this.isChainCharm(charm)) return false;
      if (this.isDropCharm(charm)) return false;
      if (this.isFreeformCharm(charm)) return false;
      const title = String(charm.title || '').toLowerCase();
      const color = String(charm.color || charm.variant || '').toLowerCase();
      const meta = this.charmMetaCache && charm.image && this.charmMetaCache[charm.image];
      const isGoldLunarGlow = title.includes('lunar glow') && (color.includes('gold') || !color.includes('silver') || (meta && meta.aspectRatio <= 1.22));
      return title.includes('crystal butterfly') || isGoldLunarGlow || title.includes('elegant');
    }

    isSlotInChainSpan(index) {
      if (!Array.isArray(this.slots)) return null;
      for (let i = 0; i < this.slotsCount; i++) {
        const item = this.slots[i];
        if (item && item.isChainStart) {
          const endIdx = typeof item.chainEndIndex === 'number' ? item.chainEndIndex : (i + 3);
          if (index >= i && index <= endIdx) {
            return { start: i, end: endIdx, item };
          }
        }
      }
      return null;
    }

    isValidChainSpan(start, slotsCount = this.slotsCount) {
      if (start < 0 || start + 3 >= slotsCount) return false;
      if (this.selectedModel && this.selectedModel.type === 'watch') {
        const leftCount = slotsCount / 2;
        if (start < leftCount && (start + 3) >= leftCount) return false;
      }
      return true;
    }

    isValidDoubleSpan(start, slotsCount = this.slotsCount) {
      if (start < 0 || start + 1 >= slotsCount) return false;
      if (this.selectedModel && this.selectedModel.type === 'watch') {
        const leftCount = slotsCount / 2;
        if (start === leftCount - 1) return false;
      }
      return true;
    }

    reconcileSlotsForModelChange(isWatch, newSlotsCount) {
      if (!Array.isArray(this.slots)) {
        this.slots = new Array(newSlotsCount).fill(null);
        return { removedChains: [], removedDoubles: [], removedSingles: [], hadAdjustments: false };
      }

      const oldSlots = this.slots;
      const newSlots = new Array(newSlotsCount).fill(null);
      const chainCharms = [];
      const doubleCharms = [];
      const singleCharms = [];

      // 1. Extract all placed items
      for (let i = 0; i < oldSlots.length; i++) {
        const item = oldSlots[i];
        if (!item) continue;
        if (item.isChainStart) {
          chainCharms.push({
            charm: item.charm,
            start: i,
            end: typeof item.chainEndIndex === 'number' ? item.chainEndIndex : (i + 3)
          });
        } else if (item.isChainEnd || item.isDoubleEnd) {
          continue;
        } else if (item.isDoubleStart) {
          doubleCharms.push({
            charm: item.charm,
            start: i
          });
        } else {
          singleCharms.push({
            charm: item.charm,
            start: i,
            item: item
          });
        }
      }

      const leftCount = isWatch ? (newSlotsCount / 2) : -1;

      const isValidChain = (s) => {
        if (s < 0 || s + 3 >= newSlotsCount) return false;
        if (isWatch && s < leftCount && (s + 3) >= leftCount) return false;
        return true;
      };

      const isValidDouble = (s) => {
        if (s < 0 || s + 1 >= newSlotsCount) return false;
        if (isWatch && s === leftCount - 1) return false;
        return true;
      };

      const unplacedChains = [];
      const unplacedDoubles = [];
      const unplacedSingles = [];

      // 2A. Place in-place valid chain charms
      for (const c of chainCharms) {
        if (isValidChain(c.start)) {
          const s = c.start;
          newSlots[s] = {
            charm: c.charm,
            isChainStart: true,
            isChainEnd: false,
            chainEndIndex: s + 3,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };
          newSlots[s + 3] = {
            charm: c.charm,
            isChainStart: false,
            isChainEnd: true,
            chainStartIndex: s,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };
        } else {
          unplacedChains.push(c);
        }
      }

      // 2B. Place in-place valid double charms
      for (const d of doubleCharms) {
        const s = d.start;
        if (isValidDouble(s) && newSlots[s] === null && newSlots[s + 1] === null) {
          newSlots[s] = {
            charm: d.charm,
            isDoubleStart: true,
            isDoubleEnd: false,
            isHanging: d.charm.type === 'drop' || d.charm.type === 'hanging'
          };
          newSlots[s + 1] = {
            charm: d.charm,
            isDoubleStart: false,
            isDoubleEnd: true,
            isHanging: false
          };
        } else {
          unplacedDoubles.push(d);
        }
      }

      // 2C. Place in-place valid single charms
      for (const sItem of singleCharms) {
        const idx = sItem.start;
        if (idx < newSlotsCount && newSlots[idx] === null) {
          newSlots[idx] = sItem.item;
        } else {
          unplacedSingles.push(sItem);
        }
      }

      // 3. Relocate unplaced chains
      const removedChains = [];
      const chainCandidates = [];
      if (isWatch) {
        for (let i = 0; i <= leftCount - 4; i++) chainCandidates.push(i);
        for (let i = leftCount; i <= newSlotsCount - 4; i++) chainCandidates.push(i);
      } else {
        for (let i = 0; i <= newSlotsCount - 4; i++) chainCandidates.push(i);
      }

      for (const c of unplacedChains) {
        let placed = false;
        for (const cand of chainCandidates) {
          if (!isValidChain(cand)) continue;
          let hasConflict = false;
          for (let k = 0; k < 4; k++) {
            const sl = newSlots[cand + k];
            if (sl && (sl.isChainStart || sl.isChainEnd || sl.isDoubleStart || sl.isDoubleEnd)) {
              hasConflict = true;
              break;
            }
          }
          if (!hasConflict) {
            // Displace any single charms residing on anchor links cand or cand + 3
            if (newSlots[cand]) {
              unplacedSingles.push({ charm: newSlots[cand].charm, start: cand, item: newSlots[cand] });
            }
            if (newSlots[cand + 3]) {
              unplacedSingles.push({ charm: newSlots[cand + 3].charm, start: cand + 3, item: newSlots[cand + 3] });
            }
            newSlots[cand] = {
              charm: c.charm,
              isChainStart: true,
              isChainEnd: false,
              chainEndIndex: cand + 3,
              isDoubleStart: false,
              isDoubleEnd: false,
              isHanging: false
            };
            newSlots[cand + 3] = {
              charm: c.charm,
              isChainStart: false,
              isChainEnd: true,
              chainStartIndex: cand,
              isDoubleStart: false,
              isDoubleEnd: false,
              isHanging: false
            };
            placed = true;
            break;
          }
        }
        if (!placed) {
          removedChains.push(c.charm);
        }
      }

      // 4. Relocate unplaced double charms
      const removedDoubles = [];
      const doubleCandidates = [];
      if (isWatch) {
        for (let i = 0; i <= leftCount - 2; i++) doubleCandidates.push(i);
        for (let i = leftCount; i <= newSlotsCount - 2; i++) doubleCandidates.push(i);
      } else {
        for (let i = 0; i <= newSlotsCount - 2; i++) doubleCandidates.push(i);
      }

      for (const d of unplacedDoubles) {
        let placed = false;
        for (const cand of doubleCandidates) {
          if (!isValidDouble(cand)) continue;
          if (newSlots[cand] === null && newSlots[cand + 1] === null) {
            newSlots[cand] = {
              charm: d.charm,
              isDoubleStart: true,
              isDoubleEnd: false,
              isHanging: d.charm.type === 'drop' || d.charm.type === 'hanging'
            };
            newSlots[cand + 1] = {
              charm: d.charm,
              isDoubleStart: false,
              isDoubleEnd: true,
              isHanging: false
            };
            placed = true;
            break;
          }
        }
        if (!placed) {
          removedDoubles.push(d.charm);
        }
      }

      // 5. Relocate unplaced single charms
      const removedSingles = [];
      for (const sItem of unplacedSingles) {
        let placed = false;
        for (let idx = 0; idx < newSlotsCount; idx++) {
          if (newSlots[idx] === null) {
            newSlots[idx] = sItem.item;
            placed = true;
            break;
          }
        }
        if (!placed) {
          removedSingles.push(sItem.charm);
        }
      }

      const hadAdjustments = unplacedChains.length > 0 || unplacedDoubles.length > 0 || unplacedSingles.length > 0;
      this.slots = newSlots;
      return { removedChains, removedDoubles, removedSingles, hadAdjustments };
    }

    init() {
      try { this.renderDynamicFilters(); } catch (e) { console.warn('BraceletBuilder: Dynamic filters error', e); }
      try { this.renderSizeDropdown(false); } catch (e) { console.warn('BraceletBuilder: Size dropdown error', e); }
      try { this.renderColorDropdown(false); } catch (e) { console.warn('BraceletBuilder: Color dropdown error', e); }
      this.updateModelToolbarUI();
      this.bindEvents();
      this.renderCanvas();
      this.setupCanvasScrollOverflow();
      this.renderCatalog();
      this.updateSidebar();
      this.updateHeaderMeta();
      this.initOrderNotes();
      this.loadRemainingCharms();
    }

    bindEvents() {
      // Mobile Expandable Model & Color Toolbar Toggle
      this.dom.mobileExpandBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = this.dom.modelColorGroup?.classList.contains('is-expanded');
        if (isExpanded) {
          this.collapseMobileToolbar();
        } else {
          this.expandMobileToolbar();
        }
      });

      // Dropdown Toggles
      this.dom.modelBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown(this.dom.modelBtn, this.dom.modelMenu);
      });

      this.dom.colorBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown(this.dom.colorBtn, this.dom.colorMenu);
      });

      this.dom.sizeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown(this.dom.sizeBtn, this.dom.sizeMenu);
      });

      this.dom.themeFilterBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown(this.dom.themeFilterBtn, this.dom.themePopover);
      });

      this.dom.colorFilterBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown(this.dom.colorFilterBtn, this.dom.colorPopover);
      });

      // Keep filter popovers open while selecting options; only close when clicking outside
      this.dom.themePopover?.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      this.dom.colorPopover?.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Search Toggle
      this.dom.searchToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = this.dom.searchControl?.classList.contains('is-open');
        if (isOpen) {
          if (!this.searchQuery) {
            this.closeSearch();
          } else {
            this.dom.searchInput?.focus();
          }
        } else {
          this.openSearch();
        }
      });

      this.dom.searchControl?.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Close popovers, search, and mobile accordion on outside click
      document.addEventListener('click', (e) => {
        // If click occurred inside a filter popover or trigger button, do not close filter interface
        if (!e.target.closest('.bb-filter-popover, [data-theme-filter-btn], [data-color-filter-btn]')) {
          this.closeAllDropdowns();
        }
        if (this.dom.searchControl?.classList.contains('is-open')) {
          if (!e.target.closest('[data-search-control]')) {
            this.closeSearch();
          }
        }
        if (window.innerWidth < 992 && !e.target.closest('[data-model-color-group], [data-mobile-expand-btn]')) {
          this.collapseMobileToolbar();
        }
      });

      // Escape key closes search, modals & menus
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeAllDropdowns();
          this.collapseMobileToolbar();
          this.closeSidebarDrawer();
          this.closeDrawer();
          this.closeSearch();
          this.closeResetModal();
          this.dom.helpModal?.classList.remove('is-open');
        }
      });

      // Model Select Items
      this.dom.modelMenu?.addEventListener('click', (e) => {
        const item = e.target.closest('[data-model-id]');
        if (!item) return;
        const modelId = item.dataset.modelId;
        this.selectModel(modelId);
        this.closeAllDropdowns();
        if (window.innerWidth < 992) {
          this.collapseMobileToolbar();
        }
      });

      // Color Select Items
      this.dom.colorMenu?.addEventListener('click', (e) => {
        const item = e.target.closest('[data-color-id]');
        if (!item) return;
        const colorId = item.dataset.colorId;
        this.selectColor(colorId);
        this.closeAllDropdowns();
        if (window.innerWidth < 992) {
          this.collapseMobileToolbar();
        }
      });

      // Size Select Items
      this.dom.sizeMenu?.addEventListener('click', (e) => {
        const item = e.target.closest('[data-size-val]');
        if (!item) return;
        const sizeVal = item.dataset.sizeVal;
        this.selectSize(sizeVal);
        this.closeAllDropdowns();
        if (window.innerWidth < 992) {
          this.collapseMobileToolbar();
        }
      });

      // Search
      this.dom.searchInput?.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderCatalog();
      });

      this.dom.searchClear?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.dom.searchInput) {
          this.dom.searchInput.value = '';
          this.searchQuery = '';
          this.renderCatalog();
          this.dom.searchInput.focus();
        }
      });

      // Reset Button (Opens Custom Modal)
      this.dom.resetBtn?.addEventListener('click', () => {
        if (this.hasPlacedCharms()) {
          this.openResetModal();
        } else {
          this.showToast('Your bracelet is already empty');
        }
      });

      // Reset Modal Actions
      const closeReset = () => this.closeResetModal();
      this.dom.resetModalClose?.addEventListener('click', closeReset);
      this.dom.resetModalCancel?.addEventListener('click', closeReset);
      this.dom.resetModal?.addEventListener('click', (e) => {
        if (e.target === this.dom.resetModal) {
          closeReset();
        }
      });

      this.dom.resetModalConfirm?.addEventListener('click', () => {
        this.closeResetModal();
        this.resetDesign();
      });

      // Help Modal
      const openHelp = () => {
        this.dom.helpModal?.classList.add('is-open');
      };
      this.dom.helpBtn?.addEventListener('click', openHelp);
      this.dom.howLink?.addEventListener('click', openHelp);
      this.dom.helpModalClose?.addEventListener('click', () => {
        this.dom.helpModal?.classList.remove('is-open');
      });
      this.dom.helpModal?.addEventListener('click', (e) => {
        if (e.target === this.dom.helpModal) {
          this.dom.helpModal.classList.remove('is-open');
        }
      });

      // Drawer Close
      this.dom.drawerClose?.addEventListener('click', () => this.closeDrawer());
      this.dom.drawerOverlay?.addEventListener('click', () => this.closeDrawer());

      // Mobile Sidebar Right Drawer
      this.dom.floatingTrigger?.addEventListener('click', () => {
        this.openSidebarDrawer();
      });
      this.dom.sidebarClose?.addEventListener('click', () => {
        this.closeSidebarDrawer();
      });
      this.dom.sidebarOverlay?.addEventListener('click', () => {
        this.closeSidebarDrawer();
      });

      // Filter Checkboxes
      this.dom.themePopover?.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
          const val = e.target.value;
          if (e.target.checked) this.activeThemes.add(val);
          else this.activeThemes.delete(val);
          this.updateFilterButtons();
          this.renderCatalog();
        }
      });

      this.dom.colorPopover?.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
          const val = e.target.value;
          if (e.target.checked) this.activeColors.add(val);
          else this.activeColors.delete(val);
          this.updateFilterButtons();
          this.renderCatalog();
        }
      });

      this.dom.clearFiltersBtn?.addEventListener('click', () => {
        this.activeThemes.clear();
        this.activeColors.clear();
        this.container.querySelectorAll('[data-theme-popover] input, [data-color-popover] input').forEach(cb => {
          cb.checked = false;
        });
        this.updateFilterButtons();
        this.renderCatalog();
      });

      // Copy Design Summary
      this.dom.copySummaryLink?.addEventListener('click', (e) => {
        e.preventDefault();
        this.copyDesignSummary();
      });

      // Checkout Button
      this.dom.checkoutBtn?.addEventListener('click', () => {
        this.handleCheckout();
      });

      // Reset checkout button & refresh cart on back navigation from bfcache
      window.addEventListener('pageshow', () => {
        if (this.dom.checkoutBtn) {
          this.dom.checkoutBtn.disabled = false;
          this.dom.checkoutBtn.innerHTML = `Check out &rarr;`;
        }
        if (window.theme && theme.miniCart) {
          if (typeof theme.miniCart.generateCart === 'function') theme.miniCart.generateCart();
          if (typeof theme.miniCart.updateElements === 'function') theme.miniCart.updateElements();
        }
      });

      // Drag & Drop Listeners on Canvas & Catalog
      this.bindDragDrop();
    }

    toggleDropdown(btn, menu) {
      const isOpen = menu?.classList.contains('is-open');
      this.closeAllDropdowns();
      if (!isOpen && menu && btn) {
        menu.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    }

    closeAllDropdowns() {
      this.container.querySelectorAll('.bb-dropdown-menu, .bb-filter-popover').forEach(el => {
        el.classList.remove('is-open');
      });
      this.container.querySelectorAll('[aria-expanded="true"]').forEach(el => {
        el.setAttribute('aria-expanded', 'false');
      });
    }

    openSearch() {
      if (!this.dom.searchControl) return;
      this.closeAllDropdowns();
      this.dom.searchControl.classList.add('is-open');
      setTimeout(() => {
        this.dom.searchInput?.focus();
      }, 50);
    }

    closeSearch() {
      if (!this.dom.searchControl) return;
      this.dom.searchControl.classList.remove('is-open');
      if (this.dom.searchInput) {
        this.dom.searchInput.blur();
        if (this.searchQuery) {
          this.dom.searchInput.value = '';
          this.searchQuery = '';
          this.renderCatalog();
        }
      }
    }

    openResetModal() {
      this.closeAllDropdowns();
      this.closeSearch();
      this.dom.resetModal?.classList.add('is-open');
    }

    closeResetModal() {
      this.dom.resetModal?.classList.remove('is-open');
    }

    updateFilterButtons() {
      // Theme Button
      if (this.dom.themeFilterBtn) {
        const count = this.activeThemes.size;
        if (count > 0) {
          this.dom.themeFilterBtn.classList.add('has-active');
          this.dom.themeFilterBtn.innerHTML = `Theme (${count}) <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;
        } else {
          this.dom.themeFilterBtn.classList.remove('has-active');
          this.dom.themeFilterBtn.innerHTML = `Theme <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;
        }
      }

      // Color Button
      if (this.dom.colorFilterBtn) {
        const count = this.activeColors.size;
        if (count > 0) {
          this.dom.colorFilterBtn.classList.add('has-active');
          this.dom.colorFilterBtn.innerHTML = `Charms Color (${count}) <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;
        } else {
          this.dom.colorFilterBtn.classList.remove('has-active');
          this.dom.colorFilterBtn.innerHTML = `Charms Color <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;
        }
      }

      // Clear Filters Link
      if (this.dom.clearFiltersBtn) {
        if (this.activeThemes.size > 0 || this.activeColors.size > 0) {
          this.dom.clearFiltersBtn.style.display = 'inline-block';
        } else {
          this.dom.clearFiltersBtn.style.display = 'none';
        }
      }
    }

    renderDynamicFilters() {
      try {
        // 1. Gather all unique themes and colors from this.charms
        const themesSet = new Set();
        const colorsSet = new Set();

        (this.charms || []).forEach(ch => {
          if (!ch) return;
          if (ch.theme && String(ch.theme).trim()) {
            themesSet.add(String(ch.theme).trim());
          }
          if (ch.color && String(ch.color).trim()) {
            colorsSet.add(String(ch.color).trim());
          }
          if (Array.isArray(ch.tags)) {
            ch.tags.forEach(tag => {
              if (!tag) return;
              const t = String(tag).trim();
              const tLower = t.toLowerCase();
              if (tLower.startsWith('theme:')) {
                const themeVal = t.slice(6).trim();
                if (themeVal) themesSet.add(themeVal);
              } else if (tLower.startsWith('color:')) {
                const colorVal = t.slice(6).trim();
                if (colorVal) colorsSet.add(colorVal);
              }
            });
          }
        });

        // If charm products provided themes, rebuild theme popover
        if (themesSet.size > 0 && this.dom && this.dom.themePopover) {
          const themesList = Array.from(themesSet).sort();
          const titleEl = this.dom.themePopover.querySelector('.bb-filter-title');
          const titleHtml = titleEl ? titleEl.outerHTML : '<div class="bb-filter-title">Shop by Story</div>';
          
          this.dom.themePopover.innerHTML = `
            ${titleHtml}
            <div class="bb-filter-grid-2col">
              ${themesList.map(name => `
                <label class="bb-checkbox-label">
                  <input type="checkbox" value="${name}" ${this.activeThemes.has(name) ? 'checked' : ''}>
                  <span>${name}</span>
                </label>
              `).join('')}
            </div>
          `;
        }

        // If charm products provided colors, rebuild color popover
        if (colorsSet.size > 0 && this.dom && this.dom.colorPopover) {
          const colorsList = Array.from(colorsSet).sort();
          const titleEl = this.dom.colorPopover.querySelector('.bb-filter-title');
          const titleHtml = titleEl ? titleEl.outerHTML : '<div class="bb-filter-title">Choose a finish</div>';

          this.dom.colorPopover.innerHTML = `
            ${titleHtml}
            <div>
              ${colorsList.map(name => {
                const handle = this.getMetalHandle(name);
                const swatch = this.swatches[handle] || '#d9dcdb';
                return `
                  <label class="bb-checkbox-label">
                    <input type="checkbox" value="${name}" ${this.activeColors.has(name) ? 'checked' : ''}>
                    <span class="bb-swatch swatch-${handle}" style="background: ${swatch};"></span>
                    <span>${name}</span>
                  </label>
                `;
              }).join('')}
            </div>
          `;
        }
      } catch (err) {
        console.warn('BraceletBuilder: Error rendering dynamic filters', err);
      }
    }

    getModelSizes(model = this.selectedModel) {
      if (!model) return [];
      // 1. Try options array
      if (Array.isArray(model.options) && model.options.length > 0) {
        const sizeOpt = model.options.find(opt => {
          const n = (opt.name || '').toLowerCase();
          return n.includes('size') || opt.position === 2;
        });
        if (sizeOpt && Array.isArray(sizeOpt.values) && sizeOpt.values.length > 0) {
          return sizeOpt.values.map(v => String(v).trim()).filter(Boolean);
        }
      }
      // 2. Try unique sizes in variants
      if (Array.isArray(model.variants) && model.variants.length > 0) {
        const sizeSet = new Set();
        model.variants.forEach(v => {
          if (v && v.size && String(v.size).trim()) {
            sizeSet.add(String(v.size).trim());
          }
        });
        if (sizeSet.size > 0) {
          return Array.from(sizeSet);
        }
      }
      // 3. Fallback for bracelet type
      if (model.type === 'bracelet') {
        return ['5.5', '6.5', '7.5', '8.25 - 8.5', '9'];
      }
      return [];
    }

    getMatchingVariant(colorHandleOrTitle, sizeVal) {
      const variants = (this.selectedModel && Array.isArray(this.selectedModel.variants) && this.selectedModel.variants.length > 0)
        ? this.selectedModel.variants
        : [];
      if (variants.length === 0) return null;

      const targetHandle = this.getMetalHandle(colorHandleOrTitle);
      const targetSize = sizeVal ? String(sizeVal).trim().toLowerCase() : null;

      // 1. Exact match on both color and size
      if (targetSize) {
        const exact = variants.find(v => {
          const vHandle = this.getMetalHandle(v.color || v.title);
          const vSize = String(v.size || '').trim().toLowerCase();
          return vHandle === targetHandle && (vSize === targetSize || vSize.includes(targetSize) || targetSize.includes(vSize));
        });
        if (exact) return exact;
      }

      // 2. Match color only
      const colorMatch = variants.find(v => this.getMetalHandle(v.color || v.title) === targetHandle);
      if (colorMatch) return colorMatch;

      // 3. Match size only
      if (targetSize) {
        const sizeMatch = variants.find(v => {
          const vSize = String(v.size || '').trim().toLowerCase();
          return vSize === targetSize;
        });
        if (sizeMatch) return sizeMatch;
      }

      // 4. Fallback to first variant
      return variants[0];
    }

    renderColorDropdown(useModelDefault = false) {
      try {
        if (!this.dom || !this.dom.colorMenu) return;

        const basePrice = this.selectedModel?.price || 4000;
        const variants = (this.selectedModel && Array.isArray(this.selectedModel.variants) && this.selectedModel.variants.length > 0)
          ? this.selectedModel.variants
          : [
              { id: 'var-gold-6-5', title: 'Gold / 6.5', color: 'Gold', size: '6.5', price: basePrice, available: true },
              { id: 'var-silver-6-5', title: 'Silver / 6.5', color: 'Silver', size: '6.5', price: basePrice, available: true },
              { id: 'var-mixed-6-5', title: 'Mixed Gold x Silver / 6.5', color: 'Mixed Gold x Silver', size: '6.5', price: basePrice, available: true },
              { id: 'var-purple-6-5', title: 'Purple / 6.5', color: 'Purple', size: '6.5', price: basePrice, available: true },
              { id: 'var-black-6-5', title: 'Black / 6.5', color: 'Black', size: '6.5', price: basePrice, available: true },
              { id: 'var-red-6-5', title: 'Red / 6.5', color: 'Red', size: '6.5', price: basePrice, available: true },
              { id: 'var-blue-6-5', title: 'Blue / 6.5', color: 'Blue', size: '6.5', price: basePrice, available: true },
              { id: 'var-champagne-6-5', title: 'Champagne / 6.5', color: 'Champagne', size: '6.5', price: basePrice, available: true },
              { id: 'var-neon-6-5', title: 'Neon / 6.5', color: 'Neon', size: '6.5', price: basePrice, available: true }
            ];

        // Resolve model's default finish handle
        const modelDefaultHandle = this.getMetalHandle(this.selectedModel?.defaultColor || this.selectedModel?.default_color || 'gold');

        // When useModelDefault is true (e.g. user selected a model), strictly use that model's Default Metal Color!
        const targetHandle = useModelDefault
          ? modelDefaultHandle
          : (this.selectedColor ? this.selectedColor.handle : modelDefaultHandle);

        let matchedVariant = this.getMatchingVariant(targetHandle, this.selectedSize);
        if (!matchedVariant && !useModelDefault && this.selectedVariant) {
          matchedVariant = variants.find(v => String(v.id) === String(this.selectedVariant.id));
        }
        if (!matchedVariant) {
          matchedVariant = variants.find(v => this.getMetalHandle(v.color || v.title) === modelDefaultHandle) ||
                           variants[0] ||
                           { id: 'var-gold-6-5', title: 'Gold / 6.5', color: 'Gold', size: '6.5', price: basePrice, available: true };
        }

        this.selectedVariant = matchedVariant;
        const finishHandle = this.getMetalHandle(matchedVariant.color || matchedVariant.title || targetHandle);
        const swatchHex = this.swatches[finishHandle] || '#d4a748';
        const displayColorTitle = matchedVariant.color || (matchedVariant.title ? matchedVariant.title.split('/')[0].trim() : 'Gold');

        this.selectedColor = {
          id: matchedVariant.id,
          title: displayColorTitle,
          handle: finishHandle,
          price: matchedVariant.price || basePrice,
          swatch: swatchHex,
          image: matchedVariant.image || null
        };

        // Deduplicate variants by normalized color finish handle so each finish appears exactly once
        const uniqueVariants = [];
        const seenColors = new Set();
        for (const v of variants) {
          const vHandle = this.getMetalHandle(v.color || v.title || 'Gold');
          if (!seenColors.has(vHandle)) {
            seenColors.add(vHandle);
            // Match variant with current size to get accurate price for this color & size combo
            const vForColor = this.getMatchingVariant(vHandle, this.selectedSize) || v;
            uniqueVariants.push(vForColor);
          }
        }

        // Build HTML for color dropdown options
        this.dom.colorMenu.innerHTML = uniqueVariants.map(v => {
          const vHandle = this.getMetalHandle(v.color || v.title || 'Silver');
          const vSwatch = this.swatches[vHandle] || '#d9dcdb';
          const isActive = (vHandle === finishHandle);
          const vTitle = v.color || (v.title ? v.title.split('/')[0].trim() : 'Silver');
          const vPriceFormatted = this.formatMoney(v.price || basePrice);

          return `
            <button type="button" 
                    class="bb-dropdown-item ${isActive ? 'is-active' : ''}" 
                    data-color-id="${v.id}"
                    data-color-handle="${vHandle}">
              <div class="bb-item-left">
                <span class="bb-swatch swatch-${vHandle}" style="background: ${vSwatch};"></span>
                <span class="bb-item-title">${vTitle}</span>
              </div>
              <span class="bb-item-price">${vPriceFormatted}</span>
            </button>
          `;
        }).join('');

        // Update Toolbar Color Button
        if (this.dom.colorBtn) {
          this.dom.colorBtn.innerHTML = `
            <span class="bb-swatch swatch-${finishHandle}" style="background: ${swatchHex};"></span>
            <span>Color: ${displayColorTitle}</span>
            <svg class="bb-chevron" aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          `;
        }

        // Update Mobile Summary Bar
        this.updateMobileSummaryUI();
      } catch (err) {
        console.warn('BraceletBuilder: Error rendering color dropdown', err);
      }
    }

    renderSizeDropdown(useDefault = false) {
      try {
        if (!this.dom || !this.dom.sizeMenu) return;

        const sizes = this.getModelSizes(this.selectedModel);
        if (!sizes || sizes.length === 0) {
          if (this.dom.sizeSelectWrap) {
            this.dom.sizeSelectWrap.style.display = 'none';
          }
          this.selectedSize = null;
          return;
        }

        if (this.dom.sizeSelectWrap) {
          this.dom.sizeSelectWrap.style.display = '';
        }

        // Determine selected size
        if (useDefault || !this.selectedSize || !sizes.includes(this.selectedSize)) {
          const defSize = this.selectedModel?.defaultSize;
          if (defSize && sizes.includes(String(defSize).trim())) {
            this.selectedSize = String(defSize).trim();
          } else {
            this.selectedSize = sizes[0];
          }
        }

        // Resolve matching variant for current color and size
        const currentHandle = this.selectedColor?.handle || this.getMetalHandle(this.selectedModel?.defaultColor || 'silver');
        const matchedVariant = this.getMatchingVariant(currentHandle, this.selectedSize);
        if (matchedVariant) {
          this.selectedVariant = matchedVariant;
          if (this.selectedColor) {
            this.selectedColor.id = matchedVariant.id;
            this.selectedColor.price = matchedVariant.price;
          }
        }

        // Build HTML for size dropdown items
        const basePrice = this.selectedModel?.price || 4000;
        this.dom.sizeMenu.innerHTML = sizes.map(sizeVal => {
          const isActive = String(sizeVal).trim() === String(this.selectedSize).trim();
          const variantForSize = this.getMatchingVariant(currentHandle, sizeVal);
          const sizePrice = (variantForSize && variantForSize.price != null) ? variantForSize.price : basePrice;
          const priceFormatted = this.formatMoney(sizePrice);

          return `
            <button type="button" 
                    class="bb-dropdown-item ${isActive ? 'is-active' : ''}" 
                    data-size-val="${sizeVal}">
              <div class="bb-item-left">
                <span class="bb-item-title">Size ${sizeVal}</span>
              </div>
              <span class="bb-item-price">${priceFormatted}</span>
            </button>
          `;
        }).join('');

        // Update Size Button UI
        if (this.dom.sizeBtn) {
          this.dom.sizeBtn.innerHTML = `
            <svg class="bb-pill-icon-svg" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.3 8.7 8.7 21.3c-1 1-2.6 1-3.6 0l-1.4-1.4c-1-1-1-2.6 0-3.6L16.3 3.7c1-1 2.6-1 3.6 0l1.4 1.4c1 1 1 2.6 0 3.6z"></path>
              <path d="m14.5 5.5 2 2"></path>
              <path d="m11.5 8.5 2 2"></path>
              <path d="m8.5 11.5 2 2"></path>
              <path d="m5.5 14.5 2 2"></path>
            </svg>
            <span>Size: ${this.selectedSize}</span>
            <svg class="bb-chevron" aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          `;
        }
      } catch (err) {
        console.warn('BraceletBuilder: Error rendering size dropdown', err);
      }
    }

    selectSize(sizeVal) {
      if (!sizeVal) return;
      this.selectedSize = String(sizeVal).trim();

      const currentHandle = this.selectedColor?.handle || this.getMetalHandle(this.selectedModel?.defaultColor || 'silver');
      const matched = this.getMatchingVariant(currentHandle, this.selectedSize);
      if (matched) {
        this.selectedVariant = matched;
        if (this.selectedColor) {
          this.selectedColor.id = matched.id;
          this.selectedColor.price = matched.price;
        }
      }

      // Update active highlight in size dropdown menu
      if (this.dom.sizeMenu) {
        this.dom.sizeMenu.querySelectorAll('[data-size-val]').forEach(item => {
          if (String(item.dataset.sizeVal).trim() === this.selectedSize) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });
      }

      // Update Size Button UI
      if (this.dom.sizeBtn) {
        this.dom.sizeBtn.innerHTML = `
          <svg class="bb-pill-icon-svg" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.3 8.7 8.7 21.3c-1 1-2.6 1-3.6 0l-1.4-1.4c-1-1-1-2.6 0-3.6L16.3 3.7c1-1 2.6-1 3.6 0l1.4 1.4c1 1 1 2.6 0 3.6z"></path>
            <path d="m14.5 5.5 2 2"></path>
            <path d="m11.5 8.5 2 2"></path>
            <path d="m8.5 11.5 2 2"></path>
            <path d="m5.5 14.5 2 2"></path>
          </svg>
          <span>Size: ${this.selectedSize}</span>
          <svg class="bb-chevron" aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        `;
      }

      // Re-render color dropdown to update prices for this size
      this.renderColorDropdown(false);

      // Update mobile summary bar, sidebar, and persist
      this.updateMobileSummaryUI();
      this.updateSidebar();
      this.updateHeaderMeta();
      this.savePersistedState();
    }

    selectModel(modelId) {
      const found = this.models.find(m => String(m.id) === String(modelId));
      if (!found) return;

      const isWatch = found.type === 'watch';
      const prevIsWatch = this.selectedModel ? (this.selectedModel.type === 'watch') : false;

      this.selectedModel = found;
      this.slotsCount = parseInt(found.slots, 10) || 16;
      if (found.type === 'watch' && this.slotsCount % 2 !== 0) {
        this.slotsCount = 14;
      }

      // First re-populate size dropdown for this model (using default size)
      this.renderSizeDropdown(true);

      // Re-populate color dropdown dynamically using this model's Default Metal Color!
      this.renderColorDropdown(true);

      // Reconcile slots gracefully preserving placed charms and resolving watch bridging/overflow
      const { removedChains, removedDoubles, removedSingles, hadAdjustments } = this.reconcileSlotsForModelChange(isWatch, this.slotsCount);

      if (removedChains.length > 0 || removedDoubles.length > 0 || removedSingles.length > 0) {
        const parts = [];
        if (removedChains.length > 0) parts.push(`${removedChains.length} chain charm${removedChains.length > 1 ? 's' : ''}`);
        if (removedDoubles.length > 0) parts.push(`${removedDoubles.length} 2-link charm${removedDoubles.length > 1 ? 's' : ''}`);
        if (removedSingles.length > 0) parts.push(`${removedSingles.length} charm${removedSingles.length > 1 ? 's' : ''}`);
        this.showToast(`Adjusted charms for watch layout. Removed ${parts.join(', ')} that could not fit.`);
      } else if (hadAdjustments && isWatch) {
        this.showToast('Adjusted charm positions for watch layout.');
      }

      // Update Toolbar Model Button Text and dropdown highlight
      this.updateModelToolbarUI();

      // Always show color select wrap (never hide it, even for watches)
      if (this.dom.colorSelectWrap) {
        this.dom.colorSelectWrap.style.display = 'block';
      }

      // Re-render
      this.renderCanvas();
      this.updateSidebar();
      this.updateHeaderMeta();
      this.savePersistedState();
    }

    selectColor(variantId) {
      const variants = (this.selectedModel && this.selectedModel.variants && this.selectedModel.variants.length > 0)
        ? this.selectedModel.variants
        : [];

      // Find by variant ID or handle
      let found = variants.find(v => String(v.id) === String(variantId));
      let finishHandle = '';
      if (found) {
        finishHandle = this.getMetalHandle(found.color || found.title);
      } else {
        finishHandle = this.getMetalHandle(variantId);
      }

      // Match variant for this finishHandle AND this.selectedSize
      const matchedWithCurrentSize = this.getMatchingVariant(finishHandle, this.selectedSize);
      if (matchedWithCurrentSize) {
        found = matchedWithCurrentSize;
        finishHandle = this.getMetalHandle(found.color || found.title);
      }

      if (!found) return;

      this.selectedVariant = found;
      const swatchHex = this.swatches[finishHandle] || '#d9dcdb';
      const displayColorTitle = found.color || (found.title ? found.title.split('/')[0].trim() : 'Silver');

      this.selectedColor = {
        id: found.id,
        title: displayColorTitle,
        handle: finishHandle,
        price: found.price,
        swatch: swatchHex,
        image: found.image || null
      };

      // Update active highlight in color dropdown menu
      if (this.dom.colorMenu) {
        this.dom.colorMenu.querySelectorAll('[data-color-id], [data-color-handle]').forEach(item => {
          const itemHandle = item.dataset.colorHandle || this.getMetalHandle(item.textContent);
          if (itemHandle === finishHandle || String(item.dataset.colorId) === String(found.id)) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });
      }

      // Update Toolbar Color Button Text
      if (this.dom.colorBtn) {
        this.dom.colorBtn.innerHTML = `
          <span class="bb-swatch swatch-${finishHandle}" style="background: ${swatchHex};"></span>
          <span>Color: ${displayColorTitle}</span>
          <svg class="bb-chevron" aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        `;
      }

      // Update size dropdown prices for this color
      this.renderSizeDropdown(false);

      // Update Mobile Summary Bar
      this.updateMobileSummaryUI();

      // Re-render
      this.renderCanvas();
      this.updateSidebar();
      this.updateHeaderMeta();
      this.savePersistedState();
    }

    getWatchImageSrc(model) {
      const modelId = ((model && model.id) || (this.selectedModel && this.selectedModel.id) || '').toLowerCase();
      const modelTitle = ((model && model.title) || (this.selectedModel && this.selectedModel.title) || '').toLowerCase();
      const assetUrls = this.assetUrls || {};

      if (modelId.includes('blush-gold') || (modelTitle.includes('blush') && modelTitle.includes('gold'))) {
        return assetUrls.watchBlushGold || 'watch-blush-gold.png';
      }
      if (modelId.includes('blush-silver') || (modelTitle.includes('blush') && modelTitle.includes('silver'))) {
        return assetUrls.watchBlushSilver || 'watch-blush-silver.png';
      }
      if (modelId.includes('flower') || modelTitle.includes('flower')) {
        return assetUrls.watchFlower || 'watch-flower.png';
      }
      if (modelId.includes('fuchsia') || modelTitle.includes('fuchsia')) {
        return assetUrls.watchFuchsia || 'watch-fuchsia.png';
      }
      if (modelId.includes('glittery') || modelTitle.includes('glitter')) {
        return assetUrls.watchGlittery || 'watch-glittery.png';
      }
      if (modelId.includes('lilac-gold') || (modelTitle.includes('lilac') && modelTitle.includes('gold'))) {
        return assetUrls.watchLilacGold || 'watch-lilac-gold.png';
      }
      if (modelId.includes('lilac-silver') || (modelTitle.includes('lilac') && modelTitle.includes('silver'))) {
        return assetUrls.watchLilacSilver || 'watch-lilac-silver.png';
      }
      if (modelId.includes('pearly-gold') || (modelTitle.includes('pearly') && modelTitle.includes('gold'))) {
        return assetUrls.watchPearlyGold || 'watch-pearly-gold.png';
      }
      if (modelId.includes('pearly-silver') || (modelTitle.includes('pearly') && modelTitle.includes('silver'))) {
        return assetUrls.watchPearlySilver || 'watch-pearly-silver.png';
      }
      if (modelId.includes('sky-blue') || (modelTitle.includes('sky') && modelTitle.includes('blue'))) {
        return assetUrls.watchSkyBlue || 'watch-sky-blue.png';
      }

      // Legacy fallback mappings
      if (modelId.includes('blue')) return assetUrls.watchSkyBlue || 'watch-sky-blue.png';
      if (modelId.includes('pink')) return assetUrls.watchBlushGold || 'watch-blush-gold.png';
      if (modelId.includes('gold')) return assetUrls.watchBlushGold || 'watch-blush-gold.png';

      // If model has direct image assigned
      if (model && model.image && !model.image.includes('bracelet-')) return model.image;
      if (this.selectedModel && this.selectedModel.image && !this.selectedModel.image.includes('bracelet-')) return this.selectedModel.image;
      if (this.selectedVariant && this.selectedVariant.image) return this.selectedVariant.image;

      return assetUrls.watchFlower || 'watch-flower.png';
    }

    getWatchHorizontalImageSrc(model) {
      const modelId = ((model && model.id) || (this.selectedModel && this.selectedModel.id) || '').toLowerCase();
      const modelTitle = ((model && model.title) || (this.selectedModel && this.selectedModel.title) || '').toLowerCase();
      const assetUrls = this.assetUrls || {};

      if (modelId.includes('blush-gold') || (modelTitle.includes('blush') && modelTitle.includes('gold'))) {
        return assetUrls.watchBlushGoldHorizontal || 'watch-blush-gold-horizontal.png';
      }
      if (modelId.includes('blush-silver') || (modelTitle.includes('blush') && modelTitle.includes('silver'))) {
        return assetUrls.watchBlushSilverHorizontal || 'watch-blush-silver-horizontal.png';
      }
      if (modelId.includes('flower') || modelTitle.includes('flower')) {
        return assetUrls.watchFlowerHorizontal || 'watch-flower-horizontal.png';
      }
      if (modelId.includes('fuchsia') || modelTitle.includes('fuchsia')) {
        return assetUrls.watchFuchsiaHorizontal || 'watch-fuchsia-horizontal.png';
      }
      if (modelId.includes('glittery') || modelTitle.includes('glitter')) {
        return assetUrls.watchGlitteryHorizontal || 'watch-glittery-horizontal.png';
      }
      if (modelId.includes('lilac-gold') || (modelTitle.includes('lilac') && modelTitle.includes('gold'))) {
        return assetUrls.watchLilacGoldHorizontal || 'watch-lilac-gold-horizontal.png';
      }
      if (modelId.includes('lilac-silver') || (modelTitle.includes('lilac') && modelTitle.includes('silver'))) {
        return assetUrls.watchLilacSilverHorizontal || 'watch-lilac-silver-horizontal.png';
      }
      if (modelId.includes('pearly-gold') || (modelTitle.includes('pearly') && modelTitle.includes('gold'))) {
        return assetUrls.watchPearlyGoldHorizontal || 'watch-pearly-gold-horizontal.png';
      }
      if (modelId.includes('pearly-silver') || (modelTitle.includes('pearly') && modelTitle.includes('silver'))) {
        return assetUrls.watchPearlySilverHorizontal || 'watch-pearly-silver-horizontal.png';
      }
      if (modelId.includes('sky-blue') || (modelTitle.includes('sky') && modelTitle.includes('blue'))) {
        return assetUrls.watchSkyBlueHorizontal || 'watch-sky-blue-horizontal.png';
      }

      if (model && model.horizontalImage) return model.horizontalImage;
      if (this.selectedModel && this.selectedModel.horizontalImage) return this.selectedModel.horizontalImage;

      if (modelId.includes('blue')) return assetUrls.watchSkyBlueHorizontal || 'watch-sky-blue-horizontal.png';
      if (modelId.includes('pink') || modelId.includes('gold')) return assetUrls.watchBlushGoldHorizontal || 'watch-blush-gold-horizontal.png';

      return assetUrls.watchFlowerHorizontal || 'watch-flower-horizontal.png';
    }

    getWatchHorizontalDimensions(model) {
      const modelId = ((model && model.id) || (this.selectedModel && this.selectedModel.id) || '').toLowerCase();
      const modelTitle = ((model && model.title) || (this.selectedModel && this.selectedModel.title) || '').toLowerCase();

      const dims = {
        'blush-gold': { width: 411, height: 204 },
        'blush-silver': { width: 391, height: 203 },
        'flower': { width: 440, height: 238 },
        'fuchsia': { width: 385, height: 199 },
        'glittery': { width: 392, height: 204 },
        'lilac-gold': { width: 390, height: 204 },
        'lilac-silver': { width: 387, height: 200 },
        'pearly-gold': { width: 372, height: 197 },
        'pearly-silver': { width: 409, height: 194 },
        'sky-blue': { width: 317, height: 189 }
      };

      for (const [key, dim] of Object.entries(dims)) {
        if (modelId.includes(key) || modelTitle.includes(key.replace('-', ' '))) {
          return dim;
        }
      }

      if (modelId.includes('blue') || modelTitle.includes('blue')) return dims['sky-blue'];
      if (modelId.includes('pink') || modelTitle.includes('pink')) return dims['blush-gold'];
      if (modelId.includes('gold') || modelTitle.includes('gold')) return dims['pearly-gold'];

      return { width: 360, height: 200 };
    }

    getMetalLinkImageSrc(handle) {
      const assetUrls = this.assetUrls || {};
      const h = (handle || '').toLowerCase();
      if (h === 'mixed' || h.includes('mixed')) return assetUrls.braceletMixed || 'bracelet-mixed.png';
      if (h.includes('purple')) return assetUrls.braceletPurple || 'bracelet-purple.png';
      if (h.includes('red')) return assetUrls.braceletRed || 'bracelet-red.png';
      if (h.includes('blue')) return assetUrls.braceletBlue || 'bracelet-blue.png';
      if (h.includes('champagne')) return assetUrls.braceletChampagne || 'bracelet-champagne.png';
      if (h.includes('neon')) return assetUrls.braceletNeon || 'bracelet-neon.png';
      if (h.includes('gold') && !h.includes('rose')) return assetUrls.braceletGold || 'bracelet-gold.png';
      if (h.includes('rose')) return assetUrls.braceletRose || 'bracelet-rose-gold.png';
      if (h.includes('black')) return assetUrls.braceletBlack || 'bracelet-black.png';
      return assetUrls.braceletSilver || 'bracelet-silver.png';
    }

    preloadMetalLinks() {
      if (!this.preloadedLinks) this.preloadedLinks = {};
      const handles = ['silver', 'gold', 'mixed', 'purple', 'black', 'red', 'blue', 'champagne', 'neon', 'rose'];
      handles.forEach(handle => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.getMetalLinkImageSrc(handle);
        this.preloadedLinks[handle] = img;
      });
    }

    renderCanvas() {
      if (!this.dom.braceletRow) return;

      const finishHandle = this.selectedColor.handle || 'silver';
      const finishClass = `metal-${finishHandle}`;
      const linkImg = this.getMetalLinkImageSrc(finishHandle);

      this.dom.braceletRow.className = `bb-bracelet-row ${finishClass}`;
      this.dom.braceletRow.style.setProperty('--bracelet-link', `url('${linkImg}')`);
      this.dom.braceletRow.innerHTML = '';

      const isWatch = this.selectedModel.type === 'watch';
      if (isWatch && this.slotsCount % 2 !== 0) {
        this.slotsCount = 14;
      }
      const totalSlots = this.slotsCount;
      const leftCount = isWatch ? (totalSlots / 2) : totalSlots;

      // Render Left Links
      for (let i = 0; i < leftCount; i++) {
        const slotEl = this.createSlotElement(i);
        this.dom.braceletRow.appendChild(slotEl);
      }

      // Render Center Watch Dial if Watch Model
      if (isWatch) {
        const watchDialEl = document.createElement('div');
        watchDialEl.className = 'bb-watch-dial-slot watch-on-bracelet';
        watchDialEl.setAttribute('role', 'img');
        watchDialEl.setAttribute('aria-label', this.selectedModel.title);

        const watchSrc = this.getWatchHorizontalImageSrc(this.selectedModel);
        const watchDims = this.getWatchHorizontalDimensions(this.selectedModel);

        watchDialEl.style.width = `${watchDims.width}px`;
        watchDialEl.style.minWidth = `${watchDims.width}px`;
        watchDialEl.style.flexBasis = `${watchDims.width}px`;
        watchDialEl.style.marginLeft = '-4px';
        watchDialEl.style.marginRight = '-4px';

        watchDialEl.innerHTML = `<img src="${watchSrc}" alt="${this.selectedModel.title}" width="${watchDims.width}" height="${watchDims.height}" style="width: ${watchDims.width}px; height: ${watchDims.height}px;">`;

        this.dom.braceletRow.appendChild(watchDialEl);

        // Render Right Links
        for (let i = leftCount; i < totalSlots; i++) {
          const slotEl = this.createSlotElement(i);
          this.dom.braceletRow.appendChild(slotEl);
        }
      }

      this.updateStageStatus();
      this.checkCanvasOverflow();
    }

    processImageTransparency(imageUrl, callback, isCharm = true, charm = null) {
      if (!imageUrl) {
        callback(imageUrl, null);
        return;
      }
      // Never process or alter watch images (they are official transparent centerpieces, not charms)
      if (!isCharm || imageUrl.includes('watch') || imageUrl.includes('watch-') || imageUrl.includes('watch00')) {
        callback(imageUrl, null);
        return;
      }
      if (!this.transparentCache) this.transparentCache = {};
      if (!this.charmMetaCache) this.charmMetaCache = {};

      if (this.transparentCache[imageUrl]) {
        callback(this.transparentCache[imageUrl], this.charmMetaCache[imageUrl] || null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const w = canvas.width;
          const h = canvas.height;
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          // Pre-clear outer letterbox bars (e.g. Cinderella top/bottom black bars and CDN downscaling gray transitions)
          // Doing this before BFS flood fill prevents anti-aliased gray boundary pixels from trapping the studio background
          let topClean = 0;
          const maxScanRows = Math.min(50, Math.floor(h / 4));
          for (let y = 0; y < maxScanRows; y++) {
            let darkOrGray = 0;
            const rowOffset = y * w * 4;
            for (let x = 0; x < w; x++) {
              const idx = rowOffset + x * 4;
              const a = data[idx + 3];
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              if (a < 25 || (r < 50 && g < 50 && b < 50) || (r < 235 && Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b)) < 16)) {
                darkOrGray++;
              }
            }
            if (darkOrGray > w * 0.8) {
              topClean = y + 1;
            } else {
              break;
            }
          }

          let botClean = h;
          for (let y = h - 1; y >= Math.max(h - 50, Math.floor(h * 3 / 4)); y--) {
            let darkOrGray = 0;
            const rowOffset = y * w * 4;
            for (let x = 0; x < w; x++) {
              const idx = rowOffset + x * 4;
              const a = data[idx + 3];
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              if (a < 25 || (r < 50 && g < 50 && b < 50) || (r < 235 && Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b)) < 16)) {
                darkOrGray++;
              }
            }
            if (darkOrGray > w * 0.8) {
              botClean = y;
            } else {
              break;
            }
          }

          for (let y = 0; y < topClean; y++) {
            const rowOffset = y * w * 4;
            for (let x = 0; x < w; x++) {
              data[rowOffset + x * 4 + 3] = 0;
            }
          }
          for (let y = botClean; y < h; y++) {
            const rowOffset = y * w * 4;
            for (let x = 0; x < w; x++) {
              data[rowOffset + x * 4 + 3] = 0;
            }
          }

          // Helper to check if a pixel is white studio background, letterbox bar, or already transparent
          function isBg(idx) {
            const a = data[idx + 3];
            if (a < 25) return true;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            // Dark letterbox borders (e.g. Cinderella top/bottom black bars)
            if (r < 30 && g < 30 && b < 30) return true;
            // High-brightness studio white background (tolerance for compression noise, preserves metallic highlights & silver stars)
            if (r > 242 && g > 242 && b > 242) {
              const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
              if (diff < 24) return true;
            }
            return false;
          }

          // Edge-connected flood fill: only erase background connected to the outer perimeter
          // Preserves all internal metallic highlights, silver reflections, and gold surfaces
          const visited = new Uint8Array(w * h);
          const queue = new Int32Array(w * h);
          let head = 0;
          let tail = 0;

          // Seed top and bottom edges
          for (let x = 0; x < w; x++) {
            const idx0 = x * 4;
            if (isBg(idx0)) {
              visited[x] = 1;
              queue[tail++] = x;
            }
            const pLast = (h - 1) * w + x;
            const idxLast = pLast * 4;
            if (!visited[pLast] && isBg(idxLast)) {
              visited[pLast] = 1;
              queue[tail++] = pLast;
            }
          }
          // Seed left and right edges
          for (let y = 0; y < h; y++) {
            const pLeft = y * w;
            const idxLeft = pLeft * 4;
            if (!visited[pLeft] && isBg(idxLeft)) {
              visited[pLeft] = 1;
              queue[tail++] = pLeft;
            }
            const pRight = y * w + (w - 1);
            const idxRight = pRight * 4;
            if (!visited[pRight] && isBg(idxRight)) {
              visited[pRight] = 1;
              queue[tail++] = pRight;
            }
          }

          // BFS traversal through background
          while (head < tail) {
            const p = queue[head++];
            const px = p % w;
            const py = (p / w) | 0;

            if (px > 0) {
              const n = p - 1;
              if (!visited[n] && isBg(n * 4)) {
                visited[n] = 1;
                queue[tail++] = n;
              }
            }
            if (px < w - 1) {
              const n = p + 1;
              if (!visited[n] && isBg(n * 4)) {
                visited[n] = 1;
                queue[tail++] = n;
              }
            }
            if (py > 0) {
              const n = p - w;
              if (!visited[n] && isBg(n * 4)) {
                visited[n] = 1;
                queue[tail++] = n;
              }
            }
            if (py < h - 1) {
              const n = p + w;
              if (!visited[n] && isBg(n * 4)) {
                visited[n] = 1;
                queue[tail++] = n;
              }
            }
          }

          // Make only edge-connected background pixels transparent
          for (let i = 0; i < tail; i++) {
            data[queue[i] * 4 + 3] = 0;
          }

          ctx.putImageData(imgData, 0, 0);

          // Find exact content bounding box of physical charm (trim all whitespace padding & filter border artifacts)
          const rowCounts = new Int32Array(canvas.height);
          for (let y = 0; y < canvas.height; y++) {
            const rowOffset = y * canvas.width * 4;
            for (let x = 0; x < canvas.width; x++) {
              if (data[rowOffset + x * 4 + 3] > 25) {
                rowCounts[y]++;
              }
            }
          }

          let minY = -1;
          for (let y = 0; y < canvas.height; y++) {
            // Must have real content (> 15 non-transparent pixels) across multiple rows
            if (rowCounts[y] > 15) {
              const nextValid = (y + 1 < canvas.height && rowCounts[y + 1] > 15) ||
                                (y + 2 < canvas.height && rowCounts[y + 2] > 15) ||
                                (y + 3 < canvas.height && rowCounts[y + 3] > 15);
              if (nextValid) {
                minY = y;
                break;
              }
            }
          }
          if (minY === -1) minY = 0;

          let maxY = -1;
          for (let y = canvas.height - 1; y >= minY; y--) {
            if (rowCounts[y] > 10) {
              maxY = y;
              break;
            }
          }
          if (maxY === -1) maxY = canvas.height - 1;

          let minX = canvas.width, maxX = -1;
          for (let y = minY; y <= maxY; y++) {
            const rowOffset = y * canvas.width * 4;
            for (let x = 0; x < canvas.width; x++) {
              if (data[rowOffset + x * 4 + 3] > 25) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
              }
            }
          }
          if (minX > maxX) { minX = 0; maxX = canvas.width - 1; }

          let finalUrl = canvas.toDataURL('image/png');
          let meta = { aspectRatio: 1, isHanging: false };

          if (maxX >= minX && maxY >= minY) {
            const contentW = maxX - minX + 1;
            const contentH = maxY - minY + 1;
            const aspectRatio = contentH / contentW;

            if (!charm && imageUrl && this.charms && this.charms.length > 0) {
              charm = this.charms.find(c => c.image === imageUrl);
            }
            const charmTitleLower = ((charm && charm.title) ? charm.title : (imageUrl ? decodeURIComponent(imageUrl) : '')).toLowerCase();
            const isChain = this.isChainCharm(charm);

            if (isChain && charm) {
              charm.type = 'chain';
              charm.slots = 4;
            }

            const isDrop = this.isDropCharm(charm) || (charmTitleLower.includes('lunar glow') && aspectRatio > 1.22);
            if (isDrop && charm) {
              charm.type = 'drop';
            }
            const isFreeform = !isChain && !isDrop && this.isFreeformCharm(charm);
            const isProtruding = !isChain && !isDrop && !isFreeform && (this.isProtrudingCharm(charm) || charmTitleLower.includes('crystal butterfly') || (charmTitleLower.includes('lunar glow') && aspectRatio <= 1.22) || charmTitleLower.includes('elegant'));
            const isHanging = !isChain && (isDrop || (charm && (charm.type === 'drop' || charm.type === 'hanging')) || aspectRatio > 1.22);

            meta = {
              aspectRatio,
              isChain,
              isHanging,
              isFreeform,
              isProtruding,
              keepBaseLink: isFreeform || isProtruding,
              contentW,
              contentH
            };

            if (isChain) {
              // 4-Link Chain Charm Anchor Calibration:
              // Robustly locate left link clip, right link clip, and the dangling chain span
              let lMinX = -1, lMaxX = -1, rMinX = -1, rMaxX = -1;
              const sampleY = Math.min(maxY, minY + Math.max(25, Math.round(contentH * 0.08)));
              const sampleRowOffset = sampleY * canvas.width * 4;

              const rowNonEmpty = [];
              for (let x = minX; x <= maxX; x++) {
                if (data[sampleRowOffset + x * 4 + 3] > 25) {
                  rowNonEmpty.push(x);
                }
              }

              const midSplit = minX + contentW * 0.5;
              const leftXs = rowNonEmpty.filter(x => x < midSplit - 15);
              const rightXs = rowNonEmpty.filter(x => x > midSplit + 15);

              if (leftXs.length > 5 && rightXs.length > 5) {
                lMinX = Math.min(...leftXs);
                lMaxX = Math.max(...leftXs);
                rMinX = Math.min(...rightXs);
                rMaxX = Math.max(...rightXs);
              }

              const lW = (lMaxX > lMinX) ? (lMaxX - lMinX + 1) : 0;
              const rW = (rMaxX > rMinX) ? (rMaxX - rMinX + 1) : 0;

              if (lW > 30 && rW > 30) {
                // Measure left rectangular link head height on outer band (8%..18% of lW, well clear of corner bevels and center ring/dangling ornaments)
                const lx1 = lMinX + Math.round(lW * 0.08);
                const lx2 = lMinX + Math.round(lW * 0.18);
                const lyMin = minY + Math.round(lW * 0.72);
                const lyMax = Math.min(maxY, minY + Math.round(lW * 1.05));
                const lFreq = {};
                for (let x = lx1; x <= lx2; x++) {
                  let colBot = -1;
                  for (let y = lyMin; y <= lyMax; y++) {
                    if (data[y * canvas.width * 4 + x * 4 + 3] > 25) {
                      colBot = y;
                    }
                  }
                  if (colBot > 0) {
                    lFreq[colBot] = (lFreq[colBot] || 0) + 1;
                  }
                }
                let lModeY = -1, lMaxCount = 0;
                for (const yStr in lFreq) {
                  if (lFreq[yStr] > lMaxCount) {
                    lMaxCount = lFreq[yStr];
                    lModeY = parseInt(yStr, 10);
                  }
                }
                const lBotY = lModeY > 0 ? lModeY : Math.round(minY + lW * 0.86);
                const lLinkH = Math.max(30, lBotY - minY + 1);

                // Measure right rectangular link head height on outer band (82%..92% of rW)
                const rx1 = rMinX + Math.round(rW * 0.82);
                const rx2 = rMinX + Math.round(rW * 0.92);
                const ryMin = minY + Math.round(rW * 0.72);
                const ryMax = Math.min(maxY, minY + Math.round(rW * 1.05));
                const rFreq = {};
                for (let x = rx1; x <= rx2; x++) {
                  let colBot = -1;
                  for (let y = ryMin; y <= ryMax; y++) {
                    if (data[y * canvas.width * 4 + x * 4 + 3] > 25) {
                      colBot = y;
                    }
                  }
                  if (colBot > 0) {
                    rFreq[colBot] = (rFreq[colBot] || 0) + 1;
                  }
                }
                let rModeY = -1, rMaxCount = 0;
                for (const yStr in rFreq) {
                  if (rFreq[yStr] > rMaxCount) {
                    rMaxCount = rFreq[yStr];
                    rModeY = parseInt(yStr, 10);
                  }
                }
                const rBotY = rModeY > 0 ? rModeY : Math.round(minY + rW * 0.86);
                const rLinkH = Math.max(30, rBotY - minY + 1);

                const origLCenter = (lMinX + lMaxX) / 2.0;
                const origRCenter = (rMinX + rMaxX) / 2.0;
                const origLoopDist = Math.max(50, origRCenter - origLCenter);

                // Slot 1 center = 32px, Slot 4 center = 224px. Span distance = 192px.
                const chainScale = 192.0 / origLoopDist;
                const chainOrigH = maxY - minY + 1;
                const destChainH = Math.round(chainOrigH * chainScale);
                const destCanvasH = Math.max(64, destChainH + 20);

                const chainCanvas = document.createElement('canvas');
                chainCanvas.width = 256;
                chainCanvas.height = destCanvasH;
                const cCtx = chainCanvas.getContext('2d');

                // 1. Draw continuous chain connecting left and right loop centers
                // Crop from bottom of the link heads downwards to avoid duplicate ghost bevels
                const chainCropX1 = lMinX;
                const chainCropX2 = rMaxX;
                const chainCropY1 = minY + Math.max(lLinkH, rLinkH);
                const chainCropY2 = maxY + 1;
                const cCropW = chainCropX2 - chainCropX1;
                const cCropH = chainCropY2 - chainCropY1;

                if (cCropW > 0 && cCropH > 0) {
                  const cDestW = Math.round(cCropW * chainScale);
                  const cDestH = Math.round(cCropH * chainScale);
                  const cDestX = Math.round(32 + (chainCropX1 - origLCenter) * chainScale);
                  const cDestY = 64;
                  cCtx.drawImage(canvas, chainCropX1, chainCropY1, cCropW, cCropH, cDestX, cDestY, cDestW, cDestH);
                }

                // 2. Draw Left Link Clip (Slot 1: x = 0..64, metal head spans y = 0..64, loop hangs below y = 64)
                const lLoopH = Math.round(lLinkH * 1.45);
                const lDestClipH = Math.round(lLoopH * (64.0 / lLinkH));
                cCtx.drawImage(canvas, lMinX, minY, lW, lLoopH, 0, 0, 64, lDestClipH);

                // 3. Draw Right Link Clip (Slot 4: x = 192..256, metal head spans y = 0..64, loop hangs below y = 64)
                const rLoopH = Math.round(rLinkH * 1.45);
                const rDestClipH = Math.round(rLoopH * (64.0 / rLinkH));
                cCtx.drawImage(canvas, rMinX, minY, rW, rLoopH, 192, 0, 64, rDestClipH);

                // 4. Guarantee middle slots (x: 64..192) are 100% unobstructed from y = 0 to 64 for intermediate charms
                cCtx.clearRect(64, 0, 128, 64);

                if (!this.calibratedCanvases) this.calibratedCanvases = {};
                this.calibratedCanvases[imageUrl] = chainCanvas;
                finalUrl = chainCanvas.toDataURL('image/png');
              } else {
                // Fallback: Uniform 256px scale
                const targetW = 256;
                const scale = targetW / contentW;
                const destW = 256;
                const destH = Math.round(contentH * scale);
                const chainCanvas = document.createElement('canvas');
                chainCanvas.width = destW;
                chainCanvas.height = destH;
                const cCtx = chainCanvas.getContext('2d');
                cCtx.drawImage(canvas, minX, minY, contentW, contentH, 0, 0, destW, destH);
                if (!this.calibratedCanvases) this.calibratedCanvases = {};
                this.calibratedCanvases[imageUrl] = chainCanvas;
                finalUrl = chainCanvas.toDataURL('image/png');
              }
            } else if (isFreeform) {
              // Free-form crystal charms: scale naturally within ~52px canvas, preserving base link beneath
              const targetSize = 52;
              const scale = targetSize / Math.max(contentW, contentH);
              const destW = Math.round(contentW * scale);
              const destH = Math.round(contentH * scale);
              const ffCanvas = document.createElement('canvas');
              ffCanvas.width = destW;
              ffCanvas.height = destH;
              const ffCtx = ffCanvas.getContext('2d');
              ffCtx.drawImage(canvas, minX, minY, contentW, contentH, 0, 0, destW, destH);
              if (!this.calibratedCanvases) this.calibratedCanvases = {};
              this.calibratedCanvases[imageUrl] = ffCanvas;
              finalUrl = ffCanvas.toDataURL('image/png');
            } else if (isProtruding) {
              // Protruding 3D charms: calibrate inner metal link body to 64x64, allowing decorative elements to protrude naturally
              const linkBodyW = charmTitleLower.includes('crystal butterfly') ? Math.round(contentW * 0.787) : Math.round(contentW * 0.94);
              const scale = 64.0 / linkBodyW;
              const destW = Math.round(contentW * scale);
              const destH = Math.round(contentH * scale);
              const protCanvas = document.createElement('canvas');
              protCanvas.width = destW;
              protCanvas.height = destH;
              const pCtx = protCanvas.getContext('2d');
              pCtx.drawImage(canvas, minX, minY, contentW, contentH, 0, 0, destW, destH);
              if (!this.calibratedCanvases) this.calibratedCanvases = {};
              this.calibratedCanvases[imageUrl] = protCanvas;
              finalUrl = protCanvas.toDataURL('image/png');
            } else if (isHanging) {
              // DUAL-ZONE CALIBRATION FOR HANGING CHARMS:
              const rowInfo = new Array(maxY + 1);
              for (let y = minY; y <= maxY; y++) {
                let rMinX = canvas.width, rMaxX = -1;
                const rowOffset = y * canvas.width * 4;
                for (let x = minX; x <= maxX; x++) {
                  if (data[rowOffset + x * 4 + 3] > 20) {
                    if (x < rMinX) rMinX = x;
                    if (x > rMaxX) rMaxX = x;
                  }
                }
                const rw = rMaxX >= rMinX ? (rMaxX - rMinX + 1) : 0;
                rowInfo[y] = { minX: rMinX, maxX: rMaxX, w: rw };
              }

              // 1. Sample the top section to estimate link width
              const topSampleH = Math.max(20, Math.round(contentH * 0.08));
              let topMaxW = 0;
              for (let y = minY; y <= Math.min(maxY, minY + topSampleH); y++) {
                if (rowInfo[y] && rowInfo[y].w > topMaxW) topMaxW = rowInfo[y].w;
              }
              const estimatedLinkW = topMaxW > 0 ? topMaxW : contentW;
              const expectedLinkH = Math.round(estimatedLinkW * 0.85);
              const searchLimit = Math.min(maxY, minY + Math.round(estimatedLinkW * 1.05));

              // 2. Detect link body boundaries in top section
              let linkMinX = canvas.width, linkMaxX = -1;
              let linkBottomY = minY;
              let hasFoundWide = false;

              for (let y = minY; y <= searchLimit; y++) {
                const rw = rowInfo[y].w;
                if (rw >= estimatedLinkW * 0.72) {
                  hasFoundWide = true;
                  if (rowInfo[y].minX < linkMinX) linkMinX = rowInfo[y].minX;
                  if (rowInfo[y].maxX > linkMaxX) linkMaxX = rowInfo[y].maxX;
                  linkBottomY = y;
                } else if (hasFoundWide) {
                  if (rw < estimatedLinkW * 0.58 || (y - minY >= expectedLinkH * 0.95)) {
                    break; // Transition: link body ends, ring/pendant begins
                  }
                }
              }

              if (linkBottomY - minY < expectedLinkH * 0.75) {
                linkBottomY = minY + expectedLinkH;
              }

              const linkW = (linkMaxX >= linkMinX) ? (linkMaxX - linkMinX + 1) : estimatedLinkW;
              const linkH = linkBottomY - minY + 1;

              // 3. Compute uniform pendant dimensions (harmonious ~42px height, max 50px width)
              const pendantSourceY = linkBottomY;
              const pendantH = Math.max(1, maxY - pendantSourceY + 1);
              const pendantW = Math.max(1, contentW);

              const TARGET_DANGLE_H = 42;
              const MAX_DANGLE_W = 50;
              const scale = Math.min(TARGET_DANGLE_H / pendantH, MAX_DANGLE_W / pendantW);

              const destPendantW = Math.round(pendantW * scale);
              const destPendantH = Math.round(pendantH * scale);

              const canvasW = Math.max(64, destPendantW);
              const canvasH = 64 + destPendantH;
              const offsetX = Math.round((canvasW - 64) / 2);

              const compCanvas = document.createElement('canvas');
              compCanvas.width = canvasW;
              compCanvas.height = canvasH;
              const cCtx = compCanvas.getContext('2d');

              // A. Draw link body to fill exactly 64px width and 64px height (spanning lines 1-2 and 3-4)
              cCtx.drawImage(
                canvas,
                linkMinX, minY, linkW, linkH,
                offsetX, 0, 64, 64
              );

              // B. Draw hanging pendant below y = 64px, centered horizontally
              const destPendantX = Math.round(offsetX + (64 - destPendantW) / 2);
              cCtx.drawImage(
                canvas,
                minX, pendantSourceY, pendantW, pendantH,
                destPendantX, 64, destPendantW, destPendantH
              );

              if (!this.calibratedCanvases) this.calibratedCanvases = {};
              this.calibratedCanvases[imageUrl] = compCanvas;
              finalUrl = compCanvas.toDataURL('image/png');
            } else {
              // Standard / Flat charm or Double charm: trim whitespace and scale flush
              const trimmedCanvas = document.createElement('canvas');
              trimmedCanvas.width = contentW;
              trimmedCanvas.height = contentH;
              const tCtx = trimmedCanvas.getContext('2d');
              tCtx.drawImage(canvas, minX, minY, contentW, contentH, 0, 0, contentW, contentH);
              if (!this.calibratedCanvases) this.calibratedCanvases = {};
              this.calibratedCanvases[imageUrl] = trimmedCanvas;
              finalUrl = trimmedCanvas.toDataURL('image/png');
            }
          }

          this.transparentCache[imageUrl] = finalUrl;
          this.charmMetaCache[imageUrl] = meta;
          this.savePersistedState();
          callback(finalUrl, meta);
        } catch (e) {
          this.transparentCache[imageUrl] = imageUrl;
          callback(imageUrl, null);
        }
      };
      img.onerror = () => {
        this.transparentCache[imageUrl] = imageUrl;
        callback(imageUrl, null);
      };
      img.src = imageUrl;
    }

    createSlotElement(index) {
      const slot = document.createElement('div');
      slot.className = 'bb-slot';
      slot.dataset.slotIndex = index;
      slot.setAttribute('role', 'button');
      slot.setAttribute('tabindex', '0');
      slot.setAttribute('aria-label', `Bracelet link position ${index + 1} of ${this.slotsCount}`);

      if (this.selectedModel && this.selectedModel.type === 'watch') {
        const leftCount = this.slotsCount / 2;
        if (index === leftCount - 1) {
          slot.classList.add('is-before-watch');
        }
      }

      const finishHandle = this.selectedColor?.handle || 'silver';
      const linkImg = this.getMetalLinkImageSrc(finishHandle);
      slot.style.setProperty('--bracelet-link', `url('${linkImg}')`);
      const placed = this.slots[index];

      if (!placed) {
        // Clean authentic Nomination link slot with real physical metal link image
        slot.innerHTML = `<img class="bb-slot-base-img" src="${linkImg}" alt="link" draggable="false">`;
      } else {
        slot.classList.add('is-occupied');
        slot.setAttribute('draggable', 'true');

        if (placed.isChainStart) {
          slot.classList.add('is-chain-start');
        } else if (placed.isChainEnd) {
          slot.classList.add('is-chain-end');
        } else if (placed.isDoubleStart) {
          slot.classList.add('is-double-start');
        } else if (placed.isDoubleEnd) {
          slot.classList.add('is-double-end');
        }

        const meta = this.charmMetaCache && this.charmMetaCache[placed.charm.image];
        const isDouble = placed.isDoubleStart;
        const isChain = placed.isChainStart;
        const charmTitleLower = (placed.charm.title || '').toLowerCase();
        const isDrop = this.isDropCharm(placed.charm) || (meta && meta.aspectRatio > 1.22 && charmTitleLower.includes('lunar glow'));
        const isFreeform = !isChain && !isDrop && this.isFreeformCharm(placed.charm);
        const isProtruding = !isChain && !isDrop && !isFreeform && (this.isProtrudingCharm(placed.charm) || (meta && meta.isProtruding) || charmTitleLower.includes('crystal butterfly') || (charmTitleLower.includes('lunar glow') && ((meta && meta.aspectRatio <= 1.22) || (!charmTitleLower.includes('silver') && !(placed.charm.color || '').toLowerCase().includes('silver')))) || charmTitleLower.includes('elegant'));
        const isHanging = !isChain && (isDrop || placed.charm.type === 'drop' || placed.charm.type === 'hanging' || (meta && meta.isHanging));
        const keepBaseLink = !isChain && !placed.isChainEnd && ((meta && meta.keepBaseLink) || isFreeform || isProtruding);

        const isCalibrated = !!(this.transparentCache && this.transparentCache[placed.charm.image]);
        const charmImgSrc = isCalibrated
          ? this.transparentCache[placed.charm.image]
          : placed.charm.image;

        if (isCalibrated) {
          if (isChain) {
            slot.classList.add('is-chain');
          }
          if (isHanging) {
            slot.classList.add('is-hanging');
          }
          if (isProtruding) {
            slot.classList.add('has-protruding-charm');
          }
        }
        if (keepBaseLink) {
          slot.classList.add('keep-base-link');
        }

        slot.style.setProperty('--bracelet-link', 'none');
        if (placed.isChainEnd) {
          // Right anchor slot: empty content, covered cleanly by the 256px chain overlay from isChainStart
          slot.innerHTML = '';
        } else {
          const charmClasses = [
            'placed-charm',
            isDouble ? 'span-2' : '',
            isChain ? 'kind-chain span-4' : '',
            (isCalibrated && isHanging) ? 'kind-hanging' : '',
            (isCalibrated && isProtruding) ? 'kind-protruding' : ''
          ].filter(Boolean).join(' ');

          slot.innerHTML = `
            ${isChain ? '' : `<img class="bb-slot-base-img" src="${linkImg}" alt="link" draggable="false">`}
            <div class="${charmClasses}">
              <img class="bb-slot-charm-img ${isCalibrated ? 'is-calibrated' : ''}" src="${charmImgSrc}" alt="${placed.charm.title}">
            </div>
          `;
        }

        if (!isCalibrated && !placed.isChainEnd) {
          this.processImageTransparency(placed.charm.image, (transUrl, charmMeta) => {
            const currentImg = slot.querySelector('.bb-slot-charm-img');
            if (currentImg && transUrl) {
              currentImg.src = transUrl;
              currentImg.classList.add('is-calibrated');
            }
            if (charmMeta) {
              if (charmMeta.isChain) {
                slot.classList.add('is-chain');
              }
              if (charmMeta.isHanging && !charmMeta.isChain) {
                slot.classList.add('is-hanging');
                const placedWrap = slot.querySelector('.placed-charm');
                if (placedWrap) placedWrap.classList.add('kind-hanging');
              }
              if (charmMeta.keepBaseLink) {
                slot.classList.add('keep-base-link');
              }
              if (charmMeta.isProtruding && !charmMeta.isChain) {
                slot.classList.add('has-protruding-charm');
                const placedWrap = slot.querySelector('.placed-charm');
                if (placedWrap) placedWrap.classList.add('kind-protruding');
              }
            }
          }, true, placed.charm);
        }
      }

      return slot;
    }

    updateStageStatus() {
      if (!this.dom.stageStatus) return;

      const placedCount = this.getPlacedCharmsCount();
      const openCount = this.slotsCount - placedCount;

      this.dom.stageStatus.innerHTML = `
        <span><strong>${placedCount}</strong> of ${this.slotsCount} charms</span>
        <span class="bb-status-dot"></span>
        <span>${openCount} open links</span>
        <span class="bb-status-dot"></span>
        <span class="bb-drag-tip">${this.settings.dragTipText || 'Drag a placed charm back to the catalog to remove it'}</span>
      `;
    }

    renderCatalog() {
      if (!this.dom.catalogGrid) return;

      const filtered = this.charms.filter(charm => {
        if (!charm) return false;

        // Search Filter
        if (this.searchQuery) {
          const matchTitle = (charm.title ? String(charm.title).toLowerCase() : '').includes(this.searchQuery);
          const matchTags = Array.isArray(charm.tags) && charm.tags.some(t => String(t).toLowerCase().includes(this.searchQuery));
          if (!matchTitle && !matchTags) return false;
        }

        // Theme Filter (OR condition within themes if any selected)
        if (this.activeThemes.size > 0) {
          const charmTheme = (charm.theme ? String(charm.theme).toLowerCase().trim() : '');
          const charmTags = Array.isArray(charm.tags) ? charm.tags.map(t => String(t).toLowerCase().trim()) : [];
          let matchTheme = false;
          for (const theme of this.activeThemes) {
            const tLower = String(theme).toLowerCase().trim();
            if (
              charmTheme === tLower ||
              charmTags.includes(tLower) ||
              charmTags.includes('theme:' + tLower) ||
              charmTags.includes('theme: ' + tLower) ||
              charmTags.some(t => t.replace(/^theme:\s*/i, '') === tLower)
            ) {
              matchTheme = true;
              break;
            }
          }
          if (!matchTheme) return false;
        }

        // Color / Finish Filter
        if (this.activeColors.size > 0) {
          const charmColor = (charm.color ? String(charm.color).toLowerCase().trim() : '');
          const charmTags = Array.isArray(charm.tags) ? charm.tags.map(t => String(t).toLowerCase().trim()) : [];
          let matchColor = false;
          for (const color of this.activeColors) {
            const cLower = String(color).toLowerCase().trim();
            if (
              charmColor === cLower ||
              charmTags.includes(cLower) ||
              charmTags.includes('color:' + cLower) ||
              charmTags.includes('color: ' + cLower) ||
              charmTags.some(t => t.replace(/^color:\s*/i, '') === cLower)
            ) {
              matchColor = true;
              break;
            }
          }
          if (!matchColor) return false;
        }

        return true;
      });

      // Update Catalog Count
      if (this.dom.catalogCount) {
        const hasActiveFilter = this.activeThemes.size > 0 || this.activeColors.size > 0 || !!this.searchQuery;
        const totalExpected = parseInt(this.collectionInfo?.allProductsCount, 10) || 0;
        const totalCount = (!hasActiveFilter && totalExpected > filtered.length)
          ? totalExpected
          : filtered.length;
        this.dom.catalogCount.textContent = `${totalCount} charms`;
      }

      if (filtered.length === 0) {
        this.dom.catalogGrid.innerHTML = `
          <div class="bb-catalog-empty">
            <p>${this.settings.noResultsText || 'No charms match your current filters.'}</p>
          </div>
        `;
        return;
      }

      this.dom.catalogGrid.innerHTML = filtered.map(charm => {
        const priceFormatted = this.formatMoney(charm.price);
        const colorLabel = charm.color || 'Standard';

        return `
          <article class="bb-charm-card" 
                   data-charm-id="${charm.id}" 
                   draggable="true" 
                   role="button" 
                   tabindex="0" 
                   aria-label="${charm.title}, ${priceFormatted}">
            <button class="bb-card-quick-add" type="button" data-quick-add-id="${charm.id}" title="Add to bracelet" aria-label="Add ${charm.title} to bracelet">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <div class="bb-charm-img-wrap">
              <img class="bb-charm-img" src="${(this.transparentCache && this.transparentCache[charm.image]) || charm.image}" alt="${charm.title}" crossorigin="anonymous">
            </div>
            <div class="bb-card-tooltip">
              <strong>${charm.title}</strong>
              <span>${colorLabel} · ${priceFormatted}</span>
            </div>
          </article>
        `;
      }).join('');

      // Background-warm transparency cache in memory so drag-and-drop and slot placement are instant
      const warmup = () => {
        const count = Math.min(filtered.length, 120);
        for (let i = 0; i < count; i++) {
          const ch = filtered[i];
          if (ch && ch.image) {
            this.processImageTransparency(ch.image, (transUrl) => {
              if (transUrl && transUrl !== ch.image && this.dom && this.dom.catalogGrid) {
                const cardImg = this.dom.catalogGrid.querySelector(`.bb-charm-card[data-charm-id="${ch.id}"] .bb-charm-img`);
                if (cardImg && cardImg.src !== transUrl) {
                  cardImg.src = transUrl;
                }
              }
            }, true, ch);
          }
        }
      };
      if (window.requestIdleCallback) {
        window.requestIdleCallback(warmup);
      } else {
        setTimeout(warmup, 120);
      }
    }

    bindDragDrop() {
      const c = this.container;

      // 1. Drag Start from Catalog Cards & Bracelet Slots
      c.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.bb-charm-card');
        const slot = e.target.closest('.bb-slot.is-occupied');

        if (card) {
          const charmId = card.dataset.charmId;
          const charm = this.charms.find(ch => String(ch.id) === String(charmId));
          if (charm) {
            this.dragSource = 'catalog';
            this.draggedCharmData = charm;
            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'catalog', charmId }));
            e.dataTransfer.effectAllowed = 'copyMove';
            card.classList.add('is-dragging');
            this.createDragGhost(e, charm, card);
          }
        } else if (slot) {
          let slotIndex = parseInt(slot.dataset.slotIndex, 10);
          const placed = this.slots[slotIndex];
          if (placed) {
            if (placed.isChainEnd && typeof placed.chainStartIndex === 'number') {
              slotIndex = placed.chainStartIndex;
            } else if (placed.isDoubleEnd && slotIndex > 0 && this.slots[slotIndex - 1]?.isDoubleStart) {
              slotIndex = slotIndex - 1;
            }
            const rootPlaced = this.slots[slotIndex] || placed;
            this.dragSource = { slotIndex };
            this.draggedCharmData = rootPlaced.charm;
            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'slot', slotIndex }));
            e.dataTransfer.effectAllowed = 'move';
            slot.classList.add('is-dragging');
            this.createDragGhost(e, rootPlaced.charm, slot);
          }
        }
      });

      // 2. Drag End Cleanup
      c.addEventListener('dragend', (e) => {
        c.querySelectorAll('.is-dragging, .is-dragover, .is-drop-remove').forEach(el => {
          el.classList.remove('is-dragging', 'is-dragover', 'is-drop-remove');
        });
        this.dragSource = null;
        this.draggedCharmData = null;
      });

      // 3. Drag Over & Drag Enter on Slots or Charms Container
      c.addEventListener('dragover', (e) => {
        const slot = e.target.closest('.bb-slot');
        const isDraggingFromSlot = this.dragSource && typeof this.dragSource.slotIndex === 'number';

        if (slot) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          slot.classList.add('is-dragover');
        } else if (isDraggingFromSlot) {
          // Allow dropping anywhere in the charms container or workspace to remove charm
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const catalog = e.target.closest('.bb-catalog-section, [data-catalog-grid]');
          if (catalog) {
            catalog.classList.add('is-drop-remove');
          }
        }
      });

      c.addEventListener('dragleave', (e) => {
        const slot = e.target.closest('.bb-slot');
        if (slot) {
          slot.classList.remove('is-dragover');
        }
        const catalog = e.target.closest('.bb-catalog-section, [data-catalog-grid]');
        if (catalog && !catalog.contains(e.relatedTarget)) {
          catalog.classList.remove('is-drop-remove');
        }
      });

      // 4. Drop onto Slot or Charms Container / Canvas Area
      c.addEventListener('drop', (e) => {
        const slot = e.target.closest('.bb-slot');
        c.querySelectorAll('.is-dragging, .is-dragover, .is-drop-remove').forEach(el => {
          el.classList.remove('is-dragging', 'is-dragover', 'is-drop-remove');
        });

        if (slot) {
          e.preventDefault();
          const targetIndex = parseInt(slot.dataset.slotIndex, 10);

          if (this.dragSource === 'catalog' && this.draggedCharmData) {
            this.placeCharmAtSlot(this.draggedCharmData, targetIndex);
          } else if (this.dragSource && typeof this.dragSource.slotIndex === 'number') {
            this.moveCharmSlot(this.dragSource.slotIndex, targetIndex);
          }
        } else if (this.dragSource && typeof this.dragSource.slotIndex === 'number') {
          // Drop on charms container / area = Remove placed charm from bracelet!
          e.preventDefault();
          const fromIndex = this.dragSource.slotIndex;
          const placedItem = this.slots[fromIndex];
          const charmTitle = (placedItem && placedItem.charm && placedItem.charm.title) || '';
          this.removeCharmAtSlot(fromIndex);
          if (charmTitle) {
            this.showToast(`Removed "${charmTitle}" from bracelet`);
          }
          this.dragSource = null;
          this.draggedCharmData = null;
        }
      });

      // Window-level drop fallback: If released anywhere outside the bracelet canvas, remove it cleanly
      window.addEventListener('dragover', (e) => {
        if (this.dragSource && typeof this.dragSource.slotIndex === 'number') {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      });

      window.addEventListener('drop', (e) => {
        if (this.dragSource && typeof this.dragSource.slotIndex === 'number') {
          const slot = e.target.closest('.bb-slot');
          if (!slot) {
            e.preventDefault();
            const fromIndex = this.dragSource.slotIndex;
            const placedItem = this.slots[fromIndex];
            const charmTitle = (placedItem && placedItem.charm && placedItem.charm.title) || '';
            this.removeCharmAtSlot(fromIndex);
            if (charmTitle) {
              this.showToast(`Removed "${charmTitle}" from bracelet`);
            }
            this.dragSource = null;
            this.draggedCharmData = null;
          }
        }
      });

      // 5. Click on Catalog Card or Occupied Slot -> Open Slide-Over Drawer
      c.addEventListener('click', (e) => {
        // Quick Add Button on Card
        const quickAddBtn = e.target.closest('[data-quick-add-id]');
        if (quickAddBtn) {
          e.stopPropagation();
          const qId = quickAddBtn.dataset.quickAddId;
          const charm = this.charms.find(ch => String(ch.id) === String(qId));
          if (charm) {
            this.addCharmToFirstAvailableSlot(charm);
          }
          return;
        }

        const card = e.target.closest('.bb-charm-card');
        const occupiedSlot = e.target.closest('.bb-slot.is-occupied');
        if (card) {
          const charmId = card.dataset.charmId;
          const charm = this.charms.find(ch => String(ch.id) === String(charmId));
          if (charm) {
            this.openDrawer(charm);
          }
        } else if (occupiedSlot) {
          const slotIndex = parseInt(occupiedSlot.dataset.slotIndex, 10);
          const placed = this.slots[slotIndex];
          if (placed && placed.charm) {
            this.openDrawer(placed.charm);
          }
        }

        // Delete Button in Sidebar
        const delBtn = e.target.closest('[data-delete-slot]');
        if (delBtn) {
          const slotIndex = parseInt(delBtn.dataset.deleteSlot, 10);
          this.removeCharmAtSlot(slotIndex);
        }

        // Recommendation Item Click in Drawer
        const recItem = e.target.closest('[data-rec-charm-id]');
        if (recItem) {
          const recId = recItem.dataset.recCharmId;
          const recCharm = this.charms.find(ch => String(ch.id) === String(recId));
          if (recCharm) {
            this.openDrawer(recCharm);
          }
        }

        // Add Charm from Drawer Button
        const addDrawerBtn = e.target.closest('[data-drawer-add-btn]');
        if (addDrawerBtn && this.activeDrawerCharm) {
          this.addCharmToFirstAvailableSlot(this.activeDrawerCharm);
          this.closeDrawer();
        }
      });

      // Double-click on card -> Quick Add directly
      c.addEventListener('dblclick', (e) => {
        const card = e.target.closest('.bb-charm-card');
        if (card) {
          const charmId = card.dataset.charmId;
          const charm = this.charms.find(ch => String(ch.id) === String(charmId));
          if (charm) {
            this.addCharmToFirstAvailableSlot(charm);
          }
        }
      });
    }

    createDragGhost(e, charm, sourceEl) {
      if (!e.dataTransfer || !e.dataTransfer.setDragImage) return;

      const meta = this.charmMetaCache && this.charmMetaCache[charm.image];
      const isChain = this.isChainCharm(charm);
      const isDouble = !isChain && (charm.slots > 1 || charm.type === 'double' || charm.type === '2-links');
      const isHanging = !isChain && (charm.type === 'drop' || charm.type === 'hanging' || (meta && meta.isHanging));
      const isMobile = window.innerWidth < 768;
      const mobileScale = isMobile ? 0.82 : 1;
      const baseSlotW = isChain ? 256 : (isDouble ? 128 : 64);
      const slotWidth = Math.round(baseSlotW * mobileScale);
      const slotHeight = Math.round(64 * mobileScale);
      const finishHandle = this.selectedColor.handle || 'silver';
      const finishClass = `metal-${finishHandle}`;
      const linkImg = this.getMetalLinkImageSrc(finishHandle);

      // 1. Locate the already-rendered <img> inside the source element (card or slot)
      const existingImg = sourceEl ? sourceEl.querySelector('.bb-charm-img, .bb-slot-charm-img') : null;
      const imgW = (existingImg && existingImg.naturalWidth) ? existingImg.naturalWidth : slotWidth;
      const imgH = (existingImg && existingImg.naturalHeight) ? existingImg.naturalHeight : slotHeight;

      // Always enforce exact slot width (or double/chain) so the drag avatar
      // matches the bracelet slot 1:1 on the screen (never enlarged)
      const cachedCanvas = this.calibratedCanvases && this.calibratedCanvases[charm.image];
      const canvasWidth = slotWidth;
      const canvasHeight = isChain
        ? Math.round((cachedCanvas ? cachedCanvas.height : 220) * mobileScale)
        : (isHanging ? Math.round(106 * mobileScale) : slotHeight);

      // 2. High-DPI Canvas for crisp, synchronously-rendered drag feedback
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.position = 'fixed';
      canvas.style.top = '-9999px';
      canvas.style.left = '-9999px';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '999999';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Draw base metal links (for chain: draw on left anchor and right anchor)
      const linkObj = this.preloadedLinks && this.preloadedLinks[finishHandle];
      if (isChain) {
        const anchorW = Math.round(64 * mobileScale);
        if (linkObj && linkObj.complete && linkObj.naturalWidth > 0) {
          ctx.drawImage(linkObj, 0, 0, anchorW, slotHeight);
          ctx.drawImage(linkObj, slotWidth - anchorW, 0, anchorW, slotHeight);
        }
      } else if (linkObj && linkObj.complete && linkObj.naturalWidth > 0) {
        ctx.drawImage(linkObj, 0, 0, slotWidth, slotHeight);
      } else {
        const fallbackColors = {
          gold: { fill: '#ecd38a', stroke: '#9b7226' },
          silver: { fill: '#d8dade', stroke: '#90949a' },
          mixed: { fill: '#ecd38a', stroke: '#90949a' },
          purple: { fill: '#b1a5c5', stroke: '#7e699c' },
          black: { fill: '#202120', stroke: '#0c0d0e' },
          red: { fill: '#d52b20', stroke: '#8a0e05' },
          blue: { fill: '#b2cde6', stroke: '#598cb8' },
          champagne: { fill: '#c4b7a6', stroke: '#8f816d' },
          neon: { fill: '#dccc64', stroke: '#969c18' },
          rose: { fill: '#e8b2a5', stroke: '#9b5c4d' }
        };
        const fb = fallbackColors[finishHandle] || fallbackColors.silver;
        ctx.fillStyle = fb.fill;
        ctx.fillRect(0, 0, slotWidth, slotHeight);
        ctx.strokeStyle = fb.stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, slotWidth, slotHeight);
      }

      // 3. Draw charm image:
      // Priority A: If an offscreen calibrated canvas already exists, draw it directly!
      let charmDrawn = false;
      if (cachedCanvas) {
        try {
          ctx.drawImage(cachedCanvas, 0, 0, slotWidth, canvasHeight);
          charmDrawn = true;
        } catch (err) {
          charmDrawn = false;
        }
      }

      // Priority B: Draw directly from existing rendered <img> element
      if (!charmDrawn && existingImg && existingImg.complete && existingImg.naturalWidth > 0) {
        try {
          if (isHanging) {
            // Check if existingImg is already a calibrated 64x106 image
            if (existingImg.naturalHeight <= 140) {
              ctx.drawImage(existingImg, 0, 0, slotWidth, canvasHeight);
            } else {
              // Raw product photo: top ~36% is link, remainder is pendant
              const nw = existingImg.naturalWidth;
              const nh = existingImg.naturalHeight;
              const linkH = Math.round(nh * 0.36);
              // Draw top link
              ctx.drawImage(existingImg, 0, 0, nw, linkH, 0, 0, slotWidth, slotHeight);
              // Draw pendant (dangle below)
              ctx.drawImage(existingImg, 0, linkH, nw, nh - linkH, 0, slotHeight, slotWidth, canvasHeight - slotHeight);
            }
          } else if (isChain) {
            ctx.drawImage(existingImg, 0, 0, slotWidth, canvasHeight);
          } else {
            // Edge-to-edge flush on block face (64x64 or 128x64)
            ctx.drawImage(existingImg, 0, 0, slotWidth, slotHeight);
          }
          charmDrawn = true;
        } catch (err) {
          charmDrawn = false;
        }
      }

      if (charmDrawn) {
        document.body.appendChild(canvas);
        try {
          e.dataTransfer.setDragImage(canvas, slotWidth / 2, slotHeight / 2);
          requestAnimationFrame(() => {
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
          });
          return;
        } catch (err) {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
      }

      // 3. Fallback: DOM element with cloned existing image
      const ghost = document.createElement('div');
      ghost.className = `bb-slot ${finishClass} is-occupied ${isChain ? 'is-chain-start' : (isDouble ? 'is-double-start' : '')} ${isHanging ? 'is-hanging' : ''}`;
      ghost.style.position = 'fixed';
      ghost.style.top = '-9999px';
      ghost.style.left = '-9999px';
      ghost.style.width = `${slotWidth}px`;
      ghost.style.height = `${slotHeight}px`;
      ghost.style.zIndex = '999999';
      ghost.style.pointerEvents = 'none';
      ghost.style.backgroundImage = 'none';
      ghost.style.background = 'transparent';

      const placedDiv = document.createElement('div');
      placedDiv.className = `placed-charm ${isChain ? 'kind-chain span-4' : (isDouble ? 'span-2' : '')} ${isHanging ? 'kind-hanging' : ''}`;

      if (existingImg && existingImg.complete && existingImg.naturalWidth > 0) {
        const cloned = existingImg.cloneNode(true);
        cloned.className = 'bb-slot-charm-img';
        if (isChain) {
          cloned.style.width = `${slotWidth}px`;
          cloned.style.height = 'auto';
          cloned.style.position = 'absolute';
          cloned.style.top = '0';
          cloned.style.left = '0';
          cloned.style.objectFit = 'contain';
        } else if (isHanging) {
          cloned.style.width = '64px';
          cloned.style.height = 'auto';
          cloned.style.position = 'absolute';
          cloned.style.top = '0';
          cloned.style.left = '50%';
          cloned.style.transform = 'translateX(-50%)';
          cloned.style.objectFit = 'contain';
        } else {
          cloned.style.width = '100%';
          cloned.style.height = '100%';
          cloned.style.objectFit = 'fill';
        }
        placedDiv.appendChild(cloned);
      } else {
        const charmImg = document.createElement('img');
        charmImg.className = 'bb-slot-charm-img';
        charmImg.src = (this.transparentCache && this.transparentCache[charm.image]) || charm.image;
        charmImg.alt = charm.title || '';
        placedDiv.appendChild(charmImg);
      }

      ghost.appendChild(placedDiv);
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, slotWidth / 2, slotHeight / 2);

      requestAnimationFrame(() => {
        if (ghost.parentNode) {
          ghost.parentNode.removeChild(ghost);
        }
      });
    }

    placeCharmAtSlot(charm, targetIndex) {
      const charmTitleLower = (charm.title || '').toLowerCase();
      const isChain = this.isChainCharm(charm);
      const isDouble = !isChain && (charm.slots > 1 || charm.type === 'double' || charm.type === '2-links' || charmTitleLower.includes('bows'));

      if (isChain) {
        const span = 4;
        if (targetIndex > this.slotsCount - span) {
          targetIndex = this.slotsCount - span;
        }
        if (targetIndex < 0) targetIndex = 0;

        if (this.selectedModel && this.selectedModel.type === 'watch') {
          const leftCount = this.slotsCount / 2;
          if (targetIndex < leftCount && (targetIndex + 3) >= leftCount) {
            if (leftCount >= span) {
              targetIndex = leftCount - span;
            } else {
              targetIndex = leftCount;
            }
          }
        }

        // Prevent overlapping spans between two chain charms
        const spanStart = this.isSlotInChainSpan(targetIndex);
        const spanEnd = this.isSlotInChainSpan(targetIndex + 3);
        const spanMid1 = this.isSlotInChainSpan(targetIndex + 1);
        const spanMid2 = this.isSlotInChainSpan(targetIndex + 2);
        if ((spanStart && spanStart.start !== targetIndex) ||
            (spanEnd && spanEnd.start !== targetIndex) ||
            (spanMid1 && spanMid1.start !== targetIndex) ||
            (spanMid2 && spanMid2.start !== targetIndex)) {
          let found = -1;
          for (let i = 0; i <= this.slotsCount - span; i++) {
            if (this.selectedModel && this.selectedModel.type === 'watch') {
              const leftCount = this.slotsCount / 2;
              if (i < leftCount && (i + 3) >= leftCount) continue;
            }
            if (!this.isSlotInChainSpan(i) && !this.isSlotInChainSpan(i + 3) && !this.isSlotInChainSpan(i + 1) && !this.isSlotInChainSpan(i + 2)) {
              if (!this.slots[i] && !this.slots[i + 3]) {
                found = i;
                break;
              }
            }
          }
          if (found !== -1) {
            targetIndex = found;
          } else {
            this.showToast('No room for a chain charm here.');
            return;
          }
        }

        // Clean up any existing charms at anchor slots targetIndex and targetIndex + 3
        if (this.slots[targetIndex]) {
          this.removeCharmAtSlot(targetIndex, true);
        }
        if (this.slots[targetIndex + 3]) {
          this.removeCharmAtSlot(targetIndex + 3, true);
        }

        // Place chain anchors (middle slots targetIndex+1 and targetIndex+2 remain untouched if they have charms)
        this.slots[targetIndex] = {
          charm,
          isChainStart: true,
          isChainEnd: false,
          chainEndIndex: targetIndex + 3,
          isDoubleStart: false,
          isDoubleEnd: false,
          isHanging: false
        };
        this.slots[targetIndex + 3] = {
          charm,
          isChainStart: false,
          isChainEnd: true,
          chainStartIndex: targetIndex,
          isDoubleStart: false,
          isDoubleEnd: false,
          isHanging: false
        };
      } else if (isDouble) {
        if (targetIndex >= this.slotsCount - 1) {
          targetIndex = this.slotsCount - 2; // Shift left so it fits
        }
        if (this.selectedModel && this.selectedModel.type === 'watch') {
          const leftCount = this.slotsCount / 2;
          if (targetIndex === leftCount - 1) {
            targetIndex = leftCount - 2; // Shift left so it does not bridge across watch
          }
        }
        if (this.slots[targetIndex]) {
          this.removeCharmAtSlot(targetIndex, true);
        }
        if (this.slots[targetIndex + 1]) {
          this.removeCharmAtSlot(targetIndex + 1, true);
        }
        this.slots[targetIndex] = {
          charm,
          isDoubleStart: true,
          isDoubleEnd: false,
          isHanging: charm.type === 'drop' || charm.type === 'hanging'
        };
        this.slots[targetIndex + 1] = {
          charm,
          isDoubleStart: false,
          isDoubleEnd: true,
          isHanging: false
        };
      } else {
        if (this.slots[targetIndex]) {
          this.removeCharmAtSlot(targetIndex, true);
        }
        const reallyIsDrop = this.isDropCharm(charm) || ((charm.title || '').toLowerCase().includes('lunar glow') && ((charm.color || '').toLowerCase().includes('silver') || (this.charmMetaCache && this.charmMetaCache[charm.image] && this.charmMetaCache[charm.image].aspectRatio > 1.22)));
        if (reallyIsDrop && charm.type !== 'drop') {
          charm.type = 'drop';
        }
        const meta = this.charmMetaCache && this.charmMetaCache[charm.image];
        this.slots[targetIndex] = {
          charm,
          isDoubleStart: false,
          isDoubleEnd: false,
          isHanging: reallyIsDrop || charm.type === 'drop' || charm.type === 'hanging' || (meta && meta.isHanging)
        };
      }

      this.renderCanvas();
      this.updateSidebar();
      this.updateHeaderMeta();
      this.savePersistedState();
    }

    moveCharmSlot(fromIndex, toIndex) {
      if (fromIndex === toIndex) return;

      const itemFrom = this.slots[fromIndex];
      const itemTo = this.slots[toIndex];
      if (!itemFrom) return;

      const isFromChain = !!(itemFrom.isChainStart || itemFrom.isChainEnd);
      const isFromDouble = !!(itemFrom.isDoubleStart || itemFrom.isDoubleEnd);
      const isFromSingle = !isFromChain && !isFromDouble;

      // =========================================================
      // CASE 1: Moving a Chain Charm
      // =========================================================
      if (isFromChain) {
        const fromChainStart = itemFrom.isChainStart ? fromIndex : itemFrom.chainStartIndex;
        const fromChainEnd = typeof this.slots[fromChainStart]?.chainEndIndex === 'number'
          ? this.slots[fromChainStart].chainEndIndex
          : (fromChainStart + 3);
        const chainCharm = (this.slots[fromChainStart] && this.slots[fromChainStart].charm) || itemFrom.charm;

        // Check if user dropped on another chain charm
        const targetChain = this.isSlotInChainSpan(toIndex);

        // 1A: Dropped directly onto another chain charm -> SWAP BOTH CHAIN CHARMS
        if (targetChain && targetChain.start !== fromChainStart) {
          const bStart = targetChain.start;
          const bEnd = targetChain.end;
          const bCharm = targetChain.item.charm;

          // Chain A moves to Span B [bStart, bEnd]
          this.slots[bStart] = {
            charm: chainCharm,
            isChainStart: true,
            isChainEnd: false,
            chainEndIndex: bEnd,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };
          this.slots[bEnd] = {
            charm: chainCharm,
            isChainStart: false,
            isChainEnd: true,
            chainStartIndex: bStart,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };

          // Chain B moves to Span A [fromChainStart, fromChainEnd]
          this.slots[fromChainStart] = {
            charm: bCharm,
            isChainStart: true,
            isChainEnd: false,
            chainEndIndex: fromChainEnd,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };
          this.slots[fromChainEnd] = {
            charm: bCharm,
            isChainStart: false,
            isChainEnd: true,
            chainStartIndex: fromChainStart,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };

          // Middle-link single charms stay in their respective slots!
          this.renderCanvas();
          this.updateSidebar();
          this.updateHeaderMeta();
          this.savePersistedState();
          return;
        }

        // If dropped inside its own chain span, do nothing
        if (targetChain && targetChain.start === fromChainStart) {
          return;
        }

        // 1B: Moving Chain Charm to empty slots or slots with normal/double charms
        let targetStart = toIndex;
        const span = 4;
        if (targetStart > this.slotsCount - span) {
          targetStart = this.slotsCount - span;
        }
        if (targetStart < 0) targetStart = 0;

        if (this.selectedModel && this.selectedModel.type === 'watch') {
          const leftCount = this.slotsCount / 2;
          if (toIndex < leftCount) {
            if (targetStart + 3 >= leftCount) {
              targetStart = leftCount - span;
            }
          } else {
            if (targetStart < leftCount) {
              targetStart = leftCount;
            }
          }
        }

        if (!this.isValidChainSpan(targetStart)) {
          this.showToast('No room for a chain charm here.');
          return;
        }

        // Check if [targetStart, targetStart + 3] collides with another chain charm
        let collidingChain = null;
        for (let s = targetStart; s <= targetStart + 3; s++) {
          const c = this.isSlotInChainSpan(s);
          if (c && c.start !== fromChainStart) {
            collidingChain = c;
            break;
          }
        }

        if (collidingChain) {
          // Collides with another chain charm -> Swap both chain charms
          const bStart = collidingChain.start;
          const bEnd = collidingChain.end;
          const bCharm = collidingChain.item.charm;

          this.slots[bStart] = {
            charm: chainCharm,
            isChainStart: true,
            isChainEnd: false,
            chainEndIndex: bEnd,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };
          this.slots[bEnd] = {
            charm: chainCharm,
            isChainStart: false,
            isChainEnd: true,
            chainStartIndex: bStart,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };
          this.slots[fromChainStart] = {
            charm: bCharm,
            isChainStart: true,
            isChainEnd: false,
            chainEndIndex: fromChainEnd,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };
          this.slots[fromChainEnd] = {
            charm: bCharm,
            isChainStart: false,
            isChainEnd: true,
            chainStartIndex: fromChainStart,
            isDoubleStart: false,
            isDoubleEnd: false,
            isHanging: false
          };

          this.renderCanvas();
          this.updateSidebar();
          this.updateHeaderMeta();
          this.savePersistedState();
          return;
        }

        if (targetStart === fromChainStart) return;

        // Collect charms at the target anchor positions that need to be displaced
        // (Middle links targetStart+1 and targetStart+2 single charms remain in place!)
        const displacedCharms = [];

        const addDisplaced = (idx) => {
          if (idx === fromChainStart || idx === fromChainEnd) return;
          const it = this.slots[idx];
          if (!it) return;
          if (it.isDoubleEnd && idx > 0 && this.slots[idx - 1]?.isDoubleStart) {
            if (!displacedCharms.some(d => d.slots.includes(idx))) {
              displacedCharms.push({ item: this.slots[idx - 1], slots: [idx - 1, idx], isDouble: true });
            }
          } else if (it.isDoubleStart) {
            if (!displacedCharms.some(d => d.slots.includes(idx))) {
              displacedCharms.push({ item: it, slots: [idx, idx + 1], isDouble: true });
            }
          } else if (!it.isDoubleEnd) {
            if (!displacedCharms.some(d => d.slots.includes(idx))) {
              displacedCharms.push({ item: it, slots: [idx], isDouble: false });
            }
          }
        };

        addDisplaced(targetStart);
        addDisplaced(targetStart + 3);

        // Check if middle links have double charm (not allowed under chain)
        for (let m = targetStart + 1; m <= targetStart + 2; m++) {
          const midIt = this.slots[m];
          if (midIt && (midIt.isDoubleStart || midIt.isDoubleEnd)) {
            addDisplaced(m);
          }
        }

        // Clear displaced slots
        displacedCharms.forEach(d => {
          d.slots.forEach(s => { this.slots[s] = null; });
        });

        // Clear old chain anchors
        this.slots[fromChainStart] = null;
        this.slots[fromChainEnd] = null;

        // Place new chain anchors
        const targetEnd = targetStart + 3;
        this.slots[targetStart] = {
          charm: chainCharm,
          isChainStart: true,
          isChainEnd: false,
          chainEndIndex: targetEnd,
          isDoubleStart: false,
          isDoubleEnd: false,
          isHanging: false
        };
        this.slots[targetEnd] = {
          charm: chainCharm,
          isChainStart: false,
          isChainEnd: true,
          chainStartIndex: targetStart,
          isDoubleStart: false,
          isDoubleEnd: false,
          isHanging: false
        };

        // Re-place displaced charms into vacated slots
        const candidateVacated = [];
        if (!this.slots[fromChainStart]) candidateVacated.push(fromChainStart);
        if (!this.slots[fromChainEnd]) candidateVacated.push(fromChainEnd);

        for (let i = 0; i < this.slotsCount; i++) {
          if (!this.slots[i] && !candidateVacated.includes(i)) {
            candidateVacated.push(i);
          }
        }

        displacedCharms.forEach(d => {
          if (d.isDouble) {
            let placedDouble = false;
            for (let i = 0; i < this.slotsCount - 1; i++) {
              if (this.isValidDoubleSpan(i) && !this.slots[i] && !this.slots[i + 1]) {
                this.slots[i] = {
                  charm: d.item.charm,
                  isDoubleStart: true,
                  isDoubleEnd: false,
                  isHanging: d.item.isHanging
                };
                this.slots[i + 1] = {
                  charm: d.item.charm,
                  isDoubleStart: false,
                  isDoubleEnd: true,
                  isHanging: false
                };
                placedDouble = true;
                break;
              }
            }
            if (!placedDouble) {
              this.showToast(`Not enough room to place 2-link charm "${d.item.charm.title}".`);
            }
          } else {
            const v = candidateVacated.find(s => !this.slots[s]);
            if (typeof v === 'number') {
              this.slots[v] = d.item;
            }
          }
        });

        this.renderCanvas();
        this.updateSidebar();
        this.updateHeaderMeta();
        this.savePersistedState();
        return;
      }

      // =========================================================
      // CASE 2: Moving a 2-Link (Double) Charm
      // =========================================================
      if (isFromDouble) {
        const fromDoubleStart = itemFrom.isDoubleStart ? fromIndex : (fromIndex - 1);
        const doubleCharm = (this.slots[fromDoubleStart] && this.slots[fromDoubleStart].charm) || itemFrom.charm;
        const isHanging = itemFrom.isHanging || (this.slots[fromDoubleStart] && this.slots[fromDoubleStart].isHanging);

        let targetStart = toIndex;
        if (targetStart >= this.slotsCount - 1) {
          targetStart = this.slotsCount - 2;
        }
        if (targetStart < 0) targetStart = 0;

        if (this.selectedModel && this.selectedModel.type === 'watch') {
          const leftCount = this.slotsCount / 2;
          if (targetStart === leftCount - 1) {
            if (toIndex < leftCount) {
              targetStart = leftCount - 2;
            } else {
              targetStart = leftCount;
            }
          }
        }

        if (!this.isValidDoubleSpan(targetStart)) {
          this.showToast('No room for a 2-link charm here.');
          return;
        }

        if (targetStart === fromDoubleStart) return;

        // Check if target is another double charm -> direct swap!
        const targetDoubleItem = this.slots[targetStart] || this.slots[targetStart + 1];
        if (targetDoubleItem && (targetDoubleItem.isDoubleStart || targetDoubleItem.isDoubleEnd)) {
          const otherDoubleStart = targetDoubleItem.isDoubleStart
            ? (this.slots[targetStart]?.isDoubleStart ? targetStart : targetStart + 1)
            : (this.slots[targetStart]?.isDoubleEnd ? targetStart - 1 : targetStart);

          if (otherDoubleStart !== fromDoubleStart && this.isValidDoubleSpan(fromDoubleStart) && this.isValidDoubleSpan(otherDoubleStart)) {
            const otherCharm = this.slots[otherDoubleStart].charm;
            const otherHanging = this.slots[otherDoubleStart].isHanging;

            this.slots[otherDoubleStart] = {
              charm: doubleCharm,
              isDoubleStart: true,
              isDoubleEnd: false,
              isHanging
            };
            this.slots[otherDoubleStart + 1] = {
              charm: doubleCharm,
              isDoubleStart: false,
              isDoubleEnd: true,
              isHanging: false
            };

            this.slots[fromDoubleStart] = {
              charm: otherCharm,
              isDoubleStart: true,
              isDoubleEnd: false,
              isHanging: otherHanging
            };
            this.slots[fromDoubleStart + 1] = {
              charm: otherCharm,
              isDoubleStart: false,
              isDoubleEnd: true,
              isHanging: false
            };

            this.renderCanvas();
            this.updateSidebar();
            this.updateHeaderMeta();
            this.savePersistedState();
            return;
          }
        }

        // Check if target collides with a chain charm
        const chainCollision = this.isSlotInChainSpan(targetStart) || this.isSlotInChainSpan(targetStart + 1);
        if (chainCollision) {
          this.showToast('Cannot place 2-link charm on a chain charm span.');
          return;
        }

        // Target contains single charms or empty slots
        const displacedCharms = [];
        for (let s = targetStart; s <= targetStart + 1; s++) {
          if (s !== fromDoubleStart && s !== fromDoubleStart + 1 && this.slots[s]) {
            displacedCharms.push({ slot: s, item: this.slots[s] });
          }
        }

        displacedCharms.forEach(d => { this.slots[d.slot] = null; });
        this.slots[fromDoubleStart] = null;
        this.slots[fromDoubleStart + 1] = null;

        this.slots[targetStart] = {
          charm: doubleCharm,
          isDoubleStart: true,
          isDoubleEnd: false,
          isHanging
        };
        this.slots[targetStart + 1] = {
          charm: doubleCharm,
          isDoubleStart: false,
          isDoubleEnd: true,
          isHanging: false
        };

        const vacatedSlots = [fromDoubleStart, fromDoubleStart + 1].filter(s => !this.slots[s]);
        for (let i = 0; i < this.slotsCount; i++) {
          if (!this.slots[i] && !vacatedSlots.includes(i)) vacatedSlots.push(i);
        }

        displacedCharms.forEach(d => {
          const v = vacatedSlots.find(s => !this.slots[s]);
          if (typeof v === 'number') {
            this.slots[v] = d.item;
          }
        });

        this.renderCanvas();
        this.updateSidebar();
        this.updateHeaderMeta();
        this.savePersistedState();
        return;
      }

      // =========================================================
      // CASE 3: Moving a Single Charm
      // =========================================================
      const targetChain = this.isSlotInChainSpan(toIndex);

      if (targetChain) {
        const cStart = targetChain.start;
        const cEnd = targetChain.end;
        const cCharm = targetChain.item.charm;

        // If dropped onto a middle link of the chain charm
        if (toIndex === cStart + 1 || toIndex === cStart + 2) {
          if (!itemTo) {
            this.slots[toIndex] = itemFrom;
            this.slots[fromIndex] = null;
          } else {
            this.slots[toIndex] = itemFrom;
            this.slots[fromIndex] = itemTo;
          }
          this.renderCanvas();
          this.updateSidebar();
          this.updateHeaderMeta();
          this.savePersistedState();
          return;
        }

        // Dropped onto an anchor of the chain charm (cStart or cEnd) -> SWAP WITH CHAIN CHARM!
        let bestSpanStart = -1;
        for (let offset = 0; offset <= 3; offset++) {
          const cand = fromIndex - offset;
          if (!this.isValidChainSpan(cand)) continue;

          let collides = false;
          for (let s = cand; s <= cand + 3; s++) {
            const ch = this.isSlotInChainSpan(s);
            if (ch && ch.start !== cStart) {
              collides = true;
              break;
            }
          }
          if (collides) continue;

          const a1Ok = (cand === fromIndex || cand === cStart || cand === cEnd || !this.slots[cand]);
          const a2Ok = (cand + 3 === fromIndex || cand + 3 === cStart || cand + 3 === cEnd || !this.slots[cand + 3]);
          if (a1Ok && a2Ok) {
            bestSpanStart = cand;
            break;
          }
        }

        if (bestSpanStart === -1) {
          for (let offset = 0; offset <= 3; offset++) {
            const cand = fromIndex - offset;
            if (!this.isValidChainSpan(cand)) continue;
            let collides = false;
            for (let s = cand; s <= cand + 3; s++) {
              const ch = this.isSlotInChainSpan(s);
              if (ch && ch.start !== cStart) {
                collides = true;
                break;
              }
            }
            if (!collides) {
              bestSpanStart = cand;
              break;
            }
          }
        }

        if (bestSpanStart === -1) {
          this.showToast('Cannot swap: Chain charm needs 4 available links.');
          return;
        }

        const displaced = [];
        if (bestSpanStart !== fromIndex && bestSpanStart !== cStart && bestSpanStart !== cEnd && this.slots[bestSpanStart]) {
          displaced.push({ slot: bestSpanStart, item: this.slots[bestSpanStart] });
        }
        const bestSpanEnd = bestSpanStart + 3;
        if (bestSpanEnd !== fromIndex && bestSpanEnd !== cStart && bestSpanEnd !== cEnd && this.slots[bestSpanEnd]) {
          displaced.push({ slot: bestSpanEnd, item: this.slots[bestSpanEnd] });
        }

        displaced.forEach(d => { this.slots[d.slot] = null; });
        this.slots[cStart] = null;
        this.slots[cEnd] = null;
        this.slots[fromIndex] = null;

        this.slots[toIndex] = itemFrom;

        this.slots[bestSpanStart] = {
          charm: cCharm,
          isChainStart: true,
          isChainEnd: false,
          chainEndIndex: bestSpanEnd,
          isDoubleStart: false,
          isDoubleEnd: false,
          isHanging: false
        };
        this.slots[bestSpanEnd] = {
          charm: cCharm,
          isChainStart: false,
          isChainEnd: true,
          chainStartIndex: bestSpanStart,
          isDoubleStart: false,
          isDoubleEnd: false,
          isHanging: false
        };

        const otherAnchor = (toIndex === cStart) ? cEnd : cStart;
        const candidateVacated = [otherAnchor, fromIndex].filter(s => !this.slots[s]);
        for (let i = 0; i < this.slotsCount; i++) {
          if (!this.slots[i] && !candidateVacated.includes(i)) candidateVacated.push(i);
        }

        displaced.forEach(d => {
          const v = candidateVacated.find(s => !this.slots[s]);
          if (typeof v === 'number') {
            this.slots[v] = d.item;
          }
        });

        this.renderCanvas();
        this.updateSidebar();
        this.updateHeaderMeta();
        this.savePersistedState();
        return;
      }

      // Dropped onto a double charm
      if (itemTo && (itemTo.isDoubleStart || itemTo.isDoubleEnd)) {
        const dStart = itemTo.isDoubleStart ? toIndex : (toIndex - 1);
        const doubleCharm = this.slots[dStart]?.charm;
        const doubleHanging = this.slots[dStart]?.isHanging;

        let canPlaceDouble = -1;
        if (this.isValidDoubleSpan(fromIndex) && (!this.slots[fromIndex + 1] || fromIndex + 1 === dStart || fromIndex + 1 === dStart + 1)) {
          canPlaceDouble = fromIndex;
        } else if (fromIndex > 0 && this.isValidDoubleSpan(fromIndex - 1) && (!this.slots[fromIndex - 1] || fromIndex - 1 === dStart || fromIndex - 1 === dStart + 1)) {
          canPlaceDouble = fromIndex - 1;
        }

        if (canPlaceDouble !== -1 && doubleCharm) {
          this.slots[dStart] = null;
          this.slots[dStart + 1] = null;
          this.slots[fromIndex] = null;

          this.slots[toIndex] = itemFrom;

          this.slots[canPlaceDouble] = {
            charm: doubleCharm,
            isDoubleStart: true,
            isDoubleEnd: false,
            isHanging: doubleHanging
          };
          this.slots[canPlaceDouble + 1] = {
            charm: doubleCharm,
            isDoubleStart: false,
            isDoubleEnd: true,
            isHanging: false
          };

          this.renderCanvas();
          this.updateSidebar();
          this.updateHeaderMeta();
          this.savePersistedState();
          return;
        } else {
          this.showToast('Cannot swap: 2-link charm needs 2 available links.');
          return;
        }
      }

      // Standard single charm swap
      this.slots[toIndex] = itemFrom;
      this.slots[fromIndex] = itemTo;

      this.renderCanvas();
      this.updateSidebar();
      this.updateHeaderMeta();
      this.savePersistedState();
    }

    removeCharmAtSlot(slotIndex, skipRender = false) {
      const placed = this.slots[slotIndex];
      if (!placed) return;

      if (placed.isChainStart) {
        const endIdx = typeof placed.chainEndIndex === 'number' ? placed.chainEndIndex : (slotIndex + 3);
        if (endIdx < this.slotsCount && this.slots[endIdx]?.isChainEnd) {
          this.slots[endIdx] = null;
        }
      } else if (placed.isChainEnd) {
        const startIdx = typeof placed.chainStartIndex === 'number' ? placed.chainStartIndex : (slotIndex - 3);
        if (startIdx >= 0 && this.slots[startIdx]?.isChainStart) {
          this.slots[startIdx] = null;
        }
      } else if (placed.isDoubleStart && slotIndex + 1 < this.slotsCount && this.slots[slotIndex + 1]?.isDoubleEnd) {
        this.slots[slotIndex + 1] = null;
      } else if (placed.isDoubleEnd && slotIndex - 1 >= 0 && this.slots[slotIndex - 1]?.isDoubleStart) {
        this.slots[slotIndex - 1] = null;
      }

      this.slots[slotIndex] = null;

      if (!skipRender) {
        this.renderCanvas();
        this.updateSidebar();
        this.updateHeaderMeta();
        this.savePersistedState();
      }
    }

    addCharmToFirstAvailableSlot(charm) {
      const charmTitleLower = (charm.title || '').toLowerCase();
      const isChain = this.isChainCharm(charm);
      const isDouble = !isChain && (charm.slots > 1 || charm.type === 'double' || charm.type === '2-links' || charmTitleLower.includes('bows'));
      let targetIndex = -1;

      if (isChain) {
        const span = 4;
        const isWatch = this.selectedModel && this.selectedModel.type === 'watch';
        const leftCount = isWatch ? (this.slotsCount / 2) : -1;

        for (let i = 0; i <= this.slotsCount - span; i++) {
          if (isWatch && i < leftCount && (i + 3) >= leftCount) {
            continue; // Cannot bridge across watch
          }
          if (!this.slots[i] && !this.slots[i + 3]) {
            if (!this.isSlotInChainSpan(i) && !this.isSlotInChainSpan(i + 3) && !this.isSlotInChainSpan(i + 1) && !this.isSlotInChainSpan(i + 2)) {
              targetIndex = i;
              break;
            }
          }
        }
      } else if (isDouble) {
        const isWatch = this.selectedModel && this.selectedModel.type === 'watch';
        const leftCount = isWatch ? (this.slotsCount / 2) : -1;
        for (let i = 0; i < this.slotsCount - 1; i++) {
          if (isWatch && i === leftCount - 1) continue;
          if (!this.slots[i] && !this.slots[i + 1]) {
            targetIndex = i;
            break;
          }
        }
      } else {
        for (let i = 0; i < this.slotsCount; i++) {
          if (!this.slots[i]) {
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex !== -1) {
        this.placeCharmAtSlot(charm, targetIndex);
        const posText = isChain
          ? `positions ${targetIndex + 1} & ${targetIndex + 4}`
          : (isDouble ? `positions ${targetIndex + 1}-${targetIndex + 2}` : `position ${targetIndex + 1}`);
        this.showToast(`Added "${charm.title}" to ${posText}`);
        if (this.dom.charmsList) {
          requestAnimationFrame(() => {
            const row = this.dom.charmsList.querySelector(`[data-placed-slot="${targetIndex}"]`);
            if (row) {
              row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          });
        }
      } else {
        alert(this.settings.braceletFullText || 'Your bracelet has no open links left! Drag or remove a charm to make room.');
      }
    }

    hasPlacedCharms() {
      return this.slots.some(s => s !== null);
    }

    getPlacedCharmsCount() {
      let count = 0;
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        if (slot) {
          if (!slot.isDoubleEnd && !slot.isChainEnd) count++;
        }
      }
      return count;
    }

    resetDesign() {
      this.slots = new Array(this.slotsCount).fill(null);
      this.renderCanvas();
      this.updateSidebar();
      this.updateHeaderMeta();
      this.savePersistedState();
      this.showToast('Design reset to empty');
    }

    updateSidebar() {
      const placedCount = this.getPlacedCharmsCount();

      // 1. YOUR BRACELET Summary
      if (this.dom.summaryTitle) {
        this.dom.summaryTitle.textContent = this.selectedModel.title;
      }
      if (this.dom.summaryMeta) {
        const colorTitle = (this.selectedColor && this.selectedColor.title) || 'Silver';
        const sizeText = this.selectedSize ? ` · Size ${this.selectedSize}` : '';
        this.dom.summaryMeta.textContent = `${colorTitle}${sizeText}`;
      }
      if (this.dom.summaryThumb) {
        if (this.selectedVariant && this.selectedVariant.image) {
          this.dom.summaryThumb.src = this.selectedVariant.image;
        } else if (this.selectedModel.image) {
          this.dom.summaryThumb.src = this.selectedModel.image;
        } else if (this.selectedModel.type === 'watch') {
          this.dom.summaryThumb.src = this.getWatchImageSrc(this.selectedModel);
        } else {
          this.dom.summaryThumb.src = this.getMetalLinkImageSrc(this.selectedColor.handle || 'silver');
        }
      }

      // Base Price (from selected model variant)
      const basePrice = parseInt((this.selectedVariant && this.selectedVariant.price) || this.selectedColor.price || this.selectedModel.price, 10) || 4000;
      const effectiveBasePrice = basePrice;

      if (this.dom.summaryPrice) {
        this.dom.summaryPrice.textContent = this.formatMoney(basePrice);
      }

      if (this.dom.sidebarHeading) {
        this.dom.sidebarHeading.textContent = this.selectedModel.type === 'watch' ? 'YOUR WATCH' : 'YOUR BRACELET';
      }

      // 3. YOUR CHARMS List
      if (this.dom.charmsCountBadge) {
        this.dom.charmsCountBadge.textContent = `${placedCount}/${this.slotsCount}`;
      }

      if (this.dom.charmsList) {
        const placedItems = [];
        for (let i = 0; i < this.slots.length; i++) {
          const item = this.slots[i];
          if (item && !item.isDoubleEnd && !item.isChainEnd) {
            placedItems.push({
              slotIndex: i,
              item
            });
          }
        }

        if (placedItems.length === 0) {
          this.dom.charmsList.innerHTML = `
            <div class="bb-charms-empty">
              <div class="bb-empty-plus-icon">+</div>
              <div class="bb-empty-title">${this.settings.emptyStateTitle || 'Your story starts here.'}</div>
              <div class="bb-empty-sub">${this.settings.emptyStateSub || 'Drag or tap any charm to begin.'}</div>
            </div>
          `;
        } else {
          this.dom.charmsList.innerHTML = placedItems.map(({ slotIndex, item }) => {
            const charm = item.charm;
            const endPos = (item.isChainStart && typeof item.chainEndIndex === 'number')
              ? item.chainEndIndex + 1
              : slotIndex + 4;
            const posLabel = item.isChainStart
              ? `Positions ${slotIndex + 1} & ${endPos}/${this.slotsCount}`
              : (item.isDoubleStart
                ? `Positions ${slotIndex + 1}-${slotIndex + 2}/${this.slotsCount}`
                : `Position ${slotIndex + 1}/${this.slotsCount}`);

            return `
              <div class="bb-charms-row" data-placed-slot="${slotIndex}">
                <img class="bb-row-thumb" src="${(this.transparentCache && this.transparentCache[charm.image]) || charm.image}" alt="${charm.title}">
                <div class="bb-row-info">
                  <div class="bb-row-title">${charm.title}</div>
                  <div class="bb-row-meta">
                    <span class="bb-row-status-dot">•</span> Available &nbsp;·&nbsp; ${posLabel}
                  </div>
                </div>
                <div class="bb-row-price-wrap">
                  <span class="bb-row-price">${this.formatMoney(charm.price)}</span>
                  <button class="bb-row-delete-btn" data-delete-slot="${slotIndex}" aria-label="Remove charm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('') + '<div class="bb-charms-list-spacer" aria-hidden="true"></div>';
        }
      }

      // 4. Calculate Total Price
      let charmsTotal = 0;
      for (let i = 0; i < this.slots.length; i++) {
        const item = this.slots[i];
        if (item && !item.isDoubleEnd && !item.isChainEnd) {
          charmsTotal += parseInt(item.charm.price, 10) || 0;
        }
      }

      const grandTotal = effectiveBasePrice + charmsTotal;
      const totalFormatted = this.formatMoney(grandTotal);

      if (this.dom.totalAmount) {
        this.dom.totalAmount.textContent = totalFormatted;
      }
      if (this.dom.headerPrice) {
        this.dom.headerPrice.textContent = totalFormatted;
      }
      if (this.dom.floatingPrice) {
        this.dom.floatingPrice.textContent = totalFormatted;
      }
      if (this.dom.floatingCount) {
        this.dom.floatingCount.textContent = `${placedCount}`;
      }
    }

    updateHeaderMeta() {
      const placedCount = this.getPlacedCharmsCount();
      if (this.dom.headerCount) {
        this.dom.headerCount.textContent = `${placedCount} charms`;
      }
      if (this.dom.floatingCount) {
        this.dom.floatingCount.textContent = `${placedCount}`;
      }
    }

    openSidebarDrawer() {
      if (!this.dom.sidebar) return;
      this.dom.sidebar.classList.add('is-open');
      this.dom.sidebarOverlay?.classList.add('is-open');
      document.body.classList.add('bb-drawer-locked');
    }

    closeSidebarDrawer() {
      if (!this.dom.sidebar) return;
      this.dom.sidebar.classList.remove('is-open');
      this.dom.sidebarOverlay?.classList.remove('is-open');
      document.body.classList.remove('bb-drawer-locked');
    }

    openDrawer(charm) {
      this.activeDrawerCharm = charm;
      if (!this.dom.drawerBody) return;

      const priceFormatted = this.formatMoney(charm.price);
      const category = charm.theme || 'Story Charm';
      const colorFinish = charm.color || 'Standard';

      // Find recommendations (other charms from same theme or random 4)
      const recs = this.charms
        .filter(ch => String(ch.id) !== String(charm.id))
        .slice(0, 4);

      this.dom.drawerBody.innerHTML = `
        <div class="bb-drawer-img-wrap">
          <img class="bb-drawer-img" src="${(this.transparentCache && this.transparentCache[charm.image]) || charm.image}" alt="${charm.title}">
        </div>
        <div>
          <div class="bb-drawer-eyebrow">${category} · ${colorFinish}</div>
          <h2 class="bb-drawer-title">${charm.title}</h2>
          <div class="bb-drawer-price">${priceFormatted}</div>
          <div class="bb-drawer-desc">${charm.description || 'A classic Italian link charm, made to mix, match, and make your own story.'}</div>
        </div>
        <button class="bb-drawer-add-btn" data-drawer-add-btn type="button">
          ${this.settings.addCharmBtnText || 'Add charm'}
        </button>
        ${recs.length > 0 ? `
          <div class="bb-drawer-recs-wrap">
            <div class="bb-recs-title">${this.settings.recsEyebrow || 'Complete the story'}</div>
            <div class="bb-recs-heading">${this.settings.recsTitle || 'You might also like'}</div>
            <div class="bb-recs-grid">
              ${recs.map(rec => `
                <div class="bb-rec-item" data-rec-charm-id="${rec.id}">
                  <div class="bb-rec-thumb">
                    <img src="${rec.image}" alt="${rec.title}">
                  </div>
                  <span class="bb-rec-price">${this.formatMoney(rec.price)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      `;

      this.dom.drawer?.classList.add('is-open');
      this.dom.drawerOverlay?.classList.add('is-open');
    }

    closeDrawer() {
      this.dom.drawer?.classList.remove('is-open');
      this.dom.drawerOverlay?.classList.remove('is-open');
      this.activeDrawerCharm = null;
    }

    getOrderNoteStorageKey() {
      return `chimcham_order_note_${this.sectionId || 'main'}`;
    }

    getOrderNoteText() {
      if (this.dom && this.dom.orderNoteInput) {
        return (this.dom.orderNoteInput.value || '').trim();
      }
      try {
        return (localStorage.getItem(this.getOrderNoteStorageKey()) || '').trim();
      } catch (e) {
        return '';
      }
    }

    initOrderNotes() {
      if (!this.dom || !this.dom.orderNoteContainer) return;

      // Restore saved note from localStorage
      try {
        const savedNote = localStorage.getItem(this.getOrderNoteStorageKey());
        if (savedNote && this.dom.orderNoteInput) {
          this.dom.orderNoteInput.value = savedNote;
        }
      } catch (e) {
        console.warn('BraceletBuilder: Error restoring order note from localStorage', e);
      }

      this.updateOrderNoteUI();

      // Toggle accordion expansion
      this.dom.orderNoteToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = this.dom.orderNoteContainer.classList.contains('is-expanded');
        if (isExpanded) {
          this.dom.orderNoteContainer.classList.remove('is-expanded');
          this.dom.orderNoteToggle.setAttribute('aria-expanded', 'false');
        } else {
          this.dom.orderNoteContainer.classList.add('is-expanded');
          this.dom.orderNoteToggle.setAttribute('aria-expanded', 'true');
          setTimeout(() => {
            this.dom.orderNoteInput?.focus();
          }, 150);
        }
      });

      // Debounce timer for saving note
      let noteDebounceTimer = null;

      // Input listener on textarea
      this.dom.orderNoteInput?.addEventListener('input', () => {
        const val = this.dom.orderNoteInput.value || '';
        this.updateOrderNoteUI();

        try {
          if (val.trim()) {
            localStorage.setItem(this.getOrderNoteStorageKey(), val);
          } else {
            localStorage.removeItem(this.getOrderNoteStorageKey());
          }
        } catch (e) {
          console.warn('BraceletBuilder: Error saving order note to localStorage', e);
        }

        clearTimeout(noteDebounceTimer);
        noteDebounceTimer = setTimeout(() => {
          this.syncOrderNoteToCart(val.trim());
        }, 600);
      });
    }

    updateOrderNoteUI() {
      if (!this.dom || !this.dom.orderNoteInput) return;
      const text = this.dom.orderNoteInput.value || '';
      const len = text.length;

      // Character counter
      if (this.dom.orderNoteCounter) {
        this.dom.orderNoteCounter.textContent = `${len} / 500`;
        if (len >= 450) {
          this.dom.orderNoteCounter.classList.add('is-near-limit');
        } else {
          this.dom.orderNoteCounter.classList.remove('is-near-limit');
        }
      }

      // Badge indicator
      if (this.dom.orderNoteBadge) {
        if (text.trim().length > 0) {
          this.dom.orderNoteBadge.style.display = 'inline-flex';
        } else {
          this.dom.orderNoteBadge.style.display = 'none';
        }
      }
    }

    async syncOrderNoteToCart(note) {
      try {
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ note: note || '' })
        });
      } catch (err) {
        console.warn('BraceletBuilder: Error syncing order note to Shopify cart', err);
      }
    }

    copyDesignSummary() {
      const placedCount = this.getPlacedCharmsCount();
      let summaryText = `CHIM.CHAM Custom Bracelet Build\n`;
      const sizeText = this.selectedSize ? `, Size: ${this.selectedSize}` : '';
      summaryText += `Model: ${this.selectedModel.title} (${this.selectedColor.title}${sizeText})\n`;
      summaryText += `Total Charms: ${placedCount}/${this.slotsCount}\n\n`;
      summaryText += `Layout:\n`;

      for (let i = 0; i < this.slots.length; i++) {
        const item = this.slots[i];
        if (item && !item.isDoubleEnd && !item.isChainEnd) {
          const endPos = (item.isChainStart && typeof item.chainEndIndex === 'number')
            ? item.chainEndIndex + 1
            : i + 4;
          const pos = item.isChainStart
            ? `Slots ${i + 1} & ${endPos}`
            : (item.isDoubleStart ? `Slots ${i + 1}-${i + 2}` : `Slot ${i + 1}`);
          summaryText += `- ${pos}: ${item.charm.title} (${this.formatMoney(item.charm.price)})\n`;
        }
      }

      summaryText += `\nTotal: ${this.dom.totalAmount?.textContent || ''}`;

      const orderNote = this.getOrderNoteText();
      if (orderNote) {
        summaryText += `\nSpecial Instructions / Note: ${orderNote}`;
      }
      if (this.lastDesignImageUrl) {
        summaryText += `\nDesign Photo: ${this.lastDesignImageUrl}`;
      }

      navigator.clipboard.writeText(summaryText).then(() => {
        this.showToast(this.settings.copiedToastText || 'Design summary copied to clipboard!');
      }).catch(() => {
        this.showToast('Copied to clipboard');
      });
    }

    showToast(message) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = message;
      this.dom.toast.classList.add('is-visible');
      setTimeout(() => {
        this.dom.toast?.classList.remove('is-visible');
      }, 2500);
    }

    formatMoney(cents) {
      if (typeof cents === 'string') {
        cents = parseFloat(cents.replace(/[^0-9.-]+/g, '')) * (cents.includes('.') ? 100 : 1);
      }
      const numCents = parseInt(cents, 10) || 0;
      const amount = (numCents / 100).toFixed(2);
      const currencyCode = this.settings.currencyCode || this.settings.currencySymbol || 'KWD';
      const format = this.settings.moneyFormat || window.theme?.moneyFormat;

      if (format && format.includes('{{')) {
        let res = format.replace(/\{\{\s*amount\s*\}\}/g, amount)
                        .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, Math.round(numCents / 100))
                        .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, amount)
                        .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, Math.round(numCents / 100));
        // Normalize any Arabic Dinar symbol to clean KWD code
        res = res.replace(/د\.ك\.?/g, currencyCode).trim();
        return res;
      }

      return `${amount} ${currencyCode}`;
    }

    async loadHtml2Canvas() {
      if (typeof window.html2canvas === 'function') return true;
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = this.assetUrls.html2canvas || 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    }

    async captureBraceletSnapshot() {
      const row = this.dom.braceletRow;
      if (!row) return null;

      try {
        if (typeof window.html2canvas !== 'function') {
          const loaded = await this.loadHtml2Canvas();
          if (!loaded || typeof window.html2canvas !== 'function') return null;
        }

        const canvas = await window.html2canvas(row, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          imageTimeout: 7000,
          onclone: (clonedDoc) => {
            const clonedRow = clonedDoc.querySelector('[data-bracelet-row]');
            if (clonedRow) {
              clonedRow.style.zoom = '1';
              clonedRow.style.transform = 'none';
              clonedRow.style.overflow = 'visible';
            }
          }
        });

        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png', 0.95);
        });
      } catch (err) {
        console.warn('BraceletBuilder: Snapshot capture failed', err);
        return null;
      }
    }

    async uploadSnapshotToCloudinary(blob) {
      const cloudName = (this.settings.cloudinaryCloudName || '').trim();
      const uploadPreset = (this.settings.cloudinaryUploadPreset || '').trim();
      const folder = (this.settings.cloudinaryFolder || 'bracelet-orders').trim();

      if (!cloudName || !uploadPreset || !blob) {
        return null;
      }

      try {
        const formData = new FormData();
        formData.append('file', blob, `design-${Date.now()}.png`);
        formData.append('upload_preset', uploadPreset);
        if (folder) {
          formData.append('folder', folder);
        }
        formData.append('tags', 'chimcham,bracelet-order');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errData = await res.text();
          console.warn('BraceletBuilder: Cloudinary upload returned error', errData);
          return null;
        }

        const data = await res.json();
        return data.secure_url || data.url || null;
      } catch (err) {
        console.warn('BraceletBuilder: Cloudinary upload request failed', err);
        return null;
      }
    }

    async handleCheckout() {
      if (this.dom.checkoutBtn) {
        this.dom.checkoutBtn.disabled = true;
        this.dom.checkoutBtn.textContent = 'Saving design & preparing checkout...';
      }

      // Try capturing & uploading design snapshot to Cloudinary if enabled
      let designImageUrl = null;
      if (this.settings.enableDesignSnapshot !== false) {
        try {
          const blob = await this.captureBraceletSnapshot();
          if (blob) {
            designImageUrl = await this.uploadSnapshotToCloudinary(blob);
            if (designImageUrl) {
              this.lastDesignImageUrl = designImageUrl;
            }
          }
        } catch (snapErr) {
          console.warn('BraceletBuilder: Design snapshot skipped', snapErr);
        }
      }

      const bundleId = `cb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const placedCount = this.getPlacedCharmsCount();

      // Build items array for Shopify Ajax Cart API
      const items = [];

      // 1. Base Bracelet Item
      const baseVariantId = (this.selectedVariant && this.selectedVariant.id) || 
                            (this.selectedColor && this.selectedColor.variantId) || 
                            this.selectedModel.variantId || 
                            this.selectedModel.id;

      if (baseVariantId && !String(baseVariantId).startsWith('var-')) {
        const layoutSummary = [];
        for (let i = 0; i < this.slots.length; i++) {
          const item = this.slots[i];
          if (item && !item.isDoubleEnd && !item.isChainEnd) {
            const pos = item.isChainStart
              ? `Slots ${i + 1} & ${i + 4}`
              : (item.isDoubleStart ? `Slot ${i + 1}-${i + 2}` : `Slot ${i + 1}`);
            layoutSummary.push(`${pos}: ${item.charm.title}`);
          }
        }

        const baseProperties = {
          '_bundle_id': bundleId,
          '_bundle_role': 'base_bracelet',
          'Bracelet Model': this.selectedModel.title,
          'Color / Finish': (this.selectedColor && this.selectedColor.title) || (this.selectedVariant && this.selectedVariant.color) || 'Silver',
          'Total Charms': `${placedCount} charms`,
          'Design Layout': layoutSummary.join(' | ')
        };
        if (this.selectedSize) {
          baseProperties['Bracelet Size'] = this.selectedSize;
        }
        const orderNote = this.getOrderNoteText();
        if (orderNote) {
          baseProperties['Special Instructions'] = orderNote;
        }
        if (designImageUrl) {
          baseProperties['Design Image'] = designImageUrl;
          baseProperties['_design_image'] = designImageUrl;
        }

        items.push({
          id: parseInt(baseVariantId, 10),
          quantity: 1,
          properties: baseProperties
        });
      }

      // 2. Individual Charm Items
      for (let i = 0; i < this.slots.length; i++) {
        const item = this.slots[i];
        const charmVarId = (item && !item.isDoubleEnd && !item.isChainEnd && item.charm) ? (item.charm.variantId || item.charm.id) : null;
        if (charmVarId && !String(charmVarId).startsWith('demo-')) {
          const endPos = (item.isChainStart && typeof item.chainEndIndex === 'number')
            ? item.chainEndIndex + 1
            : i + 4;
          const pos = item.isChainStart
            ? `Slots ${i + 1} & ${endPos}`
            : (item.isDoubleStart ? `Slot ${i + 1}-${i + 2}` : `Slot ${i + 1}`);
          items.push({
            id: parseInt(charmVarId, 10),
            quantity: 1,
            properties: {
              '_bundle_id': bundleId,
              '_bundle_role': 'charm',
              'Bracelet Position': `${pos} of ${this.slotsCount}`,
              'Bracelet Model': this.selectedModel.title
            }
          });
        }
      }

      if (items.length === 0) {
        // Fallback if demo/unconfigured products are being previewed without numeric IDs
        alert('Your custom bracelet design is ready! In a live Shopify store, each placed charm and bracelet variant will be added directly to the cart.');
        if (this.dom.checkoutBtn) {
          this.dom.checkoutBtn.disabled = false;
          this.dom.checkoutBtn.innerHTML = `Check out &rarr;`;
        }
        return;
      }

      try {
        // Clear previous cart items so only this custom bracelet design goes to checkout
        await fetch('/cart/clear.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ items })
        });

        if (res.ok) {
          // If customer provided an order note or design image, sync directly as Shopify cart.note
          const checkoutNote = this.getOrderNoteText();
          let fullCartNote = checkoutNote || '';
          if (designImageUrl) {
            fullCartNote += (fullCartNote ? '\n\n' : '') + `Design Photo: ${designImageUrl}`;
          }
          if (fullCartNote) {
            try {
              await fetch('/cart/update.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ note: fullCartNote })
              });
            } catch (noteErr) {
              console.warn('BraceletBuilder: Error syncing cart note on checkout', noteErr);
            }
          }

          if (window.theme && theme.miniCart) {
            if (typeof theme.miniCart.generateCart === 'function') theme.miniCart.generateCart();
            if (typeof theme.miniCart.updateElements === 'function') theme.miniCart.updateElements();
          }
          window.location.href = '/checkout';
        } else {
          const errData = await res.json();
          console.warn('Shopify Cart Add response:', errData);
          window.location.href = '/cart';
        }
      } catch (err) {
        console.error('Error adding bracelet bundle to cart', err);
        window.location.href = '/cart';
      }
    }

    async loadRemainingCharms() {
      const collectionHandle = this.collectionInfo?.handle || 
        (window.location.pathname.startsWith('/collections/') ? window.location.pathname.split('/')[2] : null);
      if (!collectionHandle) return;

      const totalExpected = parseInt(this.collectionInfo?.allProductsCount, 10) || 0;
      // If we already loaded all expected charms (and have more than 250), or we know there are no more
      if (totalExpected > 0 && this.charms.length >= totalExpected) return;
      // If we have less than 250 charms initially, Liquid was able to load all of them in page 1
      if (this.charms.length < 250 && totalExpected <= 250 && totalExpected > 0) return;

      const existingIds = new Set(this.charms.map(ch => String(ch.id)));
      let currentPage = 2;
      let hasMore = true;

      while (hasMore) {
        try {
          const charmsFromPage = await this.fetchCharmsPage(collectionHandle, currentPage);
          if (Array.isArray(charmsFromPage) && charmsFromPage.length > 0) {
            let added = 0;
            charmsFromPage.forEach(ch => {
              if (ch && ch.id && !existingIds.has(String(ch.id))) {
                existingIds.add(String(ch.id));
                this.charms.push(ch);
                added++;
              }
            });

            if (added > 0) {
              // Update filters and catalog UI with the newly added charms
              try { this.renderDynamicFilters(); } catch (e) {}
              this.renderCatalog();
            }

            // If we received fewer than 250 charms or reached/exceeded the expected total, we're done
            if (charmsFromPage.length < 250 || (totalExpected > 0 && this.charms.length >= totalExpected)) {
              hasMore = false;
            } else {
              currentPage++;
            }
          } else {
            hasMore = false;
          }
        } catch (err) {
          console.warn('BraceletBuilder: Error fetching charms page ' + currentPage, err);
          hasMore = false;
        }
      }
    }

    async fetchCharmsPage(handle, page) {
      // Priority 1: Fetch via alternate Liquid template (?view=charms-data)
      try {
        const url = `/collections/${encodeURIComponent(handle)}?view=charms-data&page=${page}`;
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          let data = null;
          try {
            data = JSON.parse(text);
          } catch (pe) {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end > start) {
              data = JSON.parse(text.substring(start, end + 1));
            }
          }
          if (data && Array.isArray(data.charms)) {
            return data.charms;
          }
        }
      } catch (err1) {
        console.warn('BraceletBuilder: view=charms-data not available, falling back to products.json', err1);
      }

      // Priority 2: Fallback to native Shopify /collections/{handle}/products.json
      try {
        const url = `/collections/${encodeURIComponent(handle)}/products.json?limit=250&page=${page}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.products)) {
            return data.products.map(prod => this.mapShopifyProductToCharm(prod));
          }
        }
      } catch (err2) {
        console.warn('BraceletBuilder: Error in products.json fallback', err2);
      }

      return [];
    }

    mapShopifyProductToCharm(prod) {
      let charmType = 'simple';
      let charmSlots = 1;
      let charmTheme = '';
      let charmColor = '';

      const tags = Array.isArray(prod.tags)
        ? prod.tags
        : (typeof prod.tags === 'string' ? prod.tags.split(',').map(t => t.trim()) : []);

      for (const tag of tags) {
        const t = String(tag).trim();
        const tLower = t.toLowerCase();
        if (tLower.startsWith('theme:')) {
          charmTheme = t.slice(6).trim();
        } else if (tLower.startsWith('color:')) {
          charmColor = t.slice(6).trim();
        } else if (tLower === 'type:chain' || tLower === 'type: chain') {
          charmType = 'chain';
          charmSlots = 4;
        } else if (tLower.includes('type:drop') || tLower === 'drop') {
          charmType = 'drop';
        } else if (tLower.includes('type:2-links') || tLower === '2-links' || tLower === 'double') {
          charmType = 'double';
          charmSlots = 2;
        }
      }

      const titleLower = String(prod.title || '').toLowerCase();
      const colorLower = (charmColor || '').toLowerCase();
      let hasSilverTag = false;
      for (const tag of tags) {
        if (String(tag).toLowerCase().includes('silver')) { hasSilverTag = true; break; }
      }
      if (titleLower.includes('bows')) {
        charmType = 'double';
        charmSlots = 2;
      } else if (titleLower.includes('letter ') || titleLower.includes('melted heart') || titleLower.includes('pink stone') || titleLower.includes('cinderella') || (titleLower.includes('crystal heart') && !titleLower.includes('gold'))) {
        charmType = 'drop';
      } else if (titleLower.includes('lunar glow')) {
        if (colorLower.includes('silver') || hasSilverTag || (!colorLower.includes('gold') && colorLower.length > 0)) {
          charmType = 'drop';
        }
      }

      const firstVariant = (prod.variants && prod.variants[0]) || {};
      let price = 0;
      if (firstVariant.price != null) {
        const pStr = String(firstVariant.price);
        const pNum = parseFloat(pStr);
        // If 3 decimal places (e.g. 4.000 KWD), multiply by 1000, else by 100
        if (pStr.includes('.') && pStr.split('.')[1].length === 3) {
          price = Math.round(pNum * 1000);
        } else {
          price = Math.round(pNum * 100);
        }
      }

      const image = (prod.images && prod.images[0] && prod.images[0].src) || '';

      return {
        id: prod.id,
        title: prod.title,
        price: price,
        image: image,
        description: (prod.body_html || '').replace(/<[^>]*>/g, '').substring(0, 140),
        theme: charmTheme,
        color: charmColor,
        type: charmType,
        slots: charmSlots,
        tags: tags,
        variantId: firstVariant.id || prod.id
      };
    }
  }

  // Auto-mount on DOM Ready
  function initBraceletBuilders() {
    document.querySelectorAll('[data-bracelet-builder-section]').forEach(el => {
      if (!el._braceletBuilderInstance) {
        el._braceletBuilderInstance = new BraceletBuilder(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBraceletBuilders);
  } else {
    initBraceletBuilders();
  }

  // Shopify Theme Customizer Section Lifecycle Hooks
  document.addEventListener('shopify:section:load', (e) => {
    const section = e.target.querySelector('[data-bracelet-builder-section]');
    if (section) {
      section._braceletBuilderInstance = new BraceletBuilder(section);
    }
  });

})();

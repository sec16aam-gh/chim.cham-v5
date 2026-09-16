if (!customElements.get('theme-filter-bar')) {
  class ThemeFilterBar extends HTMLElement {
    constructor() {
      super();
      this.init = this.init.bind(this);
    }

    connectedCallback() {
      this.init();
    }

    init() {
      const track = this.querySelector('.theme-filter-bar__track');
      const prevBtn = this.querySelector('.theme-filter-bar__nav--prev');
      const nextBtn = this.querySelector('.theme-filter-bar__nav--next');
      const fadeLeft = this.querySelector('.theme-filter-bar__fade--left');
      const fadeRight = this.querySelector('.theme-filter-bar__fade--right');

      if (!track) return;

      // Update visibility of arrows and fade gradients
      const updateNav = () => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        const currentScroll = track.scrollLeft;
        const hasOverflow = maxScroll > 4;

        if (prevBtn) {
          if (hasOverflow && currentScroll > 6) {
            prevBtn.classList.add('is-visible');
          } else {
            prevBtn.classList.remove('is-visible');
          }
        }

        if (nextBtn) {
          if (hasOverflow && currentScroll < maxScroll - 6) {
            nextBtn.classList.add('is-visible');
          } else {
            nextBtn.classList.remove('is-visible');
          }
        }

        if (fadeLeft) {
          if (hasOverflow && currentScroll > 6) {
            fadeLeft.classList.add('is-visible');
          } else {
            fadeLeft.classList.remove('is-visible');
          }
        }

        if (fadeRight) {
          if (hasOverflow && currentScroll < maxScroll - 6) {
            fadeRight.classList.add('is-visible');
          } else {
            fadeRight.classList.remove('is-visible');
          }
        }
      };

      track.addEventListener('scroll', updateNav, { passive: true });
      window.addEventListener('resize', updateNav, { passive: true });

      // Arrow button navigation
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          track.scrollBy({ left: -240, behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          track.scrollBy({ left: 240, behavior: 'smooth' });
        });
      }

      // 1. Mouse Drag-to-Scroll (Desktop grab & swipe)
      let isDragging = false;
      let hasMoved = false;
      let startX = 0;
      let startScrollLeft = 0;

      track.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startScrollLeft = track.scrollLeft;
        track.classList.add('is-dragging');
      });

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        if (Math.abs(deltaX) > 4) {
          hasMoved = true;
          track.scrollLeft = startScrollLeft - deltaX;
        }
      };

      const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');
        if (hasMoved) {
          setTimeout(() => {
            hasMoved = false;
          }, 60);
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      // 2. Touch Drag Detection (Prevents accidental pill click on mobile swipe)
      let touchStartX = 0;
      let touchHasMoved = false;

      track.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchHasMoved = false;
        }
      }, { passive: true });

      track.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          const delta = Math.abs(e.touches[0].clientX - touchStartX);
          if (delta > 6) {
            touchHasMoved = true;
          }
        }
      }, { passive: true });

      track.addEventListener('touchend', () => {
        if (touchHasMoved) {
          hasMoved = true;
          setTimeout(() => {
            hasMoved = false;
            touchHasMoved = false;
          }, 80);
        }
      }, { passive: true });

      // Prevent link activation if user dragged or swiped
      track.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      // Disable native HTML5 link ghost dragging
      track.addEventListener('dragstart', (e) => e.preventDefault());

      // 3. Mouse Wheel to Horizontal Scroll
      let wheelTimeout;
      track.addEventListener('wheel', (e) => {
        const deltaY = e.deltaY || 0;
        const deltaX = e.deltaX || 0;
        if (Math.abs(deltaY) >= Math.abs(deltaX) && deltaY !== 0) {
          const maxScroll = track.scrollWidth - track.clientWidth;
          if (maxScroll > 0) {
            const canScrollLeft = track.scrollLeft > 0 && deltaY < 0;
            const canScrollRight = track.scrollLeft < maxScroll - 1 && deltaY > 0;
            if (canScrollLeft || canScrollRight) {
              e.preventDefault();
              track.classList.add('is-dragging');
              track.scrollLeft += deltaY;
              clearTimeout(wheelTimeout);
              wheelTimeout = setTimeout(() => {
                track.classList.remove('is-dragging');
              }, 100);
            }
          }
        }
      }, { passive: false });

      // Initial alignment & active pill centering
      requestAnimationFrame(() => {
        updateNav();
        const activePill = track.querySelector('.theme-filter-pill.is-active');
        if (activePill) {
          const activeLeft = activePill.offsetLeft;
          const activeRight = activeLeft + activePill.offsetWidth;
          if (activeLeft < track.scrollLeft || activeRight > track.scrollLeft + track.clientWidth) {
            track.scrollLeft = activeLeft - (track.clientWidth - activePill.offsetWidth) / 2;
          }
        }
      });
    }
  }

  customElements.define('theme-filter-bar', ThemeFilterBar);
}

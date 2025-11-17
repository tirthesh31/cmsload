window.Webflow ||= [];
window.Webflow.push(() => {
  // Run ONLY after Webflow fully loads the page

  (function () {
    const loadMoreBtn = document.querySelector('[so-cmsload-element="loadMore"]');
    const realList = document.querySelector('[so-cmsload-element="list"]');

    // If elements don't exist, STOP the script (prevents errors)
    if (!loadMoreBtn || !realList) return;

    let pageStack = [];
    let currentPage = 1;
    let loadLessBtn = null;

    const updatePageHref = (href, page) =>
      href.replace(/_page=\d+/, `_page=${page}`);

    // Animation for newly added items
    function animateItem(el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity .3s ease, transform .3s ease";

      void el.offsetHeight; // Reflow

      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0px)";
      });
    }

    // Load MORE
    async function loadMore() {
      loadMoreBtn.href = updatePageHref(loadMoreBtn.href, currentPage + 1);

      const html = await fetch(loadMoreBtn.href).then(r => r.text());
      const doc = new DOMParser().parseFromString(html, "text/html");

      const newItems = [
        ...doc.querySelector('[so-cmsload-element="list"]')
          .querySelectorAll('[role="listitem"]')
      ];

      newItems.forEach(item => {
        realList.appendChild(item);
        animateItem(item);
      });

      pageStack.push(newItems);
      currentPage++;

      // Show Load Less
      if (currentPage > 1) {
        if (!loadLessBtn) {
          loadLessBtn = doc.querySelector('[so-cmsload-element="loadLess"]');
          if (loadLessBtn) {
            loadMoreBtn.parentNode.insertBefore(loadLessBtn, loadMoreBtn);
            loadLessBtn.addEventListener("click", e => {
              e.preventDefault();
              loadLess();
            });
          }
        }
      }
    }

    // Load LESS
    function loadLess() {
      if (!pageStack.length) return;

      const lastBatch = pageStack.pop();
      lastBatch.forEach(item => item.remove());
      currentPage--;

      requestAnimationFrame(() => {
        const lastVisible = realList.lastElementChild;
        if (lastVisible) {
          lastVisible.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    }

    // Event Listener
    loadMoreBtn.addEventListener("click", e => {
      e.preventDefault();
      loadMore();
    });
  })();
});

window.Webflow ||= [];
window.Webflow.push(() => {

  (function () {
    const loadMoreBtn = document.querySelector('[so-cmsload-element="loadMore"]');
    const realList = document.querySelector('[so-cmsload-element="list"]');

    if (!loadMoreBtn || !realList) return;

    let pageStack = [];
    let currentPage = 1;
    let loadLessBtn = null;

    const updatePageHref = (href, page) =>
      href.replace(/_page=\d+/, `_page=${page}`);

    // Animation
    function animateItem(el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity .3s ease, transform .3s ease";
      void el.offsetHeight;
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0px)";
      });
    }

    // LOAD MORE
    async function loadMore() {
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

      const nextLoadMore = doc.querySelector('[so-cmsload-element="loadMore"]');

      if (nextLoadMore) {
        loadMoreBtn.href = nextLoadMore.href;
        loadMoreBtn.style.display = "inline-block";
      } else {
        loadMoreBtn.style.display = "none";
      }

      // Create load less button ONLY the first time
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

    // LOAD LESS
    function loadLess() {
      if (!pageStack.length) return;

      const lastBatch = pageStack.pop();
      lastBatch.forEach(item => item.remove());

			// Update href backward
	    loadMoreBtn.href = updatePageHref(loadMoreBtn.href, currentPage);

      // Always show Load More again
      loadMoreBtn.style.display = "inline-block";
      
      //decrement the current page
      currentPage--;

      // 🔥 NEW RULE: Remove Load Less when back to page 1
      if (currentPage === 1 && loadLessBtn) {
        loadLessBtn.remove();
        loadLessBtn = null;
      }

      // Smooth scroll to last visible item
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

    // LISTENERS
    loadMoreBtn.addEventListener("click", e => {
      e.preventDefault();
      loadMore();
    });

  })();
});

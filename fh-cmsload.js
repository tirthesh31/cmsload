(function () {
  const loadMoreBtn = document.querySelector('[fh-cmsload-element="loadMore"]');
  const realList = document.querySelector('[fh-cmsload-element="list"]');
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

    // Force reflow so animation starts correctly
    void el.offsetHeight;

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
      ...doc.querySelector('[fh-cmsload-element="list"]')
        .querySelectorAll('[role="listitem"]')
    ];

    newItems.forEach(item => {
      realList.appendChild(item);
      animateItem(item);
    });

    pageStack.push(newItems);
    currentPage++;

    // Load Less Init & Show
    if (currentPage > 1) {
      if (!loadLessBtn) {
        loadLessBtn = doc.querySelector('[fh-cmsload-element="loadLess"]');
        if (loadLessBtn) {
          loadLessBtn.style.display = "inline-block";
          loadMoreBtn.parentNode.insertBefore(loadLessBtn, loadMoreBtn);
          loadLessBtn.addEventListener("click", e => {
            e.preventDefault();
            loadLess();
          });
        }
      } else {
        loadLessBtn.style.display = "inline-block";
      }
    }
  }

  // Load LESS
  function loadLess() {
    if (!pageStack.length) return;

    const lastBatch = pageStack.pop();
    lastBatch.forEach(item => item.remove());
    currentPage--;

    // SCROLL FIX — scrolls to last visible item
    requestAnimationFrame(() => {
      const lastVisible = realList.lastElementChild;

      if (lastVisible) {
        lastVisible.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });

    // Hide Load Less if on first page
    if (currentPage === 1 && loadLessBtn)
      loadLessBtn.style.display = "none";

    loadMoreBtn.style.display = "inline-block";
  }

  // Event Listener
  loadMoreBtn.addEventListener("click", e => {
    e.preventDefault();
    loadMore();
  });
})();

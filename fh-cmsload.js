
(function () {
  const loadMoreBtn = document.querySelector('[fh-cmsload-element="loadMore"]');
  const realList = document.querySelector('[fh-cmsload-element="list"]');
  let pageStack = [];
  let currentPage = 1;
  let loadLessBtn = null;

  const updatePageHref = (href, page) =>
    href.replace(/_page=\d+/, `_page=${page}`);

  // Smooth fade-in animation
  function animateItem(el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity .3s ease, transform .3s ease";

	// force a synchronous reflow so the browser registers the initial state
  // reading offsetHeight forces layout
  void el.offsetHeight;
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0px)";
    });
  }

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
      animateItem(item); // ← ADD ANIMATION HERE
    });

    pageStack.push(newItems);
    currentPage++;

    // Load Less logic
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
      } else loadLessBtn.style.display = "inline-block";
    }
  }

  function loadLess() {
    if (!pageStack.length) return;

    pageStack.pop().forEach(item => item.remove());
    currentPage--;

    if (currentPage === 1 && loadLessBtn)
      loadLessBtn.style.display = "none";

    loadMoreBtn.style.display = "inline-block";
  }

  loadMoreBtn.addEventListener("click", e => {
    e.preventDefault();
    loadMore();
  });
})();

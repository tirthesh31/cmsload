(function () {
  const loadMoreBtn = document.querySelector('[fh-cmsload-element="loadMore"]');
  const realList = document.querySelector('[fh-cmsload-element="list"]');
  let pageStack = [];       // arrays of appended nodes
  let anchorStack = [];     // absolute Y positions to scroll back to
  let currentPage = 1;
  let loadLessBtn = null;

  const updatePageHref = (href, page) =>
    href.replace(/_page=\d+/, `_page=${page}`);

  function animateItem(el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity .3s ease, transform .3s ease";
    void el.offsetHeight; // force reflow
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }

  async function loadMore() {
    if (!loadMoreBtn) return;

    // Capture anchor Y (last visible item's Y) BEFORE adding new items
    const lastVisible = realList.lastElementChild;
    const anchorY = lastVisible
      ? lastVisible.getBoundingClientRect().top + window.scrollY
      : 0;
    anchorStack.push(anchorY);

    loadMoreBtn.href = updatePageHref(loadMoreBtn.href, currentPage + 1);

    const html = await fetch(loadMoreBtn.href).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    const nodeList = doc.querySelector('[fh-cmsload-element="list"]')
      .querySelectorAll('[role="listitem"]');
    const newItems = Array.from(nodeList);

    // Append and animate with small stagger
    newItems.forEach((item, i) => {
      realList.appendChild(item);
      // stagger for nicer UX
      setTimeout(() => animateItem(item), i * 40);
    });

    pageStack.push(newItems);
    currentPage++;

    // Load Less button logic (grab from fetched page if needed)
    if (currentPage > 1) {
      if (!loadLessBtn) {
        loadLessBtn = doc.querySelector('[fh-cmsload-element="loadLess"]')
          || doc.querySelector('.w-pagination-previous');
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

    // Update next button URL from the fetched doc's next button if any
    const nextBtnFromDoc = doc.querySelector('.w-pagination-next') || doc.querySelector('[fh-cmsload-element="loadMore"]');
    if (nextBtnFromDoc) loadMoreBtn.href = updatePageHref(nextBtnFromDoc.getAttribute('href') || loadMoreBtn.href, currentPage + 0);
  }

  function clamp(n) {
    const max = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight;
    return Math.max(0, Math.min(n, max));
  }

  function loadLess() {
    if (!pageStack.length) return;

    // Remove last batch (with optional animation)
    const lastBatch = pageStack.pop();
    // Optionally animate removal; here we remove immediately but could fade out
    lastBatch.forEach(node => node.remove());
    currentPage--;

    // Pull the anchor Y for this batch
    const targetY = anchorStack.pop() || 0;

    // Wait a tick so layout updates, then scroll
    requestAnimationFrame(() => {
      // clamp target to the current max scrollable height
      const y = clamp(targetY);
      window.scrollTo({ top: y, behavior: 'smooth' });

      // If we've returned to page 1, hide loadLess button
      if (currentPage === 1 && loadLessBtn) {
        loadLessBtn.style.display = "none";
      }
      // ensure loadMore button visible
      if (loadMoreBtn) loadMoreBtn.style.display = "inline-block";
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", e => {
      e.preventDefault();
      loadMore();
    });
  } else {
    console.warn('loadMoreBtn not found: selector [fh-cmsload-element="loadMore"]');
  }
})();

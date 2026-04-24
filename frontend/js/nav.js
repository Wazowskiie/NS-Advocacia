document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", e => {
    const href = item.getAttribute("href");
    if (!href || href === "#") e.preventDefault();
  });
});
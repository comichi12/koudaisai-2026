// Replace these two values when the official accounts are ready.
const socialUrls = {
  instagram: "",
  x: ""
};

document.querySelectorAll("[data-social]").forEach((link) => {
  const url = socialUrls[link.dataset.social];
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      alert("公式SNSのリンクは準備中です。");
    });
  }
});

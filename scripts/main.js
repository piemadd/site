const mainSection = document.getElementById('mainSection');
const topLinks = document.getElementById('topLinks');

//code for "back to top"

//initial load
if (mainSection.scrollTop > 0) topLinks.style.opacity = '1';
else topLinks.style.opacity = '0';

//whenever user scrolls
mainSection.addEventListener("scroll", (event) => {
  if (event.target.scrollTop > 0) topLinks.style.opacity = '1';
  else topLinks.style.opacity = '0';
});


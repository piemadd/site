import setupCharts from './setupCharts.js';
import { setupPhysics, runPhysics, updatePhysics } from './setupPhysics.js';

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

setupCharts();



let clicksToRun = 3;

const handleActivatorClick = (e) => {
  clicksToRun--;

  if (clicksToRun <= 0) {
    const confirmed = confirm('would you like to enable the super secret easter egg?');

    if (confirmed) {
      setupPhysics();
      runPhysics();
    }
  };
}

document.getElementById('topName').addEventListener('click', handleActivatorClick);
document.getElementById('footer').addEventListener('click', handleActivatorClick);

//attaching to window for manual activation
window.setupPhysics = setupPhysics;
window.runPhysics = runPhysics;
window.updatePhysics = updatePhysics;

//runPhysics();
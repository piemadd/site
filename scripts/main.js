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

if (new URL(window.location).pathname === '/lol') {
  //alert('Hey there, you seem to have read the quote in my HS yearbook. I haven\'t really done anything with the URL, so browse my regular site I guess ¯\\_(ツ)_/¯.')
  setupPhysics();
  runPhysics();
}

//attaching to window for manual activation
window.setupPhysics = setupPhysics;
window.runPhysics = runPhysics;
window.updatePhysics = updatePhysics;

//runPhysics();
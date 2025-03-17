let allClick = [] // an array with key mouse positions

// function for fill place for key click position
function updateClickList() {
  document.querySelector('.clickContainer').innerHTML = allClick.map((item, i) => `
    <div class="clickItem">
      <div>
        <h1>${i + 1}</h1>
        <div class="column">
          <p>x: ${item.x}</p>
          <p>y: ${item.y}</p>
        </div>
      </div>
      <button data-id="${i}"></button>
    </div>
  `).join('');
}
updateClickList();

// take data in data.json
window.electronAPI.readFile().then(data => {
  const reData = JSON.parse(data);

  allClick = reData.allClick;
  document.getElementById('iteration').value = reData.iteration;
  document.getElementById('delay').value = reData.delay;

  updateClickList();
})

// write mouse pos in #firstCurText, #secondCurText elements
setInterval(() => {
  window.electronAPI.getMousePos().then(pos => { 
    document.getElementById('firstCurText').innerText = 'x: ' + pos.x;
    document.getElementById('secondCurText').innerText = 'y: ' + pos.y;
  });
}, 25);

// main functions for play and add clicks for array "allClick"
let isPlay = false;
let timeouts = [];
function playClick() {
  const iterations = Math.min(Math.max(document.getElementById('iteration').value, 1));
  const delay = Math.max(document.getElementById('delay').value, 1);
  const clickItems = document.querySelectorAll('.clickContainer .clickItem');

  if (isPlay) {
    isPlay = false;
    timeouts.forEach(clearTimeout);
    timeouts = [];
    return;
  }
  isPlay = true;

  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < allClick.length; j++) {
      let timeout = setTimeout(() => {
        clickItems[j].style.opacity = 0.7;
        setTimeout(() => {
          clickItems[j].style.opacity = 1;
        }, delay);

        window.electronAPI.moveMouse(allClick[j].x, allClick[j].y);
        window.electronAPI.mouseClick();
      }, (i * allClick.length + j) * delay);
      timeouts.push(timeout);
    }
  }
  let stopTimeout = setTimeout(() => {
    isPlay = false;
  }, (iterations * allClick.length) * delay);
  timeouts.push(stopTimeout);
}
function addClick(){
  window.electronAPI.getMousePos().then(pos => {
    allClick.push({x: pos.x, y: pos.y})
    window.electronAPI.writeFile('allClick', JSON.stringify(allClick))
    document.querySelector('.clickContainer').innerHTML += `
            <div class="clickItem">
              <div>
                <h1>${allClick.length}</h1>
                <div class="column">
                  <p>x: ${pos.x}</p>
                  <p>y: ${pos.y}</p>
                </div>
              </div>
              <button id="${allClick.length}"></button>
            </div>`
  });
}

// save iteration & delay in data.json
document.getElementById('iteration').oninput = () => window.electronAPI.writeFile('iteration', Math.max(document.getElementById('iteration').value, 1));
document.getElementById('delay').oninput = () => window.electronAPI.writeFile('delay', Math.max(document.getElementById('delay').value, 1));

// call fuctions for need client
document.getElementById('playClick').onclick = () => playClick();
document.getElementById('createClick').onclick = () => addClick();
document.getElementById('deleteAllClick').onclick = () => {
  window.electronAPI.writeFile('allClick', JSON.stringify(allClick = []));
  updateClickList();
};
document.addEventListener('keydown', function(e){ // call fuctions with keyboard
  if(e.keyCode === 67) addClick();
  if(e.keyCode === 32) playClick();
});

// remove click from array
document.querySelector('.clickContainer').addEventListener('click', (e) => {
  if(e.target.localName == 'button'){
    allClick.splice(Number(e.target.dataset.id), 1);
    window.electronAPI.writeFile('allClick', JSON.stringify(allClick))

    updateClickList();
  }
});
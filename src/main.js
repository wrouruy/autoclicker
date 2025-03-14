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

window.electronAPI.readFile().then(data => {
  if(data) allClick = JSON.parse(data);
  
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
function playClick() {
  let iterations = Math.max(document.getElementById('iteration').value, 1);
  let delay = document.getElementById('delay').value;
  document.querySelector('.clickItem').style.transition = delay + 'ms';
  iterations = Math.min(iterations, 100);

  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < allClick.length; j++) {

      setTimeout(() => {
        document.querySelectorAll('.clickContainer .clickItem')[j].style.opacity = 0.7;
        setTimeout(() => {
          document.querySelectorAll('.clickContainer .clickItem')[j].style.opacity = 1;
        }, delay)
        window.electronAPI.moveMouse(allClick[j].x, allClick[j].y);
        window.electronAPI.mouseClick();
      }, (i * allClick.length + j) * delay);
    }
  }
}
function addClick(){
  window.electronAPI.getMousePos().then(pos => {
    allClick.push({x: pos.x, y: pos.y})
    window.electronAPI.writeFile(JSON.stringify(allClick))
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

// call fuctions for need client
document.getElementById('playClick').onclick = () => playClick();
document.getElementById('createClick').onclick = () => addClick();
document.addEventListener('keydown', function(e){ // call fuctions with keyboard
  if(e.keyCode === 67) addClick();
  if(e.keyCode === 32) playClick();
});

// remove click from array
document.querySelector('.clickContainer').addEventListener('click', (e) => {
  if(e.target.localName == 'button'){
    allClick.splice(Number(e.target.dataset.id), 1);
    window.electronAPI.writeFile(JSON.stringify(allClick));

    updateClickList();
  }
});
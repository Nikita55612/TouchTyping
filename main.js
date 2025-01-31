const { invoke } = window.__TAURI__.tauri;
import { STRUCT } from './struct.js';


const ctruct_light = STRUCT["structs"].length;
const words_light = STRUCT["words"].length;


function getNewLitters(text) {
  var splitText = text.split(' ')
  for (let w = 0; w < splitText.length; w++) {
    let letters_ = splitText[w];
    let newWordDiv = document.createElement('div');
    newWordDiv.className = 'word';
    for (let i = 0; i < letters_.length; i++) {
      let letterDiv = document.createElement('letter');
      letterDiv.textContent = letters_[i];
      newWordDiv.appendChild(letterDiv);
    }
    let wordsWrapper = document.getElementById('wordsWrapper');
    wordsWrapper.appendChild(newWordDiv);
  }
  return document.getElementsByTagName('letter')
}

function getNewText() {
  let text = "";
  while (text.length < 225) {
    let rand = (Math.random() * (1.0 - 0.0) + 0.0).toFixed(4);
    let key = "structs";
    if (rand < 0.66) {
      key = "words";
    }
    let light = ctruct_light
    if (key = "words") {
      light = words_light}
    let divider = " ";
    if (rand < 0.025) {
      divider = ". ";
    }
    text += STRUCT[key][Math.floor(Math.random() * (light - 0) ) + 0] + divider;
  }

  return text.trim();
}


const timer = document.getElementById('timer');
const stat = document.getElementById('stat');
var refreshIntervalTimer;
var text = getNewText();
var letters = getNewLitters(text);
var n_words = 0;
var progress = 0;
var typos = 0;
var prev_dt_now = Date.now();
var press_time_list = [];
var miss_list = [];
var chars_list = [];
var start_progress = Date.now();


function resetWrapper() {
  clearInterval(refreshIntervalTimer)
  let wordsWrapper = document.getElementById("wordsWrapper");
  text = getNewText();
  wordsWrapper.innerHTML = '';
  letters = getNewLitters(text);
  n_words = 0;
  progress = 0;
  typos = 0;
  prev_dt_now = Date.now();
  press_time_list = [];
  miss_list = [];
  chars_list = [];
  timer.innerHTML = "<h1>00:00</h1>";
  stat.innerHTML = "<h1>P|0.00% S|0.00сps M|0.00%</h1>";
}

const resetWrapperButton = document.querySelector('.resetWrapper');
resetWrapperButton.addEventListener('mousedown', function(e) {
  resetWrapper();
});

function timerLoop( ) {
  let sec = Math.round((Date.now() - start_progress) / 1000);
  let min = (sec / 60) | 0;
  if (min > 0) {
    sec -= min * 60;
  }
  if (sec.toString().length == 1) {
    sec = "0" + sec.toString();
  }
  if (min.toString().length == 1) {
    min = "0" + min.toString();
  }
  timer.innerHTML = `<h1>${min}:${sec}</h1>`
}


document.addEventListener('keydown', function(event) {
  if ((event.ctrlKey && event.code === "KeyC") || event.key === "Enter") {
    resetWrapper();
    return;
  }
  if (progress === 0) {
    start_progress = Date.now();
    clearInterval(refreshIntervalTimer);
    refreshIntervalTimer = setInterval(timerLoop, 1000);
  }
  chars_list.push((text[progress] !== " ") ? `\"${text[progress]}\"` : "\"_\"")
  let miss = 0
  if (event.key === text[progress]) {
    if (event.key === " ") {
      n_words++;
    } else {
      letters[progress - n_words].style.color = "#00ff9d";
    }
    progress++;
  } else {
    if (event.key === "Backspace") {
      progress--;
      if (text[progress] === " ") {
        n_words--;
      }
      letters[progress - n_words].style.color = "#fafafa";
    } else {
      if (!["Tab", "CapsLock", "Shift", "Alt", "Control"].includes(event.key)) {
        if (text[progress] === " ") {
          n_words++;
        } else {
          letters[progress - n_words].style.color = "#eb2657";
        }
        typos++;
        progress++;
        miss = 1;
      }
    }
  }
  let progress_perc = (progress / text.length).toFixed(2);
  let dt_now = Date.now();
  press_time_list.push(((dt_now - prev_dt_now) / 1000).toFixed(3));
  prev_dt_now = dt_now;
  let symb_per_sec = (1 / ((dt_now - start_progress) / 1000 / progress)).toFixed(2);
  let miss_perc = (typos / progress).toFixed(2);
  miss_list.push(miss)
  stat.innerHTML = `<h1>P|${progress_perc}% S|${symb_per_sec}сps M|${miss_perc}%</h1>`;
  if (progress == text.length) {
    let dt_now = Date.now();
    let symb_per_sec = (1 / ((dt_now - start_progress) / 1000 / progress)).toFixed(4);
    let miss_perc = (typos / progress).toFixed(4);
    press_time_list.push(((dt_now - prev_dt_now) / 1000).toFixed(3));
    clearInterval(refreshIntervalTimer);
    invoke('save_stat', { data: `${symb_per_sec}.@|'${miss_perc}.@|'[${press_time_list.slice(1)}].@|'[${miss_list.slice(1)}].@|'[${chars_list.slice(1)}]` });
  }
});


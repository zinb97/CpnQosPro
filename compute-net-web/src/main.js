// main.js - 应用入口
import './style/base.css';
import './style/layout.css';
import './style/components.css';
import App from './App.js';

const app = document.getElementById('app');
app.innerHTML = App.render();
App.init();

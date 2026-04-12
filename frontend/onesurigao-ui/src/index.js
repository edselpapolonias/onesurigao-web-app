import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import L from 'leaflet';

// Global patch for Leaflet "Cannot read properties of undefined (reading 'classList')"
// This happens when dragging the cursor outside the map boundaries.
const originalAddClass = L.DomUtil.addClass;
L.DomUtil.addClass = function (el, name) {
  if (el && el.classList) {
    originalAddClass.call(L.DomUtil, el, name);
  }
};
const originalRemoveClass = L.DomUtil.removeClass;
L.DomUtil.removeClass = function (el, name) {
  if (el && el.classList) {
    originalRemoveClass.call(L.DomUtil, el, name);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

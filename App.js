// Root Expo entry — re-export the real App component from myApp-frontend
// This lets Expo's default AppEntry (which imports '../../App') resolve correctly.
export { default } from './myApp-frontend/App';

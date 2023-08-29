import { createApp } from 'kw-lib';
import routes from '~/routes';
import '~/css/app.scss';
import '~/css/grid.scss';

import App from './App.vue';

createApp(App, {
  devicePlatform: 'tablet',
  routes,
}).mount('#app');

import {
  createRoutesByGlobImport,
  registerPopupsByGlobImport,
  consts,
} from 'kw-lib';

const routesGlobImport = import.meta.glob('~/modules/**/pages/*/*M.vue');
const popupsGlobImport = import.meta.glob('~/modules/**/pages/*/*P.vue');

registerPopupsByGlobImport(popupsGlobImport);

export default [
  {
    path: '/',
    name: consts.ROUTE_HOME_NAME,
    component: () => import('~/pages/IndexPage.vue'),
  },

  ...createRoutesByGlobImport(routesGlobImport),
];

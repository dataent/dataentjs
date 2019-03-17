/**
 * Vue Plugin that registers common UI elements
 * like Button and Modal into the root Vue instance
 */

import dataent from 'dataentjs';
import NotFound from '../components/NotFound';
import FeatherIcon from '../components/FeatherIcon';
import dataentControl from '../components/controls/dataentControl';
import Button from '../components/Button';
import Indicator from '../components/Indicator';
import modalPlugin from '../components/Modal/plugin';
import formModalPlugin from '../plugins/formModal';
import outsideClickDirective from './outsideClickDirective';

export default function installdataentPlugin(Vue) {
  Vue.component('not-found', NotFound);
  Vue.component('feather-icon', FeatherIcon);
  Vue.component('dataent-control', dataentControl);
  Vue.component('f-button', Button);
  Vue.component('indicator', Indicator);
  Vue.directive('on-outside-click', outsideClickDirective);

  Vue.use(modalPlugin);
  Vue.use(formModalPlugin);

  Vue.mixin({
    computed: {
      dataent() {
        return dataent;
      }
    },
    methods: {
      // global translation function in every component
      _(...args) {
        return dataent._(...args);
      }
    }
  });
}

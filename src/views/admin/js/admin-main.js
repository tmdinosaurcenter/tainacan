// Overrides lodash by original WordPress Underscore Library
//window.lodash = _.noConflict();
//window.underscore = _.noConflict();

// Main imports
import Vue from 'vue';
import Buefy from 'buefy';
import VTooltip from 'v-tooltip';
import VueMasonry from 'vue-masonry-css';
import draggable from 'vuedraggable';
import VueTheMask from 'vue-the-mask';
import cssVars from 'css-vars-ponyfill';
import VueBlurHash from 'vue-blurhash';

// Metadata Types
import Text from '../components/metadata-types/text/Text.vue';
import Textarea from '../components/metadata-types/textarea/Textarea.vue';
import Selectbox from '../components/metadata-types/selectbox/Selectbox.vue';
import Numeric from '../components/metadata-types/numeric/Numeric.vue';
import Date from '../components/metadata-types/date/Date.vue';
import Relationship from '../components/metadata-types/relationship/Relationship.vue';
import Taxonomy from '../components/metadata-types/taxonomy/Taxonomy.vue';
import Compound from '../components/metadata-types/compound/Compound.vue';
import User from '../components/metadata-types/user/User.vue';

import FormText from '../components/metadata-types/text/FormText.vue';
import FormRelationship from '../components/metadata-types/relationship/FormRelationship.vue';
import FormTaxonomy from '../components/metadata-types/taxonomy/FormTaxonomy.vue';
import FormSelectbox from '../components/metadata-types/selectbox/FormSelectbox.vue';
import FormNumeric from '../components/metadata-types/numeric/FormNumeric.vue';
import FormUser from '../components/metadata-types/user/FormUser.vue';

import FilterNumeric from '../components/filter-types/numeric/Numeric.vue';
import FilterDate from '../components/filter-types/date/Date.vue';
import FilterSelectbox from '../components/filter-types/selectbox/Selectbox.vue';
import FilterAutocomplete from '../components/filter-types/autocomplete/Autocomplete.vue';
import FilterCheckbox from '../components/filter-types/checkbox/Checkbox.vue';
import FilterTaginput from '../components/filter-types/taginput/Taginput.vue';
import FilterNumericInterval from '../components/filter-types/numeric-interval/NumericInterval.vue';
import FilterDateInterval from '../components/filter-types/date-interval/DateInterval.vue';
import FilterNumericListInterval from '../components/filter-types/numeric-list-interval/NumericListInterval.vue';
import FilterTaxonomyCheckbox from '../components/filter-types/taxonomy/Checkbox.vue';
import FilterTaxonomyTaginput from '../components/filter-types/taxonomy/Taginput.vue';

// Term edition form must be imported here so that it is not necessary on item-submission bundle
import TermEditionForm from '../components/edition/term-edition-form.vue';

import FormFilterNumeric from '../components/filter-types/numeric/FormNumeric.vue';
import FormFilterNumericInterval from '../components/filter-types/numeric-interval/FormNumericInterval.vue';
import FormFilterNumericListInterval from '../components/filter-types/numeric-list-interval/FormNumericListInterval.vue';
// import FormDate from '../../../classes/filter-types/date/FormDate.vue';

import TainacanFormItem from '../components/metadata-types/tainacan-form-item.vue';
import TainacanFiltersList from '../components/filter-types/tainacan-filter-item.vue';

// Remaining imports
import AdminPage from '../admin.vue'
import HelpButton from '../components/other/help-button.vue';
import TainacanTitle from '../components/navigation/tainacan-title.vue';
import store from './store/store'
import router from './router'
import eventBusSearch from './event-bus-search';
import eventBusTermsList from './event-bus-terms-list.js';
import { 
    I18NPlugin,
    UserPrefsPlugin,
    RouterHelperPlugin,
    ConsolePlugin,
    UserCapabilitiesPlugin,
    StatusHelperPlugin,
    CommentsStatusHelperPlugin,
    AdminOptionsHelperPlugin 
} from './admin-utilities';
import { 
    ThumbnailHelperPlugin,
    OrderByHelperPlugin
} from './utilities';

export default (element) => {

    // Vue Dev Tools!
    Vue.config.devtools = process && process.env && process.env.NODE_ENV === 'development';

    function renderTainacanAdminPage() {

        // Gets the div with the content of the page
        let pageElement = element ? element : document.getElementById('tainacan-admin-app');

        // Mount only if the div exists and it is not already mounted
        if ( pageElement && pageElement.classList && !pageElement.classList.contains('has-mounted') ) {

            /* Registers Extra Vue Plugins passed to the window.tainacan_extra_plugins  */
            if (typeof window.tainacan_extra_plugins != "undefined") {
                for (let [extraVuePluginName, extraVuePluginObject] of Object.entries(window.tainacan_extra_plugins))
                    Vue.use(extraVuePluginObject);
            }

            // Configure and Register Plugins
            Vue.use(Buefy, {
                defaultTooltipAnimated: true
            });
            Vue.use(VTooltip, {
                defaultClass: 'tainacan-tooltip tooltip'
            });
            Vue.use(VueMasonry);
            Vue.use(VueBlurHash);
            Vue.use(I18NPlugin);
            Vue.use(UserPrefsPlugin);
            Vue.use(RouterHelperPlugin);
            Vue.use(UserCapabilitiesPlugin);
            Vue.use(ThumbnailHelperPlugin);
            Vue.use(OrderByHelperPlugin);
            Vue.use(StatusHelperPlugin);
            Vue.use(ConsolePlugin, {visual: false});
            Vue.use(VueTheMask);
            Vue.use(CommentsStatusHelperPlugin);
            Vue.use(AdminOptionsHelperPlugin, pageElement.dataset['options']);


            /* Registers Extra Vue Components passed to the window.tainacan_extra_components  */
            if (typeof window.tainacan_extra_components != "undefined") {
                for (let [extraVueComponentName, extraVueComponentObject] of Object.entries(window.tainacan_extra_components)) {
                    Vue.component(extraVueComponentName, extraVueComponentObject);
                }
            }

            /* Metadata */
            Vue.component('tainacan-text', Text);
            Vue.component('tainacan-textarea', Textarea);
            Vue.component('tainacan-selectbox', Selectbox);
            Vue.component('tainacan-numeric', Numeric);
            Vue.component('tainacan-date', Date);
            Vue.component('tainacan-relationship', Relationship);
            Vue.component('tainacan-taxonomy', Taxonomy);
            Vue.component('tainacan-compound', Compound);
            Vue.component('tainacan-user', User);

            /* Metadata Option forms */
            Vue.component('tainacan-form-text', FormText);
            Vue.component('tainacan-form-relationship', FormRelationship);
            Vue.component('tainacan-form-taxonomy', FormTaxonomy);
            Vue.component('tainacan-form-selectbox', FormSelectbox);
            Vue.component('tainacan-form-numeric', FormNumeric);
            Vue.component('tainacan-form-user', FormUser);
            Vue.component('term-edition-form', TermEditionForm);

            /* Filters */
            Vue.component('tainacan-filter-numeric', FilterNumeric);
            Vue.component('tainacan-filter-date', FilterDate);
            Vue.component('tainacan-filter-selectbox', FilterSelectbox);
            Vue.component('tainacan-filter-autocomplete', FilterAutocomplete);
            Vue.component('tainacan-filter-checkbox', FilterCheckbox);
            Vue.component('tainacan-filter-taginput', FilterTaginput);
            Vue.component('tainacan-filter-taxonomy-checkbox', FilterTaxonomyCheckbox);
            Vue.component('tainacan-filter-taxonomy-taginput', FilterTaxonomyTaginput);
            Vue.component('tainacan-filter-numeric-interval', FilterNumericInterval);
            Vue.component('tainacan-filter-numeric-list-interval', FilterNumericListInterval);
            Vue.component('tainacan-filter-date-interval', FilterDateInterval);

            /* Filter Metadata Option forms */
            Vue.component('tainacan-filter-form-numeric', FormFilterNumeric);
            Vue.component('tainacan-filter-form-numeric-interval', FormFilterNumericInterval);
            Vue.component('tainacan-filter-form-numeric-list-interval', FormFilterNumericListInterval);
            // Vue.component('tainacan-filter-form-date', FormDate);

            // Filter and Metadadum parent containers
            Vue.component('tainacan-form-item', TainacanFormItem);
            Vue.component('tainacan-filter-item', TainacanFiltersList);

            /* Others */
            Vue.component('help-button', HelpButton);
            Vue.component('draggable', draggable);
            Vue.component('tainacan-title', TainacanTitle);

            Vue.use(eventBusTermsList, {});
            Vue.use(eventBusSearch, { store: store, router: router});

            // Changing title of pages
            router.beforeEach((to, from, next) => {
                document.title = to.meta.title;
                if (next() != undefined)
                    next();
            });

            new Vue({
                el: '#tainacan-admin-app',
                store,
                router,
                render: h => h(AdminPage)
            });

            // Initialize Ponyfill for Custom CSS properties
            cssVars({
            // Options...
            });
        }
    }

    // This is rendered on the admin page.
    renderTainacanAdminPage();
};
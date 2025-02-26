<template>
    <div>
        <div class="page-container repository-level-page">
            <tainacan-title 
                    :bread-crumb-items="[
                        { path: $routerHelper.getTaxonomiesPath(), label: $i18n.get('taxonomies') },
                        { path: '', label: (taxonomy != null && taxonomy.name != undefined) ? taxonomy.name : $i18n.get('taxonomy') }
                    ]"/>
            <b-tabs 
                    @change="onChangeTab($event)"
                    v-model="tabIndex">    
                <b-tab-item :label="$i18n.get('taxonomy')">
                    <form 
                            v-if="taxonomy != null && taxonomy != undefined && (($route.name == 'TaxonomyCreationForm' && $userCaps.hasCapability('tnc_rep_edit_taxonomies')) || ($route.name == 'TaxonomyEditionForm' && taxonomy.current_user_can_edit))"
                            class="tainacan-form" 
                            label-width="120px">
                        <div class="columns">
                            <div class="column">
                                <!-- Name -------------------------------- -->
                                <b-field
                                        :addons="false"
                                        :label="$i18n.get('label_name')"
                                        :type="editFormErrors['name'] != undefined ? 'is-danger' : ''"
                                        :message="isUpdatingSlug ? $i18n.get('info_validating_slug') : (editFormErrors['name'] != undefined ? editFormErrors['name'] : '')">
                                    <span class="required-metadatum-asterisk">*</span>
                                    <help-button 
                                            :title="$i18n.getHelperTitle('taxonomies', 'name')" 
                                            :message="$i18n.getHelperMessage('taxonomies', 'name')"/>
                                    <b-input
                                            id="tainacan-text-name"
                                            v-model="form.name"
                                            @focus="clearErrors('name')"
                                            @blur="updateSlug()"
                                            :disabled="isUpdatingSlug"
                                            :loading="isUpdatingSlug"/>
                                </b-field>

                                <!-- Hook for extra Form options -->
                                <template v-if="hasBeginLeftForm">  
                                    <form 
                                        id="form-taxonomy-begin-left"
                                        class="form-hook-region"
                                        v-html="getBeginLeftForm"/>
                                </template>

                                <!-- Description -------------------------------- -->
                                <b-field
                                        :addons="false"
                                        :label="$i18n.get('label_description')"
                                        :type="editFormErrors['description'] != undefined ? 'is-danger' : ''"
                                        :message="editFormErrors['description'] != undefined ? editFormErrors['description'] : ''">
                                    <help-button 
                                            :title="$i18n.getHelperTitle('taxonomies', 'description')" 
                                            :message="$i18n.getHelperMessage('taxonomies', 'description')"/>
                                    <b-input
                                            id="tainacan-text-description"
                                            type="textarea"
                                            v-model="form.description"
                                            @focus="clearErrors('description')"/>
                                </b-field>

                                <!-- Allow Insert -->
                                <b-field :addons="false">
                                    <label class="label is-inline">
                                            {{ $i18n.get('label_taxonomy_allow_new_terms') }}
                                            <b-switch
                                                    id="tainacan-checkbox-allow-insert" 
                                                    size="is-small"
                                                    v-model="form.allowInsert"
                                                    true-value="yes"
                                                    false-value="no" />
                                            <help-button 
                                                :title="$i18n.getHelperTitle('taxonomies', 'allow_insert')" 
                                                :message="$i18n.getHelperMessage('taxonomies', 'allow_insert')"/>
                                        </label>
                                </b-field>
                            </div>

                            <div class="column">

                                <!-- Status -------------------------------- --> 
                                <b-field
                                        :addons="false" 
                                        :label="$i18n.get('label_status')"
                                        :type="editFormErrors['status'] != undefined ? 'is-danger' : ''" 
                                        :message="editFormErrors['status'] != undefined ? editFormErrors['status'] : ''">
                                    <help-button 
                                            :title="$i18n.getHelperTitle('taxonomies', 'status')" 
                                            :message="$i18n.getHelperMessage('taxonomies', 'status')"/>
                                    <div class="status-radios">
                                        <b-radio
                                                v-model="form.status"
                                                v-for="(statusOption, index) of $statusHelper.getStatuses()"
                                                :key="index"
                                                :native-value="statusOption.slug">
                                            <span class="icon has-text-gray">
                                                <i 
                                                    class="tainacan-icon tainacan-icon-18px"
                                                    :class="$statusHelper.getIcon(statusOption.slug)"/>
                                            </span>
                                            {{ statusOption.name }}
                                        </b-radio>
                                    </div>
                                </b-field>
                                
                                <!-- Slug -------------------------------- -->
                                <b-field
                                        :addons="false"
                                        :label="$i18n.get('label_slug')"
                                        :type="editFormErrors['slug'] != undefined ? 'is-danger' : ''"
                                        :message="editFormErrors['slug'] != undefined ? editFormErrors['slug'] : ''">
                                    <help-button 
                                            :title="$i18n.getHelperTitle('taxonomies', 'slug')" 
                                            :message="$i18n.getHelperMessage('taxonomies', 'slug')"/>
                                    <b-input
                                            @input="updateSlug()"
                                            id="tainacan-text-slug"
                                            v-model="form.slug"
                                            @focus="clearErrors('slug')"
                                            :disabled="isUpdatingSlug"/>
                                </b-field>

                                <!-- Activate for other post types -->
                                <b-field
                                        :addons="false"
                                        :label="$i18n.getHelperTitle('taxonomies', 'enabled_post_types')"
                                        :type="editFormErrors['enabled_post_types'] != undefined ? 'is-danger' : ''"
                                        :message="editFormErrors['enabled_post_types'] != undefined ? editFormErrors['enabled_post_types'] : ''">
                                    <help-button 
                                        :title="$i18n.getHelperTitle('taxonomies', 'enabled_post_types')" 
                                        :message="$i18n.getHelperMessage('taxonomies', 'enabled_post_types')"/>

                                    <div 
                                            v-for="wpPostType in wpPostTypes"
                                            :key="wpPostType.slug"
                                            class="field">
                                        <b-checkbox
                                            :native-value="wpPostType.slug"
                                            :true-value="wpPostType.slug"
                                            false-value=""
                                            v-model="form.enabledPostTypes"
                                            name="enabled_post_types" >
                                            {{ wpPostType.label }}  
                                        </b-checkbox>
                                    </div>    
                                </b-field>

                                <!-- Hook for extra Form options -->
                                <template v-if="hasEndLeftForm">  
                                    <form 
                                        id="form-taxonomy-end-left"
                                        class="form-hook-region"
                                        v-html="getEndLeftForm"/>
                                </template>
                            </div>
                        </div>

                        <!-- Submit -->
                        <div class="field is-grouped form-submit">
                            <div
                                    v-if="$route.query.recent"
                                    class="control">
                                <button
                                        id="button-another-taxonomy-creation"
                                        @click.prevent="goToCreateAnotherTaxonomy()"
                                        class="button is-secondary">{{ $i18n.get('label_create_another_taxonomy') }}</button>
                            </div>
                            <div    
                                    v-if="!$route.query.recent"
                                    style="margin-right: auto;"
                                    class="control">
                                <button
                                        id="button-cancel-taxonomy-creation"
                                        class="button is-outlined"
                                        type="button"
                                        @click="cancelBack">{{ $i18n.get('cancel') }}</button>
                            </div>
                            <p 
                                    style="margin: 0 12px;"
                                    class="help is-danger">
                                {{ formErrorMessage }}
                            </p>
                            <p 
                                    v-if="updatedAt != undefined"
                                    class="updated-at">
                                {{ ($i18n.get('info_updated_at') + ' ' + updatedAt) }}
                            </p>
                            <div class="control">
                                <button
                                        :class="{ 'is-loading': isLoadingTaxonomy, 'is-success': !isLoadingTaxonomy }"
                                        id="button-submit-taxonomy-creation"
                                        @click.prevent="onSubmit"
                                        class="button">{{ $i18n.get('save') }}</button>
                            </div>
                        </div>
                    </form>

                    <div v-if="!isLoading && (($route.name == 'TaxonomyCreationForm' && !$userCaps.hasCapability('tnc_rep_edit_taxonomies')) || ($route.name == 'TaxonomyEditionForm' && taxonomy && taxonomy.current_user_can_edit != undefined && !taxonomy.current_user_can_edit))">
                        <section class="section">
                            <div class="content has-text-grey has-text-centered">
                                <p>
                                    <span class="icon">
                                        <i class="tainacan-icon tainacan-icon-30px tainacan-icon-taxonomies"/>
                                    </span>
                                </p>
                                <p>{{ $i18n.get('info_can_not_edit_taxonomy') }}</p>
                            </div>
                        </section>
                    </div>

                </b-tab-item>
                
                <b-tab-item :label="$i18n.get('terms')">
                    <!-- Terms List -->    
                    <terms-list
                            :key="shouldReloadTermsList ? 'termslistreloaded' : 'termslist'" 
                            @isEditingTermUpdate="isEditingTermUpdate"
                            :taxonomy-id="taxonomyId"
                            :current-user-can-edit-taxonomy="taxonomy ? taxonomy.current_user_can_edit : false"/>
                </b-tab-item>

                <b-loading 
                        :active.sync="isLoadingTaxonomy" 
                        :can-cancel="false"/>
            </b-tabs>
        </div>
    </div>
</template>

<script>
    import { wpAjax, formHooks } from "../../js/mixins";
    import { mapActions, mapGetters } from 'vuex';
    import TermsList from '../lists/terms-list.vue';
    import CustomDialog from '../other/custom-dialog.vue';

    export default {
        name: 'TaxonomyEditionForm',
        components: {
            TermsList
        },
        mixins: [ wpAjax, formHooks ],
        data(){
            return {
                taxonomyId: String,
                tabIndex: 0,
                taxonomy: null,
                isLoadingTaxonomy: false,
                isUpdatingSlug: false,
                isEditingTerm: false,
                form: {
                    name: String,
                    status: String,
                    description: String,
                    slug: String,
                    allowInsert: String,
                    enabledPostTypes: Array
                },
                wpPostTypes: tainacan_plugin.wp_post_types,
                editFormErrors: {},
                formErrorMessage: '',
                entityName: 'taxonomy',
                updatedAt: undefined,
                shouldReloadTermsList: false
            }
        },
        beforeRouteLeave( to, from, next ) {
            let formNotSaved = false;

            if (this.taxonomy) {
                if (this.taxonomy.name != this.form.name)
                    formNotSaved = true;
                if (this.taxonomy.description != this.form.description)
                    formNotSaved = true;
                if (this.taxonomy.slug != this.form.slug)
                    formNotSaved = true;
                if (this.taxonomy.allow_insert != this.form.allowInsert)
                    formNotSaved = true;
                if (this.taxonomy.status != this.form.status)
                    formNotSaved = true;
                if (this.taxonomy.enabled_post_types != this.form.enabledPostTypes)
                    formNotSaved = true;
            }

            if (formNotSaved && this.taxonomy) {
                this.$buefy.modal.open({
                    parent: this,
                    component: CustomDialog,
                    props: {
                        icon: 'alert',
                        title: this.$i18n.get('label_warning'),
                        message: this.$i18n.get('info_warning_taxonomy_not_saved'),
                        onConfirm: () => {
                            next();
                        }
                    },
                    trapFocus: true,
                    customClass: 'tainacan-modal',
                    closeButtonAriaLabel: this.$i18n.get('close')
                });  
            } else if (this.isEditingTerm) {
                this.$buefy.modal.open({
                    parent: this,
                    component: CustomDialog,
                    props: {
                        icon: 'alert',
                        title: this.$i18n.get('label_warning'),
                        message: this.$i18n.get('info_warning_terms_not_saved'),
                        onConfirm: () => {
                            next();
                        }
                    },
                    trapFocus: true,
                    customClass: 'tainacan-modal',
                    closeButtonAriaLabel: this.$i18n.get('close')
                });  
            } else {
                next();
            }  
        },
        mounted(){
  
            if (this.$route.query.tab == 'terms')
                this.tabIndex = 1;

            if (this.$route.name == "TaxonomyCreationForm") {
                this.createNewTaxonomy();
            } else if (this.$route.name == "TaxonomyEditionForm") {

                this.isLoadingTaxonomy = true;

                // Obtains current taxonomy ID from URL
                this.pathArray = this.$route.fullPath.split("/").reverse();
                this.taxonomyId = this.pathArray[1];

                this.fetchTaxonomy({ taxonomyId: this.taxonomyId, isContextEdit: true })
                    .then(res => {
                        this.taxonomy = res.taxonomy;

                        // Fills hook forms with it's real values 
                        this.$nextTick()
                            .then(() => {
                                this.updateExtraFormData(this.taxonomy);
                            });

                        // Fill this.form data with current data.
                        this.form.name = this.taxonomy.name;
                        this.form.description = this.taxonomy.description;
                        this.form.slug = this.taxonomy.slug;
                        this.form.status = this.taxonomy.status;
                        this.form.allowInsert = this.taxonomy.allow_insert;
                        this.form.enabledPostTypes = this.taxonomy.enabled_post_types;

                        this.isLoadingTaxonomy = false;
                    })
                    .catch(() => this.isLoadingTaxonomy = false);
            }
        },
        methods: {
            ...mapActions('taxonomy', [
                'createTaxonomy',
                'updateTaxonomy',
                'fetchTaxonomy',
                'fetchOnlySlug'
            ]),
            ...mapGetters('taxonomy',[
                'getTaxonomy',
            ]),
            onChangeTab(tab) {
                this.tabIndex = tab;
                if (this.tabIndex == 1) {
                    this.$router.push({query: {tab: 'terms'}});
                } else {
                    this.$router.push({query: {}});
                }
            },
            onSubmit() {

                this.isLoadingTaxonomy = true;

                let data = {
                    taxonomyId: this.taxonomyId,
                    name: this.form.name,
                    description: this.form.description,
                    slug: this.form.slug ? this.form.slug : '',
                    status: this.form.status,
                    allow_insert: this.form.allowInsert,
                    enabled_post_types: this.form.enabledPostTypes,
                    context: 'edit'
                };
                this.fillExtraFormData(data);
                this.updateTaxonomy(data)
                    .then(updatedTaxonomy => {

                        this.taxonomy = updatedTaxonomy;
                        // Fills hook forms with it's real values 
                        this.updateExtraFormData(this.taxonomy);

                        // Fill this.form data with current data.
                        this.form.name = this.taxonomy.name;
                        this.form.slug = this.taxonomy.slug;
                        this.form.description = this.taxonomy.description;
                        this.form.status = this.taxonomy.status;
                        this.form.allowInsert = this.taxonomy.allow_insert;
                        this.form.enabledPostTypes = this.taxonomy.enabled_post_types;

                        this.isLoadingTaxonomy = false;
                        this.formErrorMessage = '';
                        this.editFormErrors = {};
                        // Updates saved at message
                        let now = new Date();
                        this.updatedAt = now.toLocaleString();

                        if (this.$route.name == 'TaxonomyCreationForm') {                    
                            this.$router.push(this.$routerHelper.getTaxonomyEditPath(this.taxonomyId, true));
                        }
                    })
                    .catch((errors) => {
                        for (let error of errors.errors) {
                            for (let attribute of Object.keys(error)) {
                                this.editFormErrors[attribute] = error[attribute];
                            }
                        }
                        this.formErrorMessage = errors.error_message;

                        this.isLoadingTaxonomy = false;
                    });
            },
            updateSlug: _.debounce(function(){
                if(!this.form.name || this.form.name.length <= 0){
                    return;
                }

                this.isUpdatingSlug = true;

                this.getSamplePermalink(this.taxonomyId, this.form.name, this.form.slug)
                    .then((res) => {
                        this.form.slug = res.data.slug;

                        this.isUpdatingSlug = false;
                        this.formErrorMessage = '';
                        this.editFormErrors = {};
                    })
                    .catch(errors => {
                        this.$console.error(errors);

                        this.isUpdatingSlug = false;
                    });

            }, 500),
            createNewTaxonomy() {
                // Puts loading on Draft Taxonomy creation
                this.isLoadingTaxonomy = true;

                // Creates draft Taxonomy
                let data = {
                    name: '',
                    description: '',
                    status: 'auto-draft',
                    slug: '',
                    allow_insert: '',
                };
                this.fillExtraFormData(data);
                this.createTaxonomy(data)
                    .then(res => {

                        this.taxonomyId = res.id;
                        this.taxonomy = res;

                        // Fill this.form data with current data.
                        this.form.name = this.taxonomy.name;
                        this.form.description = this.taxonomy.description;
                        this.form.slug = this.taxonomy.slug;
                        this.form.allowInsert = this.taxonomy.allow_insert;

                        // Pre-fill status with publish to incentivate it
                        this.form.status = 'publish';

                        this.isLoadingTaxonomy = false;
                        this.shouldReloadTermsList = false;

                    })
                    .catch((error) => {
                        this.$console.error(error)
                        this.isLoadingTaxonomy = false;
                    });
            },
            clearErrors(attribute) {
                this.editFormErrors[attribute] = undefined;
            },
            cancelBack(){
                this.$router.go(-1);
            },
            labelNewTerms(){
                return ( this.form.allowInsert === 'yes' ) ? this.$i18n.get('label_yes') : this.$i18n.get('label_no');
            },
            isEditingTermUpdate (value) {
                this.isEditingTerm = value;
            },
            goToCreateAnotherTaxonomy() {
                this.$router.push(this.$routerHelper.getNewTaxonomyPath());                            
                
                this.taxonomyId = undefined;
                this.taxonomy = null;
                this.isUpdatingSlug = false;
                this.isEditingTerm = false,
                this.form = {
                    name: String,
                    status: String,
                    description: String,
                    slug: String,
                    allowInsert: String,
                    enabledPostTypes: Array
                };
                this.editFormErrors = {};
                this.formErrorMessage = '';
                this.updatedAt = undefined;

                // Forces terms list to reload
                this.shouldReloadTermsList = true;

                this.createNewTaxonomy();
            }
        }
    }
</script>
<style lang="scss" scoped>

    .tab-content {
        overflow: visible !important;
    }
    .status-radios {
        display: flex;
    }
    .status-radios .control-lable {
        display: flex;
        align-items: center;
    }
    .tainacan-form>.columns {
        margin-bottom: var(--tainacan-container-padding);
    }
    .tainacan-form .column {
        padding: 1em var(--tainacan-one-column);
    }
    .tainacan-form .column:last-of-type {
        padding-left: 0;
    }
    .form-submit {
        align-items: center;
    }
    .updated-at {
        margin: 0 1em 0 auto;
        color: var(--tainacan-info-color);
        font-style: italic;
    }
</style>


<template>
<div>
    <div 
            v-if="(termsList.length > 0 || searchQuery != '')"
            class="terms-list-header">
        <button
                v-if="currentUserCanEditTaxonomy"
                class="button is-secondary"
                type="button"
                @click="addNewTerm(0)"
                :disabled="isEditingTerm && isLoadingTerms">
            {{ $i18n.get('label_new_term') }}
        </button>
        <b-field class="order-area">
            <label class="label">{{ $i18n.get('label_sort') }}</label>
            <b-dropdown
                    :mobile-modal="true"
                    :disabled="localTerms.length <= 0 || isLoadingTerms || isEditingTerm"
                    @input="onChangeOrder"
                    aria-role="list"
                    trap-focus>
                <button
                            :aria-label="$i18n.get('label_sorting_direction')"
                            class="button is-white"
                            slot="trigger">
                    <span 
                            style="margin-top: -2px;"
                            class="icon is-small gray-icon">
                        <i 
                                :class="order == 'desc' ? 'tainacan-icon-sortdescending' : 'tainacan-icon-sortascending'"
                                class="tainacan-icon tainacan-icon-1-25em"/>
                    </span>
                    <span class="icon">
                        <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-arrowdown" />
                    </span>
                </button>
                <b-dropdown-item
                        aria-controls="items-list-results"
                        role="button"
                        :class="{ 'is-active': order == 'desc' }"
                        :value="'desc'"
                        aria-role="listitem"
                        style="padding-bottom: 0.45em">
                    <span class="icon is-small gray-icon">
                        <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-sortdescending"/>
                    </span>
                    {{ $i18n.get('label_descending') }}
                </b-dropdown-item>
                <b-dropdown-item
                        aria-controls="items-list-results"
                        role="button"
                        :class="{ 'is-active': order == 'asc' }"
                        :value="'asc'"
                        aria-role="listitem"
                        style="padding-bottom: 0.45em">
                    <span class="icon is-small gray-icon">
                        <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-sortascending"/>
                    </span>
                    {{ $i18n.get('label_ascending') }}
                </b-dropdown-item>
            </b-dropdown>
        </b-field>
        <div class="search-area is-hidden-mobile">
            <b-input 
                    :placeholder="$i18n.get('instruction_search')"
                    size="is-small"
                    type="search"
                    :aria-label="$i18n.get('instruction_search') + ' ' + $i18n.get('terms')"
                    autocomplete="on"
                    v-model="searchQuery"
                    icon-right="magnify"
                    icon-right-clickable
                    @input="performTermSearch"
                    @icon-right-click="searchTerms(0)"
                    @keyup.enter.native="searchTerms(0)"
                    :disabled="isEditingTerm"/>
        </div>
    </div>
    <div class="columns">
        <b-loading 
                :is-full-page="false"
                :active.sync="isLoadingTerms" 
                :can-cancel="false"/>
        <div 
                style="font-size: 0.875em;"
                :class="{ 'is-12': !isEditingTerm, 'is-8-fullhd is-7-fullscreen is-6-desktop is-5-tablet': isEditingTerm }"
                class="column">
            <br>

            <!-- Basic list, without hierarchy, used during search -->
            <template v-if="isSearching">
                <div 
                        v-for="(term, index) in localTerms"
                        :key="term.id">
                    <basic-term-item
                            :term="term"
                            :index="index"
                            :taxonomy-id="taxonomyId"
                            :order="order"
                            :current-user-can-edit-taxonomy="currentUserCanEditTaxonomy"/>
                </div>
            </template>
            <a 
                    class="view-more-terms-level-0"
                    :class="{'is-disabled': isEditingTerm}"
                    @click="offset = offset + maxTerms; searchTerms(offset)"
                    v-if="(isSearching) && totalTerms > localTerms.length">
                {{ $i18n.get('label_view_more') + ' (' + Number(totalTerms - localTerms.length) + ' ' + $i18n.get('terms') + ')' }}
            </a>

            <!-- Recursive list for hierarchy -->
            <template v-if="!isSearching">
                <div    
                        v-for="(term, index) in localTerms"
                        :key="term.id"
                        class="parent-term">
                    <recursive-term-item 
                            :term="term"
                            :index="index"
                            :taxonomy-id="taxonomyId"
                            :order="order" 
                            :current-user-can-edit-taxonomy="currentUserCanEditTaxonomy"/>
                </div>
            </template>
            <a 
                    class="view-more-terms-level-0"
                    :class="{'is-disabled': isEditingTerm}"
                    @click="offset = offset + maxTerms; loadTerms(0)"
                    v-if="(!isSearching) && totalTerms > localTerms.length">
                {{ $i18n.get('label_view_more') + ' (' + Number(totalTerms - localTerms.length) + ' ' + $i18n.get('terms') + ')' }}
            </a>
        </div>
        <div 
                class="column is-4-fullhd is-5-fullscreen is-6-desktop is-7-tablet edit-forms-list"
                v-if="isEditingTerm">
            <term-edition-form 
                    :style="{ 'top': termEditionFormTop + 'px'}"
                    :taxonomy-id="taxonomyId"
                    @onEditionFinished="onTermEditionFinished($event)"
                    @onEditionCanceled="onTermEditionCanceled($event)"
                    @onErrorFound="formWithErrors = editTerm.id"
                    :form="editTerm"/>
        </div>
    </div>
    <!-- Empty state image -->
    <div v-if="termsList.length <= 0 && !isLoadingTerms && !isEditingTerm">
        <section class="section">
            <div class="content has-text-grey has-text-centered">
                <p>
                    <span class="icon is-medium">
                        <i class="tainacan-icon tainacan-icon-30px tainacan-icon-terms"/>
                    </span>
                </p>
                <p>{{ searchQuery != '' ? $i18n.get('info_no_terms_found') : $i18n.get('info_no_terms_created_on_taxonomy') }}</p>
                <button
                        v-if="searchQuery == '' && currentUserCanEditTaxonomy"
                        id="button-create-term"
                        class="button is-secondary"
                        @click="addNewTerm(0)">
                    {{ $i18n.get('label_new_term') }}
                </button>
                <button
                        v-if="searchQuery != ''"
                        id="button-clear-search"
                        class="button is-outlined"
                        @click="searchQuery = ''; searchTerms(0);">
                    {{ $i18n.get('clear_search') }}
                </button>
            </div>
        </section>
    </div>       
</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TermEditionForm from '../edition/term-edition-form.vue';
import RecursiveTermItem from './recursive-term-item.vue'
import BasicTermItem from './basic-term-item.vue'
import t from 't';

export default {
    name: 'TermsList',
    components: {
        RecursiveTermItem,
        BasicTermItem,
        TermEditionForm
    },
    props: {
        taxonomyId: String,
        currentUserCanEditTaxonomy: Boolean
    },
    data(){
        return {
            isLoadingTerms: false,
            isEditingTerm: false,
            formWithErrors: '',
            order: 'asc',
            termEditionFormTop: 0,
            searchQuery: '',
            localTerms: [],
            editTerm: null,
            maxTerms: 100,
            offset: 0,
            totalTerms: 0
        }
    },
    computed: {
        termsList() {
            return this.getTerms();
        },
        isSearching() {
            return this.searchQuery != undefined && this.searchQuery != '';
        }
    },
    watch: {
        termsList: {
            handler() { 
                this.localTerms = JSON.parse(JSON.stringify(this.termsList));
                for (let aTerm of this.localTerms) {
                    t.dfs(aTerm, [], (node) => { 
                        node.opened = false; 
                    });
                }
            },
            deep: true
        },
        taxonomyId() {
            this.loadTerms(0);
        },
        isEditingTerm(value) {
            this.$emit('isEditingTermUpdate', value);
        }
    },
    created() {
        if (this.taxonomyId != undefined && this.taxonomyId !== String) {
            this.loadTerms(0);
        }
        this.$root.$on('onChildTermDeleted', this.eventOnChildTermDeleted);
        this.$eventBusTermsList.$on('editTerm', this.eventOnEditTerm);
        this.$eventBusTermsList.$on('termEditionSaved', this.eventOnTermEditionSaved);
        this.$eventBusTermsList.$on('termEditionCanceled', this.eventOnTermEditionCanceled);
        this.$eventBusTermsList.$on('addNewChildTerm', this.addNewTerm);
        this.$eventBusTermsList.$on('deleteBasicTermItem', this.deleteBasicTerm);
    },
    beforeDestroy() {
        this.$root.$off('onChildTermDeleted', this.eventOnChildTermDeleted);
        this.$eventBusTermsList.$off('editTerm', this.eventOnEditTerm);
        this.$eventBusTermsList.$off('termEditionSaved', this.eventOnTermEditionSaved);
        this.$eventBusTermsList.$off('termEditionCanceled', this.eventOnTermEditionCanceled);
        this.$eventBusTermsList.$off('addNewChildTerm', this.addNewTerm);
        this.$eventBusTermsList.$off('deleteBasicTermItem', this.deleteBasicTerm);
    },
    methods: {
        ...mapActions('taxonomy', [
            'deleteTerm',
            'fetchChildTerms',
            'clearTerms',
            'fetchTerms',
            'updateTerm'
        ]),
        ...mapGetters('taxonomy',[
            'getTerms'
        ]),
        onChangeOrder(newOrder) {
            if (this.order != newOrder) {
                this.offset = 0;
                this.order = newOrder;
                this.clearTerms();
                this.searchTerms(0);
            }
        },
        addNewTerm(parent) {

            let newTerm = {
                taxonomyId: this.taxonomyId,
                name: '',
                description: '',
                parent: parent,
                id: 'new',
                saved: false,
                opened: true
            }
            if (parent == 0) {
                this.localTerms.unshift(newTerm);
            } else {
                for (let term of this.localTerms) {
                    let parentTerm = t.find(term, [], (node) => { return node.id == parent; });
                    if (parentTerm != undefined) {
                        if (parentTerm['children'] == undefined) {
                            this.$set(parentTerm, 'children', []);
                            parentTerm.total_children = 1;
                        }
                        parentTerm['children'].unshift(newTerm); 
                    }
                }
            }
            this.$eventBusTermsList.onEditTerm(newTerm);
        },
        onTermEditionFinished($event) {
            this.$eventBusTermsList.onTermEditionSaved($event);

            for (let i = 0; i < this.termsList.length; i++) {
                if (this.termsList[i].id == $event.term.id) {
                    this.$set(this.termsList[i], 'description', $event.term.description);
                    this.$set(this.termsList[i], 'header_image', $event.term.header_image);
                    this.$set(this.termsList[i], 'header_image_id', $event.term.header_image_id);
                    this.$set(this.termsList[i], 'name', $event.term.name);
                    this.$set(this.termsList[i], 'parent', $event.term.parent);
                    this.$set(this.termsList[i], 'id', $event.term.id);
                } 
                else if (this.termsList[i].children != undefined) {
                    for (let j = 0; j < this.termsList[i].children.length; j++) {
                        if (this.termsList[i].children[j].id == $event.term.id) {
                            this.$set(this.termsList[i].children[j], 'description', $event.term.description);
                            this.$set(this.termsList[i].children[j], 'header_image', $event.term.header_image);
                            this.$set(this.termsList[i].children[j], 'header_image_id', $event.term.header_image_id);
                            this.$set(this.termsList[i].children[j], 'name', $event.term.name);
                            this.$set(this.termsList[i].children[j], 'parent', $event.term.parent);
                            this.$set(this.termsList[i].children[j], 'id', $event.term.id);
                        } 
                    }
                }
            } 
        },
        onTermEditionCanceled($event) {

            let term = $event;

            if (term.id == 'new') { 
                for (let i = 0; i < this.localTerms.length; i++) {
                    if (this.localTerms[i].id == term.id) {
                        this.localTerms.splice(i, 1);
                        break;
                    } else { 
                        let canceledParent = t.find(this.localTerms[i], [], (node) => { return node.id == term.parent }); 
                        if (canceledParent != undefined) {
                            for (let j = 0; j < canceledParent['children'].length; j++){
                                if (canceledParent['children'][j].id == term.id) {
                                    canceledParent['children'].splice(j, 1);
                                    break;
                                }
                            }
                            break;              
                        }          
                    }
                }
            } else {

                let originalTerm;
                for (let aTerm of this.termsList) {
                    if (aTerm.id == term.id)
                        originalTerm = aTerm;
                    else {
                        let childOriginalTerm = t.find(aTerm, [], (node) => { return node.id == term.id} );
                        if (childOriginalTerm != undefined)
                            originalTerm = childOriginalTerm;
                    }
                }

                if (originalTerm != undefined) {
                    for (let i = 0; i < this.localTerms.length; i++) {
                        if (this.localTerms[i].id == term.id) {
                            this.$set(this.localTerms, i, JSON.parse(JSON.stringify(originalTerm)));
                            break;
                        } else { 
                            let canceledParent = t.find(this.localTerms[i], [], (node) => { return node.id == originalTerm.parent }); 
                            if (canceledParent != undefined) {
                                for (let j = 0; j < canceledParent['children'].length; j++){
                                    if (canceledParent['children'][j].id == originalTerm.id) {
                                        this.$set(canceledParent['children'], j, JSON.parse(JSON.stringify(originalTerm)));
                                        break;
                                    }
                                }
                                break;              
                            }          
                        }
                    }
                }
            }
            this.$eventBusTermsList.onTermEditionCanceled(term);
        },
        loadTerms(parentId) {

            if (this.offset == 0)
                this.clearTerms();

            this.isLoadingTerms = true;
            let search = (this.searchQuery != undefined && this.searchQuery != '') ? { searchterm: this.searchQuery } : '';
            this.fetchChildTerms({ 
                    parentId: parentId, 
                    taxonomyId: this.taxonomyId, 
                    fetchOnly: '', 
                    search: search, 
                    all: '', 
                    order: this.order,
                    offset: this.offset,
                    number: this.maxTerms })
                .then((resp) => {
                    this.isLoadingTerms = false;   
                    this.totalTerms = resp.total;
                })
                .catch((error) => {
                    this.isLoadingTerms = false;   
                    this.$console.log(error);
                });
        },
        searchTerms(offset) {
            
            if (this.searchQuery == undefined || this.searchQuery == '') {
                this.offset = 0;
                this.loadTerms(0);
            } else {
                this.offset = offset;
                if (this.offset == 0)
                    this.clearTerms();

                this.isLoadingTerms = true;
                let search = { searchterm: this.searchQuery };
                this.fetchTerms({ 
                        taxonomyId: this.taxonomyId, 
                        fetchOnly: '', 
                        search: search, 
                        all: '', 
                        order: this.order,
                        offset: this.offset,
                        number: this.maxTerms })
                    .then((resp) => {
                        this.isLoadingTerms = false;   
                        this.totalTerms = resp.total;
                    })
                    .catch((error) => {
                        this.isLoadingTerms = false;   
                        this.$console.log(error);
                    });
            }
        },
        performTermSearch: _.debounce(function() {
            this.searchTerms(0);
        }, 600),
        // When searching, term deletion is perfomed by list as it has control of it's children
        deleteBasicTerm(term) {
            this.deleteTerm({taxonomyId: this.taxonomyId, termId: term.id })
                .then(() => {
                    this.searchTerms(this.offset);
                    this.totalTerms--;
                })
                .catch((error) => {
                    this.$console.log(error);
                });
        },
        eventOnChildTermDeleted(parentTermId) {
            if ((parentTermId == 0 || parentTermId == undefined ) && this.totalTerms > 0) {
                this.totalTerms--;
                this.loadTerms(parentTermId);
            }
        },
        eventOnEditTerm(term) {
            // Position edit form in a visible area
            let container = document.getElementsByClassName('repository-level-page')[0];
            if (container && container.scrollTop && container.scrollTop > 80)
                this.termEditionFormTop = container.scrollTop - 80;
            else
                this.termEditionFormTop = 0;

            this.editTerm = term;
            this.isEditingTerm = true;
        },
        eventOnTermEditionSaved({hasChangedParent}) {
            this.isEditingTerm = false;
            this.editTerm = null;

            if (hasChangedParent)
                this.loadTerms(0);
        },
        eventOnTermEditionCanceled() {
            this.isEditingTerm = false;
            this.editTerm = null;
        }
    }    
}
</script>

<style lang="scss">

    .columns {
        position: relative;
    }

    .terms-list-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .order-area {
            padding: 4px;
            margin-top: -4px;
            margin-left: auto;

            .label {
                font-size: 0.875em;
                font-weight: normal;
                margin-top: 3px;
                margin-bottom: 2px;
                cursor: default;
            }

            .button {
                display: flex;
                align-items: center;
            }
            
            .field {
                align-items: center;
            }

            .gray-icon, 
            .gray-icon .icon {
                color: var(--tainacan-info-color) !important;
                padding-right: 10px;
                height: 1.125em !important;
            }
            .gray-icon .icon i::before, 
            .gray-icon i::before {
                max-width: 1.25em;
            }
        }

        .search-area {
            display: inline-flex;
            align-items: center;

            .input {
                border: 1px solid var(--tainacan-gray2);
            }
            .control {
                width: 100%;
            }
            a {
                margin-left: 12px;
                white-space: nowrap; 
            }
        }
    }

    .parent-term>div>.term-item:first-child:hover {
        background-color: var(--tainacan-gray1) !important;
        .controls {
            visibility: visible;
            opacity: 1.0;
        }
        &::before {
            border-color: transparent transparent transparent var(--tainacan-gray2) !important;
        }
    }
    .parent-term>div>.opened-term.term-item:first-child {
        cursor: default;
        background-color: var(--tainacan-gray1) !important;

        &:before {
            content: '';
            display: block;
            position: absolute;
            left: 100%;
            right: -20px;
            width: 0;
            height: 0;
            border-style: solid;
            border-color: transparent transparent transparent var(--tainacan-gray1);
            border-left-width: 24px;
            border-top-width: 1.55em;
            border-bottom-width: 1.55em;
            top: 0;
        }
        &:hover:before {
            border-color: transparent transparent transparent var(--tainacan-gray1);
        }
    }

    .view-more-terms-level-0 {
        font-size: 0.875em;
        margin: 0;
        padding: 0.5em 0 0.5em 1.75em;
        display: flex;
        border-top: 1px solid var(--tainacan-gray1);
    }

    .edit-forms-list {
        padding-left: 0;
    }

</style>



<template>
    <div 
            v-if="taxonomies.length > 0 && !isLoading"
            class="table-container">

        <div 
                v-if="$userCaps.hasCapability('tnc_rep_delete_taxonomies')"
                class="selection-control">
            <div class="field select-all is-pulled-left">
                <span>
                    <b-checkbox 
                            @click.native="selectAllOnPage()" 
                            :value="allOnPageSelected">{{ $i18n.get('label_select_all_taxonomies_page') }}</b-checkbox>
                </span>
            </div>
            <div class="field is-pulled-right">
                <b-dropdown
                        position="is-bottom-left"
                        :disabled="!isSelecting"
                        id="bulk-actions-dropdown"
                        aria-role="list"
                        trap-focus>
                    <button
                            class="button is-white"
                            slot="trigger">
                        <span>{{ $i18n.get('label_bulk_actions') }}</span>
                        <span class="icon">
                            <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-arrowdown"/>
                        </span>
                    </button> 

                    <b-dropdown-item
                            id="item-delete-selected-items"
                            @click="deleteSelected()"
                            aria-role="listitem">
                        {{ $i18n.get('label_delete_selected_taxonomies') }}
                    </b-dropdown-item>
                    <b-dropdown-item 
                            disabled
                            aria-role="listitem">{{ $i18n.get('label_edit_selected_taxonomies') + ' (Not ready)' }}
                    </b-dropdown-item>
                </b-dropdown>
            </div>
        </div>

        <div class="table-wrapper">
            <table class="tainacan-table is-narrow">
                <thead>
                    <tr>
                        <!-- Checking list -->
                        <th v-if="$userCaps.hasCapability('tnc_rep_delete_taxonomies')">
                            &nbsp;
                            <!-- nothing to show on header -->
                        </th>
                        <!-- Status icon -->
                        <th v-if="isOnAllTaxonomiesTab">
                            &nbsp;
                        </th>
                        <!-- Name -->
                        <th>
                            <div class="th-wrap">{{ $i18n.get('label_name') }}</div>
                        </th>
                        <!-- Description -->
                        <th>
                            <div class="th-wrap">{{ $i18n.get('label_description') }}</div>
                        </th>
                        <!-- Collections -->
                        <th>
                            <div class="th-wrap">{{ $i18n.get('label_collections_using') }}</div>
                        </th>
                        <!-- Actions -->
                        <th 
                                v-if="taxonomies.findIndex((taxonomy) => taxonomy.current_user_can_edit || taxonomy.current_user_can_delete) >= 0"
                                class="actions-header">
                            &nbsp;
                            <!-- nothing to show on header for actions cell-->
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr     
                            :class="{ 'selected-row': selected[index] }"
                            :key="index"
                            v-for="(taxonomy, index) of taxonomies">
                        <!-- Checking list -->
                        <td 
                                v-if="$userCaps.hasCapability('tnc_rep_delete_taxonomies')"
                                :class="{ 'is-selecting': isSelecting }"
                                class="checkbox-cell">
                            <b-checkbox 
                                    v-model="selected[index]"/> 
                        </td>
                        <!-- Status icon -->
                        <td 
                                v-if="isOnAllTaxonomiesTab"
                                class="status-cell">
                            <span 
                                    v-if="$statusHelper.hasIcon(taxonomy.status)"
                                    class="icon has-text-gray"
                                    v-tooltip="{
                                        content: $i18n.get('status_' + taxonomy.status),
                                        autoHide: true,
                                        classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                        placement: 'auto-start'
                                    }">
                                <i 
                                        class="tainacan-icon tainacan-icon-1em"
                                        :class="$statusHelper.getIcon(taxonomy.status)"
                                        />
                            </span>
                        </td>
                        <!-- Name -->
                        <td 
                                class="column-default-width column-main-content"
                                @click="onClickTaxonomy($event, taxonomy.id, index)"
                                :label="$i18n.get('label_name')" 
                                :aria-label="$i18n.get('label_name') + ': ' + taxonomy.name">
                            <p
                                    v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: taxonomy.name,
                                        autoHide: false,
                                        placement: 'auto-start'
                                    }">
                                {{ taxonomy.name }}</p>
                        </td>
                        <!-- Description -->
                        <td
                                class="column-large-width" 
                                @click="onClickTaxonomy($event, taxonomy.id, index)"
                                :label="$i18n.get('label_description')" 
                                :aria-label="$i18n.get('label_description') + ': ' + taxonomy.description != undefined && taxonomy.description != '' ? taxonomy.description : `<span class='has-text-gray is-italic'>` + $i18n.get('label_description_not_provided') + `</span>`">
                            <p
                                    v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: taxonomy.description != undefined && taxonomy.description != '' ? taxonomy.description : `<span class='has-text-gray is-italic'>` + $i18n.get('label_description_not_provided') + `</span>`,
                                        autoHide: false,
                                        placement: 'auto-start'
                                    }"
                                    v-html="(taxonomy.description != undefined && taxonomy.description != '') ? taxonomy.description : `<span class='has-text-gray is-italic'>` + $i18n.get('label_description_not_provided') + `</span>`" />
                        </td>
                        <!-- Collections using -->
                        <td
                                class="column-large-width has-text-gray "
                                :class="{ 'is-italic' : !(taxonomy.collections != undefined && taxonomy.collections.length != undefined && taxonomy.collections.length > 0) }" 
                                :label="$i18n.get('label_collections_using')" 
                                :aria-label="(taxonomy.collections != undefined && taxonomy.collections.length != undefined && taxonomy.collections.length > 0) ? taxonomy.collections.toString() : $i18n.get('label_no_collections_using_taxonomy')">
                            <p
                                    @click.self="onClickTaxonomy($event, taxonomy.id, index)"
                                    v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: (taxonomy.collections != undefined && taxonomy.collections.length != undefined && taxonomy.collections.length > 0) ? renderListOfCollections(taxonomy.collections, taxonomy.metadata_by_collection) : $i18n.get('label_no_collections_using_taxonomy'),
                                        autoHide: false,
                                        placement: 'auto-start'
                                    }"
                                    v-html="(taxonomy.collections != undefined && taxonomy.collections.length != undefined && taxonomy.collections.length > 0) ? renderListOfCollections(taxonomy.collections, taxonomy.metadata_by_collection) : $i18n.get('label_no_collections_using_taxonomy')" />
                        </td>
                        <!-- Actions -->
                        <td 
                                v-if="taxonomy.current_user_can_edit || taxonomy.current_user_can_delete"
                                @click="onClickTaxonomy($event, taxonomy.id, index)"
                                class="column-default-width"
                                :class="{ 'actions-cell': taxonomy.current_user_can_edit || taxonomy.current_user_can_delete }" 
                                :label="$i18n.get('label_actions')">
                            <div class="actions-container">
                                <a 
                                        id="button-edit" 
                                        v-if="taxonomy.current_user_can_edit"
                                        :aria-label="$i18n.getFrom('taxonomies','edit_item')" 
                                        @click="onClickTaxonomy($event, taxonomy.id, index)">
                                    <span
                                            v-tooltip="{
                                                content: $i18n.get('edit'),
                                                autoHide: true,
                                                classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'], 
                                                placement: 'bottom'
                                            }"
                                            class="icon">
                                        <i class="has-text-secondary tainacan-icon tainacan-icon-1-25em tainacan-icon-edit"/>
                                    </span>
                                </a>
                                <a 
                                        id="button-delete" 
                                        v-if="taxonomy.current_user_can_delete"
                                        :aria-label="$i18n.get('label_button_delete')" 
                                        @click.prevent.stop="deleteOneTaxonomy(taxonomy.id)">
                                    <span
                                            v-tooltip="{
                                                content: $i18n.get('delete'),
                                                autoHide: true,
                                                classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                                placement: 'bottom'
                                            }"
                                            class="icon">
                                        <i 
                                                :class="{ 'tainacan-icon-delete': !isOnTrash, 'tainacan-icon-deleteforever': isOnTrash }"
                                                class="has-text-secondary tainacan-icon tainacan-icon-1-25em"/>
                                    </span>
                                </a>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import CustomDialog from '../other/custom-dialog.vue';

    export default {
        name: 'List',
        props: {
            isLoading: false,
            total: 0,
            page: 1,
            taxonomiesPerPage: 12,
            taxonomies: Array,
            status: ''
        },
        data() {
            return {
                selected: [],
                allOnPageSelected: false,
                isSelecting: false,
                adminUrl: tainacan_plugin.admin_url
            }
        },
        computed: {
            isOnTrash() {
                return this.status == 'trash';
            },
            isOnAllTaxonomiesTab() {
                return !this.status || (this.status.indexOf(',') > 0);
            }
        },
        watch: {
            taxonomies() {
                this.selected = [];
                for (let i = 0; i < this.taxonomies.length; i++)
                    this.selected.push(false);    
            },
            selected() {
                let allSelected = true;
                let isSelecting = false;
                for (let i = 0; i < this.selected.length; i++) {
                    if (this.selected[i] == false) {
                        allSelected = false;
                    } else {
                        isSelecting = true;
                    }
                }
                this.allOnPageSelected = allSelected;
                this.isSelecting = isSelecting;
            }
        },
        methods: {
            ...mapActions('taxonomy', [
                'deleteTaxonomy'
            ]),
            selectAllOnPage() {
                for (let i = 0; i < this.selected.length; i++) 
                    this.selected.splice(i, 1, !this.allOnPageSelected);
            },
            deleteOneTaxonomy(taxonomyId) {
                this.$buefy.modal.open({
                    parent: this,
                    component: CustomDialog,
                    props: {
                        icon: 'alert',
                        title: this.$i18n.get('label_warning'),
                        message: this.$i18n.get('info_warning_taxonomy_delete'),
                        onConfirm: () => {
                            this.deleteTaxonomy({ taxonomyId: taxonomyId, isPermanently: this.isOnTrash })
                                .then(() => {
                                    // this.$buefy.toast.open({
                                    //     duration: 3000,
                                    //     message: this.$i18n.get('info_taxonomy_deleted'),
                                    //     position: 'is-bottom',
                                    //     type: 'is-secondary',
                                    //     queue: true
                                    // });
                                    for (let i = 0; i < this.selected.length; i++) {
                                        if (this.selected[i].id === this.taxonomyId)
                                            this.selected.splice(i, 1);
                                    }
                                })
                                .catch(() => {
                                    // this.$buefy.toast.open({
                                    //     duration: 3000,
                                    //     message: this.$i18n.get('info_error_deleting_taxonomy'),
                                    //     position: 'is-bottom',
                                    //     type: 'is-danger',
                                    //     queue: true
                                    // });
                                });
                        }
                    },
                    trapFocus: true,
                    customClass: 'tainacan-modal',
                    closeButtonAriaLabel: this.$i18n.get('close')
                });
            },
            deleteSelected() {
                this.$buefy.modal.open({
                    parent: this,
                    component: CustomDialog,
                    props: {
                        icon: 'alert',
                        title: this.$i18n.get('label_warning'),
                        message: this.$i18n.get('info_warning_selected_taxonomies_delete'),
                        onConfirm: () => {

                            for (let i = 0; i < this.taxonomies.length;  i++) {
                                if (this.selected[i]) {
                                    this.deleteTaxonomy({ taxonomyId: this.taxonomies[i].id, isPermanently: this.isOnTrash })
                                        .then(() => {
                                            // this.load();
                                            // this.$buefy.toast.open({
                                            //     duration: 3000,
                                            //     message: this.$i18n.get('info_taxonomy_deleted'),
                                            //     position: 'is-bottom',
                                            //     type: 'is-secondary',
                                            //     queue: false
                                            // })
                                        }).catch(() => {
                                        // this.$buefy.toast.open({
                                        //     duration: 3000,
                                        //     message: this.$i18n.get('info_error_deleting_taxonomy'),
                                        //     position: 'is-bottom',
                                        //     type: 'is-danger',
                                        //     queue: false
                                        // });
                                    });
                                }
                            }
                            this.allOnPageSelected = false;
                        }
                    },
                    trapFocus: true,
                    customClass: 'tainacan-modal',
                    closeButtonAriaLabel: this.$i18n.get('close')
                });
            },
            onClickTaxonomy($event, taxonomyId, index) {
                if ($event.ctrlKey) {
                    this.$set(this.selected, index, !this.selected[index]); 
                } else {
                    this.$router.push(this.$routerHelper.getTaxonomyEditPath(taxonomyId));
                }
            },
            renderListOfCollections(collections, metadata) {
                let htmlList = '';

                for (let i = 0; i < collections.length; i++) {
                    htmlList += `<a target="_blank" href=${ this.adminUrl + 'admin.php?page=tainacan_admin#' + this.$routerHelper.getCollectionPath(collections[i].id)}>${collections[i].name} (${metadata[collections[i].id].name})</a>`;
                    if (collections.length > 2 && i < collections.length - 1) {
                        if (i < collections.length - 2)
                            htmlList += ', '
                        else
                            htmlList += ' ' + this.$i18n.get('label_and') + ' ';
                    } else if (collections.length == 2 && i == 0) {
                        htmlList += ' ' + this.$i18n.get('label_and') + ' ';
                    }
                }

                return htmlList;
            } 
        }
    }
</script>

<style lang="scss" scoped>

    .selection-control {
        
        padding: 6px 0px 0px 12px;
        background: var(--tainacan-white);
        height: 40px;

        .select-all {
            color: var(--tainacan-info-color);
            font-size: 0.875em;
            &:hover {
                color: var(--tainacan-info-color);
            }
        }
    }

</style>



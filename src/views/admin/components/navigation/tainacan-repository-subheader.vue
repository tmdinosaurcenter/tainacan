<template>
    <div
            id="tainacan-repository-subheader" 
            class="level secondary-page"
            :class="{'is-menu-compressed': isMenuCompressed, 'is-repository-level' : isRepositoryLevel}">

        <div 
                v-if="$adminOptions.hideCollectionSubheader"
                class="back-button is-hidden-mobile">
            <button     
                    @click="$router.go(-1)"
                    class="button is-turquoise4">
                <span class="icon">
                    <i class="tainacan-icon tainacan-icon-previous"/>
                </span>
            </button>
        </div>

        <h1 
                v-if="isRepositoryLevel"
                :style="$adminOptions.hideCollectionSubheader ? 'margin-right: auto;' : ''">
            {{ repositoryName }}
        </h1>
        <h1 
                v-else
                :style="$adminOptions.hideCollectionSubheader ? 'margin-right: auto;' : ''">
            {{ $i18n.get('collection') + '' }} 
            <span class="has-text-weight-bold">
                {{ collection && collection.name ? collection.name : '' }}
                <span 
                        v-if="collection && collection.status && $statusHelper.hasIcon(collection.status)"
                        class="icon has-text-white"
                        v-tooltip="{
                            content: $i18n.get('status_' + collection.status),
                            autoHide: true,
                            classes: ['tainacan-tooltip', 'tooltip'],
                            placement: 'auto-start'
                        }">
                    <i 
                            class="tainacan-icon tainacan-icon-1em"
                            :class="$statusHelper.getIcon(collection.status)"
                            />
                </span>
            </span>
        </h1>

        <ul class="repository-subheader-icons">
            <li
                    v-tooltip="{
                            delay: {
                                show: 500,
                                hide: 300,
                            },
                            content: $i18n.get('exporters'),
                            autoHide: false,
                            placement: 'bottom-start',
                            classes: ['tainacan-tooltip', 'header-tooltips', 'tooltip']
                        }">
                <a
                        @click="openAvailableExportersModal"
                        class="button"
                        id="exporter-collection-button"
                        v-if="!isRepositoryLevel && !$adminOptions.hideRepositorySubheaderExportButton">
                    <span class="icon">
                        <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-export"/>
                    </span>
                </a>
            </li>
            <li     
                    v-tooltip="{
                            delay: {
                                show: 500,
                                hide: 300,
                            },
                            content: $i18n.get('label_view_collection_on_website'),
                            autoHide: false,
                            placement: 'bottom-end',
                            classes: ['tainacan-tooltip', 'header-tooltips', 'tooltip']
                        }">
                <a
                        :href="collection && collection.url ? collection.url : ''"
                        target="_blank"
                        v-if="!isRepositoryLevel && collection && collection.url && !$adminOptions.hideRepositorySubheaderViewCollectionButton"
                        class="button"
                        id="view-collection-button">
                <span class="icon">
                    <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-see"/>
                </span>
                    <!-- {{ $i18n.get('label_view_collection_on_website') }} -->
                </a>
            </li>
            <li     
                    v-tooltip="{
                            delay: {
                                show: 500,
                                hide: 300,
                            },
                            content: $i18n.get('label_view_repository'),
                            autoHide: false,
                            placement: 'bottom-end',
                            classes: [ 'tainacan-tooltip', 'tooltip', isRepositoryLevel ? 'repository-header-tooltips' : 'header-tooltips']
                        }">
                <a
                        :href="repositoryURL"
                        target="_blank"
                        v-if="isRepositoryLevel && !$adminOptions.hideRepositorySubheaderViewCollectionsButton"
                        class="button"
                        id="view-repository-button">
                <span class="icon">
                    <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-see"/>
                </span>
                    <!-- {{ $i18n.get('label_view_collection_on_website') }} -->
                </a>
            </li>
        </ul>


    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AvailableExportersModal from '../modals/available-exporters-modal.vue';

export default {
    name: 'TainacanRepositorySubheader',
    props: {
        isMenuCompressed: false,
        isRepositoryLevel: true
    },
    data() {
        return {
            repositoryName: tainacan_plugin.repository_name,
            repositoryURL: tainacan_plugin.theme_collection_list_url,
            collectionId: ''
        }
    },
    computed: {
        collection() {
            return this.getCollection();
        }
    },
    methods: {
        ...mapGetters('collection', [
            'getCollection'
        ]),
        openAvailableExportersModal(){

            this.$buefy.modal.open({
                parent: this,
                component: AvailableExportersModal,
                hasModalCard: true,
                props: {
                    sourceCollection: this.collection.id,
                    hideWhenManualCollection: true
                },
                trapFocus: true,
                customClass: 'tainacan-modal',
                closeButtonAriaLabel: this.$i18n.get('close')
            });
        }
    }
}
</script>

<style lang="scss">

    @import "../../scss/_variables.scss";
    
    .header-tooltips .tooltip-inner {
        color: var(--tainacan-white);
        text-shadow: 1px 1px var(--tainacan-turquoise4);
        background-color: var(--tainacan-turquoise3);
        font-weight: 400;
        padding: 10px 14px;
    }
    .header-tooltips .tooltip-arrow {
        border-color: var(--tainacan-turquoise3);
    }

    .repository-header-tooltips .tooltip-inner {
        color: var(--tainacan-white);
        background-color: var(--tainacan-blue3);
        font-weight: 400;
        padding: 10px 14px;
    }
    .repository-header-tooltips .tooltip-arrow {
        border-color: var(--tainacan-blue3);
    }

    // Tainacan Header
    #tainacan-repository-subheader {
        background-color: var(--tainacan-turquoise6);
        height: $subheader-height;
        max-height: $subheader-height;
        width: 100%;
        // overflow-y: hidden;
        padding-top: 10px;
        padding-bottom: 10px;
        padding-right: 0;
        padding-left: calc((var(--tainacan-one-column) - 6.666666667px) + 10em);
        margin: 0px;
        display: flex;
        vertical-align: middle; 
        left: 0;
        right: 0;
        top: $header-height;
        position: absolute;
        z-index: 100;
        transition: padding-left 0.2s linear, background-color 0.2s linear;

        &.is-repository-level {
            background-color: var(--tainacan-blue5);
            padding-right: var(--tainacan-one-column);

            .repository-subheader-icons { 
                margin-right: -1em !important; 
            }
        }

        &.is-menu-compressed {     
            padding-left: calc((var(--tainacan-one-column)  - 2.083333333px)  + 50px);
        }

        h1 {
            font-size: 1.125em;
            color: var(--tainacan-white);
            line-height: 1.4em;
            max-width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;  
            transition: all 0.2s linear;
        }

        .back-button {
            padding: 0;
            margin: 0;
            width: var(--tainacan-one-column);
            min-width: var(--tainacan-one-column);
            color: var(--tainacan-white);
            display: flex;
            margin-left: calc(-1 * var(--tainacan-one-column));

            button, 
            button:hover, 
            button:focus, 
            button:active {
                width: 100%;
                color: var(--tainacan-white);
                background-color: transparent !important;
                border: none;
                height: $subheader-height !important;
                .icon {
                    margin-top: -2px;
                    font-size: 1.5em;
                }
            }
        }

        .repository-subheader-icons {
            display: flex;
            flex-wrap: nowrap;
            margin-right: calc(var(--tainacan-one-column) - 2.083333333px);

            #view-collection-button,
            #exporter-collection-button {
                font-size: 1rem !important;
                border: none;
                border-radius: 0px !important;
                height: $subheader-height !important;
                background-color: transparent;
                color: var(--tainacan-white);
                width: 48px;

                &:hover {
                    background-color: var(--tainacan-turquoise5) !important;
                }
            }
            #view-repository-button {
                font-size: 1rem !important;
                border: none;
                border-radius: 0px !important;
                height: $subheader-height !important;
                background-color: transparent;
                color: var(--tainacan-white);
                width: 48px;
                &:hover {
                    background-color: var(--tainacan-blue4) !important;
                }
            }
        }

        @media screen and (max-width: 769px) {
            top: 102px;
            padding-left: var(--tainacan-one-column) !important;
        }
    }
</style>



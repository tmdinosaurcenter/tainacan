<template>
    <div class="table-container">
        <div class="table-wrapper">

            <!-- Empty result placeholder -->
            <section
                    v-if="!isLoading && items.length <= 0"
                    class="section">
                <div class="content has-text-gray4 has-text-centered">
                    <p>
                        <span class="icon is-large">
                            <i class="tainacan-icon tainacan-icon-36px tainacan-icon-items" />
                        </span>
                    </p>
                    <p>{{ $i18n.get('info_no_item_found') }}</p>
                </div>
            </section>

            <!-- SKELETON LOADING -->
            <div
                    v-if="isLoading"
                    class="tainacan-cards-container">
                <div 
                        :key="item"
                        v-for="item in 12"
                        class="skeleton tainacan-card" />
            </div>

            <!-- CARDS VIEW MODE -->
            <div 
                    role="list"
                    v-if="!isLoading && items.length > 0"
                    class="tainacan-cards-container">
                <!-- <div> -->
                <a
                        role="listitem"
                        :key="index"
                        :data-tainacan-item-id="item.id"
                        v-for="(item, index) of items"
                        class="tainacan-card"
                        :href="getItemLink(item.url, index)">                                
                    <!-- Title -->
                    <div class="metadata-title">
                        <p 
                                v-tooltip="{
                                    delay: {
                                        show: 500,
                                        hide: 300,
                                    },
                                    content: item.title != undefined ? item.title : '',
                                    html: true,
                                    autoHide: false,
                                    placement: 'auto-start'
                                }"
                                v-html="item.title != undefined ? item.title : ''" />                
                        <span 
                                v-if="isSlideshowViewModeEnabled"
                                v-tooltip="{
                                    delay: {
                                        show: 500,
                                        hide: 100,
                                    },
                                    content: $i18n.get('label_see_on_fullscreen'),
                                    placement: 'auto-start'
                                }"          
                                @click.prevent="starSlideshowFromHere(index)"
                                class="icon slideshow-icon">
                            <i class="tainacan-icon tainacan-icon-viewgallery tainacan-icon-1-125em"/>
                        </span>
                    </div>
                    <!-- Remaining metadata -->
                    <div class="media">
                        <div 
                                v-if="!shouldHideItemsThumbnail"
                                class="card-thumbnail">
                        <blur-hash-image
                                v-if="item.thumbnail != undefined"
                                :width="$thumbHelper.getWidth(item['thumbnail'], 'tainacan-medium', 120)"
                                :height="$thumbHelper.getHeight(item['thumbnail'], 'tainacan-medium', 120)"
                                :hash="$thumbHelper.getBlurhashString(item['thumbnail'], 'tainacan-medium')"
                                :src="$thumbHelper.getSrc(item['thumbnail'], 'tainacan-medium', item.document_mimetype)"
                                :srcset="$thumbHelper.getSrcSet(item['thumbnail'], 'tainacan-medium', item.document_mimetype)"
                                :alt="item.thumbnail_alt ? item.thumbnail_alt : $i18n.get('label_thumbnail')"
                                :transition-duration="500"
                        />
                        </div>
                        
                        <div class="list-metadata media-body">
                           <!-- Description -->
                            <p 
                                    v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: item.description != undefined && item.description != '' ? item.description : `<span class='has-text-gray3 is-italic'>` + $i18n.get('label_description_not_provided') + `</span>`,
                                        html: true,
                                        autoHide: false,
                                        placement: 'auto-start'
                                    }"   
                                    class="metadata-description"
                                    v-html="item.description != undefined && item.description != '' ? getLimitedDescription(item.description) : `<span class='has-text-gray3 is-italic'>` + $i18n.get('label_description_not_provided') + `</span>`" />                                                        
                            <br>
                            <!-- Author and Creation Date-->
<!--                            <p 
                                    v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: column.metadatum == 'row_author' || column.metadatum == 'row_creation',
                                        html: false,
                                        autoHide: false,
                                        placement: 'auto-start'
                                    }"   
                                    v-for="(column, index) in displayedMetadata"
                                    :key="index"
                                    v-if="column.metadatum == 'row_author' || column.metadatum == 'row_creation'"
                                    class="metadata-author-creation">   
                                {{ column.metadatum == 'row_author' ? $i18n.get('info_created_by') + ' ' + item[column.slug] : $i18n.get('info_date') + ' ' + item[column.slug] }}
                            </p>   
-->                       
                        </div>
                    </div>
               
                </a>
                <!-- </div> -->
            </div>
        </div> 
    </div>
</template>

<script>
import { viewModesMixin } from '../js/view-modes-mixin.js';

export default {
    name: 'ViewModeCards',
    mixins: [
        viewModesMixin
    ],
    data() {
        return {
            shouldHideItemsThumbnail: this.$root.hideItemsThumbnail
        }
    },
    computed: {
        descriptionMaxCharacter() {
            return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 480 ? (this.shouldHideItemsThumbnail ? 185 : 155) : (this.shouldHideItemsThumbnail ? 480 : 330);
        }
    },
    methods: {
        getLimitedDescription(description) {
            return description.length > this.descriptionMaxCharacter ? description.substring(0, this.descriptionMaxCharacter - 3) + '...' : description;
        }
    }
}
</script>

<style lang="scss" scoped>

    // Grid mixin for display: grid compatibility
    @mixin display-grid {
        flex-wrap: wrap;
        display: flex;
        display: -ms-grid;
        display: grid;
    }

    @import "../../../../../admin/scss/_view-mode-cards.scss";
    
    .tainacan-cards-container .tainacan-card .metadata-title {
        padding: 0.6em 0.75em;
    }
</style>



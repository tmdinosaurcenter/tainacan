<template>
    <div 
            :style="style"
            :class="className + ' has-mounted'">
        <div v-if="!isLoading">
            <div  
                    :class="'tainacan-carousel ' + (arrowsPosition ? ' has-arrows-' + arrowsPosition : '') + (largeArrows ? ' has-large-arrows' : '') "
                    :style="{ '--spaceAroundCarousel': !isNaN(spaceAroundCarousel) ? (spaceAroundCarousel + 'px') : '50px' }"
                    v-if="collections.length > 0">
                <swiper 
                        role="list"
                        ref="myCollectionSwiper"
                        :options="swiperOptions">
                    <swiper-slide 
                            role="listitem"
                            :key="index"
                            v-for="(collection, index) of collections"
                            :class="'collection-list-item ' + (!showCollectionThumbnail ? 'collection-list-item-grid' : '')">      
                        <a 
                                v-if="showCollectionThumbnail"
                                :id="isNaN(collection.id) ? collection.id : 'collection-id-' + collection.id"
                                :href="collection.url">
                            <img
                                :src=" 
                                    collection.thumbnail && collection.thumbnail[maxCollectionsPerScreen > 4 ? (!cropImagesToSquare ? 'tainacan-medium-full' : 'tainacan-medium') : 'full'][0] && collection.thumbnail[maxCollectionsPerScreen > 4 ? (!cropImagesToSquare ? 'tainacan-medium-full' : 'tainacan-medium') : 'full'][0] 
                                        ?
                                    collection.thumbnail[maxCollectionsPerScreen > 4 ? (!cropImagesToSquare ? 'tainacan-medium-full' : 'tainacan-medium') : 'full'][0] 
                                        :
                                    (collection.thumbnail && collection.thumbnail['thumbnail'][0] && collection.thumbnail['thumbnail'][0]
                                        ?    
                                    collection.thumbnail['thumbnail'][0] 
                                        : 
                                    `${tainacanBaseUrl}/assets/images/placeholder_square.png`)
                                "
                                :data-src=" 
                                    collection.thumbnail && collection.thumbnail[maxCollectionsPerScreen > 4 ? (!cropImagesToSquare ? 'tainacan-medium-full' : 'tainacan-medium') : 'full'][0] && collection.thumbnail[maxCollectionsPerScreen > 4 ? (!cropImagesToSquare ? 'tainacan-medium-full' : 'tainacan-medium') : 'full'][0] 
                                        ?
                                    collection.thumbnail[maxCollectionsPerScreen > 4 ? (!cropImagesToSquare ? 'tainacan-medium-full' : 'tainacan-medium') : 'full'][0] 
                                        :
                                    (collection.thumbnail && collection.thumbnail['thumbnail'][0] && collection.thumbnail['thumbnail'][0]
                                        ?    
                                    collection.thumbnail['thumbnail'][0] 
                                        : 
                                    `${tainacanBaseUrl}/assets/images/placeholder_square.png`)
                                "
                                :alt="collection.name ? collection.name : $root.__('Thumbnail', 'tainacan')">
                            <span v-if="!hideName">{{ collection.name ? collection.name : '' }}</span>
                        </a>
                        <a 
                                v-else
                                :id="isNaN(collection.id) ? collection.id : 'collection-id-' + collection.id"
                                :href="collection.url">
                            <div class="collection-items-grid">
                                <blur-hash-image
                                        :height="collectionItems[collection.id][0] ? $thumbHelper.getHeight(collectionItems[collection.id][0]['thumbnail'], 'tainacan-medium') : 275"
                                        :width="collectionItems[collection.id][0] ? $thumbHelper.getWidth(collectionItems[collection.id][0]['thumbnail'], 'tainacan-medium') : 275"
                                        :src="collectionItems[collection.id][0] ? $thumbHelper.getSrc(collectionItems[collection.id][0]['thumbnail'], 'tainacan-medium', collectionItems[collection.id][0]['document_mimetype']) :`${tainacanBaseUrl}/assets/images/placeholder_square.png`"
                                        :srcset="collectionItems[collection.id][0] ? $thumbHelper.getSrcSet(collectionItems[collection.id][0]['thumbnail'], 'tainacan-medium', collectionItems[collection.id][0]['document_mimetype']) :`${tainacanBaseUrl}/assets/images/placeholder_square.png`"
                                        :hash="collectionItems[collection.id][0] ? $thumbHelper.getBlurhashString(collectionItems[collection.id][0]['thumbnail'], 'tainacan-medium') : 'V4P?:h00Rj~qM{of%MRjWBRjD%%MRjayofj[%M-;RjRj'"
                                        :alt="collectionItems[collection.id][0] && collectionItems[collection.id][0].thumbnail_alt ? collectionItems[collection.id][0].thumbnail_alt : (collectionItems[collection.id][0] && collectionItems[collection.id][0].name ? collectionItems[collection.id][0].name : $root.__( 'Thumbnail', 'tainacan' ))"
                                        :transition-duration="500" />
                                <blur-hash-image
                                        :height="collectionItems[collection.id][1] ? $thumbHelper.getHeight(collectionItems[collection.id][1]['thumbnail'], 'tainacan-medium') : 275"
                                        :width="collectionItems[collection.id][1] ? $thumbHelper.getWidth(collectionItems[collection.id][1]['thumbnail'], 'tainacan-medium') : 275"
                                        :src="collectionItems[collection.id][1] ? $thumbHelper.getSrc(collectionItems[collection.id][1]['thumbnail'], 'tainacan-medium', collectionItems[collection.id][1]['document_mimetype']) :`${tainacanBaseUrl}/assets/images/placeholder_square.png`"
                                        :srcset="collectionItems[collection.id][1] ? $thumbHelper.getSrcSet(collectionItems[collection.id][1]['thumbnail'], 'tainacan-medium', collectionItems[collection.id][1]['document_mimetype']) :`${tainacanBaseUrl}/assets/images/placeholder_square.png`"
                                        :hash="collectionItems[collection.id][1] ? $thumbHelper.getBlurhashString(collectionItems[collection.id][1]['thumbnail'], 'tainacan-medium') : 'V4P?:h00Rj~qM{of%MRjWBRjD%%MRjayofj[%M-;RjRj'"
                                        :alt="collectionItems[collection.id][1] && collectionItems[collection.id][1].thumbnail_alt ? collectionItems[collection.id][1].thumbnail_alt : (collectionItems[collection.id][1] && collectionItems[collection.id][1].name ? collectionItems[collection.id][1].name : $root.__( 'Thumbnail', 'tainacan' ))"
                                        :transition-duration="500" />
                                <blur-hash-image
                                        :height="collectionItems[collection.id][2] ? $thumbHelper.getHeight(collectionItems[collection.id][2]['thumbnail'], 'tainacan-medium') : 275"
                                        :width="collectionItems[collection.id][2] ? $thumbHelper.getWidth(collectionItems[collection.id][2]['thumbnail'], 'tainacan-medium') : 275"
                                        :src="collectionItems[collection.id][2] ? $thumbHelper.getSrc(collectionItems[collection.id][2]['thumbnail'], 'tainacan-medium', collectionItems[collection.id][2]['document_mimetype']) :`${tainacanBaseUrl}/assets/images/placeholder_square.png`"
                                        :srcset="collectionItems[collection.id][2] ? $thumbHelper.getSrcSet(collectionItems[collection.id][2]['thumbnail'], 'tainacan-medium', collectionItems[collection.id][2]['document_mimetype']) :`${tainacanBaseUrl}/assets/images/placeholder_square.png`"
                                        :hash="collectionItems[collection.id][2] ? $thumbHelper.getBlurhashString(collectionItems[collection.id][2]['thumbnail'], 'tainacan-medium') : 'V4P?:h00Rj~qM{of%MRjWBRjD%%MRjayofj[%M-;RjRj'"
                                        :alt="collectionItems[collection.id][2] && collectionItems[collection.id][2].thumbnail_alt ? collectionItems[collection.id][2].thumbnail_alt : (collectionItems[collection.id][2] && collectionItems[collection.id][2].name ? collectionItems[collection.id][2].name : $root.__( 'Thumbnail', 'tainacan' ))"
                                        :transition-duration="500" />
                            </div>
                            <span v-if="!hideName">{{ collection.name ? collection.name : '' }}</span>
                        </a>
                    </swiper-slide>
                </swiper>
                <button 
                        class="swiper-button-prev" 
                        :id="blockId + '-prev'" 
                        slot="button-prev"
                        :style="hideName ? 'top: calc(50% - 21px)' : 'top: calc(50% - ' + (largeArrows ? '60' : '42') + 'px)'">
                    <svg
                            :width="largeArrows ? 60 : 42"
                            :height="largeArrows ? 60 : 42"
                            viewBox="0 0 24 24">
                        <path
                                v-if="arrowsStyle === 'type-2'"
                                d="M 10.694196,6 12.103795,7.4095983 8.5000002,11.022321 H 19.305804 v 1.955358 H 8.5000002 L 12.103795,16.590402 10.694196,18 4.6941962,12 Z"/>
                        <path 
                                v-else
                                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        <path
                                d="M0 0h24v24H0z"
                                fill="none"/>
                    </svg>
                </button>
                <button 
                        class="swiper-button-next" 
                        :id="blockId + '-next'" 
                        slot="button-next"
                        :style="hideName ? 'top: calc(50% - 21px)' : 'top: calc(50% - ' + (largeArrows ? '60' : '42') + 'px)'">
                    <svg
                            :width="largeArrows ? 60 : 42"
                            :height="largeArrows ? 60 : 42"
                            viewBox="0 0 24 24">
                        <path
                                v-if="arrowsStyle === 'type-2'"
                                d="M 13.305804,6 11.896205,7.4095983 15.5,11.022321 H 4.6941964 v 1.955358 H 15.5 L 11.896205,16.590402 13.305804,18 l 6,-6 z"/>
                        <path 
                                v-else
                                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        <path
                                d="M0 0h24v24H0z"
                                fill="none"/>
                    </svg>
                </button>
            </div>
            <div
                    v-else
                    class="spinner-container">
                {{ $root.__('No collections found.', 'tainacan') }}
            </div>
            <!-- Swiper buttons are hidden as they actually swipe from slide to slide -->
        </div>
        <div v-else>
            <div 
                    :class="'tainacan-carousel ' + (arrowsPosition ? ' has-arrows-' + arrowsPosition : '') + (largeArrows ? ' has-large-arrows' : '') "
                    :style="{ '--spaceAroundCarousel': !isNaN(spaceAroundCarousel) ? (spaceAroundCarousel + 'px') : '50px' }">
                <swiper 
                        role="list"
                        ref="myCollectionSwiper"
                        :options="{ ...JSON.parse(JSON.stringify(swiperOptions)), autoplay: false, loop: false }">
                    <swiper-slide 
                            role="listitem"
                            :key="index"
                            v-for="(collection, index) of 18"
                            class="collection-list-item skeleton">
                        <a>
                            <img>
                            <span v-if="!hideName" />
                        </a>
                    </swiper-slide>
                </swiper>
                <button 
                        class="swiper-button-prev" 
                        :id="blockId + '-prev'" 
                        slot="button-prev"
                        :style="hideName ? 'top: calc(50% - 21px)' : 'top: calc(50% - ' + (largeArrows ? '60' : '42') + 'px)'">
                    <svg
                            :width="largeArrows ? 60 : 42"
                            :height="largeArrows ? 60 : 42"
                            viewBox="0 0 24 24">
                        <path
                                v-if="arrowsStyle === 'type-2'"
                                d="M 10.694196,6 12.103795,7.4095983 8.5000002,11.022321 H 19.305804 v 1.955358 H 8.5000002 L 12.103795,16.590402 10.694196,18 4.6941962,12 Z"/>
                        <path 
                                v-else
                                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        <path
                                d="M0 0h24v24H0z"
                                fill="none"/>
                    </svg>
                </button>
                <button 
                        class="swiper-button-next" 
                        :id="blockId + '-next'" 
                        slot="button-next"
                        :style="hideName ? 'top: calc(50% - 21px)' : 'top: calc(50% - ' + (largeArrows ? '60' : '42') + 'px)'">
                    <svg
                            :width="largeArrows ? 60 : 42"
                            :height="largeArrows ? 60 : 42"
                            viewBox="0 0 24 24">
                        <path
                                v-if="arrowsStyle === 'type-2'"
                                d="M 13.305804,6 11.896205,7.4095983 15.5,11.022321 H 4.6941964 v 1.955358 H 15.5 L 11.896205,16.590402 13.305804,18 l 6,-6 z"/>
                        <path
                                v-else
                                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        <path
                                d="M0 0h24v24H0z"
                                fill="none"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
 
<script>
import axios from 'axios';
import qs from 'qs';
import 'swiper/css/swiper.min.css';
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';

export default {
    name: "CarouselCollectionsListTheme",
    components: {
        Swiper,
        SwiperSlide
    },
    props: {
        blockId: String,
        selectedCollections: Array,
        maxCollectionsNumber: Number,
        arrowsPosition: String,
        autoPlay: false,
        autoPlaySpeed: Number,
        loopSlides: Boolean,
        maxCollectionsPerScreen: Number,
        spaceBetweenCollections: Number,
        spaceAroundCarousel: Number,
        hideName: Boolean,
        largeArrows: Boolean,
        arrowsStyle: String,
        cropImagesToSquare: Boolean,
        showCollectionThumbnail: Boolean,
        tainacanApiRoot: String,
        tainacanBaseUrl: String,
        className: String,
        style: String
    },
    data() {
        return {
            collections: [],
            collectionItems: {},
            collectionsRequestSource: undefined,
            isLoading: false,
            isLoadingCollection: false,
            localMaxCollectionsNumber: undefined,
            localOrder: undefined,
            tainacanAxios: undefined,
            paged: undefined,
            totalCollections: 0,
            swiperOptions: {
                watchOverflow: true,
                mousewheel: {
                    forceToAxis: true
                },
                observer: true,
                preventInteractionOnTransition: true,
                allowClick: true,
                allowTouchMove: true, 
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: this.spaceBetweenCollections,
                slideToClickedSlide: true,
                navigation: {
                    nextEl: '#' + this.blockId + '-next',
                    prevEl: '#' + this.blockId + '-prev',
                },
                breakpoints: {
                    498:  { slidesPerView: this.showCollectionThumbnail ? 1 : 1, spaceBetween: this.spaceBetweenCollections },
                    768:  { slidesPerView: this.showCollectionThumbnail ? 2 : 1, spaceBetween: this.spaceBetweenCollections },
                    1024: { slidesPerView: this.showCollectionThumbnail ? 3 : 2, spaceBetween: this.spaceBetweenCollections },
                    1366: { slidesPerView: this.showCollectionThumbnail ? 4 : 3, spaceBetween: this.spaceBetweenCollections },
                    1600: { slidesPerView: this.showCollectionThumbnail ? 5 : 4, spaceBetween: this.spaceBetweenCollections },
                },
                autoplay: this.autoPlay ? { delay: this.autoPlaySpeed*1000 } : false,
                loop: this.loopSlides
            },
            errorMessage: 'No collections found.'
        }
    },
    created() {
        this.tainacanAxios = axios.create({ baseURL: this.tainacanApiRoot });
        if (tainacan_blocks && tainacan_blocks.nonce)
            this.tainacanAxios.defaults.headers.common['X-WP-Nonce'] = tainacan_blocks.nonce;

        this.fetchCollections();

         if (!isNaN(this.maxCollectionsPerScreen)) {
            this.swiperOptions.breakpoints = {
                498:  { slidesPerView: this.maxCollectionsPerScreen - 4 > 0 ? this.maxCollectionsPerScreen - 4 : 1, spaceBetween: this.spaceBetweenCollections }, 
                768:  { slidesPerView: this.maxCollectionsPerScreen - 3 > 0 ? this.maxCollectionsPerScreen - 3 : 1, spaceBetween: this.spaceBetweenCollections },
                1024: { slidesPerView: this.maxCollectionsPerScreen - 2 > 0 ? this.maxCollectionsPerScreen - 2 : 1, spaceBetween: this.spaceBetweenCollections },
                1366: { slidesPerView: this.maxCollectionsPerScreen - 1 > 0 ? this.maxCollectionsPerScreen - 1 : 1, spaceBetween: this.spaceBetweenCollections },
                1600: { slidesPerView: this.maxCollectionsPerScreen > 0 ? this.maxCollectionsPerScreen : 1, spaceBetween: this.spaceBetweenCollections },
            }
            this.swiperOptions.slidesPerView = 1;
        }
    },
    methods: {
        fetchCollections() {
            this.isLoading = true;
            this.errorMessage = 'No collections found.';
            
            if (this.collectionsRequestSource != undefined && typeof this.collectionsRequestSource == 'function')
                this.collectionsRequestSource.cancel('Previous collections search canceled.');

            this.collectionsRequestSource = axios.CancelToken.source();

            let endpoint = '/collections?'+ qs.stringify({ postin: this.selectedCollections, perpage: this.selectedCollections.length, fetch_preview_image_items: this.showCollectionThumbnail ? 0 : 3 }) + '&fetch_only=name,url,thumbnail';

            this.tainacanAxios.get(endpoint, { cancelToken: this.collectionsRequestSource.token })
                .then(response => {

                    for (let collection of response.data) {
                        this.collections.push(collection);
                        if (!this.showCollectionThumbnail)
                            this.collectionItems[collection.id] = collection.preview_image_items ? collection.preview_image_items : [];
                    }

                    this.isLoading = false;
                    this.totalCollections = response.headers['x-wp-total'];

                }).catch((error) => { 
                    this.isLoading = false;
                    if (error.response && error.response.status && error.response.status == 401)
                        this.errorMessage = 'Not allowed to see these collections.'

                });
        },
    }
}
</script>

<style lang="scss">

    @import './style.scss';

</style>

<template>
<div class="child-metadata-inputs">
    <a
            v-if="!hideCollapses && childItemMetadataGroups.length > 0"
            class="collapse-all"
            @click="toggleCollapseAllChildren()">
        {{ collapseAllChildren ? $i18n.get('label_collapse_all') : $i18n.get('label_expand_all') }}
        <span class="icon">
            <i
                    :class="{ 'tainacan-icon-arrowdown' : collapseAllChildren, 'tainacan-icon-arrowright' : !collapseAllChildren }"
                    class="tainacan-icon tainacan-icon-1-25em"/>
        </span>
    </a>
    
    <div
            v-if="childItemMetadataGroups.length > 0"
            class="multiple-inputs">
        <template v-for="(childItemMetadata, groupIndex) of childItemMetadataGroups">
            <hr 
                    v-if="groupIndex > 0"
                    :key="groupIndex">
            
            <template v-for="(childItemMetadatum, childIndex) of childItemMetadata">
                <div 
                        class="field"
                        :key="groupIndex + '-' + childIndex"
                        v-if="isRemovingGroup">
                    <span class="collapse-handle">
                        <span class="icon">
                            <i class="has-text-secondary tainacan-icon tainacan-icon-1-25em tainacan-icon-arrowdown" />
                        </span>
                        <label class="label has-tooltip">
                            {{ childItemMetadatum.metadatum.name }}
                        </label>
                        <span
                            v-if="childItemMetadatum.metadatum.required == 'yes'"
                            class="required-metadatum-asterisk">
                            *
                        </span>
                        <span class="metadata-type">
                            ({{ childItemMetadatum.metadatum.metadata_type_object.name }})
                        </span>
                        <help-button 
                                :title="childItemMetadatum.metadatum.name"
                                :message="childItemMetadatum.metadatum.description"/>
                    </span> 
                    <div 
                            class="skeleton"
                            :style="{ 
                                minHeight: (childItemMetadatum.metadatum.metadata_type_object.component == 'tainacan-checkbox' || childItemMetadatum.metadatum.metadata_type_object.component == 'tainacan-taxonomy-checkbox') ? '150px' : '30px'
                            }" />
                </div>
                <tainacan-form-item
                        v-else
                        v-show="(metadataNameFilterString == '' || filterByMetadatumName(childItemMetadatum))"
                        :key="groupIndex + '-' + childIndex"
                        :item-metadatum="childItemMetadatum"
                        :hide-collapses="hideCollapses"
                        :is-collapsed="childItemMetadatum.collapse"
                        @changeCollapse="onChangeCollapse($event, groupIndex, childIndex)"
                        :class="{ 'is-last-input': childIndex == childItemMetadata.length - 1}"
                    />
            </template>
            <a 
                    v-if="isMultiple" 
                    @click="removeGroup(groupIndex)"
                    class="add-link"
                    :key="groupIndex">
                <span class="icon is-small">
                    <i class="tainacan-icon has-text-secondary tainacan-icon-remove"/>
                </span>
                &nbsp;{{ $i18n.get('label_remove_value') }}
            </a>
        </template>
        <transition name="filter-item">
            <span 
                    v-if="isCreatingGroup"
                    style="width: 100%;"
                    class="icon has-text-success loading-icon">
                <div class="control has-icons-right is-loading is-clearfix" />
            </span>
        </transition>
    </div>
    <p 
            v-else
            class="empty-label">
        {{ $i18n.get('info_no_value_compound_metadata') }}
    </p>
    <a
            v-if="isMultiple && (maxMultipleValues === undefined || maxMultipleValues === 0 || (maxMultipleValues !== 1 && maxMultipleValues > childItemMetadataGroups.length))"
            :disabled="itemMetadatum.item.id && (childItemMetadataGroups.length > 0 && !someValueOnLastInput)"
            @click="addGroup"
            class="is-inline-block add-link">
        <span class="icon is-small">
            <i class="tainacan-icon has-text-secondary tainacan-icon-add"/>
        </span>
        &nbsp;{{ $i18n.get('label_add_value') }}
    </a>

</div>
</template>

<script>
    import { eventBusItemMetadata } from '../../../js/event-bus-item-metadata';

    export default {
        props: {
            itemMetadatum: Object,
            value: [String, Number, Array],
            disabled: false,
            hideCollapses: false,
            metadataNameFilterString: ''
        },
        data() {
            return {
                isRemovingGroup: false,
                isCreatingGroup: false,
                children: [],
                collapseAllChildren: true,
                childItemMetadataGroups: []
            }
        },
        computed: {
            isMultiple() {
                return (this.itemMetadatum && this.itemMetadatum.metadatum && this.itemMetadatum.metadatum.multiple == 'yes') ? this.itemMetadatum.metadatum.multiple == 'yes' : false;
            },
            someValueOnLastInput() {
                return this.childItemMetadataGroups && this.childItemMetadataGroups[this.childItemMetadataGroups.length - 1] && this.childItemMetadataGroups[this.childItemMetadataGroups.length - 1].findIndex((childItemMetadatum) => childItemMetadatum.value) >= 0;
            },
            maxMultipleValues() {
                return (
                    this.itemMetadatum &&
                    this.itemMetadatum.metadatum &&
                    this.itemMetadatum.metadatum.cardinality &&
                    !isNaN(this.itemMetadatum.metadatum.cardinality) &&
                    this.itemMetadatum.metadatum.cardinality > 1
                ) ? this.itemMetadatum.metadatum.cardinality : undefined;
            },
        },
        watch: {
            /*  This will create the input object structure for 
             *   <tainacan-item-form :item-metadatum="childItemMetadatum" />
             *   looking at the values from the parent (this.itemMetadatum)   
             */  
            'itemMetadatum.value': {
                handler() {
                    this.createChildMetadataGroups();
                },
                immediate: true
            }
        },
        created() {
            eventBusItemMetadata.$on('hasRemovedItemMetadataGroup', () => this.$nextTick(() => this.isRemovingGroup = false));
        },
        beforeDestroy() {
            eventBusItemMetadata.$off('hasRemovedItemMetadataGroup', () => this.$nextTick(() => this.isRemovingGroup = false));
        },
        methods: {
            createChildMetadataGroups() {
                let currentChildItemMetadataGroups = [];

                const parentValues = this.isMultiple ? this.itemMetadatum.value : [ this.itemMetadatum.value ];
                
                if (this.itemMetadatum &&
                    this.itemMetadatum.metadatum &&
                    this.itemMetadatum.metadatum.metadata_type_options &&
                    this.itemMetadatum.metadatum.metadata_type_options.children_objects.length > 0 
                ) {
                    // Here we load the values from the object, but must also create some
                    if (parentValues && parentValues.length) {
                        
                        for (let groupIndex = 0; groupIndex < parentValues.length; groupIndex++) {
                            const childItemMetadata = parentValues[groupIndex];
                            let existingChildItemMetadata = [];

                            if (childItemMetadata && childItemMetadata.length) {
                        
                                for (let childMetadatum of this.itemMetadatum.metadatum.metadata_type_options.children_objects) {
                                
                                    const childItemMetadatumIndex = childItemMetadata.findIndex((aChildItemMetadatum) => childMetadatum.id == aChildItemMetadatum.metadatum_id);
                                    // Loads the existing values
                                    if (childItemMetadatumIndex >= 0) {
                                        const childItemMetadatum = childItemMetadata[childItemMetadatumIndex];
                                        existingChildItemMetadata.push({
                                            item: this.itemMetadatum.item,
                                            metadatum: childMetadatum,
                                            parent_meta_id: (this.itemMetadatum.item && this.itemMetadatum.item.id) ?childItemMetadatum.parent_meta_id : groupIndex,
                                            value: childItemMetadatum.value,
                                            value_as_html: childItemMetadatum.value_as_html,
                                            value_as_string: childItemMetadatum.value_as_string,
                                            collapse: this.childItemMetadataGroups[groupIndex] && this.childItemMetadataGroups[groupIndex][childItemMetadatumIndex] ? this.childItemMetadataGroups[groupIndex][childItemMetadatumIndex].collapse : (this.collapseAllChildren ? this.collapseAllChildren : false)
                                        })
                                    // Creates inputs for non existing ones
                                    } else {
                                        const existingParentMetaIdIndex = childItemMetadata.findIndex((aChildItemMetadatum) => aChildItemMetadatum.parent_meta_id > 0);
                                        existingChildItemMetadata.push({
                                            item: this.itemMetadatum.item,
                                            metadatum: childMetadatum,
                                            parent_meta_id: (this.itemMetadatum.item && this.itemMetadatum.item.id) ? (existingParentMetaIdIndex >= 0 ? childItemMetadata[existingParentMetaIdIndex].parent_meta_id : 0) : groupIndex,
                                            value: '',
                                            value_as_html: '',
                                            value_as_string: '',
                                            collapse: this.collapseAllChildren ? this.collapseAllChildren : false
                                        });
                                    }
                                }

                            } else {

                                // A new input for each type of child metadatum
                                for (let childMetadatum of this.itemMetadatum.metadatum.metadata_type_options.children_objects) {
                                    let childObject = {
                                        item: this.itemMetadatum.item,
                                        metadatum: childMetadatum,
                                        parent_meta_id: (this.itemMetadatum.item && this.itemMetadatum.item.id) ? '0' : currentChildItemMetadataGroups.length,
                                        value: '',
                                        value_as_html: '',
                                        value_as_string: '',
                                        collapse: this.collapseAllChildren ? this.collapseAllChildren : false
                                    };
                                    existingChildItemMetadata.push(childObject)
                                }
                            }
                            currentChildItemMetadataGroups.push(existingChildItemMetadata);
                        }
                    }
                }
                
                this.childItemMetadataGroups = currentChildItemMetadataGroups;
            },
            toggleCollapseAllChildren() {
                this.collapseAllChildren = !this.collapseAllChildren;

                for (let i = 0; i < this.childItemMetadataGroups.length; i++)
                    for (let j = 0; j < this.childItemMetadataGroups[i].length; j++)
                        this.childItemMetadataGroups[i][j].collapse = this.collapseAllChildren;
            },
            onChangeCollapse(event, groupIndex, index) {
                this.childItemMetadataGroups[groupIndex][index].collapse = event;
            },
            addGroup() {

                this.isCreatingGroup = true;

                if (this.itemMetadatum.item && this.itemMetadatum.item.id) {
                
                    // Sends value to api so we can obtain the parent_meta_id
                    eventBusItemMetadata.fetchCompoundFirstParentMetaId({
                        itemId: this.itemMetadatum.item.id,
                        metadatumId: this.itemMetadatum.metadatum.id
                    }).then((parentMetaId) => {

                        // Create a new placeholder parent_meta_id group here.
                        let newEmptyGroup = [];

                        if (this.itemMetadatum &&
                            this.itemMetadatum.metadatum &&
                            this.itemMetadatum.metadatum.metadata_type_options &&
                            this.itemMetadatum.metadatum.metadata_type_options.children_objects.length > 0 
                        ) {
                            for (let childMetadatum of this.itemMetadatum.metadatum.metadata_type_options.children_objects) {
                                let childObject = {
                                    item: this.itemMetadatum.item,
                                    metadatum: childMetadatum,
                                    parent_meta_id: parentMetaId,
                                    value: '',
                                    value_as_html: '',
                                    value_as_string: '',
                                    collapse: true
                                };
                                newEmptyGroup.push(childObject)
                            }
                        } 
                        
                        this.childItemMetadataGroups.push(newEmptyGroup);
                        
                        this.isCreatingGroup = false;
                    });

                // If no itemId is provided, we are probably on an item Submission flow
                } else {

                    // Create a new placeholder parent_meta_id group here.
                    let newEmptyGroup = [];

                    if (this.itemMetadatum &&
                        this.itemMetadatum.metadatum &&
                        this.itemMetadatum.metadatum.metadata_type_options &&
                        this.itemMetadatum.metadatum.metadata_type_options.children_objects.length > 0 
                    ) {
                        for (let childMetadatum of this.itemMetadatum.metadatum.metadata_type_options.children_objects) {
                            let childObject = {
                                item: this.itemMetadatum.item,
                                metadatum: childMetadatum,
                                parent_meta_id: this.childItemMetadataGroups.length,
                                value: '',
                                value_as_html: '',
                                value_as_string: '',
                                collapse: true
                            };
                            newEmptyGroup.push(childObject)
                        }
                    } 
                    this.childItemMetadataGroups.push(newEmptyGroup);
                    this.isCreatingGroup = false;
                }
            },
            removeGroup(groupIndex) {
                
                if (this.itemMetadatum.value && this.itemMetadatum.value[groupIndex] && this.itemMetadatum.value[groupIndex][0]) {
                    this.isRemovingGroup = true;
                    eventBusItemMetadata.$emit('remove_group', {
                        itemId: this.itemMetadatum.item.id,
                        metadatumId: this.itemMetadatum.metadatum.id,
                        parentMetaId: this.itemMetadatum.item.id ? this.itemMetadatum.value[groupIndex][0].parent_meta_id : groupIndex
                    });
                    if (!this.itemMetadatum.item.id)
                        this.childItemMetadataGroups.splice(groupIndex, 1);
                } else {
                    this.childItemMetadataGroups.splice(groupIndex, 1);
                }
            },
            filterByMetadatumName(itemMetadatum) {
                return this.metadataNameFilterString ? (itemMetadatum.metadatum.name.toString().toLowerCase().indexOf(this.metadataNameFilterString.toString().toLowerCase()) >= 0) : true;
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../../admin/scss/_variables.scss';

    .child-metadata-inputs {
        margin-left: -30px;
        padding-left: 38px;
        padding-top: 5px;
        border-left: 1px solid var(--tainacan-gray2);

        .skeleton {
            width: 100%;
            min-height: 30px;
        }
        .collapse-all {
            margin-left: -8px;
            font-size: 0.75em;
        }
        .field {
            padding-right: 0;
            margin-left: 3px;
            margin-bottom: 0em !important;
        }
        .is-last-input.field {
            border-bottom: none;
        }
        .add-link {
            font-size: 0.75em;
            margin-left: -1.25rem;
        }
        .multiple-inputs hr {
            background-color: var(--tainacan-gray2);
            margin: 6px 0px 12px -38px;
            width: calc(100% + 38px);
            height: 1px;
        }
        .empty-label {
            color: var(--tainacan-gray4);
            font-size: 0.875em;
            font-style: italic;
        }

        @media screen and (max-width: 769px) {
            margin-left: 0px;
            padding-left: 22px;

            .field {
                padding-left: 12px;
                
                /deep/ .label {
                    margin-left: 0;
                }
                /deep/ .collapse-handle {
                    margin-left: -28px;
                }
            }
        }
    }
</style>
<template>
  <div>

    <div
        v-if="processes.length > 0 && !isLoading"
        class="table-container">
      <!--
              <div class="selection-control">
                  <div class="field select-all is-pulled-left">
                      <span>
                          <b-checkbox
                                  @click.native="selectAllOnPage()"
                                  :value="allOnPageSelected">{{ $i18n.get('label_select_all_processes_page') }}</b-checkbox>
                      </span>
                  </div>
                  <div class="field is-pulled-right">
                      <b-dropdown
                              position="is-bottom-left"
                              :disabled="!isSelecting"
                              id="bulk-actions-dropdown"
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
                                  @click="deleteSelected()">
                              {{ $i18n.get('label_delete_selected_processes') }}
                          </b-dropdown-item>
                          <b-dropdown-item disabled>{{ $i18n.get('label_edit_selected_processes') + ' (Not ready)' }}
                          </b-dropdown-item>
                      </b-dropdown>
                  </div>
              </div>
      -->

      <div class="processes-list">
        <div
            :class="{
                        'opened-process': collapses[index],
                        'selected-row': selected[index],
                        'highlighted-process': highlightedProcess == bgProcess.ID
                    }"
            class="processes-list-item"
            :key="index"
            v-for="(bgProcess, index) of processes">
          <div
              @click="$set(collapses, index, !collapses[index])"
              class="process-handler">
            <!-- Collapse -->
            <span class="icon">
                        <i
                            :class="{ 'tainacan-icon-arrowdown' : collapses[index], 'tainacan-icon-arrowright' : !collapses[index] }"
                            class="tainacan-icon tainacan-icon-1-25em has-text-blue4" />
                    </span>
            <!-- Checking list -->
            <!-- <span
                    :class="{ 'is-selecting': isSelecting }"
                    class="checkbox-cell">
                <b-checkbox
                        v-model="selected[index]"/>
            </span> -->
            <!-- Name -->
            <span
                class="process-title"
                :label="$i18n.get('label_name')"
                :aria-label="$i18n.get('label_name') + ': ' + bgProcess.name">
                        <p
                            v-tooltip="{
                                    delay: {
                                        show: 500,
                                        hide: 300,
                                    },
                                    content: bgProcess.name ? bgProcess.name : $i18n.get('label_unnamed_process'),
                                    autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                    placement: 'auto-start'
                                }">
                            {{ bgProcess.name ? bgProcess.name : $i18n.get('label_unnamed_process') }}</p>
                    </span>
            <!-- Progress -->
            <span
                class="process-progress"
                :label="$i18n.get('label_progress')"
                :aria-label="$i18n.get('label_progress') + ': ' + bgProcess.progress_label ? bgProcess.progress_label + (bgProcess.progress_value ? ' (' + bgProcess.progress_value + '%)' : '') : $i18n.get('label_no_details_of_process')">
                        <p
                            v-tooltip="{
                                    delay: {
                                        show: 500,
                                        hide: 300,
                                    },
                                    content: bgProcess.progress_label ? bgProcess.progress_label : $i18n.get('label_no_details_of_process'),
                                    autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                    placement: 'auto-start'
                                }">
                            <span :class="{'occluding-content': bgProcess.progress_value }"><span class="has-text-weight-bold">{{ $i18n.get('label_progress') + " " }}</span>{{ bgProcess.progress_label ? bgProcess.progress_label : $i18n.get('label_no_details_of_process') }}</span>
                            <span>{{ bgProcess.progress_value == 0 ? `(0%)` : ' ('+ bgProcess.progress_value +'%)' }}</span>
                        </p>
                    </span>
            <!-- Queued on -->
            <span
                class="process-queued-on"
                :label="$i18n.get('label_queued_on')"
                :aria-label="$i18n.get('label_queued_on') + ' ' + getDate(bgProcess.queued_on)">
                        <p
                            v-tooltip="{
                                    delay: {
                                        show: 500,
                                        hide: 300,
                                    },
                                    content: getDate(bgProcess.queued_on),
                                    autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                    placement: 'auto-start'
                                }">
                            <span class="has-text-weight-bold">{{ $i18n.get('label_queued_on') + " " }}</span>{{ getDate(bgProcess.queued_on) }}</p>
                    </span>

            <!-- Status-->
            <span
                class="actions-cell"
                :label="$i18n.get('label_status')">
                        <div class="actions-container">
                            <span
                                v-if="bgProcess.status == 'running'"
                                class="icon has-text-success loading-icon">
                                <div class="control has-icons-right is-loading is-clearfix" />
                            </span>
                            <span
                                v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: $i18n.get('label_stop_process'),
                                        autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                        placement: 'auto-start'
                                    }"
                                v-if=" bgProcess.status === 'running' "
                                class="icon has-text-gray action-icon"
                                @click.prevent.stop="pauseProcess(index)">
                                <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-stop"/>
                            </span>
                            <span
                                v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: $i18n.get('label_process_completed'),
                                        autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                        placement: 'auto-start'
                                    }"
                                v-if=" ( bgProcess.status === 'finished' && !bgProcess.error_log ) || bgProcess.status === null"
                                class="icon has-text-success">
                                <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-approvedcircle"/>
                            </span>
                            <span
                                    v-tooltip="{
                                            delay: {
                                                show: 500,
                                                hide: 300,
                                            },
                                            content: $i18n.get('label_process_completed_with_errors'),
                                            autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                            placement: 'auto-start'
                                        }"
                                    v-if=" bgProcess.status === 'finished-errors' || ( bgProcess.done > 0 && bgProcess.error_log && bgProcess.status === 'finished' ) "
                                    class="icon has-text-success">
                                <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-alertcircle has-text-yellow2"/>
                            </span>
                            <span
                                    v-tooltip="{
                                            delay: {
                                                show: 500,
                                                hide: 300,
                                            },
                                            content: $i18n.get('label_process_cancelled'),
                                            autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                            placement: 'auto-start'
                                        }"
                                    v-if=" bgProcess.status === 'cancelled' "
                                    class="icon has-text-success">
                                <i class="tainacan-icon has-text-danger tainacan-icon-1-25em tainacan-icon-repprovedcircle"/>
                            </span>
                            <span
                                    v-tooltip="{
                                            delay: {
                                                show: 500,
                                                hide: 300,
                                            },
                                            content: $i18n.get('label_process_paused'),
                                            autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                            placement: 'auto-start'
                                        }"
                                    v-if=" bgProcess.status === 'paused' "
                                    class="icon has-text-gray">
                                <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-pause"/>
                            </span>
                            <span
                                    v-tooltip="{
                                            delay: {
                                                show: 500,
                                                hide: 300,
                                            },
                                            content: $i18n.get('label_process_waiting'),
                                            autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                            placement: 'auto-start'
                                        }"
                                    v-if=" bgProcess.status === 'waiting' "
                                    class="icon has-text-gray">
                                <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-waiting"/>
                            </span>
                            <span
                                    v-tooltip="{
                                            delay: {
                                                show: 500,
                                                hide: 300,
                                            },
                                            content: $i18n.get('label_delete_process'),
                                            autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                            placement: 'auto-start'
                                        }"
                                    v-if=" bgProcess.status === 'waiting' "
                                    class="icon has-text-gray"
                                    @click.prevent.stop="deleteOneProcess(index)">
                                <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-delete"/>
                            </span>
                            <span
                                    v-tooltip="{
                                            delay: {
                                                show: 500,
                                                hide: 300,
                                            },
                                            content: $i18n.get('label_process_failed'),
                                            autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                            placement: 'auto-start'
                                        }"
                                    v-if="bgProcess.status === 'errored'"
                                    class="icon has-text-danger">
                                <i class="tainacan-icon tainacan-icon-1-25em tainacan-icon-processerror" />
                            </span>
                        </div>
                    </span>
          </div>

          <!-- Collapse inner content -->
          <transition name="filter-item">
            <div
                v-if="collapses[index]"
                class="process-collapse">
              <!-- Output -->
              <span
                  class="process-output"
                  :label="$i18n.get('label_output')"
                  :aria-label="$i18n.get('label_output') + ': ' + (bgProcess.output ? bgProcess.output : $i18n.get('label_no_output_info'))">
                            <p v-html="bgProcess.output ? bgProcess.output : $i18n.get('label_no_output_info')"/>
                        </span>

              <!-- Logs -->
              <span
                  class="process-logs"
                  :label="$i18n.get('label_log_file')"
                  :aria-label="$i18n.get('label_log_gile')">
                            <p>
                                <a
                                    v-if="bgProcess.log"
                                    :href="bgProcess.log">
                                    <span class="icon is-small">
                                        <i class="tainacan-icon tainacan-icon-18px tainacan-icon-openurl"/>
                                    </span>
                                    {{ $i18n.get('label_log_file') }}
                                </a>
                                <br>
                                <a
                                    v-if="bgProcess.error_log"
                                    class="has-text-danger"
                                    :href="bgProcess.error_log">
                                    <span class="icon is-small">
                                        <i class="tainacan-icon tainacan-icon-18px tainacan-icon-openurl"/>
                                    </span>
                                    {{ $i18n.get('label_error_log_file') }}
                                </a>
                            </p>
                        </span>

              <!-- Last processed on -->
              <span
                  class="process-last-processed-on"
                  :label="$i18n.get('label_last_processed_on')"
                  :aria-label="$i18n.get('label_last_processed_on') + ' ' + getDate(bgProcess.processed_last)">
                            <p
                                v-tooltip="{
                                        delay: {
                                            show: 500,
                                            hide: 300,
                                        },
                                        content: getDate(bgProcess.processed_last),
                                        autoHide: false, classes: ['tainacan-tooltip', 'tooltip', 'repository-tooltip'],
                                        placement: 'auto-start'
                                    }">
                                <span class="has-text-weight-bold">{{ $i18n.get('label_last_processed_on') + " " }}</span>{{ getDate(bgProcess.processed_last) }}</p>
                        </span>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-else-if="isLoading">
      <center>
      <span>
        {{ $i18n.get('loading_processes') }}
      </span>
      </center>
    </div>
  </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import CustomDialog from '../other/custom-dialog.vue';
    import moment from 'moment'

    export default {
        name: 'List',
        props: {
            isLoading: false,
            total: 0,
            page: 1,
            processesPerPage: 12,
            processes: Array
        },
        data() {
            return {
                selected: [],
                collapses: [],
                allOnPageSelected: false,
                isSelecting: false,
                highlightedProcess: '',
                dateFormat: '',
            }
        },
        watch: {
            processes() {
                this.selected = [];
                for (let i = 0; i < this.processes.length; i++)
                    this.selected.push(false);   
                
                this.collapses = [];
                for (let i = 0; i < this.processes.length; i++)
                    this.collapses.push(false);   
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
        mounted() {
            let locale = navigator.language;

            moment.locale(locale);

            let localeData = moment.localeData();
            this.dateFormat = localeData.longDateFormat('LLL');

            if (this.$route.query.highlight) {
                this.highlightedProcess = this.$route.query.highlight;
            }

            if (jQuery && jQuery( document )) {
                jQuery( document ).on( 'heartbeat-tick', this.onHeartBitTickList);
            }
        },
        beforeDestroy() {
            if (jQuery && jQuery( document )) {
                jQuery( document ).off( 'heartbeat-tick', this.onHeartBitTickList)
            }
        },
        methods: {
            ...mapActions('bgprocess', [
                'deleteProcess',
                'updateProcess',
                'heartBitUpdateProcess',
                'fetchProcesses'
            ]),
            selectAllOnPage() {
                for (let i = 0; i < this.selected.length; i++) 
                    this.selected.splice(i, 1, !this.allOnPageSelected);
            },
            deleteOneProcess(index) {
                this.$buefy.modal.open({
                    parent: this,
                    component: CustomDialog,
                    props: {
                        icon: 'alert',
                        title: this.$i18n.get('label_warning'),
                        message: this.$i18n.get('info_warning_process_delete'),
                        onConfirm: () => {
                            const processId = this.processes[index].ID;
                            this.deleteProcess(processId);
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
                        message: this.$i18n.get('info_warning_selected_processes_delete'),
                        onConfirm: () => {

                            for (let i = 0; i < this.processes.length;  i++) {
                                if (this.selected[i]) {
                                    this.deleteTaxonomy({ processId: this.processes[i].id })
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
            getDate(rawDate) {
                let date = moment(rawDate).format(this.dateFormat);

                if (date != 'Invalid date') {
                    return date;
                } else {
                    return this.$i18n.get('info_unknown_date');
                }
            },
            pauseProcess(index) {

                this.$buefy.modal.open({
                    parent: this,
                    component: CustomDialog,
                    props: {
                        icon: 'alert',
                        title: this.$i18n.get('label_warning'),
                        message: this.$i18n.get('info_warning_process_cancelled'),
                        onConfirm: () => {
                            this.updateProcess({ id: this.processes[index].ID, status: 'closed' });
                        },
                    },
                    trapFocus: true,
                    customClass: 'tainacan-modal'
                });
            },
            onHeartBitTickList(event, data) {
                let updatedProcesses = data.bg_process_feedback;

                for (let updatedProcess of updatedProcesses) {
                    let updatedProcessIndex = this.processes.findIndex((aProcess) => aProcess.ID == updatedProcess.ID);
                    if (updatedProcessIndex >= 0) {
                        this.heartBitUpdateProcess(updatedProcess);
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../scss/_variables.scss';

    .sub-header {
      @include logs-container();
    }

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

    .loading-icon .control.is-loading::after {
        position: relative !important;
        right: 0;
        top: 0;
    }

    @keyframes highlight {
        from {
            background-color: var(--tainacan-blue1); 
        }
        to {
            background-color: var(--tainacan-white); 
        }
    }

    .highlighted-process {
        &>.process-handler {
            transition: background-color 0.8s; 
            animation-name: highlight;
            animation-duration: 1s;
            animation-iteration-count: 2; 
        }  
    }

    .processes-list-item {
        &.opened-process {
            background-color: var(--tainacan-gray0);
        }

        &>.process-handler {
            cursor: pointer;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            padding: 0.5em 0.75em;

            &:hover {
                background-color: var(--tainacan-gray1);
            }
            &>span:not(:first-of-type) {
                margin: 0 0.75em;
                color: var(--tainacan-info-color);
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;

                .has-text-weight-bold {
                    color: var(--tainacan-gray5) !important;
                }

                p {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
            }

            .process-title {
                p {
                    color: var(--tainacan-black) !important;
                    font-size: 0.875em !important;
                }
                width: 20.833333%;
                margin-right: var(--tainacan-one-column) !important;
            }
            .process-progress {
                width: auto;
                margin-right: var(--tainacan-one-column) !important;
                flex-grow: 2;

                .occluding-content {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .actions-cell {
                width: 52px;
            }
            .actions-container {
                align-items: center;
                display: flex;
                justify-content: flex-end;
                padding: 0 0.5em;

                .tainacan-icon-openurl {
                    font-size: 1.25em;
                }
            }

            .process-queued-on {
                width: 16.6666667%;
                margin-right: var(--tainacan-one-column) !important;
            }
        }
        &>.process-collapse {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.5em 1.25em 1em 1.25em;

            &>span {
                margin: 0 0.75em;
                color: var(--tainacan-info-color);

                .has-text-weight-bold {
                    color: var(--tainacan-gray5) !important;
                }
            }

            .process-output {
                margin-left: 1.75em !important;
                margin-right: var(--tainacan-one-column) !important;
                width: 20.83%;

                ul {
                    column-count: 2;
                    column-gap: 4em;
                    column-rule: none;
                    padding: 0 0.75em;
                }
            }

            .process-logs a{
                display: flex;
                align-items: center;

                .icon {
                    margin: 0 0.5em;
                } 
            }

            .process-last-processed-on {
                margin-left: auto !important;
                margin-right: calc(var(--tainacan-one-column) + 72px) !important;
            }
        }
    }

</style>



import tainacan from '../../js/axios.js';
import axios from 'axios';

const { __ } = wp.i18n;

const { TextControl, Button, Modal, RadioControl, SelectControl, Spinner } = wp.components;
const currentWPVersion = (typeof tainacan_blocks != 'undefined') ? tainacan_blocks.wp_version : tainacan_plugin.wp_version;

export default class CarouselItemsModal extends React.Component {
    constructor(props) {
        super(props);

        // Initialize state
        this.state = {
            collectionsPerPage: 24,
            collectionId: undefined,  
            collectionName: '', 
            isLoadingCollections: false, 
            modalCollections: [],
            totalModalCollections: 0, 
            collectionOrderBy: 'date-desc',
            collectionPage: 1,
            temporaryCollectionId: '',
            searchCollectionName: '',
            collections: [],
            collectionsRequestSource: undefined,
            searchURL: '',
            itemsPerPage: 12,
            loadStrategy: 'search'
        };
        
        // Bind events
        this.resetCollections = this.resetCollections.bind(this);
        this.selectCollection = this.selectCollection.bind(this);
        this.fetchCollections = this.fetchCollections.bind(this);
        this.fetchModalCollections = this.fetchModalCollections.bind(this);
        this.fetchCollection = this.fetchCollection.bind(this);
        this.applySelectedSearchURL = this.applySelectedSearchURL.bind(this);
        this.applySelectedItems = this.applySelectedItems.bind(this);
    }

    componentWillMount() {
        
        this.setState({ 
            collectionId: this.props.existingCollectionId
        });
         
        if (this.props.existingCollectionId) {
            this.fetchCollection(this.props.existingCollectionId);

            this.setState({ 
                searchURL: (this.props.existingSearchURL && this.props.existingSearchURL.indexOf('iframemode') < 0) ? this.props.existingSearchURL : tainacan_blocks.admin_url + 'admin.php?' + (this.props.loadStrategy == 'search' ? 'itemsSearchSelectionMode' : 'itemsMultipleSelectionMode') + '=true&page=tainacan_admin#/collections/'+ this.props.existingCollectionId + '/items/?status=publish'
            });
        } else {
            this.setState({ collectionPage: 1 });
            this.fetchModalCollections();
        }
    }

    // COLLECTIONS RELATED --------------------------------------------------
    fetchModalCollections() {

        let someModalCollections = this.state.modalCollections;
        if (this.state.collectionPage <= 1)
            someModalCollections = [];

        let endpoint = '/collections/?perpage=' + this.state.collectionsPerPage + '&paged=' + this.state.collectionPage;
        
        if (this.state.collectionOrderBy == 'date')
            endpoint += '&orderby=date&order=asc';
        else if (this.state.collectionOrderBy == 'date-desc')
            endpoint += '&orderby=date&order=desc';
        else if (this.state.collectionOrderBy == 'title')
            endpoint += '&orderby=title&order=asc';
        else if (this.state.collectionOrderBy == 'title-desc')
            endpoint += '&orderby=title&order=desc';

        this.setState({ 
            isLoadingCollections: true,
            collectionPage: this.state.collectionPage + 1, 
            modalCollections: someModalCollections
        });

        tainacan.get(endpoint)
            .then(response => {

                let otherModalCollections = this.state.modalCollections;
                for (let collection of response.data) {
                    otherModalCollections.push({ 
                        name: collection.name, 
                        id: collection.id
                    });
                }

                this.setState({ 
                    isLoadingCollections: false, 
                    modalCollections: otherModalCollections,
                    totalModalCollections: response.headers['x-wp-total']
                });
            
                return otherModalCollections;
            })
            .catch(error => {
                console.log('Error trying to fetch collections: ' + error);
            });
    }

    fetchCollection(collectionId) {
        tainacan.get('/collections/' + collectionId)
            .then((response) => {
                this.setState({ collectionName: response.data.name });
            }).catch(error => {
                console.log('Error trying to fetch collection: ' + error);
            });
    }

    selectCollection(selectedCollectionId) {
        this.setState({
            collectionId: selectedCollectionId,
            searchURL: tainacan_blocks.admin_url + 'admin.php?' + (this.props.loadStrategy == 'search' ? 'itemsSearchSelectionMode' : 'itemsMultipleSelectionMode') + '=true&page=tainacan_admin#/collections/' + selectedCollectionId + '/items/?status=publish'
        });
        this.props.onSelectCollection(selectedCollectionId);
        this.fetchCollection(selectedCollectionId);
    }

    fetchCollections(name) {

        if (this.state.collectionsRequestSource != undefined)
            this.state.collectionsRequestSource.cancel('Previous collections search canceled.');

        let aCollectionRequestSource = axios.CancelToken.source();

        this.setState({ 
            collectionsRequestSource: aCollectionRequestSource,
            isLoadingCollections: true, 
            collections: [],
            items: []
        });

        let endpoint = '/collections/?perpage=' + this.state.collectionsPerPage;
        if (name != undefined && name != '')
            endpoint += '&search=' + name;
        
        if (this.state.collectionOrderBy == 'date')
            endpoint += '&orderby=date&order=asc';
        else if (this.state.collectionOrderBy == 'date-desc')
            endpoint += '&orderby=date&order=desc';
        else if (this.state.collectionOrderBy == 'title')
            endpoint += '&orderby=title&order=asc';
        else if (this.state.collectionOrderBy == 'title-desc')
            endpoint += '&orderby=title&order=desc';

        tainacan.get(endpoint, { cancelToken: aCollectionRequestSource.token })
            .then(response => {
                let someCollections = response.data.map((collection) => ({ name: collection.name, id: collection.id + '' }));

                this.setState({ 
                    isLoadingCollections: false, 
                    collections: someCollections
                });
                
                return someCollections;
            })
            .catch(error => {
                console.log('Error trying to fetch collections: ' + error);
            });
    }

    applySelectedSearchURL() {    
        let iframe = document.getElementById("itemsFrame");
        if (iframe) {
            this.props.onApplySearchURL(iframe.contentWindow.location.href);
        }
    }

    applySelectedItems() {
        let iframe = document.getElementById("itemsFrame");
        if (iframe) {
            let params = new URLSearchParams(iframe.contentWindow.location.search);
            let selectedItems = params.getAll('selecteditems');
            params.delete('selecteditems')
            this.props.onApplySelectedItems(selectedItems);
        }
    }

    resetCollections() {

        this.setState({
            collectionId: null,
            collectionPage: 1,
            modalCollections: []
        });
        this.fetchModalCollections(); 
    }

    cancelSelection() {

        this.setState({
            modalCollections: []
        });

        this.props.onCancelSelection();
    }

    render() {
        return this.state.collectionId ? (
            // Items modal
        <Modal
                className={ 'wp-block-tainacan-modal dynamic-modal ' + (currentWPVersion < 5.9 ? 'wp-version-smaller-than-5-9' : '') }
                title={ this.props.loadStrategy == 'selection' ? __('Select items to add on block', 'tainacan') : __('Configure the items search to be used on block', 'tainacan')}
                onRequestClose={ () => this.cancelSelection() }
                shouldCloseOnClickOutside={ false }
                contentLabel={ this.props.loadStrategy == 'selection' ? __('Select items that will be added on block', 'tainacan') : __('Configure your items search that will load items on block', 'tainacan')}>
                <iframe
                        id="itemsFrame"
                        src={ this.state.searchURL } />
                <div className="modal-footer-area">
                    <Button 
                        isSecondary
                        onClick={ () => { this.resetCollections() }}>
                        {__('Switch collection', 'tainacan')}
                    </Button>
                    { this.props.loadStrategy == 'selection' ? 
                        <Button
                            style={{ marginLeft: 'auto' }} 
                            isPrimary
                            onClick={ () => this.applySelectedItems() }>
                            {__('Add the selected items', 'tainacan')}
                        </Button>
                        : null
                    }
                    { this.props.loadStrategy == 'search' ? 
                        <Button 
                            isPrimary
                            onClick={ () => this.applySelectedSearchURL() }>
                            {__('Use this search', 'tainacan')}
                        </Button>
                    : null
                    }
                </div>
        </Modal>
    ) : (
        // Collections modal
        <Modal
                className="wp-block-tainacan-modal"
                title={__('Select a collection to fetch items from', 'tainacan')}
                onRequestClose={ () => this.cancelSelection() }
                shouldCloseOnClickOutside={ false }
                contentLabel={__('Select items', 'tainacan')}>
                <div>
                    <div className="modal-search-area">
                        <TextControl 
                                label={__('Search for a collection', 'tainacan')}
                                placeholder={ __('Search by collection\'s name', 'tainacan') }
                                value={ this.state.searchCollectionName }
                                onChange={(value) => {
                                    this.setState({ 
                                        searchCollectionName: value
                                    });
                                    _.debounce(this.fetchCollections(value), 300);
                                }}/>
                        <SelectControl
                                label={__('Order by', 'tainacan')}
                                value={ this.state.collectionOrderBy }
                                options={ [
                                    { label: __('Latest', 'tainacan'), value: 'date-desc' },
                                    { label: __('Oldest', 'tainacan'), value: 'date' },
                                    { label: __('Name (A-Z)', 'tainacan'), value: 'title' },
                                    { label: __('Name (Z-A)', 'tainacan'), value: 'title-desc' }
                                ] }
                                onChange={ ( aCollectionOrderBy ) => { 
                                    this.state.collectionOrderBy = aCollectionOrderBy;
                                    this.state.collectionPage = 1;
                                    this.setState({ 
                                        collectionOrderBy: this.state.collectionOrderBy,
                                        collectionPage: this.state.collectionPage 
                                    });
                                    if (this.state.searchCollectionName && this.state.searchCollectionName != '') {
                                        this.fetchCollections(this.state.searchCollectionName);
                                    } else {
                                        this.fetchModalCollections();
                                    }
                                }}/>
                    </div>
                    {(
                    this.state.searchCollectionName != '' ? (
                        this.state.collections.length > 0 ?
                        (
                            <div>
                                <div className="modal-radio-list">
                                    {
                                    <RadioControl
                                        selected={ this.state.temporaryCollectionId }
                                        options={
                                            this.state.collections.map((collection) => {
                                                return { label: collection.name, value: '' + collection.id }
                                            })
                                        }
                                        onChange={ ( aCollectionId ) => { 
                                            this.setState({ temporaryCollectionId: aCollectionId });
                                        } } />
                                    }                                      
                                </div>
                            </div>
                        ) :
                        this.state.isLoadingCollections ? (
                            <Spinner />
                        ) :
                        <div className="modal-loadmore-section">
                            <p>{ __('Sorry, no collection found.', 'tainacan') }</p>
                        </div> 
                    ):
                    this.state.modalCollections.length > 0 ? 
                    (   
                        <div>
                            <div className="modal-radio-list">
                                {
                                <RadioControl
                                    selected={ this.state.temporaryCollectionId }
                                    options={
                                        this.state.modalCollections.map((collection) => {
                                            return { label: collection.name, value: '' + collection.id }
                                        })
                                    }
                                    onChange={ ( aCollectionId ) => { 
                                        this.setState({ temporaryCollectionId: aCollectionId });
                                    } } />
                                }                                     
                            </div>
                            <div className="modal-loadmore-section">
                                <p>{ __('Showing', 'tainacan') + " " + this.state.modalCollections.length + " " + __('of', 'tainacan') + " " + this.state.totalModalCollections + " " + __('collections', 'tainacan') + "."}</p>
                                {
                                    this.state.modalCollections.length < this.state.totalModalCollections ? (
                                    <Button 
                                        isSecondary
                                        isSmall
                                        onClick={ () => this.fetchModalCollections() }>
                                        {__('Load more', 'tainacan')}
                                    </Button>
                                    ) : null
                                }
                            </div>
                        </div>
                    ) : this.state.isLoadingCollections ? <Spinner/> :
                    <div className="modal-loadmore-section">
                        <p>{ __('Sorry, no collection found.', 'tainacan') }</p>
                    </div>
                )}
                <div className="modal-footer-area">
                    <Button 
                        isSecondary
                        onClick={ () => { this.cancelSelection() }}>
                        {__('Cancel', 'tainacan')}
                    </Button>
                    <Button
                        isPrimary
                        disabled={ this.state.temporaryCollectionId == undefined || this.state.temporaryCollectionId == null || this.state.temporaryCollectionId == ''}
                        onClick={ () => { this.selectCollection(this.state.temporaryCollectionId);  } }>
                        { this.props.loadStrategy == 'selection' ? __('Select items', 'tainacan') : __('Configure search', 'tainacan')}
                    </Button>
                </div>
            </div>
        </Modal> 
        );
    }
}
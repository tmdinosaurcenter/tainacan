<?php

namespace Tainacan\API\EndPoints;

use Tainacan\Repositories;
use Tainacan\Entities;
use \Tainacan\API\REST_Controller;

class REST_Facets_Controller extends REST_Controller {


	private $metadatum_repository;

	/**
	 * REST_Facets_Controller constructor.
	 */
	public function __construct() {
		$this->rest_base = 'facets';
		$this->total_pages = 0;
		$this->total_items = 0;
		parent::__construct();
        add_action('init', array(&$this, 'init_objects'), 11);
	}
	
	/**
	 * Initialize objects after post_type register
	 */
	public function init_objects() {
		$this->metadatum_repository = Repositories\Metadata::get_instance();
	}

	public function register_routes() {
		register_rest_route($this->namespace, '/collection/(?P<collection_id>[\d]+)/' . $this->rest_base . '/(?P<metadatum_id>[\d]+)', array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array($this, 'get_items'),
				'permission_callback' => array($this, 'get_items_permissions_check')
			)
		));
		
		register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<metadatum_id>[\d]+)', array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array($this, 'get_items'),
				'permission_callback' => array($this, 'get_items_permissions_check')
			)
		));
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_Error|\WP_REST_Response
	 */
	public function get_items( $request ) {
		
		$metadatum_id = $request['metadatum_id'];
		
		if( !empty($metadatum_id) ) {
			
			$metadatum = $this->metadatum_repository->fetch($metadatum_id);
			$metadatum_type = $metadatum->get_metadata_type();
			
			$offset = null;
			$number = null;
			$_search = null;
			$collection_id = ( isset($request['collection_id']) ) ? $request['collection_id'] : null;
			
			$query_args = defined('TAINACAN_FACETS_FILTER_ITEMS') && true === TAINACAN_FACETS_FILTER_ITEMS ? $request['current_query'] : [];
			$query_args = $this->prepare_filters($query_args);
			
			if ( isset($request['hideempty']) && $request['hideempty'] == 0 ) {
				$query_args = false;
			}
			
			if($request['offset'] >= 0 && $request['number'] >= 1){
				$offset = $request['offset'];
				$number = $request['number'];
			}
			
			if($request['search']) {
				$_search = $request['search'];
			}
			
			$include = [];
			if ( isset($request['getSelected']) && $request['getSelected'] == 1 ) {
				if ( $metadatum_type === 'Tainacan\Metadata_Types\Taxonomy' ) {
					$metadatum_options = $metadatum->get_metadata_type_options();
					$taxonomy_id = $metadatum_options['taxonomy_id'];
					$taxonomy_slug = Repositories\Taxonomies::get_instance()->get_db_identifier_by_id($taxonomy_id);
					if( isset($request['current_query']['taxquery']) ){
						foreach( $request['current_query']['taxquery'] as $taxquery ){
							if( $taxquery['taxonomy'] === $taxonomy_slug ){
								$include = $taxquery['terms']; 
							}
						}
					}
				} else {
					if( isset($request['current_query']['metaquery']) ){
						foreach( $request['current_query']['metaquery'] as $metaquery ){
							if( $metaquery['key'] == $metadatum_id ){
								$include = $metaquery['value'];
							}
						}
					}
				}
			}
			
			$parent_id = 0;
			if ( isset($request['parent']) ) {
				$parent_id = (int) $request['parent'];
			}
			
			
			$args = [
				'collection_id' => $collection_id,
				'search' => $_search,
				'offset' => $offset,
				'number' => $number,
				'items_filter' => $query_args,
				'include' => $include,
				'parent_id' => $parent_id,
				'count_items' => defined('TAINACAN_FACETS_COUNT_ITEMS') && true === TAINACAN_FACETS_COUNT_ITEMS ? true : false
			];
			
			$response = $this->metadatum_repository->fetch_all_metadatum_values( $metadatum_id, $args );
			
			$rest_response = new \WP_REST_Response($response['values'], 200);

			$rest_response->header('X-WP-Total', $response['total']);
			$rest_response->header('X-WP-TotalPages', $response['pages']);
			
			return $rest_response;
			
		}
		
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return bool|\WP_Error
	 */
	public function get_items_permissions_check( $request ) {
		return true;
	}

}

?>
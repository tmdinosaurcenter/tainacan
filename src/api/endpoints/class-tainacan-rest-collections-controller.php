<?php

use Tainacan\Repositories;
use Tainacan\Entities;

class TAINACAN_REST_Collections_Controller extends WP_REST_Controller {
    private $collections_repository;
    private $collection;

    public function __construct(){
        $this->namespace = 'tainacan/v2';
        $this->rest_base = 'collections';
        $this->collections_repository = new Repositories\Collections();
        $this->collection = new Entities\Collection();

        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes(){
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_items'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args'                => $this->get_collection_params(),
            ),
	        array(
		        'methods'             => WP_REST_Server::CREATABLE,
		        'callback'            => array($this, 'create_item'),
		        'permission_callback' => array($this, 'create_item_permissions_check'),
		        'args'                => $this->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
	        ),
            'schema' => array($this, 'get_public_item_schema'),
        ));
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_item'),
                'permission_callback' => array($this, 'get_item_permissions_check'),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array($this, 'update_item'),
                'permission_callback' => array($this, 'update_item_permissions_check'),
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array($this, 'delete_item'),
                'permission_callback' => array($this, 'delete_item_permissions_check'),
            ),
        ));
    }

    public function get_items($request){
        $collections = $this->collections_repository->fetch();

        $response = $this->prepare_item_for_response($collections, $request);

        return new WP_REST_Response($response, 200);
    }

    public function get_item($request){
        $collection_id = $request['id'];
        $collection = $this->collections_repository->fetch($collection_id);

        $response = $this->prepare_item_for_response($collection, $request);

        return new WP_REST_Response($response, 200);
    }

    public function prepare_item_for_response($item, $request){
        if(is_array($item)){

            $collections_as_json = [];
            foreach ($item as $wp_post){
                array_push($collections_as_json, $wp_post->__toJSON());
            }

            return json_encode($collections_as_json);
        }
        else {
            return $item->__toJSON();
        }
    }

    public function get_item_schema(){

    }

    public function get_items_permissions_check($request){
        return true;
    }

    public function  get_item_permissions_check($request){
        return true;
    }

    public function create_item( $request ) {
    	$request = json_decode($request->get_body(), true);

        if (!empty($request['id'])){
	        return new WP_Error( 'rest_post_exists', __( 'Cannot create existing post.' ), array( 'status' => 400 ) );
        }

        $prepared_post = $this->prepare_item_for_database($request);

        if($prepared_post->validate()) {
	        $collection = $this->collections_repository->insert( $prepared_post );

	        return new WP_REST_Response($collection->__toJSON(), 200);
        }

        return $prepared_post->get_errors();
    }

    public function create_item_permissions_check( $request ) {
	    //if(current_user_can('edit_posts')){
            return true;
        //}
    }

    public function prepare_item_for_database( $request ) {
        $this->collection->set_name($request['name']);
	    $this->collection->set_description($request['description']);

        return $this->collection;
    }

	public function delete_item( $request ) {
	    return parent::delete_item( $request ); // TODO: Change the autogenerated stub
    }

    public function delete_item_permissions_check( $request ) {
	    if(current_user_can('delete_posts')){
		    return true;
	    }
    }

    public function update_item( $request ) {
	    return parent::update_item( $request ); // TODO: Change the autogenerated stub
    }

    public function update_item_permissions_check( $request ) {
	    if(current_user_can('edit_posts')){
		    return true;
	    }
    }

    public function get_public_item_schema() {
	    return parent::get_public_item_schema(); // TODO: Change the autogenerated stub
    }

    public function get_collection_params() {
	    $query_params = $this->collections_repository->get_map();

        return apply_filters("rest_{$this->collection->get_post_type()}_collection_params", $query_params, $this->collection->get_post_type());
    }

    public function get_endpoint_args_for_item_schema( $method = WP_REST_Server::CREATABLE ) {
	    return parent::get_endpoint_args_for_item_schema( $method ); // TODO: Change the autogenerated stub
    }
}

?>

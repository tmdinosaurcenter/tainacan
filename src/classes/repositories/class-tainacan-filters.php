<?php

namespace Tainacan\Repositories;
use Tainacan\Entities;

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

class Filters extends Repository {
	protected $entities_type = '\Tainacan\Entities\Filter';
	
    public function get_map() {
        return [
            'id'                 => [
                'map'        => 'ID',
                //'validation' => ''
            ],
            'name'               => [
                'map'        => 'post_title',
                'validation' => ''
            ],
            'order'              => [
                'map'        => 'menu_order',
                'validation' => ''
            ],
            'description'        => [
                'map'        => 'post_content',
                'validation' => ''
            ],
            'filter_type_object' => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'filter_type'        => [
                'map' => 'meta',
                'validation' => ''
            ],
            'collection_id'      => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'color'              => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'metadata'           => [
                'map'        => 'meta',
                'validation' => ''
            ],
        ];
    }

    public function register_post_type(){
        $labels = array(
            'name'               => 'Filter',
            'singular_name'      => 'Filter',
            'add_new'            => 'Adicionar Novo',
            'add_new_item'       => 'Adicionar Filters',
            'edit_item'          => 'Editar',
            'new_item'           => 'Novo Filter',
            'view_item'          => 'Visualizar',
            'search_items'       => 'Pesquisar',
            'not_found'          => 'Nenhum ticket encontrado',
            'not_found_in_trash' => 'Nenhum Filter encontrado na lixeira',
            'parent_item_colon'  => 'Filter acima:',
            'menu_name'          => 'Filters'
        );
        $args = array(
            'labels'              => $labels,
            'hierarchical'        => true,
            //'supports'          => array('title'),
            //'taxonomies'        => array(self::TAXONOMY),
            'public'              => true,
            'show_ui'             => tnc_enable_dev_wp_interface(),
            'show_in_menu'        => tnc_enable_dev_wp_interface(),
            //'menu_position'     => 5,
            //'show_in_nav_menus' => false,
            'publicly_queryable'  => true,
            'exclude_from_search' => true,
            'has_archive'         => true,
            'query_var'           => true,
            'can_export'          => true,
            'rewrite'             => true,
            'capability_type'     => 'post',
        );
        register_post_type(Entities\Filter::get_post_type(), $args);
    }


    /**
     * @param Entities\Metadata $metadata
     * @return int
     *
    public function insert($metadata) {
        // First iterate through the native post properties
        $map = $this->get_map();
        foreach ($map as $prop => $mapped) {
            if ($mapped['map'] != 'meta' && $mapped['map'] != 'meta_multi') {
                $metadata->WP_Post->{$mapped['map']} = $metadata->get_mapped_property($prop);
            }
        }

        // save post and get its ID
        $metadata->WP_Post->post_type = Entities\Filter::get_post_type();
        $metadata->WP_Post->post_status = 'publish';
        $id = wp_insert_post($metadata->WP_Post);
        $metadata->WP_Post = get_post($id);

        // Now run through properties stored as postmeta
        foreach ($map as $prop => $mapped) {
            if ($mapped['map'] == 'meta') {
                update_post_meta($id, $prop, $metadata->get_mapped_property($prop));
            } elseif ($mapped['map'] == 'meta_multi') {
                $values = $metadata->get_mapped_property($prop);
                
                delete_post_meta($id, $prop);
                
                if (is_array($values)){
                    foreach ($values as $value){
                        add_post_meta($id, $prop, $value);
                    }
                }
            }
        }

        // return a brand new object
        return new Entities\Filter($metadata->WP_Post);
    }*/

    public function delete($object){

    }

    public function update($object){

    }

    /**
     * fetch filter based on ID or WP_Query args
     *
     * Filters are stored as posts. Check WP_Query docs
     * to learn all args accepted in the $args parameter
     *
     * @param array $args WP_Query args || int $args the filter id
     * @param string $output One of 2 pre-defined constants 'WP_Query' | 'OBJECT' . Defaults to WP_Query
     * @return \WP_Query|Array an instance of wp query OR array of entities;
     */
    public function fetch($args = [], $output = 'WP_Query'){
        if( is_numeric($args) ){
            return new Entities\Filter($args);
        } elseif (!empty($args)) {
            // TODO: get filters from parent collections
            $args = array_merge([
                'posts_per_page' => -1,
                'post_status'    => 'publish'
            ], $args);

            $args['post_type'] = Entities\Filter::get_post_type();

            $wp_query = new \WP_Query($args);
            return $this->fetch_output($wp_query, $output);
        }
    }

    /**
     * fetch all declared filter type classes
     *
     * @return Array of Entities\Filter_Types\Filter_Type objects
     */
    public function fetch_filter_types(){
        $filters = array();

        foreach (get_declared_classes() as $class) {
            if (is_subclass_of($class, '\Tainacan\Filter_Types\Filter_Type')){
                $filters[] = new $class();
            }
        }

        return $filters;
    }

    /**
     * fetch only supported filters for the type specified
     *
     * @param ( string || array )  $types Primitve types of metadata ( float, string, int)
     * @return array Filters supported by the primitive types passed in $types
     */
    public function fetch_supported_filter_types($types){
        $filter_types = $this->fetch_filter_types();
        $supported_filter_types = [];

        foreach ( $filter_types as $filter_type){
            $filter = new $filter_type();

            if( ( is_array( $types ) )){
                foreach ( $types as $single_type ) {
                    if( in_array( $single_type ,$filter->get_supported_types() )){
                          $supported_filter_types[] = $filter;
                    }
                }
            }else if( in_array( $types ,$filter->get_supported_types() )){
                $supported_filter_types[] = $filter;
            }
        }

        return $supported_filter_types;
    }
}
<?php

namespace Tainacan\Repositories;
use Tainacan\Entities;

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

/**
 * Class Metadatas
 */
class Metadatas extends Repository {
	protected $entities_type = '\Tainacan\Entities\Metadata';
	
    public function get_map() {
        return [
            'id'             => [
                'map'        => 'ID',
                //'validation' => ''
            ],
            'name'           => [
                'map'        => 'post_title',
                'validation' => ''
            ],
            'order'          => [
                'map'        => 'menu_order',
                'validation' => ''
            ],
            'parent'         => [
                'map'        => 'parent',
                'validation' => ''
            ],
            'description'    => [
                'map'        => 'post_content',
                'validation' => ''
            ],
            'field_type'     => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'required'       => [
                'map'        => 'meta',
                'validation' => '', // yes or no
                'default'    => 'no'
            ],
            'collection_key' => [
                'map'        => 'meta',
                'validation' => '', // yes or no. it cant be key if its multiple
                'default'    => 'no'
            ],
            'multiple'       => [
                'map'        => 'meta',
                'validation' => '', // yes or no. It cant be multiple if its collection_key
                'default'    => 'no'
            ],
            'cardinality'    => [
                'map'        => 'meta',
                'validation' => '',
                'default'    => 1
            ],
            'privacy'        => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'mask'           => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'default_value'  => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'field_type_object' => [
                'map'        => 'meta',
                'validation' => ''
            ],
            'collection_id'  => [
                'map'        => 'meta',
                'validation' => ''
            ],
        ];
    }

    public function register_post_type() {
        $labels = array(
            'name'               => 'Metadata',
            'singular_name'      => 'Metadata',
            'add_new'            => 'Adicionar Metadata',
            'add_new_item'       =>'Adicionar Metadata',
            'edit_item'          => 'Editar',
            'new_item'           => 'Novo Metadata',
            'view_item'          => 'Visualizar',
            'search_items'       => 'Pesquisar',
            'not_found'          => 'Nenhum ticket encontrado',
            'not_found_in_trash' => 'Nenhum Collections encontrado na lixeira',
            'parent_item_colon'  => 'Metadata acima:',
            'menu_name'          => 'Metadata'
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
        register_post_type(Entities\Metadata::get_post_type(), $args);
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
        $metadata->WP_Post->post_type = Entities\Metadata::POST_TYPE;
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
        return new Entities\Metadata($metadata->WP_Post);
    }*/

    public function fetch($object, $args = []){
        // TODO: get metadata from parent collections
        if(is_numeric($object)){
            return new Entities\Metadata($object);            
        } else {
            $collection_id = ( is_object( $object ) ) ? $object->get_id() : $object;

            $args = array_merge([
                'post_type'      => Entities\Metadata::get_post_type(),
                'posts_per_page' => -1,
                'post_status'    => 'publish',
                'meta_key'       => 'collection_id',
                'meta_value'     => $collection_id
            ], $args);

            $posts = get_posts($args);

            $return = [];

            foreach ($posts as $post) {
                $return[] = new Entities\Metadata($post);
            }

            return $return;
        }
    }

    public function update($object){

    }

    public function delete($object){

    }
}
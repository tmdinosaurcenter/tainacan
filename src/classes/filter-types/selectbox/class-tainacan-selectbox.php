<?php
namespace Tainacan\Filter_Types;

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

/**
 * Class TainacanFieldType
 */
class Selectbox extends Filter_Type {

    function __construct(){
        parent::set_supported_types(['string']);
        $this->component = 'tainacan-filter-selectbox';
    }

    /**
     * @param $filter
     * @return string
     */

    public function render( $filter ){
        return '<tainacan-filter-selectbox name="'.$filter->get_name().'"></tainacan-filter-selectbox>';
    }
}
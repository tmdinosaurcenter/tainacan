<?php

namespace Tainacan\Field_Types;

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

/**
 * Class TainacanFieldType
 */
class Selectbox extends Field_Type {

    function __construct(){
        // call field type constructor
        parent::__construct();
        parent::set_primitive_type('');
    }

    /**
     * @param $metadata
     * @return string
     */

    public function render( $metadata ){
        $options = ( isset( $this->options['options'] ) ) ? $this->options['options'] : '';
        return '<tainacan-selectbox options="'.$options.'" name="'.$metadata->get_name().'"></tainacan-selectbox>';
    }

    /**
     * generate the fields for this field type
     */
    public function form(){
        ?>
        <tr>
            <td>
                <label><?php echo __('Options','tainacan'); ?></label><br/>
                <small><?php echo __('Insert the options, separate by lines for the metadata value','tainacan'); ?></small>
            </td>
            <td>
                <textarea name="field_type_selectbox[options]"><?php echo ( isset( $this->options['options'] ) ) ? $this->options['options'] : ''; ?></textarea>
            </td>
        </tr>
        <?php
    }
}
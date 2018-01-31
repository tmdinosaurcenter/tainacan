<?php

use Tainacan\Capabilities;

const ENTITIES_DIR 	   = __DIR__ . '/entities/';
const FIELD_TYPES_DIR  = __DIR__ . '/field-types/';
const FILTER_TYPES_DIR = __DIR__ . '/filter-types/';
const REPOSITORIES_DIR = __DIR__ . '/repositories/';
const TRAITS_DIR 	   = __DIR__ . '/traits/';
const VENDOR_DIR 	   = __DIR__ . '/../vendor/';
const TAPI_DIR          = __DIR__ . '/../api/';
const ENDPOINTS_DIR    = __DIR__ . '/../api/endpoints/';
const HELPERS_DIR      = __DIR__ . '/../helpers/';

const DIRS = [
    CLASSES_DIR,
    ENTITIES_DIR,
    FIELD_TYPES_DIR,
    FILTER_TYPES_DIR,
    REPOSITORIES_DIR,
    TRAITS_DIR,
	TAPI_DIR,
	ENDPOINTS_DIR,
];

require_once(VENDOR_DIR . 'autoload.php');
require_once(HELPERS_DIR . 'class-tainacan-helpers-html.php');

spl_autoload_register('tainacan_autoload');

function tainacan_autoload($class_name){
    $class_path = explode('\\', $class_name);
    $class_name = end($class_path);

    if(count($class_path) == 1 ) {
        foreach(DIRS as $dir) {
            $file = $dir . 'class-'. strtolower(str_replace('_', '-' , $class_name)) . '.php';

            if(file_exists($file)) {
                require_once($file);
            }
        }
    }
    elseif ($class_path[0] == 'Tainacan') {
    	$sliced = array_slice($class_path, 1, count($class_path) -2);

    	if($sliced) {
		    $lower     = $sliced[0];
		    $sliced[0] = strtolower( $lower );

		    $dir = CLASSES_DIR . implode( DIRECTORY_SEPARATOR, $sliced ) . '/';
		    $dir = str_replace( '_', '-', $dir );
	    } else {
		    $dir = CLASSES_DIR;
	    }

        if( in_array('Field_Types', $class_path) ){
            $dir.= strtolower(str_replace('_', '-' , $class_name)).'/';
        }

        $file = $dir . 'class-tainacan-'. strtolower(str_replace('_', '-' , $class_name)) . '.php';

        if(file_exists($file)) {
            require_once($file);
        }
    }
}

global $Tainacan_Collections;
$Tainacan_Collections = new \Tainacan\Repositories\Collections();

global $Tainacan_Item_Metadata;
$Tainacan_Item_Metadata = new \Tainacan\Repositories\Item_Metadata();

global $Tainacan_Fields;
$Tainacan_Fields = new \Tainacan\Repositories\Fields();

//register field types
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Text');
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Textarea');
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Date');
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Numeric');
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Selectbox');
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Relationship');
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Radio');
$Tainacan_Fields->register_field_type('Tainacan\Field_Types\Checkbox');

global $Tainacan_Filters;
$Tainacan_Filters = new \Tainacan\Repositories\Filters();

global $Tainacan_Taxonomies;
$Tainacan_Taxonomies = new \Tainacan\Repositories\Taxonomies();

global $Tainacan_Items;
$Tainacan_Items = new \Tainacan\Repositories\Items();

global $Tainacan_Terms;
$Tainacan_Terms = new \Tainacan\Repositories\Terms();

global $Tainacan_Logs;
$Tainacan_Logs = new \Tainacan\Repositories\Logs();

new Capabilities();

?>
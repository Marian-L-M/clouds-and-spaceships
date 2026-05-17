<?php
$wrapper_attributes = get_block_wrapper_attributes([
    "data-wp-interactive" => "cns-theme/cns-header",
]); ?>
<div <?php echo $wrapper_attributes; ?>>
	<?php echo $content; ?>
</div>
<?php
// cns-section's render.php calls $tab_block->render() and wraps the output
// in .cns-tab__panel with the Interactivity API context. This file only
// needs to output the raw inner content.
echo $content;

<?php
if (!isset($attributes["imgURL"])) {
    $attributes["imgURL"] = get_theme_file_uri("/assets/images/banner.png");
} ?>
<div class="page-banner">
  <div
    class="page-banner__bg-image"
    style="background-image: url('<?php echo $attributes["imgURL"]; ?>');"
  ></div>
  <div class="page-banner__content">
    <?php echo $content; ?>
  </div>
</div>
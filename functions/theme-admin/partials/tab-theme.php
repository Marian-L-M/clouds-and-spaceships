<?php
/**
 * CNS admin — Theme tab.
 */
defined( 'ABSPATH' ) || exit;

$redirect_enabled  = (bool) cns_get_theme_setting( 'subscriber_redirect_enabled', false );
$redirect_url      = cns_get_theme_setting( 'subscriber_redirect_url', '/' );
$login_logo_id     = (int) cns_get_theme_setting( 'login_logo_id', 0 );
$login_bg_color    = cns_get_theme_setting( 'login_bg_color', '' );
$login_bg_image_id = (int) cns_get_theme_setting( 'login_bg_image_id', 0 );

$search_post_types  = (array) cns_get_theme_setting( 'search_post_types', [] );
$public_types       = get_post_types( [ 'public' => true ], 'objects' );
$profile_page_id    = (int) cns_get_theme_setting( 'profile_page_id', 0 );

$login_logo_url     = $login_logo_id     ? wp_get_attachment_image_url( $login_logo_id,     'thumbnail' ) : '';
$login_bg_image_url = $login_bg_image_id ? wp_get_attachment_image_url( $login_bg_image_id, 'thumbnail' ) : '';
?>
<div class="cns-admin-panel">
  <form method="post" action="options.php">
    <?php settings_fields( 'cns_theme_settings_group' ); ?>

    <?php /* ── User & Access ─────────────────────────────────────────── */ ?>
    <h2><?php esc_html_e( 'User &amp; Access', 'cns-theme' ); ?></h2>
    <table class="form-table" role="presentation">
      <tr>
        <th scope="row"><?php esc_html_e( 'Subscriber redirect', 'cns-theme' ); ?></th>
        <td>
          <label>
            <input
              type="checkbox"
              name="cns_theme_settings[subscriber_redirect_enabled]"
              value="1"
              <?php checked( $redirect_enabled ); ?>
            >
            <?php esc_html_e( 'Redirect subscribers away from the WordPress admin area', 'cns-theme' ); ?>
          </label>
        </td>
      </tr>
      <tr>
        <th scope="row">
          <label for="cns_redirect_url"><?php esc_html_e( 'Redirect destination', 'cns-theme' ); ?></label>
        </th>
        <td>
          <input
            type="text"
            id="cns_redirect_url"
            name="cns_theme_settings[subscriber_redirect_url]"
            value="<?php echo esc_attr( $redirect_url ); ?>"
            class="regular-text"
            placeholder="/"
          >
          <p class="description">
            <?php esc_html_e( 'Where to send subscribers who access the admin area. Defaults to /.', 'cns-theme' ); ?>
          </p>
        </td>
      </tr>
    </table>
    <hr>

    <?php /* ── Search Scope ─────────────────────────────────────────── */ ?>
    <h2><?php esc_html_e( 'Search Scope', 'cns-theme' ); ?></h2>
    <table class="form-table" role="presentation">
      <tr>
        <th scope="row"><?php esc_html_e( 'Included post types', 'cns-theme' ); ?></th>
        <td>
          <?php foreach ( $public_types as $slug => $type ) : ?>
            <label style="display:block;margin-bottom:4px;">
              <input
                type="checkbox"
                name="cns_theme_settings[search_post_types][]"
                value="<?php echo esc_attr( $slug ); ?>"
                <?php checked( empty( $search_post_types ) || in_array( $slug, $search_post_types, true ) ); ?>
              >
              <?php echo esc_html( $type->label ); ?>
              <span style="color:#8c8f94;">( <?php echo esc_html( $slug ); ?> )</span>
            </label>
          <?php endforeach; ?>
          <p class="description">
            <?php esc_html_e( 'Which post types appear in global search results. All are included by default.', 'cns-theme' ); ?>
          </p>
        </td>
      </tr>
    </table>
    <hr>

    <?php /* ── Site Structure ───────────────────────────────────────── */ ?>
    <h2><?php esc_html_e( 'Site Structure', 'cns-theme' ); ?></h2>
    <table class="form-table" role="presentation">
      <tr>
        <th scope="row">
          <label for="cns_profile_page"><?php esc_html_e( 'Profile page', 'cns-theme' ); ?></label>
        </th>
        <td>
          <?php wp_dropdown_pages( [
              'name'              => 'cns_theme_settings[profile_page_id]',
              'id'                => 'cns_profile_page',
              'selected'          => $profile_page_id,
              'show_option_none'  => __( '— Not set —', 'cns-theme' ),
              'option_none_value' => '0',
          ] ); ?>
          <p class="description">
            <?php esc_html_e( 'The page used as the user profile destination. Created automatically on theme activation.', 'cns-theme' ); ?>
          </p>
        </td>
      </tr>
    </table>
    <hr>

    <?php /* ── Login Page Branding ──────────────────────────────────── */ ?>
    <h2><?php esc_html_e( 'Login Page Branding', 'cns-theme' ); ?></h2>
    <table class="form-table" role="presentation">

      <?php /* Login logo */ ?>
      <tr>
        <th scope="row"><?php esc_html_e( 'Login logo', 'cns-theme' ); ?></th>
        <td>
          <input type="hidden" id="cns_login_logo_id" name="cns_theme_settings[login_logo_id]" value="<?php echo esc_attr( $login_logo_id ?: '' ); ?>">
          <img
            id="cns_login_logo_preview"
            src="<?php echo $login_logo_url ? esc_url( $login_logo_url ) : ''; ?>"
            style="max-height:80px;display:<?php echo $login_logo_url ? 'block' : 'none'; ?>;margin-bottom:8px;"
            alt=""
          >
          <button
            type="button"
            id="cns_login_logo_btn"
            class="button cns-media-btn"
            data-input="cns_login_logo_id"
            data-preview="cns_login_logo_preview"
            data-remove="cns_login_logo_remove"
            data-title="<?php esc_attr_e( 'Select login logo', 'cns-theme' ); ?>"
            data-select-label="<?php esc_attr_e( 'Select logo', 'cns-theme' ); ?>"
            data-change-label="<?php esc_attr_e( 'Change logo', 'cns-theme' ); ?>"
          ><?php echo $login_logo_id ? esc_html__( 'Change logo', 'cns-theme' ) : esc_html__( 'Select logo', 'cns-theme' ); ?></button>
          <button
            type="button"
            id="cns_login_logo_remove"
            class="button cns-media-remove-btn"
            data-input="cns_login_logo_id"
            data-preview="cns_login_logo_preview"
            data-picker="cns_login_logo_btn"
            style="display:<?php echo $login_logo_id ? 'inline-block' : 'none'; ?>;"
          ><?php esc_html_e( 'Remove', 'cns-theme' ); ?></button>
          <p class="description"><?php esc_html_e( 'Replaces the WordPress logo on the login screen.', 'cns-theme' ); ?></p>
        </td>
      </tr>

      <?php /* Background colour */ ?>
      <tr>
        <th scope="row">
          <label for="cns_login_bg_color"><?php esc_html_e( 'Background colour', 'cns-theme' ); ?></label>
        </th>
        <td>
          <input
            type="color"
            id="cns_login_bg_color"
            name="cns_theme_settings[login_bg_color]"
            value="<?php echo esc_attr( $login_bg_color ?: '#f0f0f1' ); ?>"
          >
          <p class="description">
            <?php esc_html_e( 'Login page background colour. Hidden when a background image is set.', 'cns-theme' ); ?>
          </p>
        </td>
      </tr>

      <?php /* Background image */ ?>
      <tr>
        <th scope="row"><?php esc_html_e( 'Background image', 'cns-theme' ); ?></th>
        <td>
          <input type="hidden" id="cns_login_bg_image_id" name="cns_theme_settings[login_bg_image_id]" value="<?php echo esc_attr( $login_bg_image_id ?: '' ); ?>">
          <img
            id="cns_login_bg_image_preview"
            src="<?php echo $login_bg_image_url ? esc_url( $login_bg_image_url ) : ''; ?>"
            style="max-height:80px;display:<?php echo $login_bg_image_url ? 'block' : 'none'; ?>;margin-bottom:8px;"
            alt=""
          >
          <button
            type="button"
            id="cns_login_bg_image_btn"
            class="button cns-media-btn"
            data-input="cns_login_bg_image_id"
            data-preview="cns_login_bg_image_preview"
            data-remove="cns_login_bg_image_remove"
            data-title="<?php esc_attr_e( 'Select background image', 'cns-theme' ); ?>"
            data-select-label="<?php esc_attr_e( 'Select image', 'cns-theme' ); ?>"
            data-change-label="<?php esc_attr_e( 'Change image', 'cns-theme' ); ?>"
          ><?php echo $login_bg_image_id ? esc_html__( 'Change image', 'cns-theme' ) : esc_html__( 'Select image', 'cns-theme' ); ?></button>
          <button
            type="button"
            id="cns_login_bg_image_remove"
            class="button cns-media-remove-btn"
            data-input="cns_login_bg_image_id"
            data-preview="cns_login_bg_image_preview"
            data-picker="cns_login_bg_image_btn"
            style="display:<?php echo $login_bg_image_id ? 'inline-block' : 'none'; ?>;"
          ><?php esc_html_e( 'Remove', 'cns-theme' ); ?></button>
          <p class="description">
            <?php esc_html_e( 'Cover-scaled over the background colour. Leave empty to use the colour only.', 'cns-theme' ); ?>
          </p>
        </td>
      </tr>

    </table>

    <?php submit_button(); ?>
  </form>
</div>

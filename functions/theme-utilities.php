<?php
function cns_generate_style_text( array $props ): string {
    $declarations = [];
    foreach ( $props as $property => $value ) {
        if ( $value !== '' && $value !== null ) {
            $declarations[] = esc_attr( $property ) . ':' . esc_attr( $value );
        }
    }
    return implode( ';', $declarations );
}

function cns_get_position_props( string $position, array $offset = [] ): array {
    [ $v, $h ] = explode( '-', $position );

    $props      = [ 'position' => 'absolute' ];
    $transforms = [];

    if ( $v === 'top' ) {
        $props['top'] = $offset['top'] ?? '1rem';
    } elseif ( $v === 'bottom' ) {
        $props['bottom'] = $offset['bottom'] ?? '1rem';
    } else {
        $props['top'] = '50%';
        $transforms[] = 'translateY(-50%)';
    }

    if ( $h === 'left' ) {
        $props['left'] = $offset['left'] ?? '1rem';
    } elseif ( $h === 'right' ) {
        $props['right'] = $offset['right'] ?? '1rem';
    } else {
        $props['left'] = '50%';
        $transforms[]  = 'translateX(-50%)';
    }

    if ( ! empty( $transforms ) ) {
        $props['transform'] = implode( ' ', $transforms );
    }

    return $props;
}

/**
 * Convert a Gutenberg BorderBoxControl value into CSS declarations.
 *
 * Accepts either a "flat" border ( ['color'=>…,'style'=>…,'width'=>…] applied
 * to all sides ) or a "split" border keyed by top/right/bottom/left, each a
 * flat border. Returns a prop array for cns_generate_style_text().
 */
function cns_border_to_props( $border ): array {
    if ( empty( $border ) || ! is_array( $border ) ) {
        return [];
    }

    $sides = [ 'top', 'right', 'bottom', 'left' ];

    $is_split = false;
    foreach ( $sides as $side ) {
        if ( isset( $border[ $side ] ) ) {
            $is_split = true;
            break;
        }
    }

    if ( ! $is_split ) {
        return cns_single_border_props( 'border', $border );
    }

    $props = [];
    foreach ( $sides as $side ) {
        $props += cns_single_border_props( "border-{$side}", $border[ $side ] ?? null );
    }
    return $props;
}

/** Build width/style/color declarations for one border side (or all sides). */
function cns_single_border_props( string $prefix, $border ): array {
    if ( empty( $border ) || ! is_array( $border ) ) {
        return [];
    }

    $props = [];
    if ( ! empty( $border['width'] ) ) {
        $props[ "{$prefix}-width" ] = $border['width'];
    }
    // A width with no explicit style still needs one to render.
    if ( ! empty( $border['style'] ) || ! empty( $border['width'] ) ) {
        $props[ "{$prefix}-style" ] = $border['style'] ?? 'solid';
    }
    if ( ! empty( $border['color'] ) ) {
        $props[ "{$prefix}-color" ] = $border['color'];
    }
    return $props;
}

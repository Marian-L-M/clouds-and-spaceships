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

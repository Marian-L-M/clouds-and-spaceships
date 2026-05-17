import Glide from "@glidejs/glide";

document.querySelectorAll( ".cns-slideshow__wrapper .glide" ).forEach( ( el ) => {
	new Glide( el ).mount();
} );

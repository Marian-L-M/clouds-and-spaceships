import './toast.scss';

const CONTAINER_ID = 'cns-toast-container';
const DEFAULT_DURATION = 4000;

function getContainer() {
	let el = document.getElementById( CONTAINER_ID );
	if ( ! el ) {
		el = document.createElement( 'div' );
		el.id = CONTAINER_ID;
		el.className = 'cns-toast-container';
		el.setAttribute( 'aria-live', 'polite' );
		el.setAttribute( 'aria-atomic', 'false' );
		document.body.appendChild( el );
	}
	return el;
}

/**
 * Show a toast notification.
 *
 * @param {string} message  The message to display.
 * @param {'success'|'error'|'info'|'warning'} [type='info']  Visual type.
 * @param {number} [duration]  Auto-dismiss delay in ms. 0 = no auto-dismiss.
 */
function show( message, type = 'info', duration = DEFAULT_DURATION ) {
	const container = getContainer();

	const toast = document.createElement( 'div' );
	toast.className = `cns-toast cns-toast--${ type }`;
	toast.setAttribute( 'role', 'status' );

	const text = document.createElement( 'span' );
	text.className = 'cns-toast__message';
	text.textContent = message;

	const closeBtn = document.createElement( 'button' );
	closeBtn.type = 'button';
	closeBtn.className = 'cns-toast__close';
	closeBtn.setAttribute( 'aria-label', 'Dismiss' );
	closeBtn.textContent = '×';
	closeBtn.addEventListener( 'click', () => dismiss( toast ) );

	toast.appendChild( text );
	toast.appendChild( closeBtn );
	container.appendChild( toast );

	// Trigger enter animation on next frame.
	requestAnimationFrame( () => {
		requestAnimationFrame( () => toast.classList.add( 'is-visible' ) );
	} );

	if ( duration > 0 ) {
		setTimeout( () => dismiss( toast ), duration );
	}

	return toast;
}

function dismiss( toast ) {
	toast.classList.remove( 'is-visible' );
	toast.addEventListener( 'transitionend', () => toast.remove(), { once: true } );
	// Fallback in case transitionend never fires.
	setTimeout( () => toast.remove(), 500 );
}

window.cnsToast = { show };

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		index: path.resolve( __dirname, 'src/index.js' ),
		editor: path.resolve( __dirname, 'src/editor.js' ),
		toast: path.resolve( __dirname, 'src/modules/toast.js' ),
	},
	output: {
		...defaultConfig.output,
		clean: false,
	},
};

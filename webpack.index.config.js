const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		index: path.resolve( __dirname, 'src/index.ts' ),
		editor: path.resolve( __dirname, 'src/editor.ts' ),
		toast: path.resolve( __dirname, 'src/modules/toast.ts' ),
	},
	output: {
		...defaultConfig.output,
		clean: false,
	},
};

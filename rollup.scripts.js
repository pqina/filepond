import babel from 'rollup-plugin-babel';
import license from 'rollup-plugin-license';
import { terser } from 'rollup-plugin-terser';
import prettier from 'rollup-plugin-prettier';
const banner = require('./banner');

const createBuild = (options) => {
	const { format, id, name, minify = false, transpile = false } = options;

	// get filename
	const filename = ['dist/', name];
	if (format === 'es') {
		filename.push('.esm');
	}
	if (minify) {
		filename.push('.min');
	}
	filename.push('.js');

	// collect plugins
	const plugins = [];
	if (transpile) {
		plugins.push(babel({
			exclude: ['node_modules/**']
		}))
	}
	if (minify) {
		plugins.push(terser())
	}
	else {
		plugins.push(prettier({
			singleQuote: true,
			parser: 'babel'
		}))
	}
	plugins.push(license({banner: banner(options)}))
	
	// return Rollup config
	return {
		input: 'src/js/index.js',
		treeshake: false,
		output: [
			{
				format,
				name: id,
				file: filename.join('')
			}
		],
		plugins
	}
};

export default (metadata, configs) => configs.map(config => createBuild({ ...metadata, ...config }));
import * as pkg from './package.json';
import build from './rollup.scripts';

export default build(
	{
		id: 'FilePond',
		...pkg
	},
	[
		{
			format: 'umd',
			transpile: true
		},
		{
			format: 'umd',
			transpile: true,
			minify: true
		},
		{
			format: 'es'
		},
		{
			format: 'es',
			minify: true
		}
	]
);
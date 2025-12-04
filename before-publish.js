const pkg = require('./package.json');

if (pkg.version.includes('alpha') && process.env.npm_config_tag !== 'alpha') {
    console.error('Refusing to publish alpha as latest');
    process.exit(1);
}

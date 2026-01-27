import pkg from './package.json' with { type: 'json' };

if (pkg.version.includes('beta') && process.env.npm_config_tag !== 'beta') {
    console.error('Refusing to publish beta as latest');
    process.exit(1);
}

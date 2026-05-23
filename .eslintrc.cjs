module.exports = {
    // Or 'jejolare/backend' for Node.js app
    extends: ['jejolare/frontend'],

    // This is needed only if you use TypeScript
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
        },
    },

    rules: {
        '@next/next/no-img-element': 'off',
    },
};

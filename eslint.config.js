export default [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                Blob: 'readonly',
                history: 'readonly',
                app: 'writable',
                DocumentManager: 'readonly',
                UIManager: 'readonly',
                StorageManager: 'readonly',
                CitationGenerator: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'off',
            'no-console': 'off',
            'complexity': ['error', 15],
            'max-lines-per-function': ['error', 80],
            'max-depth': ['error', 4],
            'no-var': 'error',
            'prefer-const': 'error',
            'eqeqeq': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'prefer-template': 'error',
            'no-trailing-spaces': 'error',
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always']
        }
    }
];

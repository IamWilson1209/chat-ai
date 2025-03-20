import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // 關閉未使用變數檢查
      '@typescript-eslint/no-explicit-any': 'off', // 關閉 no-explicit-any 檢查
      'prefer-const': 'off', // 關閉 prefer-const 檢查
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off', // 關閉 no-non-null-asserted-optional-chain 檢查
    },
  },
];

export default eslintConfig;

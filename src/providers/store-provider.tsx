// providers/redux-provider.tsx
'use client'; // 如果使用 Next.js，確保這是 Client Component

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/app/redux/stores/index'; // 根據你的實際路徑調整

export const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

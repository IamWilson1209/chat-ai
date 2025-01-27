import { Provider } from 'react-redux';
import { store } from '../app/redux/stores';
import '../styles/globals.css';
import type { AppProps } from 'next/app'; // 引入 Next.js 預設型別

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

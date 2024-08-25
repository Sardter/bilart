import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { Provider as StoreProvider } from 'jotai';

import { MuiThemeProvider } from '@/theme'
import Layout from "@/layout";

export default function App({ Component, pageProps }: AppProps) {

  // @ts-ignore
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <StoreProvider> 
      <MuiThemeProvider>
        {
          pageProps.navbar ? 
          <Layout show={pageProps.navbar}>
            {getLayout(<Component  {...pageProps} />)}
          </Layout>
          :
          <>
            {getLayout(<Component  {...pageProps} />)}
          </>
        }
      </MuiThemeProvider> 
    </StoreProvider>
  )
}

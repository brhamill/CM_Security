import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import { setAccessToken } from '../lib/accessToken';
import { useApollo } from '../lib/apolloClient';

const App = ({ Component, pageProps }: AppProps) => {
  const apolloClient = useApollo(pageProps);

  // if (pageProps && pageProps.serverAccessToken) {
  //   setAccessToken(pageProps.serverAccessToken);
  // }

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

export default App;

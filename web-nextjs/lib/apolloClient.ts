import { useMemo } from 'react';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import fetch from 'isomorphic-unfetch';
import { getAccessToken, setAccessToken } from './accessToken';
// import { concatPagination } from '@apollo/client/utilities';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

const isServer = () => typeof window === 'undefined';

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient() {
  const httpLink = new HttpLink({
    uri: 'http://localhost:4000/graphql',
    credentials: 'include',
    fetch,
  });

  const refreshLink = new TokenRefreshLink({
    accessTokenField: 'accessToken',
    isTokenValidOrUndefined: () => {
      const token = getAccessToken();

      if (!token) {
        return false;
      }

      try {
        const { exp } = jwtDecode<JwtPayload>(token);

        if (exp && Date.now() >= exp * 1000) {
          return false;
        } else {
          return true;
        }
      } catch (err) {
        return false;
      }
    },
    fetchAccessToken: () => {
      return fetch('http://localhost:4000/refresh_token', {
        method: 'POST',
        credentials: 'include',
      });
    },
    handleFetch: (accessToken) => {
      setAccessToken(accessToken);
    },
    handleError: (err) => {
      // console.warn('Your refresh token is invalid. Try to relogin');
      // console.error(err);
    },
  });

  const authLink = setContext((_request, { headers }) => {
    // const token = isServer() ? serverAccessToken : getAccessToken();
    const token = getAccessToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `bearer ${token}` : '',
      },
    };
  });

  // const errorLink = onError(({ graphQLErrors, networkError }) => {
  //   console.log(graphQLErrors);
  //   if (networkError) console.log(networkError);
  // });

  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          if (err.extensions) {
            switch (err.extensions.code) {
              // Apollo Server sets code to UNAUTHENTICATED
              // when an AuthenticationError is thrown in a resolver
              case 'INTERNAL_SERVER_ERROR':
                // Modify the operation context with a new token
                const oldHeaders = operation.getContext().headers;
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    // authorization: getNewToken(),
                  },
                });
                // Retry the request, returning the new observable
                return forward(operation);
            }
          }
        }
      }

      // To retry on network errors, we recommend the RetryLink
      // instead of the onError link. This just logs the error.
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }
  );

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.from([refreshLink, errorLink, authLink, httpLink]),
    cache: new InMemoryCache({}),
  });
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState as any, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client: any, pageProps: any) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: any) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(() => initializeApollo(state), [state]);
  return store;
}

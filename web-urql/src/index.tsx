import ReactDOM from 'react-dom';
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql';
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';
import { App } from './App';
import { LoginMutation, MeDocument, MeQuery } from './generated/graphql';
import { getAccessToken } from './accessToken';

export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          login: (_result, _, cache, __) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, _query) => {
                return {
                  me: result.login.user,
                };
              }
            );
          },
        },
      },
    }),
    fetchExchange,
  ],
  fetchOptions: () => {
    const accessToken = getAccessToken();

    return accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {};
  },
});

ReactDOM.render(
  <Provider value={client}>
    <App />
  </Provider>,
  document.getElementById('root')
);

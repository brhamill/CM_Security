import React from 'react';
import { useUsersQuery, UsersDocument } from '../generated/graphql';
import Layout from '../components/Layout';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import cookie from 'cookie';
import { gql } from '@apollo/client';

import { addApolloState, initializeApollo } from '../lib/apolloClient';

const Home = ({ users }: any) => {
  // const { data } = useUsersQuery({ fetchPolicy: 'network-only' });
  // const { data } = useUsersQuery();

  // if (!data) {
  //   return (
  //     <Layout>
  //       <div>loading...</div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout>
      <div>
        <div>users:</div>
        <ul>
          {users.map((x: any) => {
            return (
              <li key={x.id}>
                {x.email}, {x.id}
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const client = initializeApollo({ headers: context.req.headers } as any);

  const { data } = await client.query({
    query: UsersDocument,
  });

  return addApolloState(client, {
    props: { users: data.users },
  });
};

// export const getServerSideProps = async (
//   context: GetServerSidePropsContext
// ) => {
//   const { req } = context;

//   let serverAccessToken = '';

//   if (req && req.headers && req.headers.cookie) {
//     const cookies = cookie.parse(req.headers.cookie);
//     if (cookies.jid) {
//       const response = await fetch('http://localhost:4000/refresh_token', {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//           cookie: 'jid=' + cookies.jid,
//         },
//       });
//       const data = await response.json();
//       serverAccessToken = data.accessToken;
//     }
//   }

//   console.log('serverAccessToken', serverAccessToken);

//   const client = initializeApollo({ headers: context.req.headers } as any);

//   return addApolloState(client, {
//     props: { serverAccessToken },
//   });
// };

export default Home;

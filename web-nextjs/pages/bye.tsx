import React from 'react';
import { useByeQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { getAccessToken, getIsAuthenticated } from '../lib/accessToken';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { addApolloState, initializeApollo } from '../lib/apolloClient';

const Bye = () => {
  console.log('Authenticated?', getIsAuthenticated());

  const { data, loading, error } = useByeQuery();

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>err</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div>no data</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>{data.bye}</div>
    </Layout>
  );
};

// export const getServerSideProps: GetServerSideProps = async (
//   context: GetServerSidePropsContext
// ) => {
//   const client = initializeApollo({ headers: context.req.headers } as any);

//   console.log('Bye Headers', context.req.headers);

//   return addApolloState(client, {
//     props: {},
//   });
// };

export default Bye;

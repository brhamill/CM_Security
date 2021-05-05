import React from 'react';
import { useUsersQuery } from '../generated/graphql';

export const Home: React.FC = () => {
  console.log('Home');

  const [result] = useUsersQuery();

  const { data } = result;

  console.log(data);

  if (!data) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <div>users:</div>
      <ul>
        {data.users.map((x) => {
          return (
            <li key={x.id}>
              {x.email}, {x.id}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

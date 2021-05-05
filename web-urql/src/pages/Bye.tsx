import React from 'react';
import { useByeQuery } from '../generated/graphql';

interface Props {}

export const Bye: React.FC<Props> = () => {
  const [result] = useByeQuery();

  const { data, fetching, error } = result;

  if (fetching) {
    return <div>loading...</div>;
  }

  if (error) {
    console.log(error);
    return <div>err</div>;
  }

  if (!data) {
    return <div>no data</div>;
  }

  return <div>{data.bye}</div>;
};

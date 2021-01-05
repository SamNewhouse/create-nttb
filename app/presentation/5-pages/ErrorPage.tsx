import { NextPage } from 'next';
import BaseLayout from 'presentation/4-layouts/BaseLayout';
import React from 'react';

interface Props {
  statusCode: number | null
}

const ErrorPage: NextPage<Props> = ({ statusCode }) => {

  return (
    <>
      <BaseLayout>
        <div className="">
          <h1>{statusCode ? statusCode : 'Unknown'}</h1>
          <h2>{statusCode === 404 ? 'Page not found' : 'An error occurred'}</h2>
        </div>
      </BaseLayout>
    </>
  );
};

ErrorPage.getInitialProps = async ({ res, err }): Promise<Props> => {

  const statusCode = !(res && res.statusCode)
    ? (err && err.statusCode) ? err.statusCode : null
    : res.statusCode;

  return { statusCode };
};

export default ErrorPage;

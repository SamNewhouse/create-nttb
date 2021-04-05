import { NextPage } from 'next';
import BaseLayout from 'presentation/4-layouts/BaseLayout';
import React from 'react';

interface Props {
  //
}

const HomePage: NextPage<Props> = () => {

  return (
    <>
      <BaseLayout className="home">
        <div className="flex justify-center items-center h-screen w-100">
          <h1 className="font-serif text-8xl">NextJs Typescript Tailwind Boilerplate</h1>
        </div>
      </BaseLayout>
    </>
  );
};

export default HomePage;

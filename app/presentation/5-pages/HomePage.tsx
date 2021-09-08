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
        <div className="flex justify-center items-center h-screen ">
          <div className="flex flex-col w-100 max-w-md space-y-3">
            <h1 className="font-serif text-8xl">NextJs Typescript Tailwind Boilerplate</h1>
            <h2 className="font-sans text-2xl">by Sam Newhouse</h2>
          </div>
        </div>
      </BaseLayout>
    </>
  );
};

export default HomePage;

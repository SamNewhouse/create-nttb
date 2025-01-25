import { NextPage } from "next";
import BaseLayout from "../4-layouts/BaseLayout";
import React from "react";

interface Props {
  statusCode: number | null;
}

const ErrorPage: NextPage<Props> = ({ statusCode }) => {
  return (
    <>
      <BaseLayout className="error">
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col w-100 max-w-md space-y-3">
            <h1 className="font-serif text-8xl">
              {statusCode ? statusCode : "Unknown"}
            </h1>
            <h2 className="font-sans text-2xl">
              {statusCode === 404 ? "Page not found" : "An error occurred"}
            </h2>
          </div>
        </div>
      </BaseLayout>
    </>
  );
};

export const getServerSideProps = async ({ res, err }: any) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return {
    props: { statusCode },
  };
};

export default ErrorPage;

import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import BaseLayout from "../4-layouts/BaseLayout";
import React from "react";

type ErrorProps = {
  statusCode: number;
};

export const getServerSideProps = (async ({ res }) => {
  const statusCode = res?.statusCode || 500;

  return { props: { statusCode } };
}) satisfies GetServerSideProps<{ statusCode: number }>;

const ErrorPage: NextPage<ErrorProps> = ({
  statusCode,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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

export default ErrorPage;

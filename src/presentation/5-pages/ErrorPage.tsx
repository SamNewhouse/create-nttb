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

ErrorPage.getInitialProps = async ({ res, err }): Promise<Props> => {
  const statusCode = !(res && res.statusCode)
    ? err && err.statusCode
      ? err.statusCode
      : null
    : res.statusCode;

  return { statusCode };
};

export default ErrorPage;


import { AppProps } from 'next/app';
import React, { FC } from 'react';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import "tailwindcss/tailwind.css";

const { SENTRY_DSN } = process.env;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
      <Component {...pageProps} />
  );
}

export default App

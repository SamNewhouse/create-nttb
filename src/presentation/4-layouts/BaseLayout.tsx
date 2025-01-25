import React, { FC, memo, PropsWithChildren, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
}

const BaseLayout: FC<Props> = ({ children, className }) => {
  return (
    <>
      <div
        className={`max-w-(--breakpoint-lg) mx-auto${className ? " " + className : ""}`}
      >
        {children}
      </div>
    </>
  );
};

export default memo<PropsWithChildren<Props>>(BaseLayout);

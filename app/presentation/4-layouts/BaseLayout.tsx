import React, { FC, memo, PropsWithChildren } from 'react';

interface Props {
  className?: string
}

const BaseLayout: FC<Props> = ({ children, className }) => {
  return (
    <>
      <div className={`max-w-screen-lg mx-auto ${className ? ' ' + className : ''}`}>
        {children}
      </div>
    </>
  );
};

export default memo<PropsWithChildren<Props>>(BaseLayout);

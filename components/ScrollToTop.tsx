import React, { useEffect, useState } from 'react';

const defaultProps = Object.freeze({});
const initialState = Object.freeze({
  visible: false,
});

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

export default function ScrollToTop(): JSX.Element {
  const [visible, setVisible] = useState(initialState.visible);

  const onScroll = () => {
    const rootElement = document.documentElement;
    const scrollTotal = 100 * (1 - (rootElement.clientHeight - rootElement.scrollTop) / rootElement.clientHeight);
    setVisible(scrollTotal > 90);
  };

  useEffect(() => {
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`cursor-pointer transition-opacity border-none outline-none fixed right-[0px] bottom-[16px] ${visible ? 'opacity-100' : 'opacity-0' } hover:motion-safe:animate-bounce`} onClick={() => scrollToTop()}>
      <img 
        src='/toTop.png'
        alt='Click to rocket boost to the top of the page!'
      />
    </div>
  );
}

ScrollToTop.defaultProps = defaultProps;

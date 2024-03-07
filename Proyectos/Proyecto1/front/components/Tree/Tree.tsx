'use client';

import { Graphviz } from 'graphviz-react';

export const Tree = () => {
  return (
    <>
        <Graphviz dot={`digraph G {Hello->World}`} />
    </>
  )
}
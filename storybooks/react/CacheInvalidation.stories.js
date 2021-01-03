import React from 'react';

import CacheInvalidation from './CacheInvalidation';

export default {
  title: 'Heelflip/React/Cache invalidation',
  component: CacheInvalidation,
};

const Template = (args) => <CacheInvalidation {...args} />;

export const Default = Template.bind({});

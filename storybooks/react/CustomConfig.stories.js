import React from 'react';

import CustomConfig from './CustomConfig';

export default {
  title: 'Heelflip/React/Custom config',
  component: CustomConfig,
};

const Template = (args) => <CustomConfig {...args} />;

export const Default = Template.bind({});

import React from 'react';

import Arguments from './Arguments';

export default {
  title: 'Heelflip/React/Arguments',
  component: Arguments
};

const Template = (args) => <Arguments {...args} />;

export const Default = Template.bind({});
import React from 'react';

import CallbackError from './CallbackError';
import CallbackSuccess from './CallbackSuccess';
import CallbackLoading from './CallbackLoading';

export default {
  title: 'Heelflip/React/Callbacks',
  component: CallbackSuccess,
};

const CallbackSuccessTemplate = (args) => <CallbackSuccess {...args} />;
export const Success = CallbackSuccessTemplate.bind({});

const CallbackErrorTemplate = (args) => <CallbackError {...args} />;
export const Error = CallbackErrorTemplate.bind({});

const CallbackLoadingTemplate = (args) => <CallbackLoading {...args} />;
export const Loading = CallbackLoadingTemplate.bind({});

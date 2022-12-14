import { API } from 'aws-amplify';
import { GraphQLResult, graphqlOperation } from '@aws-amplify/api-graphql';

import { createTimer } from '../graphql/mutations';
import { CreateTimerInput, CreateTimerMutation } from '../API';
import { PromiseType } from '../utils/typeUtils';

const TimerService = {
  createTimer: async (input: CreateTimerInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return API.graphql(graphqlOperation(createTimer, { input: input })) as Promise<GraphQLResult<CreateTimerMutation>>;
  },
};

export type TimerServiceReturnType = {
  createTimerRT: PromiseType<ReturnType<typeof TimerService.createTimer>>;
};

export default TimerService;

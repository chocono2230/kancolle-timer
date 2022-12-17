import { API } from 'aws-amplify';
import { GraphQLResult, graphqlOperation } from '@aws-amplify/api-graphql';

import { listTimers } from '../graphql/queries';
import { createTimer } from '../graphql/mutations';
import { CreateTimerInput, CreateTimerMutation, ListTimersQuery } from '../API';
import { PromiseType } from '../utils/typeUtils';

const TimerService = {
  createTimer: async (input: CreateTimerInput) => {
    return API.graphql(graphqlOperation(createTimer, { input: input })) as Promise<GraphQLResult<CreateTimerMutation>>;
  },
  listTimers: async () => {
    return API.graphql(graphqlOperation(listTimers)) as Promise<GraphQLResult<ListTimersQuery>>;
  },
};

export type TimerServiceReturnType = {
  createTimerRT: PromiseType<ReturnType<typeof TimerService.createTimer>>;
  listTimersRT: PromiseType<ReturnType<typeof TimerService.listTimers>>;
};

export default TimerService;

import { API } from 'aws-amplify';
import { GraphQLResult, graphqlOperation } from '@aws-amplify/api-graphql';

import { listTimers } from '../graphql/queries';
import { createTimer, updateTimer, deleteTimer } from '../graphql/mutations';
import {
  CreateTimerInput,
  UpdateTimerInput,
  DeleteTimerInput,
  CreateTimerMutation,
  UpdateTimerMutation,
  DeleteTimerMutation,
  ListTimersQuery,
} from '../API';
import { PromiseType } from '../utils/typeUtils';

const TimerService = {
  createTimer: async (input: CreateTimerInput) => {
    return API.graphql(graphqlOperation(createTimer, { input: input })) as Promise<GraphQLResult<CreateTimerMutation>>;
  },
  updateTimer: async (input: UpdateTimerInput) => {
    return API.graphql(graphqlOperation(updateTimer, { input: input })) as Promise<GraphQLResult<UpdateTimerMutation>>;
  },
  deleteTimer: async (input: DeleteTimerInput) => {
    return API.graphql(graphqlOperation(deleteTimer, { input: input })) as Promise<GraphQLResult<DeleteTimerMutation>>;
  },
  listTimers: async () => {
    return API.graphql(graphqlOperation(listTimers)) as Promise<GraphQLResult<ListTimersQuery>>;
  },
};

export type TimerServiceReturnType = {
  createTimerRT: PromiseType<ReturnType<typeof TimerService.createTimer>>;
  updateTimerRT: PromiseType<ReturnType<typeof TimerService.updateTimer>>;
  deleteTimerRT: PromiseType<ReturnType<typeof TimerService.deleteTimer>>;
  listTimersRT: PromiseType<ReturnType<typeof TimerService.listTimers>>;
};

export default TimerService;

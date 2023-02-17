/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTimerInput = {
  id?: string | null,
  time: string,
  isTemped: boolean,
  order: number,
  endTime?: string | null,
  name?: string | null,
};

export type ModelTimerConditionInput = {
  time?: ModelStringInput | null,
  isTemped?: ModelBooleanInput | null,
  order?: ModelIntInput | null,
  endTime?: ModelStringInput | null,
  name?: ModelStringInput | null,
  and?: Array< ModelTimerConditionInput | null > | null,
  or?: Array< ModelTimerConditionInput | null > | null,
  not?: ModelTimerConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Timer = {
  __typename: "Timer",
  id: string,
  time: string,
  isTemped: boolean,
  order: number,
  endTime?: string | null,
  name?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateTimerInput = {
  id: string,
  time?: string | null,
  isTemped?: boolean | null,
  order?: number | null,
  endTime?: string | null,
  name?: string | null,
};

export type DeleteTimerInput = {
  id: string,
};

export type ModelTimerFilterInput = {
  id?: ModelIDInput | null,
  time?: ModelStringInput | null,
  isTemped?: ModelBooleanInput | null,
  order?: ModelIntInput | null,
  endTime?: ModelStringInput | null,
  name?: ModelStringInput | null,
  and?: Array< ModelTimerFilterInput | null > | null,
  or?: Array< ModelTimerFilterInput | null > | null,
  not?: ModelTimerFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelTimerConnection = {
  __typename: "ModelTimerConnection",
  items:  Array<Timer | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionTimerFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  time?: ModelSubscriptionStringInput | null,
  isTemped?: ModelSubscriptionBooleanInput | null,
  order?: ModelSubscriptionIntInput | null,
  endTime?: ModelSubscriptionStringInput | null,
  name?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTimerFilterInput | null > | null,
  or?: Array< ModelSubscriptionTimerFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type CreateTimerMutationVariables = {
  input: CreateTimerInput,
  condition?: ModelTimerConditionInput | null,
};

export type CreateTimerMutation = {
  createTimer?:  {
    __typename: "Timer",
    id: string,
    time: string,
    isTemped: boolean,
    order: number,
    endTime?: string | null,
    name?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateTimerMutationVariables = {
  input: UpdateTimerInput,
  condition?: ModelTimerConditionInput | null,
};

export type UpdateTimerMutation = {
  updateTimer?:  {
    __typename: "Timer",
    id: string,
    time: string,
    isTemped: boolean,
    order: number,
    endTime?: string | null,
    name?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteTimerMutationVariables = {
  input: DeleteTimerInput,
  condition?: ModelTimerConditionInput | null,
};

export type DeleteTimerMutation = {
  deleteTimer?:  {
    __typename: "Timer",
    id: string,
    time: string,
    isTemped: boolean,
    order: number,
    endTime?: string | null,
    name?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetTimerQueryVariables = {
  id: string,
};

export type GetTimerQuery = {
  getTimer?:  {
    __typename: "Timer",
    id: string,
    time: string,
    isTemped: boolean,
    order: number,
    endTime?: string | null,
    name?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListTimersQueryVariables = {
  filter?: ModelTimerFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTimersQuery = {
  listTimers?:  {
    __typename: "ModelTimerConnection",
    items:  Array< {
      __typename: "Timer",
      id: string,
      time: string,
      isTemped: boolean,
      order: number,
      endTime?: string | null,
      name?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateTimerSubscriptionVariables = {
  filter?: ModelSubscriptionTimerFilterInput | null,
};

export type OnCreateTimerSubscription = {
  onCreateTimer?:  {
    __typename: "Timer",
    id: string,
    time: string,
    isTemped: boolean,
    order: number,
    endTime?: string | null,
    name?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTimerSubscriptionVariables = {
  filter?: ModelSubscriptionTimerFilterInput | null,
};

export type OnUpdateTimerSubscription = {
  onUpdateTimer?:  {
    __typename: "Timer",
    id: string,
    time: string,
    isTemped: boolean,
    order: number,
    endTime?: string | null,
    name?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTimerSubscriptionVariables = {
  filter?: ModelSubscriptionTimerFilterInput | null,
};

export type OnDeleteTimerSubscription = {
  onDeleteTimer?:  {
    __typename: "Timer",
    id: string,
    time: string,
    isTemped: boolean,
    order: number,
    endTime?: string | null,
    name?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

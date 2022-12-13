/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTimer = /* GraphQL */ `
  subscription OnCreateTimer($filter: ModelSubscriptionTimerFilterInput) {
    onCreateTimer(filter: $filter) {
      id
      time
      isTemped
      order
      endTime
      name
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateTimer = /* GraphQL */ `
  subscription OnUpdateTimer($filter: ModelSubscriptionTimerFilterInput) {
    onUpdateTimer(filter: $filter) {
      id
      time
      isTemped
      order
      endTime
      name
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteTimer = /* GraphQL */ `
  subscription OnDeleteTimer($filter: ModelSubscriptionTimerFilterInput) {
    onDeleteTimer(filter: $filter) {
      id
      time
      isTemped
      order
      endTime
      name
      createdAt
      updatedAt
    }
  }
`;

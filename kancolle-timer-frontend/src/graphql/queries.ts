/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTimer = /* GraphQL */ `
  query GetTimer($id: ID!) {
    getTimer(id: $id) {
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
export const listTimers = /* GraphQL */ `
  query ListTimers(
    $filter: ModelTimerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTimers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        time
        isTemped
        order
        endTime
        name
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

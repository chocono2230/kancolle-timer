import os, copy, boto3, json
from datetime import datetime, timezone, timedelta
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

# AppSyncのエンドポイントのURL
ENDPOINT = os.environ["ENDPOINT"]
# AppSyncのAPI KEY
API_KEY = os.environ["API_KEY"]
# Slack送信用sqsのURL
SQSURL = os.environ["SQSURL"]
# SlackのURL
SLACK_URL = os.environ["SLACK_URL"]


def send(text):
    client = boto3.client("sqs")
    messageBody = json.dumps({"text": text})
    return client.send_message(QueueUrl=SQSURL, MessageBody=messageBody)


def create_client():
    _headers = {
        "Content-Type": "application/graphql",
        "x-api-key": API_KEY,
    }
    _transport = RequestsHTTPTransport(
        headers=_headers,
        url=ENDPOINT,
        use_json=True,
    )

    return Client(
        transport=_transport,
        fetch_schema_from_transport=True,
    )


def get_timers():
    client = create_client()
    query = gql(
        """
    {
    listTimers {
        items {
        id
        isTemped
        name
        order
        time
        endTime
        }
    }
    }
    """
    )
    r = client.execute(query)
    return r["listTimers"]["items"]


def change_timer(id, end_time, order):
    client = create_client()
    query = gql(
        """
    mutation MyMutation ($id: ID!, $endTime: AWSDateTime, $order: Int) {
    updateTimer(input: {id: $id, endTime: $endTime, order: $order}) {
        id
        endTime
        name
        createdAt
        isTemped
        order
        time
        updatedAt
    }
    }
    """
    )
    r = client.execute(
        query, variable_values={"id": id, "endTime": end_time, "order": order}
    )


def change_timer(id, end_time, order):
    client = create_client()
    query = gql(
        """
    mutation MyMutation ($id: ID!, $endTime: AWSDateTime, $order: Int) {
    updateTimer(input: {id: $id, endTime: $endTime, order: $order}) {
        id
        endTime
        name
        createdAt
        isTemped
        order
        time
        updatedAt
    }
    }
    """
    )
    r = client.execute(
        query, variable_values={"id": id, "endTime": end_time, "order": order}
    )


def delete_timer(id):
    client = create_client()
    query = gql(
        """
    mutation MyMutation ($id: ID!) {
    deleteTimer(input: {id: $id}) {
        createdAt
        endTime
        id
        isTemped
        name
        order
        time
        updatedAt
    }
    }
    """
    )
    r = client.execute(query, variable_values={"id": id})


def main():
    now = datetime.now(timezone(timedelta(hours=+9)))
    timers = get_timers()
    timers.sort(key=lambda x: x["order"])
    prev_timers = copy.deepcopy(timers)
    messages = ["【KancolleTimer】"]

    for t in timers:
        if t["endTime"] is None:
            continue
        end_time = datetime.fromisoformat(t["endTime"])
        if end_time < now:
            if t["isTemped"]:
                t["order"] = -1
            t["endTime"] = None
            messages.append(f"{t['name']}のタイマーが終了しました。")

    new_index = -1
    for i in range(len(timers)):
        new_index += 1
        if timers[i] == prev_timers[i] and timers[i]["order"] == new_index:
            continue
        if timers[i]["order"] == -1:
            new_index -= 1
            delete_timer(timers[i]["id"])
            continue
        change_timer(timers[i]["id"], timers[i]["endTime"], new_index)

    if len(messages) != 1:
        send("\n".join(messages))


def lambda_handler(event, context):
    main()
    return {"statusCode": 200, "body": "ok"}


if __name__ == "__main__":
    main()

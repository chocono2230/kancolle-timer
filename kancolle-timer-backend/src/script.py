import os


def handler(event, context):

    base_message = os.environ["BASE_MESSAGE"]

    return {"message": f"{base_message}!!"}

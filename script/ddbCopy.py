import boto3, os

FROM_NAME = os.environ['FROM_NAME']
TO_NAME = os.environ['TO_NAME']

dynamodb = boto3.client('dynamodb')

def main():
    r = scan()
    print(r)
    for o in r:
        put(o)


def scan():
    options = {
        'TableName': FROM_NAME,
    }

    res = dynamodb.scan(**options)
    ret = res.get('Items', [])
    return ret



def put(obj):
    options = {
        'TableName': TO_NAME,
        'Item': obj,
    }
    dynamodb.put_item(**options)


if __name__ == '__main__':
    main()
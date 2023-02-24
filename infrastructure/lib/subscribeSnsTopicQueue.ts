
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubcription from 'aws-cdk-lib/aws-sns-subscriptions';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Runtime, Function, Code } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'



export interface SubscribeConstructeWithLambdaProps {
  name: string
  marketplaceSnsTopic: string;
  crossAccountDynamodbRole: iam.Role;
  readonly crossAccoountTable: dynamodb.Table;

}

export class SubscribeConstructeWithLambda extends Construct {
  readonly fn: Function;
  constructor(scope: Construct, id: string, props: SubscribeConstructeWithLambdaProps) {
    super(scope, id);

    // init sns topic from ARN
    const topic = sns.Topic.fromTopicArn(this, 'MarketplaceTopic', props.marketplaceSnsTopic);
    // SQS Queue 
    const queue = new sqs.Queue(this, 'InfrastructureQueue', {
      queueName: `${props.name}-infrastructure-queue`,
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.days(1),
      deliveryDelay: cdk.Duration.seconds(10),
    });
    // add queue as subscription to topic
    topic.addSubscription(new snsSubcription.SqsSubscription(queue));
    // or subscribe as HTTP endpoint to topic
    // topic.addSubscription(new snsSubcription.UrlSubscription('https://example.com/endpoint'));

    // Lambda function to process messages from SQS
    const fn = new Function(this, 'MyFunction', {
      code: Code.fromAsset(path.resolve(__dirname, '..', '..', 'api')), // required
      runtime: Runtime.PYTHON_3_8, // required
      handler: 'subscribe_handler.handler', // optional, defaults to 'handler'
      environment: {
        'CROSS_ACCOUNT_ROLE': props.crossAccountDynamodbRole.roleArn,
        'DYNAMODB_TABLE': props.crossAccoountTable.tableName,
        'DYNAMODB_REGION': props.crossAccoountTable.stack.region,
      }
    });

    // grant lambda function to read from SQS
    fn.addEventSource(new SqsEventSource(queue, {
      batchSize: 1, // default
    }));
    // grant lambda function to write to DynamoDB
    fn.addToRolePolicy(new iam.PolicyStatement({
      resources: [props.crossAccountDynamodbRole.roleArn],
      actions: ['sts:AssumeRole']
    }));
  }
}
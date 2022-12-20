
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubcription from 'aws-cdk-lib/aws-sns-subscriptions';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path'



export interface SubscribeConstructeWithLambdaProps {
  name: string
  marketplaceSnsTopic: string;
}

export class SubscribeConstructeWithLambda extends Construct {
  // readonly lambda: lambda.Function;
  constructor(scope: Construct, id: string, props: SubscribeConstructeWithLambdaProps) {
    super(scope, id);

    // init sns topic from ARN
    const topic = sns.Topic.fromTopicArn(this, 'MarketplaceTopic', props.marketplaceSnsTopic);
    // SQS Queue 
    const queue = new sqs.Queue(this, 'InfrastructureQueue', {
      queueName: `${props.name}/infrastructure/queue`,
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.days(7),
      contentBasedDeduplication: true,
      deliveryDelay: cdk.Duration.seconds(10),
    });
    // add queue as subscription to topic
    topic.addSubscription(new snsSubcription.SqsSubscription(queue));
    // or subscribe as HTTP endpoint to topic
    // topic.addSubscription(new snsSubcription.UrlSubscription('https://example.com/endpoint'));

    // Lambda function to process messages from SQS
    const fn = new PythonFunction(this, 'MyFunction', {
      entry: path.resolve(__dirname, '..', 'api'), // required
      runtime: Runtime.PYTHON_3_8, // required
      index: 'subscribe_handler.py', // optional, defaults to 'index.py'
      handler: 'handler', // optional, defaults to 'handler'
    });
  }
}
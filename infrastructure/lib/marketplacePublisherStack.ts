import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { AccountPrincipal, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';


export interface marketplacePublisherStackProps extends cdk.StackProps {
  readonly saasHostingAccountId: string;
  readonly marketplaceSnsTopicArn: string;
}


export class MarketplacePublisherStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: marketplacePublisherStackProps) {
    super(scope, id, props);

    // get the SNS Topic ARN from the MarketplaceStack
    const snsTopic = sns.Topic.fromTopicArn(this, 'marketplaceSnsTopic', props.marketplaceSnsTopicArn);
    const topicPolicy = new sns.TopicPolicy(this, 'TopicPolicy', {
      topics: [snsTopic],
    });

    // Add Subscribe Permission to the SNS Topic for the Marketplace to publish Messages
    // {
    //   "Version": "2008-10-17",
    //     "Statement": [
    //       {
    //         "Sid": "AwsMarketplaceDataFeedsAccess",
    //         "Effect": "Allow",
    //         "Principal": {
    //           "Service": "reports.marketplace.amazonaws.com"
    //         },
    //         "Action": "sns:Publish",
    //         "Resource": "arn:aws:sns:us-east-1:907797767998:hugging-face-marketplace-data-feeds"
    //       }
    //     ]
    // }
    topicPolicy.document.addStatements(new PolicyStatement({
      sid: "AwsMarketplaceDataFeedsAccess",
      actions: ["sns:Publish"],
      resources: [snsTopic.topicArn],
      principals: [new ServicePrincipal("reports.marketplace.amazonaws.com")]
    }));

    // Add Subscribe Permission to the SNS Topic for the SaaS Hosting Account ID
    topicPolicy.document.addStatements(new PolicyStatement({
      actions: ["sns:Subscribe"],
      resources: [snsTopic.topicArn],
      principals: [new AccountPrincipal(props.saasHostingAccountId)]
    }));




  }
}




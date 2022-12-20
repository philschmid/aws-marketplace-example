import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { AccountPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';


export interface marketplacePublisherStackProps extends cdk.StackProps {
  readonly saasHostingAccountId: string;
  readonly marketplaceSnsTopicArn: string;
}


export class MarketplacePublisherStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: marketplacePublisherStackProps) {
    super(scope, id, props);

    // get the SNS Topic ARN from the MarketplaceStack
    const snsTopic = Topic.fromTopicArn(this, 'marketplaceSnsTopic', props.marketplaceSnsTopicArn);
    // Add Subscribe Permission to the SNS Topic for the SaaS Hosting Account ID
    snsTopic.addToResourcePolicy(new PolicyStatement({
      actions: ['SNS:Subscribe'],
      resources: [snsTopic.topicArn],
      principals: [new AccountPrincipal(props.saasHostingAccountId)]
    }));
  }
}




#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MarketplaceStack, MarketplaceStackProps } from '../lib/marketplaceStack';
import { AmplifyNextJsStack, AmplifyNextJsStackProps } from '../lib/amplifyNextJsStack';
import config from '../config'
import { MarketplacePublisherStack } from '../lib/marketplacePublisherStack';

const props: MarketplaceStackProps = {
  name: 'marketplace-test',
  marketplaceSnsTopic: 'arn:aws:sns:us-east-1:907797767998:hugging-face-marketplace-data-feeds',
  productCode: '123456789012'
}

// You can use AWS CloudFormation, the Amplify CLI, and the SDKs to deploy a new Amplify app
//  that uses the GitHub App for repo access. This process requires that you first install
// the Amplify GitHub App in your GitHub account. https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html#setting-up-github-app-cloudformation
// Next, you will need to generate a personal access token in your GitHub account. 
// Lastly, deploy the app and specify the personal access token.
const amplifyProps: AmplifyNextJsStackProps = {
  name: props.name,
  githubRepsoitory: 'philschmid/aws-marketplace-example',
  githubToken: config.GITHUB_ACCESS_TOKEN,
  // customDomain: 'master.d3q7q2q2q2q2q2.amplifyapp.com',
  environmentVariables: {
    NEXTAUTH_SECRET: config.NEXTAUTH_SECRET,
    GITHUB_ID: config.GITHUB_ID,
    GITHUB_SECRET: config.GITHUB_SECRET,
  }
}


const app = new cdk.App();

// give permission from the Marketplace account to the deploy account
// AWS_PROFILE must be the for the marketpalce credentials
/* AWS_PROFILE=hf-marketplace \ 
AWS_DEFAULT_REGION=us-east-1 \
DEPLOY_ACCOUNT=558105141721 \
MARKETPLACE_ACCOUNT=907797767998 \
cdk bootstrap --trust ${DEPLOY_ACCOUNT} --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://${MARKETPLACE_ACCOUNT}/us-east-1
*/
// AWS_PROFILE=hf-sm AWS_DEFAULT_REGION=us-east-1 cdk deploy
new MarketplacePublisherStack(app, 'MarketplacePublisherStack', {
  saasHostingAccountId: config.AWS_HOSTING_ACCOUNTID,
  marketplaceSnsTopicArn: props.marketplaceSnsTopic,
  env: { account: config.AWS_MARKETPLACE_PROVIDER_ACCOUNTID, region: process.env.CDK_DEFAULT_REGION },
})

// deploy marketplace related Lambda Functions and resources (SQS, SNS, etc)
new MarketplaceStack(app, 'MarketplaceStack', {
  ...props,
  env: { account: config.AWS_HOSTING_ACCOUNTID, region: process.env.CDK_DEFAULT_REGION },
});

// deploy NextJS Application with Amplify from GitHub
new AmplifyNextJsStack(app, 'AmplifyNextJsStack', {
  ...amplifyProps,
  env: { account: config.AWS_HOSTING_ACCOUNTID, region: process.env.CDK_DEFAULT_REGION },
});

